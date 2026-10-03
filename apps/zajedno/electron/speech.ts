import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import type { LocalSpeechVoice } from '../src/domain/state';

const workerScript = `
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::InputEncoding = $utf8
[Console]::OutputEncoding = $utf8
function Add-WaveSilence([byte[]]$wave, [int]$leadingMs, [int]$trailingMs) {
  $fmtOffset = -1
  $dataOffset = -1
  for ($offset = 12; $offset + 8 -le $wave.Length;) {
    $tag = [Text.Encoding]::ASCII.GetString($wave, $offset, 4)
    $chunkLength = [BitConverter]::ToInt32($wave, $offset + 4)
    if ($tag -eq 'fmt ') { $fmtOffset = $offset }
    if ($tag -eq 'data') { $dataOffset = $offset; break }
    $offset += 8 + $chunkLength + ($chunkLength % 2)
  }
  if ($fmtOffset -lt 0 -or $dataOffset -lt 0) { throw 'SAPI returned an invalid WAV stream' }
  if ([BitConverter]::ToInt16($wave, $fmtOffset + 8) -ne 1) { throw 'SAPI returned a non-PCM WAV stream' }
  $sampleRate = [BitConverter]::ToInt32($wave, $fmtOffset + 12)
  $blockAlign = [BitConverter]::ToInt16($wave, $fmtOffset + 20)
  $dataStart = $dataOffset + 8
  $dataLength = [BitConverter]::ToInt32($wave, $dataOffset + 4)
  $leadingBytes = [int][Math]::Ceiling($sampleRate * $leadingMs / 1000.0) * $blockAlign
  $trailingBytes = [int][Math]::Ceiling($sampleRate * $trailingMs / 1000.0) * $blockAlign
  $afterData = $dataStart + $dataLength
  $afterDataLength = $wave.Length - $afterData
  $padded = New-Object byte[] ($wave.Length + $leadingBytes + $trailingBytes)
  [Array]::Copy($wave, 0, $padded, 0, $dataStart)
  [Array]::Clear($padded, $dataStart, $leadingBytes)
  [Array]::Copy($wave, $dataStart, $padded, $dataStart + $leadingBytes, $dataLength)
  [Array]::Clear($padded, $dataStart + $leadingBytes + $dataLength, $trailingBytes)
  [Array]::Copy($wave, $afterData, $padded, $afterData + $leadingBytes + $trailingBytes, $afterDataLength)
  [Array]::Copy([BitConverter]::GetBytes([int]($dataLength + $leadingBytes + $trailingBytes)), 0, $padded, $dataOffset + 4, 4)
  [Array]::Copy([BitConverter]::GetBytes([int]($padded.Length - 8)), 0, $padded, 4, 4)
  return ,$padded
}
try {
  Add-Type -AssemblyName System.Speech
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $player = New-Object System.Media.SoundPlayer
  try {
    $voices = @($synth.GetInstalledVoices() | Where-Object { $_.Enabled } | ForEach-Object {
      [pscustomobject]@{ name = $_.VoiceInfo.Name; lang = $_.VoiceInfo.Culture.Name }
    })
    [Console]::Out.WriteLine((ConvertTo-Json -InputObject @{ type = 'ready'; voices = $voices } -Compress -Depth 4))
    while ($line = [Console]::In.ReadLine()) {
      $request = $null
      try {
        $request = ConvertFrom-Json $line
        if ($request.type -ne 'speak' -or $request.text -isnot [string] -or $request.text.Length -gt 1000) { throw 'Invalid speech request' }
        $synth.SelectVoice([string]$request.voiceName)
        $output = [System.IO.MemoryStream]::new()
        try {
          $synth.SetOutputToWaveStream($output)
          $synth.Speak([string]$request.text)
          $synth.SetOutputToNull()
          $paddedWave = Add-WaveSilence $output.ToArray() 600 350
          $audio = [System.IO.MemoryStream]::new($paddedWave, $false)
          try {
            $player.Stream = $audio
            $player.Load()
            $player.PlaySync()
          } finally { $player.Stream = $null; $audio.Dispose() }
        } finally { $synth.SetOutputToNull(); $output.Dispose() }
        [Console]::Out.WriteLine((ConvertTo-Json -InputObject @{ id = $request.id; ok = $true } -Compress))
      } catch {
        [Console]::Out.WriteLine((ConvertTo-Json -InputObject @{ id = $request.id; ok = $false; error = $_.Exception.Message } -Compress))
      }
    }
  } finally { $player.Dispose(); $synth.Dispose() }
} catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }
`;

