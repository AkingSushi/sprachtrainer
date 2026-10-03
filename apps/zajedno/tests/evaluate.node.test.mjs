import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAnswer } from '../src/domain/evaluate.mjs';

test('both directions preserve articles and Serbian Latin distinctions', () => {
  assert.equal(evaluateAnswer('  DER TISCH! ', 'der Tisch'), 'correct');
  assert.equal(evaluateAnswer('Tisch', 'der Tisch'), 'article');
  assert.equal(evaluateAnswer('die Tisch', 'der Tisch'), 'incorrect');
  assert.equal(evaluateAnswer('casa', 'čaša'), 'diacritics');
  assert.equal(evaluateAnswer('časa', 'čaša'), 'diacritics');
  assert.equal(evaluateAnswer('ĐAK', 'đak'), 'correct');
  assert.equal(evaluateAnswer('djak', 'đak'), 'incorrect');
  assert.equal(evaluateAnswer('čaša'.normalize('NFD'), 'čaša'), 'correct');
  assert.equal(evaluateAnswer('', 'čaša'), 'incorrect');
});