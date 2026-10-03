import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export const sourceUrl = 'https://kaikki.org/dewiktionary/raw-wiktextract-data.jsonl.gz';
const latin = /^[\p{Script=Latin}\p{M}\p{N}\p{P}\p{Zs}]+$/u;
const clean = (value) => typeof value === 'string' ? value.normalize('NFC').trim().replace(/\s+/gu, ' ') : '';

export function extractEntries(record) {
  const entries = [];
  let rejected = 0;
  if (record.lang_code !== 'de' || !Array.isArray(record.translations)) return { entries, rejected };
  const word = clean(record.word);
  if (!word || word.length > 250 || !latin.test(word) || record.tags?.includes('form-of')) return { entries, rejected };
  const gender = (record.tags ?? []).filter((tag) => ['masculine', 'feminine', 'neuter'].includes(tag));
  const article = record.pos === 'noun' && gender.length === 1 ? { masculine: 'der ', feminine: 'die ', neuter: 'das ' }[gender[0]] : '';
  for (const translation of record.translations) {
    if (translation.lang_code !== 'sr') continue;
    const original = clean(translation.word);
    const roman = clean(translation.roman);
    const sr = latin.test(original) ? original : roman;
    const sense = clean(translation.sense);
    if (!sr || sr.length > 300 || !latin.test(sr) || (sense && (!latin.test(sense) || sense.length > 2000))) { rejected++; continue; }
    const de = `${article}${word}`;
    const source = `https://de.wiktionary.org/wiki/${encodeURIComponent(word)}#Deutsch`;
    const id = createHash('sha256').update(JSON.stringify([de, sr, sense, record.pos])).digest('hex').slice(0, 24);
    entries.push({ id, de, sr, sense, pos: record.pos ?? '', source });
  }
  return { entries, rejected };
}

async function main() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const cache = path.join(root, '.preview', 'kaikki');
  await mkdir(cache, { recursive: true });
  const archive = process.argv[2] ? path.resolve(process.argv[2]) : path.join(cache, 'de.jsonl.gz');
  if (!process.argv[2]) {
    console.log(`Downloading ${sourceUrl}`);
    const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(1_800_000) });
    if (!response.ok || !response.body) throw new Error(`Download failed: HTTP ${response.status}`);
    let downloaded = 0;
    let reported = 0;
    const body = Readable.fromWeb(response.body);
    body.on('data', (chunk) => {
      downloaded += chunk.length;
      if (downloaded - reported >= 25_000_000) { console.log(`${Math.round(downloaded / 1_000_000)} MB downloaded`); reported = downloaded; }
    });
    try {
      await pipeline(body, createWriteStream(`${archive}.tmp`));
      await rename(`${archive}.tmp`, archive);
    } finally { await rm(`${archive}.tmp`, { force: true }); }
  }
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(archive)) digest.update(chunk);
  const input = createReadStream(archive).pipe(createGunzip());
  const lines = createInterface({ input, crlfDelay: Infinity });
  const unique = new Map();
  let records = 0;
  let rejected = 0;
  let malformedLines = 0;
  for await (const line of lines) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); }
    catch { malformedLines++; continue; }
    const result = extractEntries(record);
    for (const entry of result.entries) unique.set(entry.id, entry);
    rejected += result.rejected;
    records++;
  }
  const entries = [...unique.values()].sort((left, right) => left.de.localeCompare(right.de, 'de') || left.sr.localeCompare(right.sr, 'sr-Latn') || left.id.localeCompare(right.id));
  if (entries.length < 100) throw new Error(`Unexpectedly small dictionary: ${entries.length}. Existing output kept.`);
  const output = {
    format: 'zajedno-kaikki', version: 1, retrievedAt: new Date().toISOString(), sourceUrl,
    sourceSha256: digest.digest('hex'), license: 'CC-BY-SA-4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    attribution: 'Deutschsprachiges Wiktionary, Mitwirkende; Extraktion: Kaikki / Wiktextract. Auswahl, Artikelergänzung und Latinica-Auswahl: Zajedno.',
    records, rejected, malformedLines, entries,
  };
  if (/\p{Script=Cyrillic}/u.test(JSON.stringify(output))) throw new Error('Cyrillic found in dictionary output');
  const target = path.join(root, 'public', 'kaikki.json');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(`${target}.tmp`, JSON.stringify(output), 'utf8');
  await rename(`${target}.tmp`, target);
  console.log(JSON.stringify({ entries: entries.length, rejected, malformedLines, records, sourceSha256: output.sourceSha256, target }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}