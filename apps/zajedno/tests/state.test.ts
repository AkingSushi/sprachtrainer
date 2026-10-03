import { describe, expect, it } from 'vitest';
import { advanceTurn, applyCommand, initialState, scheduleReview, parseBackup, makeBackup, learningQueue, alternateTurn, stateSchema, allEntries } from '../src/domain/state';
import { evaluateAnswer } from '../src/domain/evaluate.mjs';

const now = new Date('2026-09-23T12:00:00Z');
const profile = (name = 'Ana', target: 'de' | 'sr' = 'de') => ({ type: 'addProfile', name, target, uiLanguage: target === 'de' ? 'sr' : 'de' });
const twoProfiles = () => applyCommand(applyCommand(initialState(), profile(), now), profile('Peter', 'sr'), now);

describe('local vocabulary validation and editing', () => {
  const entry = { de: 'der Kühlschrank', sr: 'frižider', topic: 'home', kind: 'word' };
  it('preserves progress when only plural notes change and round-trips optional forms', () => {
    let state = applyCommand(twoProfiles(), { type: 'addEntry', entry }, now);
    const id = state.customEntries[0].id;
    state = applyCommand(state, { type: 'review', profileId: state.profiles[0].id, target: 'de', entryId: id, expectedReps: 0, expectedEntryRevision: 1, rating: 3 }, now);
    const profiles = structuredClone(state.profiles);
    state = applyCommand(state, { type: 'editEntry', entryId: id, expectedRevision: 1, confirmed: true, entry: { ...entry, dePlural: 'die Kühlschränke', srPlural: 'frižideri' } }, now);
    expect(state.profiles).toEqual(profiles);
    expect(parseBackup(makeBackup(state))).toEqual(state);
    expect(state.customEntries[0]).toMatchObject({ revision: 2, dePlural: 'die Kühlschränke', srPlural: 'frižideri' });
    state = applyCommand(state, { type: 'editEntry', entryId: id, expectedRevision: 2, confirmed: true, entry: { ...entry, dePlural: '', srPlural: '' } }, now);
    expect(state.customEntries[0].dePlural).toBeUndefined();
    expect(state.customEntries[0].srPlural).toBeUndefined();
    expect(state.profiles).toEqual(profiles);
    expect(() => applyCommand(initialState(), { type: 'addEntry', entry: { ...entry, srPlural: 'књиге' } })).toThrow();
    expect(() => applyCommand(initialState(), { type: 'addEntry', entry: { ...entry, dePlural: 'x'.repeat(301) } })).toThrow();
  });
  it('preserves dictionary attribution through editing and backup restoration', () => {
    const provenance = { provider: 'Wiktionary / Kaikki', license: 'CC-BY-SA-4.0', url: 'https://de.wiktionary.org/wiki/K%C3%BChlschrank#Deutsch', sense: 'Gerät zum Kühlen' };
    let state = applyCommand(twoProfiles(), { type: 'addEntry', entry: { ...entry, provenance } }, now);
    expect(parseBackup(makeBackup(state)).customEntries[0].provenance).toEqual(provenance);
    state = applyCommand(state, { type: 'editEntry', entryId: state.customEntries[0].id, expectedRevision: 1, entry: { ...entry, de: 'Kühlschrank' }, confirmed: true });
    expect(state.customEntries[0].provenance).toEqual(provenance);
    for (const url of ['javascript:alert(1)', 'https://example.com/wiki/Test#Deutsch'])
      expect(() => applyCommand(initialState(), { type: 'addEntry', entry: { ...entry, provenance: { ...provenance, url } } })).toThrow();
    expect(() => applyCommand(initialState(), { type: 'addEntry', entry: { ...entry, provenance: { ...provenance, sense: '\u0434\u043e\u043c' } } })).toThrow();
  });
  it('validates text, Latin script, topics, duplicate pairs and known references', () => {
    const state = applyCommand(twoProfiles(), { type: 'addEntry', entry }, now);
    for (const fields of [{ ...entry, de: ' ' }, { ...entry, sr: 'фрижидер' }, { ...entry, topic: 'unknown' }, { ...entry, de: 'x'.repeat(301) }])
      expect(() => applyCommand(state, { type: 'addEntry', entry: fields })).toThrow();
    expect(() => applyCommand(state, { type: 'addEntry', entry: { ...entry, de: '  DER KÜHLSCHRANK ' } })).toThrow('ENTRY_EXISTS');
    expect(() => applyCommand(state, { type: 'addEntry', entry: { ...entry, de: 'das Haus', sr: 'kuća' } })).toThrow('ENTRY_EXISTS');
    expect(() => applyCommand(state, { type: 'editEntry', entryId: 'home-w1', expectedRevision: 0, entry, confirmed: true })).toThrow();
    const corrupted = structuredClone(state);
    corrupted.profiles[0].favorites.push(`custom-${crypto.randomUUID()}`);
    expect(stateSchema.safeParse(corrupted).success).toBe(false);
    expect(stateSchema.safeParse({ ...state, customEntries: [state.customEntries[0], state.customEntries[0]] }).success).toBe(false);
  });
  it('edits with a stable ID, resets just that card and rejects stale updates', () => {
    let state = applyCommand(twoProfiles(), { type: 'addEntry', entry }, now);
    const id = state.customEntries[0].id;
    const profileId = state.profiles[0].id;
    state = applyCommand(state, { type: 'review', profileId, target: 'de', entryId: 'home-w1', expectedReps: 0, rating: 3 }, now);
    state = applyCommand(state, { type: 'review', profileId, target: 'de', entryId: id, expectedEntryRevision: 1, expectedReps: 0, rating: 3 }, now);
    state = applyCommand(state, { type: 'favorite', profileId, entryId: id, value: true }, now);
    const command = { type: 'editEntry', entryId: id, expectedRevision: 1, entry: { ...entry, de: 'der Gefrierschrank', sr: 'zamrzivač' }, confirmed: true };
    expect(applyCommand(state, { ...command, entry })).toEqual(state);
    state = applyCommand(state, command, now);
    expect(state.customEntries[0]).toMatchObject({ id, revision: 2, sr: 'zamrzivač' });
    expect(state.profiles[0].progress[id]).toBeUndefined();
    expect(state.profiles[0].progress['home-w1'].reps).toBe(1);
    expect(state.profiles[0].favorites).toContain(id);
    expect(() => applyCommand(state, command)).toThrow('STALE_ENTRY');
    expect(() => applyCommand(state, { type: 'review', profileId, target: 'de', entryId: id, expectedEntryRevision: 1, expectedReps: 0, rating: 3 })).toThrow('STALE_ENTRY');
    expect(() => applyCommand(state, { type: 'removeEntry', entryId: id, expectedRevision: 2 })).toThrow();
    state = applyCommand(state, { type: 'removeEntry', entryId: id, expectedRevision: 2, confirmed: true });
    expect(state.customEntries).toEqual([]);
    expect(state.profiles[0].favorites).toEqual([]);
    expect(state.profiles[0].history.every((review) => review.entryId !== id)).toBe(true);
    expect(() => applyCommand(state, { type: 'favorite', profileId, entryId: id, value: true })).toThrow('ENTRY_MISSING');
  });
});

