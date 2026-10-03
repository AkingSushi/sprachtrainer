import { describe, expect, it } from 'vitest';
import { curriculum, topics, acceptedAnswers } from '../src/domain/curriculum';
import { evaluateAnswer } from '../src/domain/evaluate.mjs';

describe('intentional static learning curriculum', () => {
  it('contains 320 word pairs and 100 original daily sentences over 10 topics', () => {
    expect(curriculum.filter((entry) => entry.kind === 'word')).toHaveLength(320);
    expect(curriculum.filter((entry) => entry.kind === 'sentence')).toHaveLength(100);
    expect(topics).toHaveLength(10);
  });
  it('has stable unique IDs, unique pairs, and no Cyrillic', () => {
    expect(new Set(curriculum.map((entry) => entry.id)).size).toBe(curriculum.length);
    expect(new Set(curriculum.map((entry) => `${entry.de.toLowerCase()}|${entry.sr.toLowerCase()}`)).size).toBe(curriculum.length);
    expect(new Set(curriculum.map((entry) => entry.de.toLowerCase())).size).toBe(curriculum.length);
    expect(JSON.stringify(topics)).not.toMatch(/\p{Script=Cyrillic}/u);
    for (const mark of ['č', 'ć', 'š', 'ž', 'đ']) expect(curriculum.some((entry) => entry.sr.includes(mark))).toBe(true);
    for (const entry of curriculum) {
      expect(entry.de.trim()).toBe(entry.de);
      expect(entry.sr.trim()).toBe(entry.sr);
      expect(entry.de.length).toBeGreaterThan(0);
      expect(entry.sr.length).toBeGreaterThan(0);
    }
  });
  it('includes articles for German common noun entries', () => {
    const exceptions = new Set(['Entschuldigung', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']);
    for (const entry of curriculum.filter((entry) => entry.kind === 'word')) {
      if (/^\p{Lu}/u.test(entry.de) && !exceptions.has(entry.de)) throw new Error(`Missing article: ${entry.de}`);
    }
    expect(curriculum.filter((entry) => /^(der|die|das) /u.test(entry.de)).length).toBeGreaterThan(190);
  });
  it('accepts each curriculum answer in both directions, including annotated variants', () => {
    for (const entry of curriculum) for (const language of ['de', 'sr'] as const) {
      const answers = acceptedAnswers(entry, language);
      for (const answer of answers) expect(evaluateAnswer(answer, answers[0], answers.slice(1))).toBe('correct');
    }
  });
});