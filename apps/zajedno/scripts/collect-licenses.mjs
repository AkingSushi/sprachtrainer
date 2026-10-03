import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';

const packages = ['react', 'react-dom', 'scheduler', 'ts-fsrs', 'zod', 'lucide-react', '@fontsource/nunito-sans'];
const sections = [];
for (const name of packages) {
  const directory = new URL(`../node_modules/${name}/`, import.meta.url);
  const files = await readdir(directory);
  const license = files.find((file) => /^(license|licence|ofl)(\.(txt|md))?$/iu.test(file));
  if (!license) throw new Error(`Missing bundled license: ${name}`);
  sections.push(`${name}\n${'='.repeat(name.length)}\n${await readFile(new URL(license, directory), 'utf8')}`);
}
const output = new URL('../public/', import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL('THIRD-PARTY-LICENSES.txt', output), sections.join('\n\n'), 'utf8');
console.log(`Bundled ${sections.length} dependency license texts.`);