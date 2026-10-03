import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { foldWord, searchDictionary } from '../src/domain/lexicon';
import { commandSchema } from '../src/domain/state';

describe('offline dictionary search', () => {
  it('ships a Latin-only dictionary with unique IDs and importable attribution', () => {
    const raw = readFileSync(new URL('../public/kaikki.json', import.meta.url), 'utf8');
    const data = JSON.parse(raw);
    expect(data.license).toBe('CC-BY-SA-4.0');
    expect(data.sourceSha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(data.entries.length).toBeGreaterThan(100);
    expect(new Set(data.entries.map((entry: { id: string }) => entry.id)).size).toBe(data.entries.length);
    expect(raw).not.toMatch(/\p{Script=Cyrillic}/u);
    for (const entry of data.entries) {
      expect(commandSchema.safeParse({ type: 'addEntry', entry: { de: entry.de, sr: entry.sr, topic: 'home', kind: 'word', provenance: { provider: 'Wiktionary / Kaikki', license: data.license, url: entry.source, sense: entry.sense } } }).success, entry.id).toBe(true);
    }
    expect(searchDictionary(data.entries, 'kuca').some((entry) => entry.de === 'das Haus' && entry.sr === 'kuća')).toBe(true);
  });
  const entries = [
    { id: '1', de: 'das Krankenhaus', sr: 'bolnica', sense: 'Gebäude', pos: 'noun', source: '' },
    { id: '2', de: 'das Haus', sr: 'kuća', sense: 'Wohngebäude', pos: 'noun', source: '' },
    { id: '3', de: 'der Schüler', sr: 'đak', sense: 'Person', pos: 'noun', source: '' },
  ];
  it('ranks exact words before substrings and searches both languages', () => {
    expect(searchDictionary(entries, 'Haus').map((entry) => entry.id)).toEqual(['2', '1']);
    expect(searchDictionary(entries, ' KUCA ')).toEqual([entries[1]]);
    expect(searchDictionary(entries, 'dak')).toEqual([entries[2]]);
    expect(searchDictionary(entries, 'Schuler')).toEqual([entries[2]]);
    expect(searchDictionary(entries, 'Wohngebaude')).toEqual([entries[1]]);
    expect(searchDictionary(entries, 'xyz')).toEqual([]);
    expect(searchDictionary(entries, '')).toEqual(entries);
    expect(foldWord('ČĆŠŽĐ')).toBe('ccszd');
  });
});