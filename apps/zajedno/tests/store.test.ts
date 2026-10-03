import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LocalStore } from '../electron/store';
import { makeBackup, initialState, parseBackup } from '../src/domain/state';

const directories: string[] = [];
async function createStore() {
  const directory = await mkdtemp(path.join(tmpdir(), 'zajedno-test-'));
  directories.push(directory);
  return new LocalStore(directory);
}
afterEach(async () => { await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))); });

describe('durable local store', () => {
  it('backs up and migrates a version-one file once', async () => {
    const store = await createStore();
    const original = await store.command({ type: 'addProfile', name: 'Ana', target: 'de', uiLanguage: 'sr' });
    const { customEntries, ...data } = original;
    await writeFile(store.file, JSON.stringify({ ...data, version: 1 }));
    expect(await store.load()).toEqual(original);
    expect(JSON.parse(await readFile(store.file, 'utf8')).version).toBe(2);
    await store.load();
    expect(await readdir(path.join(store.directory, 'backups'))).toHaveLength(1);
  });
  it('persists custom entries and backs up edits and deletions', async () => {
    const store = await createStore();
    const fields = { de: 'der Kühlschrank', sr: 'frižider', topic: 'home', kind: 'word' };
    const original = await store.command({ type: 'addEntry', entry: fields });
    const id = original.customEntries[0].id;
    expect(await new LocalStore(store.directory).load()).toEqual(original);
    const edited = await store.command({ type: 'editEntry', entryId: id, expectedRevision: 1, entry: { ...fields, de: 'der Gefrierschrank', sr: 'zamrzivač' }, confirmed: true });
    expect(parseBackup(await store.exportData())).toEqual(edited);
    await store.command({ type: 'removeEntry', entryId: id, expectedRevision: 2, confirmed: true });
    expect((await store.load()).customEntries).toEqual([]);
    const names = await readdir(path.join(store.directory, 'backups'));
    expect(names).toHaveLength(2);
    const backups = await Promise.all(names.map(async (name) => parseBackup(await readFile(path.join(store.directory, 'backups', name), 'utf8'))));
    expect(backups).toContainEqual(original);
    expect(backups).toContainEqual(edited);
  });
  it('serializes concurrent updates without losing another profile', async () => {
    const store = await createStore();
    await Promise.all(Array.from({ length: 12 }, (_, index) => store.command({ type: 'addProfile', name: `Learner ${index}`, target: 'sr', uiLanguage: 'de' })));
    const loaded = await new LocalStore(store.directory).load();
    expect(loaded.profiles).toHaveLength(12);
    expect(loaded.revision).toBe(12);
  });
  it('backs up the prior state before a destructive restore', async () => {
    const store = await createStore();
    const previous = await store.command({ type: 'addProfile', name: 'Ana', target: 'de', uiLanguage: 'sr' });
    await store.restore(makeBackup(initialState()));
    expect((await store.load()).profiles).toHaveLength(0);
    const files = await readdir(path.join(store.directory, 'backups'));
    expect(parseBackup(await readFile(path.join(store.directory, 'backups', files[0]), 'utf8'))).toEqual(previous);
  });
  it('does not wipe corrupted data and permits explicit restore with a raw backup', async () => {
    const store = await createStore();
    await writeFile(store.file, '{damaged', 'utf8');
    await expect(store.load()).rejects.toThrow('STORAGE_CORRUPT');
    await expect(store.command({ type: 'language', language: 'sr' })).rejects.toThrow('STORAGE_CORRUPT');
    expect(await readFile(store.file, 'utf8')).toBe('{damaged');
    await store.restore(makeBackup(initialState()));
    expect((await store.load()).profiles).toHaveLength(0);
    const files = await readdir(path.join(store.directory, 'backups'));
    expect(await readFile(path.join(store.directory, 'backups', files[0]), 'utf8')).toBe('{damaged');
  });
  it('backs up deleted profiles, recovers its queue after rejection, and rejects unsafe imports', async () => {
    const store = await createStore();
    const state = await store.command({ type: 'addProfile', name: 'Ana', target: 'de', uiLanguage: 'sr' });
    await expect(store.restore('{}')).rejects.toThrow('IMPORT_INVALID');
    await store.command({ type: 'removeProfile', profileId: state.profiles[0].id, confirmed: true });
    expect((await readdir(path.join(store.directory, 'backups'))).length).toBe(1);
    expect((await store.load()).profiles).toHaveLength(0);
  });
});