import { z } from 'zod';
import { createEmptyCard, fsrs, type Card, type Grade } from 'ts-fsrs';
import { curriculum, curriculumVersion, entryById, topics, type Entry, type Language } from './curriculum';

const languageSchema = z.enum(['de', 'sr']);
const identifier = z.string().uuid();
const date = z.string().datetime({ offset: true }).refine((value) => Number.isFinite(Date.parse(value)));
const count = z.number().int().min(0).max(10000000);
const customId = z.string().refine((value) => value.startsWith('custom-') && identifier.safeParse(value.slice(7)).success);
const entryId = z.string().refine((value) => entryById.has(value) || customId.safeParse(value).success, 'Unknown curriculum entry');
export const MAX_CUSTOM_ENTRIES = 1000;
const entryText = z.string().trim().min(1).max(300).refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value));
const pluralText = z.string().trim().max(300).refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value));
const provenanceSchema = z.object({
  provider: z.literal('Wiktionary / Kaikki'), license: z.literal('CC-BY-SA-4.0'),
  url: z.string().max(2000).regex(/^https:\/\/de\.wiktionary\.org\/wiki\/[^\s?#]+#Deutsch$/u),
  sense: z.string().max(2000).refine((value) => !/[\p{Cc}\p{Cf}\p{Script=Cyrillic}]/u.test(value)),
}).strict();
export const entryFieldsSchema = z.object({
  de: entryText, sr: entryText.refine((value) => !/\p{Script=Cyrillic}/u.test(value)),
  topic: z.string().refine((value) => topics.some((topic) => topic.id === value)), kind: z.enum(['word', 'sentence']),
  provenance: provenanceSchema.optional(),
  dePlural: pluralText.transform((value) => value || undefined).optional(),
  srPlural: pluralText.refine((value) => !/\p{Script=Cyrillic}/u.test(value)).transform((value) => value || undefined).optional(),
}).strict();
export const customEntrySchema = entryFieldsSchema.extend({ id: customId, revision: z.number().int().min(1).max(10000000) }).strict();
export type CustomEntry = z.infer<typeof customEntrySchema>;
export type EntryFields = z.infer<typeof entryFieldsSchema>;
const nameSchema = z.string().trim().min(1).max(40).refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value));
export const cardSchema = z.object({
  due: date, stability: z.number().min(0).max(10000000), difficulty: z.number().min(0).max(10),
  elapsed_days: count, scheduled_days: count, learning_steps: count,
  reps: count, lapses: count, state: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  last_review: date.optional(),
}).strict().refine((card) => card.lapses <= card.reps && (card.reps === 0 || !!card.last_review), 'Invalid review history');
export const profileSchema = z.object({
  id: identifier, name: nameSchema, target: languageSchema, uiLanguage: languageSchema,
  createdAt: date, favorites: z.array(entryId).max(curriculum.length + MAX_CUSTOM_ENTRIES),
  progress: z.record(entryId, cardSchema),
  history: z.array(z.object({ at: date, entryId, rating: z.number().int().min(1).max(4) }).strict()).max(2000),
}).strict().refine((profile) => new Set(profile.favorites).size === profile.favorites.length, 'Duplicate favorites');
const legacyStateSchema = z.object({
  version: z.literal(1), curriculumVersion: z.literal(curriculumVersion), revision: count,
  uiLanguage: languageSchema, activeProfileId: identifier.nullable(), profiles: z.array(profileSchema).max(24),
}).strict();
const currentStateSchema = legacyStateSchema.extend({ version: z.literal(2), customEntries: z.array(customEntrySchema).max(MAX_CUSTOM_ENTRIES) }).strict();
export const stateSchema = z.union([
  currentStateSchema,
  legacyStateSchema.transform((state) => ({ ...state, version: 2 as const, customEntries: [] as CustomEntry[] })),
]).superRefine((state, context) => {
  const knownEntries = new Set([...entryById.keys(), ...state.customEntries.map((entry) => entry.id)]);
  if (new Set(state.customEntries.map((entry) => entry.id)).size !== state.customEntries.length)
    context.addIssue({ code: 'custom', message: 'Duplicate entry IDs' });
  for (const profile of state.profiles) {
    if ([...profile.favorites, ...Object.keys(profile.progress), ...profile.history.map((review) => review.entryId)].some((id) => !knownEntries.has(id)))
      context.addIssue({ code: 'custom', message: 'Unknown curriculum entry' });
  }
  if (new Set(state.profiles.map((profile) => profile.id)).size !== state.profiles.length)
    context.addIssue({ code: 'custom', message: 'Duplicate profile IDs' });
  if (new Set(state.profiles.map((profile) => profile.name.toLocaleLowerCase())).size !== state.profiles.length)
    context.addIssue({ code: 'custom', message: 'Duplicate profile names' });
  if (state.activeProfileId !== null && !state.profiles.some((profile) => profile.id === state.activeProfileId))
    context.addIssue({ code: 'custom', message: 'Unknown active profile' });
  if (state.profiles.length > 0 && state.activeProfileId === null)
    context.addIssue({ code: 'custom', message: 'Existing profiles require an active profile' });
});

