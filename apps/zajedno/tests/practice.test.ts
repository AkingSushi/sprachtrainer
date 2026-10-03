import { expect, it } from 'vitest';
import { curriculum } from '../src/domain/curriculum';
import { choiceAnswers, evaluateEntryAnswer, localSapiVoice, localVoice } from '../src/domain/practice';
import { de, sr } from '../src/i18n';

it('offers four distinct choices containing the correct answer in either direction', () => {
  for (const entry of curriculum) for (const language of ['de', 'sr'] as const) {
    const options = choiceAnswers(entry, language);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options).toContain(entry[language]);
    expect(evaluateEntryAnswer(entry, language, entry[language], 'choice')).toBe('correct');
  }
});
it('never falls back to network voices, other languages or Cyrillic voices', () => {
  const voices = [{ lang: 'de-DE', localService: true }, { lang: 'sr-RS', localService: false }, { lang: 'hr-HR', localService: true }, { lang: 'sr-Cyrl-RS', localService: true }];
  expect(localVoice(voices, 'de')).toEqual(voices[0]);
  expect(localVoice(voices, 'sr')).toBeUndefined();
  expect(localVoice([...voices, { lang: 'sr-Latn-RS', localService: true }], 'sr')?.lang).toBe('sr-Latn-RS');
});
it('uses the installed Serbian RHVoice SAPI voice without treating its script tag as text script', () => {
  const voices = [{ name: 'Microsoft Hedda Desktop', lang: 'de-DE' }, { name: 'Dragana', lang: 'sr-Cyrl-CS' }];
  expect(localSapiVoice(voices, 'sr')).toEqual(voices[1]);
  expect(localSapiVoice(voices, 'de')).toBeUndefined();
});
it('provides a complete Serbian Latin translation for every UI label', () => {
  expect(Object.keys(sr).sort()).toEqual(Object.keys(de).sort());
  expect(JSON.stringify(sr)).not.toMatch(/\p{Script=Cyrillic}/u);
  expect(Object.values(sr).every((value) => value.length > 0)).toBe(true);
});