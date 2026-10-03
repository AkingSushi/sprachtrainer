export type DictionaryEntry = { id: string; de: string; sr: string; sense: string; pos: string; source: string };
export type Lexicon = { retrievedAt: string; license: string; attribution: string; entries: DictionaryEntry[] };
export const foldWord = (value: string) => value.toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd').trim();
export function searchDictionary(entries: DictionaryEntry[], query: string) {
  const term = foldWord(query);
  if (!term) return entries;
  const rank = (entry: DictionaryEntry) => {
    const german = foldWord(entry.de).replace(/^(der|die|das) /u, '');
    const serbian = foldWord(entry.sr);
    return german === term || serbian === term ? 0 : german.startsWith(term) || serbian.startsWith(term) ? 1 : 2;
  };
  return entries.filter((entry) => foldWord(`${entry.de} ${entry.sr} ${entry.sense}`).includes(term))
    .sort((left, right) => rank(left) - rank(right));
}