export type AppState = z.infer<typeof stateSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type SavedCard = z.infer<typeof cardSchema>;
export const initialState = (): AppState => ({ version: 2, curriculumVersion: 1, revision: 0, uiLanguage: 'de', activeProfileId: null, profiles: [], customEntries: [] });
export const allEntries = (state: AppState): Entry[] => [...curriculum, ...state.customEntries];
export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

export const backupSchema = z.object({
  format: z.literal('zajedno-backup'), version: z.union([z.literal(1), z.literal(2)]), exportedAt: date, data: z.unknown(),
}).strict().transform((backup, context) => {
  const parsed = stateSchema.safeParse(backup.data);
  if (!parsed.success || (backup.data as { version?: unknown })?.version !== backup.version) {
    context.addIssue({ code: 'custom', message: 'Invalid backup state or version' });
    return z.NEVER;
  }
  return { ...backup, data: parsed.data };
});

export function parseBackup(text: string): AppState {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) throw new Error('IMPORT_INVALID');
  try { return backupSchema.parse(JSON.parse(text)).data; }
  catch { throw new Error('IMPORT_INVALID'); }
}

export function makeBackup(state: AppState, now = new Date()): string {
  return JSON.stringify({ format: 'zajedno-backup', version: 2, exportedAt: now.toISOString(), data: stateSchema.parse(state) }, null, 2);
}

export const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('addEntry'), entry: entryFieldsSchema }).strict(),
  z.object({ type: z.literal('editEntry'), entryId: customId, expectedRevision: count, entry: entryFieldsSchema, confirmed: z.literal(true) }).strict(),
  z.object({ type: z.literal('removeEntry'), entryId: customId, expectedRevision: count, confirmed: z.literal(true) }).strict(),
  z.object({ type: z.literal('addProfile'), name: nameSchema, target: languageSchema, uiLanguage: languageSchema }).strict(),
  z.object({ type: z.literal('renameProfile'), profileId: identifier, name: nameSchema }).strict(),
  z.object({ type: z.literal('removeProfile'), profileId: identifier, confirmed: z.literal(true) }).strict(),
  z.object({ type: z.literal('selectProfile'), profileId: identifier }).strict(),
  z.object({ type: z.literal('language'), language: languageSchema }).strict(),
  z.object({ type: z.literal('favorite'), profileId: identifier, entryId, value: z.boolean() }).strict(),
  z.object({ type: z.literal('review'), profileId: identifier, target: languageSchema, entryId, expectedReps: count, expectedEntryRevision: count.optional(), rating: z.number().int().min(1).max(4) }).strict(),
]);
export type Command = z.infer<typeof commandSchema>;
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });

export function scheduleReview(previous: SavedCard | undefined, rating: number, now = new Date()): SavedCard {
  const input: Card = previous ? { ...previous, due: new Date(previous.due), last_review: previous.last_review ? new Date(previous.last_review) : undefined } : createEmptyCard(now);
  const result = scheduler.next(input, now, rating as Grade).card;
  return cardSchema.parse({ ...result, due: result.due.toISOString(), last_review: result.last_review?.toISOString() });
}

