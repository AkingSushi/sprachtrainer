import { describe, expect, it } from 'vitest';
import { curriculum, acceptedAnswers, type Entry } from '../src/domain/curriculum';
import { grammarBooks } from '../src/domain/grammar';
import { nounForms, nounRows } from '../src/domain/nounForms';

describe('grammar books and explicit noun number forms', () => {
  it('provides both teaching directions, chapters and Latin-only examples', () => {
    expect(grammarBooks.sr.explanationLanguage).toBe('de');
    expect(grammarBooks.de.explanationLanguage).toBe('sr');
    for (const book of Object.values(grammarBooks)) {
      expect(book.chapters).toHaveLength(9);
      expect(new Set(book.chapters.map((chapter) => chapter.id)).size).toBe(9);
      expect(JSON.stringify(book)).not.toMatch(/\p{Script=Cyrillic}/u);
      for (const chapter of book.chapters) {
        expect(chapter.paragraphs.length).toBeGreaterThan(0);
        expect(chapter.examples.length).toBeGreaterThan(0);
      }
    }
  });
  it('matches actual curriculum pairs and covers all article-bearing nouns', () => {
    expect(new Set(nounRows.map(([de, sr]) => JSON.stringify([de, sr]))).size).toBe(nounRows.length);
    for (const [de, sr] of nounRows) expect(curriculum.some((entry) => entry.kind === 'word' && entry.de === de && entry.sr === sr)).toBe(true);
    for (const entry of curriculum.filter((entry) => entry.kind === 'word' && /^(der|die|das) /u.test(entry.de))) {
      expect(nounForms(entry).de, entry.de).toBeDefined();
      expect(nounForms(entry).sr, entry.sr).toBeDefined();
    }
    expect(JSON.stringify(nounRows)).not.toMatch(/\p{Script=Cyrillic}/u);
  });
  it('distinguishes irregular forms, existing plural, mass and collective forms without changing answers', () => {
    const house = curriculum.find((entry) => entry.id === 'home-w1')!;
    expect(nounForms(house)).toEqual({ de: { form: 'die Häuser', usage: 'plural' }, sr: { form: 'kuće', usage: 'plural' } });
    expect(acceptedAnswers(house, 'de')).toEqual(['das Haus']);
    expect(nounForms(curriculum.find((entry) => entry.sr === 'vrata')!).sr?.usage).toBe('alreadyPlural');
    expect(nounForms(curriculum.find((entry) => entry.sr === 'mleko')!).sr?.usage).toBe('mass');
    expect(nounForms(curriculum.find((entry) => entry.sr === 'dete')!).sr).toEqual({ form: 'deca', usage: 'collective' });
    expect(nounForms({ ...house, sr: 'something else' })).toEqual({});
    expect(nounForms(curriculum.find((entry) => entry.de === 'lernen')!)).toEqual({});
    expect(nounForms({ ...house, kind: 'sentence' })).toEqual({});
    const custom: Entry = { id: 'custom-test', kind: 'word', topic: 'home', de: 'der Kühlschrank', sr: 'frižider', dePlural: 'die Kühlschränke', srPlural: 'frižideri' };
    expect(nounForms(custom).sr?.form).toBe('frižideri');
    expect(acceptedAnswers(custom, 'de')).toEqual(['der Kühlschrank']);
  });
});