import { acceptedAnswers, curriculum, type Entry, type Language } from './curriculum';
import { evaluateAnswer } from './evaluate.mjs';

export function evaluateEntryAnswer(entry: Entry, target: Language, answer: string, mode: 'choice' | 'typing') {
  if (mode === 'choice') return answer === entry[target] ? 'correct' : 'incorrect';
  const accepted = acceptedAnswers(entry, target);
  return evaluateAnswer(answer, accepted[0], accepted.slice(1));
}

export function choiceAnswers(entry: Entry, target: Language, random = Math.random, catalog: Entry[] = curriculum): string[] {
  const candidates = Array.from(new Set(catalog.filter((candidate) => candidate.kind === entry.kind && candidate.id !== entry.id && candidate[target] !== entry[target] && candidate[target === 'de' ? 'sr' : 'de'] !== entry[target === 'de' ? 'sr' : 'de']).map((candidate) => candidate[target])));
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [candidates[index], candidates[other]] = [candidates[other], candidates[index]];
  }
  const answers = [entry[target], ...candidates.slice(0, 3)];
  for (let index = answers.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [answers[index], answers[other]] = [answers[other], answers[index]];
  }
  return answers;
}

export function localVoice<T extends { lang: string; localService: boolean }>(voices: T[], language: Language): T | undefined {
  return voices.find((voice) => voice.localService && voice.lang.toLowerCase().replaceAll('_', '-').split('-')[0] === language && !voice.lang.toLowerCase().includes('cyrl'));
}

export function localSapiVoice<T extends { name: string; lang: string }>(voices: T[], language: Language): T | undefined {
  if (language !== 'sr') return undefined;
  return voices.find((voice) => voice.name === 'Dragana' && voice.lang.toLowerCase().startsWith('sr-'));
}