describe('profile isolation and real FSRS', () => {
  it('uses FSRS schedules for all four grades and serializes dates', () => {
    const cards = [1, 2, 3, 4].map((grade) => scheduleReview(undefined, grade, now));
    for (const card of cards) { expect(card.reps).toBe(1); expect(Date.parse(card.due)).toBeGreaterThan(now.getTime()); expect(card.stability).toBeGreaterThan(0); }
    expect(Date.parse(cards[3].due)).toBeGreaterThan(Date.parse(cards[0].due));
    expect(scheduleReview(cards[2], 3, new Date(cards[2].due)).reps).toBe(2);
  });
  it('updates only the chosen profile, refuses duplicate reviews and wrong direction', () => {
    const state = twoProfiles();
    const command = { type: 'review', profileId: state.profiles[0].id, target: 'de', entryId: 'home-w1', expectedReps: 0, rating: 3 };
    const updated = applyCommand(state, command, now);
    expect(updated.profiles[0].progress['home-w1'].reps).toBe(1);
    expect(updated.profiles[1].progress).toEqual({});
    expect(state.profiles[0].progress).toEqual({});
    expect(() => applyCommand(updated, command, now)).toThrow('STALE_REVIEW');
    expect(() => applyCommand(state, { ...command, target: 'sr' }, now)).toThrow('STALE_REVIEW');
  });
  it('alternates two queues and skips exhausted queues', () => {
    expect(alternateTurn(0, [['home-w1'], ['food-w1']])).toBe(1);
    expect(alternateTurn(1, [['home-w1'], ['food-w1']])).toBe(0);
    expect(alternateTurn(0, [['home-w1'], []])).toBe(0);
    expect(alternateTurn(0, [[], []])).toBeNull();
  });
  it('mixes fresh topic entries before limiting while retaining due priority and filters', () => {
    const learner = twoProfiles().profiles[0];
    learner.progress['home-w4'] = scheduleReview(undefined, 1, new Date('2026-09-22T12:00:00Z'));
    learner.progress['home-w5'] = scheduleReview(undefined, 4, now);
    const options = { topic: 'home', kind: 'word', limit: 5 };
    const normal = learningQueue(learner, options, now);
    const mixed = learningQueue(learner, options, now, undefined, () => 0);
    expect(mixed[0]).toBe('home-w4');
    expect(mixed).not.toEqual(normal);
    expect(mixed).toHaveLength(5);
    expect(new Set(mixed).size).toBe(5);
    expect(mixed.every((id) => id.startsWith('home-w'))).toBe(true);
    expect(mixed).not.toContain('home-w5');
    learner.favorites = ['home-w1', 'food-w1'];
    expect(learningQueue(learner, { ...options, favorites: true }, now, undefined, () => 0)).toEqual(['home-w1']);
    expect(learningQueue(learner, { customOnly: true }, now, undefined, () => 0)).toEqual([]);
  });
  it('avoids consecutive identical cards across a complete shared topic round without losing cards', () => {
    const initial = [['home-w1', 'home-w2', 'home-w3'], ['home-w1', 'home-w2', 'home-w3']];
    let queues = initial;
    let turn: number | null = 0;
    const seen: string[][] = [[], []];
    let previous = '';
    while (turn !== null) {
      const card = queues[turn][0];
      expect(card).not.toBe(previous);
      seen[turn].push(card);
      previous = card;
      ({ queues, turn } = advanceTurn(turn, queues));
    }
    expect(seen.map((cards) => [...cards].sort())).toEqual(initial);
    expect(initial[0]).toEqual(['home-w1', 'home-w2', 'home-w3']);
  });
  it('allows unavoidable single-card repeats and finishes uneven or solo queues', () => {
    expect(advanceTurn(0, [['home-w1'], ['home-w1']])).toEqual({ queues: [[], ['home-w1']], turn: 1 });
    expect(advanceTurn(1, [[], ['home-w1']])).toEqual({ queues: [[], []], turn: null });
    expect(advanceTurn(0, [['home-w1', 'home-w2'], []])).toEqual({ queues: [['home-w2'], []], turn: 0 });
    expect(advanceTurn(0, [['home-w1', 'home-w2']])).toEqual({ queues: [['home-w2']], turn: 0 });
    expect(advanceTurn(0, [['home-w1'], ['home-w2', 'home-w1']])).toEqual({ queues: [[], ['home-w2', 'home-w1']], turn: 1 });
  });
  it('prioritizes due cards, respects topics and isolated favorites', () => {
    let state = twoProfiles();
    const profileId = state.profiles[0].id;
    state = applyCommand(state, { type: 'favorite', profileId, entryId: 'home-w4', value: true }, now);
    expect(learningQueue(state.profiles[0], { favorites: true }, now)).toEqual(['home-w4']);
    expect(learningQueue(state.profiles[1], { favorites: true }, now)).toEqual([]);
    state = applyCommand(state, { type: 'review', profileId, target: 'de', entryId: 'home-w4', expectedReps: 0, rating: 1 }, now);
    expect(learningQueue(state.profiles[0], { topic: 'home' }, now)).not.toContain('home-w4');
    expect(learningQueue(state.profiles[0], { topic: 'home' }, new Date('2026-09-24T12:00:00Z'))[0]).toBe('home-w4');
  });
  it('preserves preferred UI language when switching profiles and rejects duplicate names', () => {
    const state = twoProfiles();
    expect(applyCommand(state, { type: 'selectProfile', profileId: state.profiles[0].id }).uiLanguage).toBe('sr');
    expect(() => applyCommand(state, profile('ana'))).toThrow('NAME_EXISTS');
    expect(() => applyCommand(state, { type: 'removeProfile', profileId: state.profiles[0].id })).toThrow();
  });
});