type PendingRequest = {
  child: ChildProcess;
  resolve: () => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

let worker: ChildProcess | undefined;
let workerReady: Promise<LocalSpeechVoice[]> | undefined;
let requestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

function cancelSapiSpeech() {
  const current = worker;
  worker = undefined;
  workerReady = undefined;
  current?.kill();
  for (const [id, pending] of pendingRequests) {
    if (pending.child !== current) continue;
    clearTimeout(pending.timeout);
    pending.reject(new Error('Speech cancelled'));
    pendingRequests.delete(id);
  }
}

function startWorker(): Promise<LocalSpeechVoice[]> {
  if (workerReady) return workerReady;
  if (process.platform !== 'win32') return Promise.resolve([]);
  const executable = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const encodedScript = Buffer.from(workerScript, 'utf16le').toString('base64');
  let resolveReady!: (voices: LocalSpeechVoice[]) => void;
  let rejectReady!: (error: Error) => void;
  let readyReceived = false;
  let outputBuffer = '';
  const ready = new Promise<LocalSpeechVoice[]>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  workerReady = ready;

  let child: ChildProcess;
  try {
    child = spawn(executable, ['-NoLogo', '-NoProfile', '-NonInteractive', '-STA', '-EncodedCommand', encodedScript], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (error) {
    worker = undefined;
    workerReady = undefined;
    rejectReady(error instanceof Error ? error : new Error('Unable to start SAPI worker'));
    return ready;
  }
  worker = child;
  child.stdout?.setEncoding('utf8').on('data', (chunk: string) => {
    outputBuffer += chunk;
    const lines = outputBuffer.split(/\r?\n/u);
    outputBuffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const response = JSON.parse(line) as { type?: unknown; voices?: unknown; id?: unknown; ok?: unknown; error?: unknown };
        if (response.type === 'ready') {
          const voices = Array.isArray(response.voices) ? response.voices.flatMap((item): LocalSpeechVoice[] => {
            if (!item || typeof item !== 'object') return [];
            const voice = item as { name?: unknown; lang?: unknown };
            if (typeof voice.name !== 'string' || typeof voice.lang !== 'string') return [];
            return [{ name: voice.name, lang: voice.lang, localService: true, sapi: true }];
          }) : [];
          readyReceived = true;
          resolveReady(voices);
          continue;
        }
        if (typeof response.id !== 'number') continue;
        const pending = pendingRequests.get(response.id);
        if (!pending || pending.child !== child) continue;
        clearTimeout(pending.timeout);
        pendingRequests.delete(response.id);
        if (response.ok === true) pending.resolve();
        else pending.reject(new Error(typeof response.error === 'string' ? response.error : 'SAPI playback failed'));
      } catch {
        if (!readyReceived) rejectReady(new Error('Invalid SAPI worker response'));
      }
    }
  });
  let stderr = '';
  child.stderr?.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk; });
  child.stdin?.on('error', () => undefined);
  child.once('error', (error) => {
    if (!readyReceived) rejectReady(error);
    if (worker === child) { worker = undefined; workerReady = undefined; }
  });
  child.once('close', (code) => {
    if (!readyReceived) rejectReady(new Error(stderr.trim() || `PowerShell exited with code ${code ?? 'unknown'}`));
    if (worker === child) { worker = undefined; workerReady = undefined; }
    for (const [id, pending] of pendingRequests) {
      if (pending.child !== child) continue;
      clearTimeout(pending.timeout);
      pending.reject(new Error(stderr.trim() || 'SAPI worker stopped'));
      pendingRequests.delete(id);
    }
  });
  return ready;
}

async function requestSpeech(voiceName: string, text: string): Promise<void> {
  await startWorker();
  const child = worker;
  if (!child?.stdin) throw new Error('SAPI worker is not available');
  const id = ++requestId;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error('SAPI playback timed out'));
      if (worker === child) cancelSapiSpeech();
    }, 90000);
    pendingRequests.set(id, { child, resolve, reject, timeout });
    child.stdin!.write(`${JSON.stringify({ id, type: 'speak', voiceName, text })}\n`, 'utf8', (error) => {
      if (!error) return;
      clearTimeout(timeout);
      pendingRequests.delete(id);
      reject(error);
    });
  });
}

export async function getSapiVoices(): Promise<LocalSpeechVoice[]> {
  return startWorker();
}

export async function speakSapi(text: string, voiceName: string): Promise<boolean> {
  if (!text.trim() || text.length > 1000 || voiceName.length > 100) throw new Error('SPEECH_INVALID');
  const voices = await getSapiVoices();
  if (!voices.some((voice) => voice.name === voiceName)) throw new Error('SPEECH_VOICE_MISSING');
  await requestSpeech(voiceName, text);
  return true;
}

export { cancelSapiSpeech };