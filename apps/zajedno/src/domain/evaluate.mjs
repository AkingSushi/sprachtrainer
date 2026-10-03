export function normalizeAnswer(value) {
  return value.normalize('NFC').trim().toLocaleLowerCase('de-DE')
    .replace(/[.,!?;:„“"«»]/gu, '').replace(/\s+/gu, ' ');
}

export function evaluateAnswer(answer, expected, alternatives = []) {
  const normalized = normalizeAnswer(answer);
  const accepted = [expected, ...alternatives].map(normalizeAnswer);
  if (accepted.includes(normalized)) return 'correct';
  const withoutMarks = (value) => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gu, 'd');
  if (normalized && accepted.some((value) => withoutMarks(value) === withoutMarks(normalized))) return 'diacritics';
  if (accepted.some((value) => /^(der|die|das) /u.test(value) && value.replace(/^(der|die|das) /u, '') === normalized)) return 'article';
  return 'incorrect';
}