export function applyCommand(current: AppState, input: unknown, now = new Date(), newId = () => crypto.randomUUID()): AppState {
  const command = commandSchema.parse(input);
  const state = structuredClone(current);
  const find = (profileId: string) => {
    const profile = state.profiles.find((candidate) => candidate.id === profileId);
    if (!profile) throw new Error('PROFILE_MISSING');
    return profile;
  };
  const validateName = (name: string, except?: string) => {
    if (state.profiles.some((profile) => profile.id !== except && profile.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error('NAME_EXISTS');
  };
  const normalize = (text: string) => text.normalize('NFC').toLocaleLowerCase().replace(/\s+/gu, ' ').trim();
  const validateEntry = (entry: EntryFields, except?: string) => {
    if (allEntries(state).some((candidate) => candidate.id !== except && normalize(candidate.de) === normalize(entry.de) && normalize(candidate.sr) === normalize(entry.sr))) throw new Error('ENTRY_EXISTS');
  };
  const clearReviews = (id: string) => {
    for (const profile of state.profiles) {
      delete profile.progress[id];
      profile.history = profile.history.filter((review) => review.entryId !== id);
    }
  };
  switch (command.type) {
    case 'addEntry': {
      if (state.customEntries.length >= MAX_CUSTOM_ENTRIES) throw new Error('ENTRY_LIMIT');
      validateEntry(command.entry);
      state.customEntries.push({ ...command.entry, id: `custom-${newId()}`, revision: 1 });
      break;
    }
    case 'editEntry':
    case 'removeEntry': {
      const entry = state.customEntries.find((candidate) => candidate.id === command.entryId);
      if (!entry) throw new Error('ENTRY_MISSING');
      if (entry.revision !== command.expectedRevision) throw new Error('STALE_ENTRY');
      if (command.type === 'editEntry') {
        validateEntry(command.entry, entry.id);
        const answerChanged = entry.de !== command.entry.de || entry.sr !== command.entry.sr || entry.kind !== command.entry.kind || entry.topic !== command.entry.topic;
        if (!answerChanged && entry.dePlural === command.entry.dePlural && entry.srPlural === command.entry.srPlural) return current;
        Object.assign(entry, command.entry, { dePlural: command.entry.dePlural, srPlural: command.entry.srPlural, provenance: entry.provenance ?? command.entry.provenance, revision: entry.revision + 1 });
        if (!answerChanged) break;
      } else {
        state.customEntries = state.customEntries.filter((candidate) => candidate.id !== entry.id);
        for (const profile of state.profiles) profile.favorites = profile.favorites.filter((id) => id !== entry.id);
      }
      clearReviews(entry.id);
      break;
    }
    case 'addProfile': {
      if (state.profiles.length >= 24) throw new Error('PROFILE_LIMIT');
      validateName(command.name);
      const profile: Profile = { id: newId(), name: command.name, target: command.target, uiLanguage: command.uiLanguage, createdAt: now.toISOString(), favorites: [], progress: {}, history: [] };
      state.profiles.push(profile);
      state.activeProfileId = profile.id;
      state.uiLanguage = profile.uiLanguage;
      break;
    }
    case 'renameProfile': validateName(command.name, command.profileId); find(command.profileId).name = command.name; break;
    case 'removeProfile': {
      find(command.profileId);
      state.profiles = state.profiles.filter((profile) => profile.id !== command.profileId);
      if (state.activeProfileId === command.profileId) {
        state.activeProfileId = state.profiles[0]?.id ?? null;
        state.uiLanguage = state.profiles[0]?.uiLanguage ?? state.uiLanguage;
      }
      break;
    }
    case 'selectProfile': {
      const profile = find(command.profileId);
      state.activeProfileId = profile.id;
      state.uiLanguage = profile.uiLanguage;
      break;
    }
    case 'language': {
      state.uiLanguage = command.language;
      if (state.activeProfileId) find(state.activeProfileId).uiLanguage = command.language;
      break;
    }
    case 'favorite': {
      if (!allEntries(state).some((entry) => entry.id === command.entryId)) throw new Error('ENTRY_MISSING');
      const profile = find(command.profileId);
      profile.favorites = profile.favorites.filter((value) => value !== command.entryId);
      if (command.value) profile.favorites.push(command.entryId);
      break;
    }
    case 'review': {
      const entry = allEntries(state).find((candidate) => candidate.id === command.entryId);
      if (!entry) throw new Error('ENTRY_MISSING');
      const revision = state.customEntries.find((candidate) => candidate.id === entry.id)?.revision ?? 0;
      if (revision !== (command.expectedEntryRevision ?? 0)) throw new Error('STALE_ENTRY');
      const profile = find(command.profileId);
      if (profile.target !== command.target || (profile.progress[command.entryId]?.reps ?? 0) !== command.expectedReps) throw new Error('STALE_REVIEW');
      profile.progress[command.entryId] = scheduleReview(profile.progress[command.entryId], command.rating, now);
      profile.history = [...profile.history, { at: now.toISOString(), entryId: command.entryId, rating: command.rating }].slice(-2000);
      break;
    }
  }
  state.revision += 1;
  return stateSchema.parse(state);
}

export function learningQueue(profile: Profile, options: { topic?: string; kind?: string; favorites?: boolean; limit?: number; customOnly?: boolean } = {}, now = new Date(), catalog: Entry[] = curriculum, random?: () => number): string[] {
  const entries = catalog.filter((entry) => (!options.topic || entry.topic === options.topic) && (!options.kind || entry.kind === options.kind) && (!options.favorites || profile.favorites.includes(entry.id)) && (!options.customOnly || entry.id.startsWith('custom-')));
  const due = entries.filter((entry) => profile.progress[entry.id] && Date.parse(profile.progress[entry.id].due) <= now.getTime())
    .sort((left, right) => Date.parse(profile.progress[left.id].due) - Date.parse(profile.progress[right.id].due));
  const fresh = entries.filter((entry) => !profile.progress[entry.id]);
  if (random) {
    for (let index = fresh.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [fresh[index], fresh[other]] = [fresh[other], fresh[index]];
    }
  }
  return [...due, ...fresh].slice(0, options.limit ?? 10).map((entry) => entry.id);
}

export function advanceTurn(current: number, queues: string[][]) {
  const previous = queues[current][0];
  const remaining = queues.map((queue, index) => index === current ? queue.slice(1) : [...queue]);
  const turn = alternateTurn(current, remaining);
  if (turn !== null && remaining[turn][0] === previous) {
    const alternative = remaining[turn].findIndex((id) => id !== previous);
    if (alternative > 0) remaining[turn].unshift(...remaining[turn].splice(alternative, 1));
  }
  return { queues: remaining, turn };
}

export function alternateTurn(current: number, queues: string[][]): number | null {
  for (let offset = 1; offset <= queues.length; offset += 1) {
    const index = (current + offset) % queues.length;
    if (queues[index].length) return index;
  }
  return null;
}

export function profileStats(profile: Profile, now = new Date(), catalog: Entry[] = curriculum) {
  const cards = Object.values(profile.progress);
  return { started: cards.length, due: cards.filter((card) => Date.parse(card.due) <= now.getTime()).length, reviews: cards.reduce((total, card) => total + card.reps, 0), new: catalog.length - cards.length };
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export type StorageInfo = { desktop: boolean; path: string };
export type LocalSpeechVoice = { name: string; lang: string; localService: true; sapi: true };
export interface LocalBridge {
  load(): Promise<Result<AppState>>;
  command(command: Command): Promise<Result<AppState>>;
  exportData(): Promise<Result<boolean>>;
  importData(text: string): Promise<Result<AppState>>;
  info(): Promise<Result<StorageInfo>>;
  speechVoices?(): Promise<Result<LocalSpeechVoice[]>>;
  speakSapi?(text: string, voiceName: string): Promise<Result<boolean>>;
  cancelSpeech?(): Promise<Result<boolean>>;
}

export function sourceLanguage(target: Language): Language { return target === 'de' ? 'sr' : 'de'; }