describe('backup validation', () => {
  it('migrates version one without changing profiles', () => {
    const state = twoProfiles();
    const data = { version: 1, curriculumVersion: 1, revision: state.revision, uiLanguage: state.uiLanguage, activeProfileId: state.activeProfileId, profiles: state.profiles };
    expect(stateSchema.parse(data)).toEqual(state);
    expect(parseBackup(JSON.stringify({ format: 'zajedno-backup', version: 1, exportedAt: now.toISOString(), data }))).toEqual(state);
  });
  it('stores and learns custom vocabulary without sharing progress', () => {
    let state = applyCommand(twoProfiles(), { type: 'addEntry', entry: { de: 'der Kühlschrank', sr: 'frižider', topic: 'home', kind: 'word' } }, now);
    const entry = state.customEntries[0];
    expect(learningQueue(state.profiles[0], { customOnly: true }, now, allEntries(state))).toEqual([entry.id]);
    state = applyCommand(state, { type: 'review', profileId: state.profiles[0].id, target: 'de', entryId: entry.id, expectedEntryRevision: 1, expectedReps: 0, rating: 3 }, now);
    expect(state.profiles[0].progress[entry.id].reps).toBe(1);
    expect(state.profiles[1].progress).toEqual({});
    expect(parseBackup(makeBackup(state))).toEqual(state);
  });
  it('round-trips the full versioned state', () => {
    const state = twoProfiles();
    expect(parseBackup(makeBackup(state, now))).toEqual(state);
  });
  it('rejects unsupported versions, unknown fields, invalid references and duplicate profiles', () => {
    const state = twoProfiles();
    const backup = JSON.parse(makeBackup(state, now));
    for (const invalid of ['{}', '{broken', JSON.stringify({ ...backup, version: 99 }), JSON.stringify({ ...backup, cloud: true })])
      expect(() => parseBackup(invalid)).toThrow('IMPORT_INVALID');
    expect(stateSchema.safeParse({ ...state, profiles: [state.profiles[0], state.profiles[0]] }).success).toBe(false);
    expect(stateSchema.safeParse({ ...state, activeProfileId: null }).success).toBe(false);
    const corrupted = structuredClone(state);
    corrupted.profiles[0].favorites = ['not-a-card'];
    expect(stateSchema.safeParse(corrupted).success).toBe(false);
    corrupted.profiles[0].favorites = [];
    corrupted.profiles[0].progress['home-w1'] = { ...scheduleReview(undefined, 3, now), due: 'not-a-date' };
    expect(stateSchema.safeParse(corrupted).success).toBe(false);
  });
  it('requires German articles and Serbian diacritics in both typed directions', () => {
    expect(evaluateAnswer('Haus', 'das Haus')).toBe('article');
    expect(evaluateAnswer('Das Haus.', 'das Haus')).toBe('correct');
    expect(evaluateAnswer('kuca', 'kuća')).toBe('diacritics');
    expect(evaluateAnswer('kuća', 'kuća')).toBe('correct');
    expect(evaluateAnswer('uciti', 'učiti')).toBe('diacritics');
    expect(evaluateAnswer('lernen', 'lernen')).toBe('correct');
  });
});