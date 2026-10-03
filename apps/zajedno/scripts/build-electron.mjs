import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
await build({ absWorkingDir: root, entryPoints: { main: 'electron/main.ts', preload: 'electron/preload.ts' }, outdir: 'dist-electron', outExtension: { '.js': '.cjs' }, bundle: true, platform: 'node', target: 'node22', format: 'cjs', external: ['electron'], sourcemap: true });