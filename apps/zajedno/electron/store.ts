import { mkdir, readFile, open, rename, unlink, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { applyCommand, commandSchema, initialState, makeBackup, MAX_IMPORT_BYTES, parseBackup, stateSchema, type AppState } from '../src/domain/state';

export class LocalStore {
  readonly file: string;
  private pending: Promise<unknown> = Promise.resolve();

  constructor(readonly directory: string) { this.file = path.join(directory, 'learners-v1.json'); }

  private serial<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.pending.then(operation);
    this.pending = result.catch(() => undefined);
    return result;
  }

  private async read(): Promise<AppState> {
    try {
      if ((await stat(this.file)).size > MAX_IMPORT_BYTES) throw new Error('STORAGE_CORRUPT');
      const raw = JSON.parse(await readFile(this.file, 'utf8'));
      const state = stateSchema.parse(raw);
      if (raw.version === 1) {
        await this.backupExisting();
        await this.write(state);
      }
      return state;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return initialState();
      if (error instanceof SyntaxError || (error instanceof Error && error.name === 'ZodError')) throw new Error('STORAGE_CORRUPT');
      throw error;
    }
  }

  private async write(state: AppState): Promise<void> {
    const valid = stateSchema.parse(state);
    if (Buffer.byteLength(makeBackup(valid), 'utf8') > MAX_IMPORT_BYTES) throw new Error('STORAGE_LIMIT');
    await mkdir(this.directory, { recursive: true });
    const temporary = path.join(this.directory, `.${randomUUID()}.tmp`);
    try {
      const handle = await open(temporary, 'wx', 0o600);
      try { await handle.writeFile(JSON.stringify(valid), 'utf8'); await handle.sync(); }
      finally { await handle.close(); }
      await rename(temporary, this.file);
    } finally { await unlink(temporary).catch(() => undefined); }
  }

  private async backupExisting(): Promise<void> {
    let raw: string;
    try { raw = await readFile(this.file, 'utf8'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return; throw error; }
    const folder = path.join(this.directory, 'backups');
    await mkdir(folder, { recursive: true });
    let content: string;
    let extension: string;
    try { content = makeBackup(stateSchema.parse(JSON.parse(raw))); extension = 'json'; }
    catch { content = raw; extension = 'damaged.txt'; }
    await writeFile(path.join(folder, `${new Date().toISOString().replace(/[:.]/gu, '-')}-${randomUUID()}.${extension}`), content, { flag: 'wx', mode: 0o600 });
  }

  load(): Promise<AppState> { return this.serial(() => this.read()); }
  exportData(): Promise<string> { return this.serial(async () => makeBackup(await this.read())); }
  command(input: unknown): Promise<AppState> {
    return this.serial(async () => {
      const command = commandSchema.parse(input);
      const next = applyCommand(await this.read(), command, new Date(), randomUUID);
      if (command.type === 'removeProfile' || command.type === 'editEntry' || command.type === 'removeEntry') await this.backupExisting();
      await this.write(next);
      return next;
    });
  }
  restore(text: string): Promise<AppState> {
    return this.serial(async () => {
      const restored = parseBackup(text);
      await this.backupExisting();
      let revision = restored.revision;
      try { revision = Math.max(revision, (await this.read()).revision); }
      catch (error) { if (!(error instanceof Error) || error.message !== 'STORAGE_CORRUPT') throw error; }
      const next = { ...restored, revision: revision + 1 };
      await this.write(next);
      return next;
    });
  }
  async flush(): Promise<void> { await this.pending; }
}