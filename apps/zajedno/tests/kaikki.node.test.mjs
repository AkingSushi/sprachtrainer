import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractEntries } from '../scripts/prepare-dictionary.mjs';

test('Kaikki keeps Serbian Latin forms, meaning and attribution without mixing languages', () => {
  const record = { lang_code: 'de', word: 'Haus', pos: 'noun', tags: ['neuter'], translations: [
    { lang_code: 'sr', word: '\u043a\u0443\u045b\u0430', roman: 'ku\u0107a', sense: 'Wohngebäude' },
    { lang_code: 'bs', word: 'dom' }, { lang_code: 'hr', word: 'dom' },
  ] };
  const result = extractEntries(record);
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].de, 'das Haus');
  assert.equal(result.entries[0].sr, 'ku\u0107a');
  assert.equal(result.entries[0].sense, 'Wohngebäude');
  assert.equal(result.entries[0].source, 'https://de.wiktionary.org/wiki/Haus#Deutsch');
  assert.deepEqual(extractEntries(record), result);
  assert.equal(extractEntries({ ...record, lang_code: 'en' }).entries.length, 0);
});

test('Kaikki rejects missing or Cyrillic romanization, controls and Cyrillic annotations', () => {
  for (const translation of [
    { word: '\u043a\u0443\u045b\u0430' },
    { word: '\u043a\u0443\u045b\u0430', roman: 'ku\u045ba' },
    { word: 'ku\u0107a', sense: '\u0434\u043e\u043c' },
    { word: 'ku\u0000ca' },
  ]) {
    const result = extractEntries({ lang_code: 'de', word: 'Haus', translations: [{ lang_code: 'sr', ...translation }] });
    assert.equal(result.entries.length, 0);
    assert.equal(result.rejected, 1);
  }
  const result = extractEntries({ lang_code: 'de', word: 'Wort', translations: [{ lang_code: 'sr', word: 'lj nj d\u017e \u010d \u0107 \u0161 \u017e \u0111' }] });
  assert.equal(result.entries.length, 1);
  assert.equal(/\p{Script=Cyrillic}/u.test(JSON.stringify(result)), false);
});