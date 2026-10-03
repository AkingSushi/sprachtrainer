import { _electron as electron } from 'playwright';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';

const root = fileURLToPath(new URL('../', import.meta.url));
const scaled = process.argv.includes('--scale-150');
const grammarOnly = process.argv.includes('--grammar-only');
const artifacts = path.join(root, '.preview', ...(scaled ? ['scale-150'] : []));
await mkdir(artifacts, { recursive: true });
const testHome = await mkdtemp(path.join(tmpdir(), 'zajedno-desktop-'));
const executablePath = path.join(root, process.env.ZAJEDNO_TEST_RELEASE ?? 'release', 'win-unpacked', 'Zajedno.exe');
const env = { ...process.env, LOCALAPPDATA: testHome };
delete env.ELECTRON_RUN_AS_NODE;
delete env.ZAJEDNO_DEV_URL;
let application;
const checks = [];
const consoleErrors = [];
const externalRequests = [];
const record = (message) => { checks.push(message); console.log(`PASS ${message}`); };

async function checkLayout(page, name) {
  await page.evaluate(() => document.fonts.ready);
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, images: [...document.images].every((image) => image.complete && image.naturalWidth > 0) }));
  assert.ok(dimensions.scroll <= dimensions.width + 1, `Horizontal overflow in ${name}: ${JSON.stringify(dimensions)}`);
  assert.ok(dimensions.images, `Missing bitmap in ${name}`);
  const clippedNavigation = await page.locator('.nav-link').evaluateAll((buttons) => buttons.filter((button) => {
    const label = button.querySelector('span').getBoundingClientRect();
    const bounds = button.getBoundingClientRect();
    return label.left < bounds.left || label.right > bounds.right + 1 || label.bottom > bounds.bottom + 1 || bounds.right > innerWidth + 1;
  }).map((button) => button.textContent));
  assert.deepEqual(clippedNavigation, [], `Clipped navigation in ${name}`);
  await page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage: true, animations: 'disabled' });
  record(`Layout and bundled assets: ${name}`);
}

async function checkGermanKeys(container, input, characters) {
  await input.fill('');
  for (const character of characters) {
    await container.getByRole('button', { name: character, exact: true }).first().click();
  }
  assert.equal(await input.inputValue(), characters.join(''));
  await input.fill('der Kuhlschrank');
  await input.evaluate((element) => { element.focus(); element.setSelectionRange(5, 5); });
  await container.getByRole('button', { name: 'ü', exact: true }).first().click();
  assert.equal(await input.inputValue(), 'der Küuhlschrank');
  await input.evaluate((element) => { element.focus(); element.setSelectionRange(5, 7); });
  await container.getByRole('button', { name: 'ü', exact: true }).first().click();
  assert.equal(await input.inputValue(), 'der Kühlschrank');
  assert.ok(await input.evaluate((element) => document.activeElement === element));
  record(`German screen keys insert and replace at the cursor: ${characters.join(' ')}`);
}

async function checkCustomVocabulary(page) {
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1240, 900));
  let state = await page.evaluate(async () => (await window.zajedno.load()).value);
  const peterId = state.profiles.find((profile) => profile.name === 'Peter').id;
  const anaId = state.profiles.find((profile) => profile.name === 'Ana').id;
  await page.getByRole('combobox', { name: 'Lernprofil', exact: true }).selectOption(peterId);
  await page.getByRole('button', { name: 'Bibliothek', exact: true }).click();
  await page.getByRole('button', { name: 'Eintrag hinzufügen', exact: true }).click();
  const dialog = page.getByRole('dialog');
  assert.ok(await dialog.getByRole('button', { name: 'Speichern', exact: true }).isDisabled());
  await checkGermanKeys(dialog, dialog.getByLabel('Deutsch', { exact: true }), ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']);
  await checkGermanKeys(dialog.locator('.plural-input').first(), dialog.getByLabel('Mehrzahl Deutsch (optional)', { exact: true }), ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']);
  await dialog.getByLabel('Mehrzahl Deutsch (optional)', { exact: true }).fill('die Kühlschränke');
  await dialog.getByLabel('Mehrzahl Serbisch (optional)', { exact: true }).fill('frižideri');
  await dialog.getByLabel('Serbisch (lateinisch)', { exact: true }).fill('фрижидер');
  await dialog.getByRole('button', { name: 'Speichern', exact: true }).click();
  await dialog.getByRole('alert').filter({ hasText: 'lateinischer Schrift' }).waitFor();
  await dialog.getByLabel('Serbisch (lateinisch)', { exact: true }).fill('frižider');
  await checkLayout(page, 'desktop-de-entry-editor');
  await dialog.getByRole('button', { name: 'Speichern', exact: true }).click();
  await page.locator('.library-list').getByText('frižider', { exact: true }).waitFor();
  state = await page.evaluate(async () => (await window.zajedno.load()).value);
  const id = state.customEntries[0].id;
  assert.equal(state.customEntries.length, 1);
  assert.equal(state.customEntries[0].dePlural, 'die Kühlschränke');
  assert.equal(state.customEntries[0].srPlural, 'frižideri');
  await page.locator('.library-list').getByText('die Kühlschränke', { exact: true }).waitFor();
  await checkLayout(page, 'desktop-de-own-library');
  await page.getByRole('button', { name: 'Eintrag hinzufügen', exact: true }).click();
  await dialog.getByLabel('Deutsch', { exact: true }).fill('der Kühlschrank');
  await dialog.getByLabel('Serbisch (lateinisch)', { exact: true }).fill('frižider');
  await dialog.getByRole('button', { name: 'Speichern', exact: true }).click();
  await dialog.getByRole('alert').filter({ hasText: 'bereits vorhanden' }).waitFor();
  await dialog.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  await page.getByRole('button', { name: 'Als Favorit merken', exact: true }).click();
  record('Library creates persistent custom entries and rejects Cyrillic and duplicate pairs');

  await page.getByRole('button', { name: 'Lernen', exact: true }).click();
  await page.getByLabel('Eigene Einträge', { exact: true }).check();
  await page.locator('.mode-picker label').filter({ hasText: 'Schreiben' }).click();
  await page.getByRole('button', { name: 'Jetzt lernen', exact: true }).click();
  await page.getByLabel('Deine Antwort', { exact: true }).fill('frižider');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await page.getByText('Lernstand gespeichert', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Zurück zum Lernplatz', exact: true }).click();
  await page.getByRole('button', { name: 'Bibliothek', exact: true }).click();
  await page.getByRole('combobox', { name: 'Herkunft', exact: true }).selectOption('custom');
  await page.getByRole('button', { name: 'Bearbeiten: der Kühlschrank', exact: true }).click();
  assert.ok(await dialog.getByRole('button', { name: 'Speichern', exact: true }).isDisabled());
  await dialog.getByLabel('Deutsch', { exact: true }).fill('der Gefrierschrank');
  await dialog.getByLabel('Serbisch (lateinisch)', { exact: true }).fill('zamrzivač');
  await dialog.getByLabel('Mehrzahl Deutsch (optional)', { exact: true }).fill('die Gefrierschränke');
  await dialog.getByLabel('Mehrzahl Serbisch (optional)', { exact: true }).fill('zamrzivači');
  await dialog.getByLabel('Änderung bestätigen (gegebenenfalls Lernstand zurücksetzen)', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Speichern', exact: true }).click();
  await page.locator('.library-list').getByText('zamrzivač', { exact: true }).waitFor();
  state = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.equal(state.customEntries[0].id, id);
  assert.equal(state.customEntries[0].revision, 2);
  assert.equal(state.profiles.find((profile) => profile.id === peterId).progress[id], undefined);
  assert.equal(state.profiles.find((profile) => profile.id === peterId).progress['greetings-w1'].reps, 1);
  record('Editing preserves the entry ID and resets only that entry after explicit confirmation');

  await page.getByRole('button', { name: 'Lernen', exact: true }).click();
  await page.getByLabel('Eigene Einträge', { exact: true }).check();
  await page.locator('.mode-picker label').filter({ hasText: 'Auswahl' }).click();
  await page.getByRole('button', { name: 'Jetzt lernen', exact: true }).click();
  await page.locator('.choice-grid button').filter({ hasText: 'zamrzivač' }).click();
  await page.getByText('Lernstand gespeichert', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Zurück zum Lernplatz', exact: true }).click();
  await page.getByRole('combobox', { name: 'Lernprofil', exact: true }).selectOption(anaId);
  await page.getByLabel('Eigene Einträge', { exact: true }).check();
  await page.getByRole('button', { name: 'Jetzt lernen', exact: true }).click();
  await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click();
  await page.getByRole('heading', { name: 'der Gefrierschrank', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Gewusst', exact: true }).click();
  await page.getByText('Lernstand gespeichert', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Zurück zum Lernplatz', exact: true }).click();
  state = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.equal(state.profiles.find((profile) => profile.id === peterId).progress[id].reps, 1);
  assert.equal(state.profiles.find((profile) => profile.id === anaId).progress[id].reps, 1);
  record('Own entries work in writing, choice and flashcard modes in both directions');

  await page.getByRole('combobox', { name: /^Oberflächensprache/u }).selectOption('sr');
  await page.getByRole('button', { name: 'Biblioteka', exact: true }).click();
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(400, 800));
  await page.getByRole('button', { name: 'Dodaj stavku', exact: true }).click();
  await checkGermanKeys(dialog, dialog.getByLabel('Nemački', { exact: true }), ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']);
  await dialog.getByLabel('Nemački', { exact: true }).fill('Der Kühlschrank ist leer.');
  await dialog.getByLabel('Srpski (latinica)', { exact: true }).fill('Frižider je prazan.');
  await dialog.getByRole('combobox', { name: /^Sadržaj/u }).selectOption('sentence');
  await checkLayout(page, 'mobile-sr-entry-editor');
  await dialog.getByRole('button', { name: 'Sačuvaj', exact: true }).click();
  await page.locator('.library-list').getByText('Frižider je prazan.', { exact: true }).waitFor();
  await checkLayout(page, 'mobile-sr-own-library');
  await page.getByRole('button', { name: 'Zajedno', exact: true }).click();
  await page.getByLabel('Sopstvene stavke', { exact: true }).check();
  await page.getByRole('combobox', { name: /^Sadržaj/u }).selectOption('sentence');
  await page.getByRole('button', { name: 'Počnite zajedno', exact: true }).click();
  await page.getByText('Ana je na redu', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Prikaži odgovor', exact: true }).click();
  await page.getByRole('button', { name: 'Znam', exact: true }).click();
  await page.getByRole('button', { name: 'Dalje', exact: true }).click();
  await page.getByText('Peter ist dran', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click();
  await page.getByRole('button', { name: 'Gewusst', exact: true }).click();
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();
  await page.getByRole('heading', { name: 'Krug je završen', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Nazad na početak', exact: true }).last().click();
  record('Custom sentences work in alternating shared rounds and Serbian editing UI');

  await page.getByRole('button', { name: 'Biblioteka', exact: true }).click();
  await page.getByRole('combobox', { name: 'Poreklo', exact: true }).selectOption('custom');
  await page.getByRole('button', { name: 'Izmeni: der Gefrierschrank', exact: true }).click();
  await dialog.getByLabel('Nemački', { exact: true }).fill('Verworfen');
  await dialog.getByRole('button', { name: 'Otkaži', exact: true }).click();
  await page.getByRole('button', { name: 'Obriši: der Gefrierschrank', exact: true }).click();
  await dialog.getByRole('button', { name: 'Otkaži', exact: true }).click();
  assert.equal((await page.evaluate(async () => (await window.zajedno.load()).value)).customEntries.length, 2);
  await page.getByRole('button', { name: 'Obriši: der Gefrierschrank', exact: true }).click();
  await dialog.getByRole('button', { name: 'Sačuvaj i obriši', exact: true }).click();
  await page.getByRole('button', { name: 'Obriši: der Gefrierschrank', exact: true }).waitFor({ state: 'detached' });
  state = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.equal(state.customEntries.length, 1);
  for (const profile of state.profiles) {
    assert.equal(profile.progress[id], undefined);
    assert.ok(!profile.favorites.includes(id));
    assert.ok(!profile.history.some((review) => review.entryId === id));
  }
  const backups = await readdir(path.join(testHome, 'Zajedno', 'backups'));
  assert.ok(backups.length >= 2);
  record('Cancel keeps entries unchanged; confirmed deletion cleans all profiles with automatic backup');
  await page.getByRole('combobox', { name: /^Jezik prikaza/u }).selectOption('de');
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
}

async function checkDictionary(page) {
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1240, 900));
  await page.waitForFunction(() => innerWidth === 1240, { }, { polling: 200 });
  await page.getByRole('button', { name: 'Bibliothek', exact: true }).click();
  await page.getByRole('tab', { name: 'Wörterbuch', exact: true }).click();
  await page.getByRole('tab', { name: 'Wörterbuch', exact: true }).hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.dictionary-tabs [aria-selected=true]')).backgroundColor === 'rgb(23, 70, 52)', {}, { polling: 200 });
  const selected = await page.getByRole('tab', { name: 'Wörterbuch', exact: true }).evaluate((button) => ({ background: getComputedStyle(button).backgroundColor, foreground: getComputedStyle(button).color }));
  assert.equal(selected.foreground, 'rgb(255, 255, 255)');
  assert.ok(['rgb(23, 70, 52)', 'rgb(34, 92, 72)'].includes(selected.background));
  const search = page.getByRole('searchbox');
  await search.fill('kuca');
  await page.getByRole('button', { name: 'Bereits im Lernbestand: das Haus / kuća', exact: true }).waitFor();
  assert.ok(await page.getByRole('button', { name: 'Bereits im Lernbestand: das Haus / kuća', exact: true }).isDisabled());
  await search.fill('zzzzunfindbarzzzz');
  await page.locator('.dictionary-list li').first().waitFor({ state: 'detached' });
  await search.fill('Kühlschrank');
  const adopt = page.getByRole('button', { name: 'Übernehmen: der Kühlschrank / frižider', exact: true });
  await adopt.waitFor();
  await checkLayout(page, 'desktop-de-dictionary');
  const before = await page.evaluate(async () => (await window.zajedno.load()).value);
  await adopt.click();
  const dialog = page.getByRole('dialog');
  assert.equal(await dialog.getByLabel('Serbisch (lateinisch)', { exact: true }).inputValue(), 'frižider');
  await dialog.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  assert.equal((await page.evaluate(async () => (await window.zajedno.load()).value)).revision, before.revision);
  await adopt.click();
  await dialog.getByRole('button', { name: 'Speichern', exact: true }).click();
  await page.locator('.library-list').getByText('frižider', { exact: true }).waitFor();
  const after = await page.evaluate(async () => (await window.zajedno.load()).value);
  const added = after.customEntries.find((entry) => entry.de === 'der Kühlschrank');
  assert.equal(after.customEntries.length, before.customEntries.length + 1);
  assert.equal(added.provenance.license, 'CC-BY-SA-4.0');
  assert.equal(added.provenance.url, 'https://de.wiktionary.org/wiki/K%C3%BChlschrank#Deutsch');
  await page.getByRole('button', { name: 'Bearbeiten: der Kühlschrank', exact: true }).click();
  await dialog.getByLabel('Serbisch (lateinisch)', { exact: true }).fill('frižider (hladnjak)');
  await dialog.getByLabel('Änderung bestätigen (gegebenenfalls Lernstand zurücksetzen)', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Speichern', exact: true }).click();
  await dialog.waitFor({ state: 'detached' });
  assert.deepEqual((await page.evaluate(async () => (await window.zajedno.load()).value)).customEntries.find((entry) => entry.id === added.id).provenance, added.provenance);
  record('Offline dictionary search, built-in duplicate guard, cancel, adoption and provenance after editing');
  await page.getByRole('combobox', { name: /^Oberflächensprache/u }).selectOption('sr');
  await page.getByRole('tab', { name: 'Rečnik', exact: true }).click();
  await search.fill('frizider');
  await page.locator('.dictionary-list').getByText('frižider', { exact: true }).first().waitFor();
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(400, 800));
  await checkLayout(page, 'mobile-sr-dictionary');
  assert.ok(!/\p{Script=Cyrillic}/u.test(await page.locator('body').innerText()));
  await page.getByRole('combobox', { name: /^Jezik prikaza/u }).selectOption('de');
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
}

async function checkGrammarAndPlurals(page) {
  await page.evaluate(async () => {
    const result = await window.zajedno.command({ type: 'language', language: 'de' });
    if (!result.ok) throw new Error(result.error);
  });
  await page.reload();
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1240, 900));
  await page.getByRole('button', { name: 'Grammatik', exact: true }).click();
  for (const language of ['sr', 'de']) {
    await page.getByRole('combobox', { name: /^Lernrichtung/u }).selectOption(language);
    const title = language === 'sr' ? 'Serbische Grammatik' : 'Nemačka gramatika';
    await page.getByRole('heading', { name: title, exact: true }).waitFor();
    assert.equal(await page.locator('.grammar-chapter').count(), 9);
    assert.equal(await page.locator('.grammar-book article').getAttribute('lang'), language === 'sr' ? 'de' : 'sr-Latn');
    await page.locator('.grammar-contents a').nth(2).click();
    const chapter = await page.locator('#grammar-plural').boundingBox();
    assert.ok(chapter.y >= 0 && chapter.y < 200);
    await page.evaluate(() => scrollTo(0, 0));
    await checkLayout(page, `grammar-${language}-desktop`);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.sidebar').isVisible(), false);
    assert.equal(await page.locator('.grammar-tools').isVisible(), false);
    await page.emulateMedia({ media: 'screen' });
    const bytes = await application.evaluate(async ({ BrowserWindow }) => Array.from(await BrowserWindow.getAllWindows()[0].webContents.printToPDF({ printBackground: true, preferCSSPageSize: true })));
    const pdf = Buffer.from(bytes);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    assert.ok(pdf.length > 10000);
    await writeFile(path.join(artifacts, language === 'sr' ? 'Serbische-Grammatik-auf-Deutsch.pdf' : 'Nemacka-gramatika-na-srpskom.pdf'), pdf);
    await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(400, 800));
    await checkLayout(page, `grammar-${language}-mobile`);
    await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1240, 900));
  }
  record('Both grammar books, chapter navigation, print styles and PDF exports');
  await page.getByRole('button', { name: 'Bibliothek', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Wörter und Sätze suchen', exact: true }).fill('das Haus');
  await page.locator('.library-list').getByText('die Häuser', { exact: true }).waitFor();
  await page.locator('.library-list').getByText('kuće', { exact: true }).waitFor();
  await checkLayout(page, 'noun-plural-library');
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(400, 800));
  await checkLayout(page, 'noun-plural-mobile');
  const data = await page.evaluate(async () => (await window.zajedno.load()).value);
  const entry = data.customEntries.find((entry) => entry.kind === 'word');
  assert.ok(entry);
  await page.getByRole('searchbox', { name: 'Wörter und Sätze suchen', exact: true }).fill(entry.de);
  await page.getByRole('button', { name: `Bearbeiten: ${entry.de}`, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mehrzahl Deutsch (optional)', { exact: true }).fill('Testformen');
  await dialog.getByLabel('Änderung bestätigen (gegebenenfalls Lernstand zurücksetzen)', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Speichern', exact: true }).click();
  await page.locator('.library-list').getByText('Testformen', { exact: true }).waitFor();
  const saved = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.deepEqual(saved.profiles, data.profiles);
  await page.reload();
  const reloaded = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.equal(reloaded.customEntries.find((candidate) => candidate.id === entry.id).dePlural, 'Testformen');
  record('Library plural display and metadata-only edit preserve learner histories and survive reload');
}

async function checkSharedTyping(page) {
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1280, 660));
  await page.waitForFunction(() => innerWidth === 1280 && innerHeight === 660, {}, { polling: 200 });
  const created = await page.evaluate(async () => {
    const first = await window.zajedno.command({ type: 'addProfile', name: 'Mix DE', target: 'sr', uiLanguage: 'de' });
    const second = await window.zajedno.command({ type: 'addProfile', name: 'Mix SR', target: 'de', uiLanguage: 'sr' });
    return first.ok && second.ok;
  });
  assert.ok(created);
  await page.reload();
  await page.getByRole('button', { name: 'Zajedno', exact: true }).click();
  const state = await page.evaluate(async () => (await window.zajedno.load()).value);
  const partner = state.profiles.find((profile) => profile.name === 'Mix DE');
  await page.locator('.partner-selectors select').nth(1).selectOption(partner.id);
  await page.locator('.mode-picker label').filter({ hasText: 'Pisanje' }).click();
  await page.getByRole('combobox', { name: /^Tema/u }).selectOption('home');
  await page.getByRole('combobox', { name: /^Sadržaj/u }).selectOption('word');
  await page.locator('.setup-fields select').nth(2).selectOption('5');
  await checkLayout(page, 'compact-sr-together-setup');
  await page.evaluate(() => { Math.random = () => 0.999999; });
  await page.getByRole('button', { name: 'Počnite zajedno', exact: true }).click();
  const seen = [[], []];
  let previous;
  for (let index = 0; index < 10; index++) {
    const serbianUi = index % 2 === 0;
    await page.getByText(serbianUi ? 'Mix SR je na redu' : 'Mix DE ist dran', { exact: true }).waitFor();
    if (index < 2) await checkLayout(page, `compact-${serbianUi ? 'sr' : 'de'}-together-typing`);
    await page.getByLabel(serbianUi ? 'Tvoj odgovor' : 'Deine Antwort', { exact: true }).fill('zzzz');
    await page.getByRole('button', { name: serbianUi ? 'Proveri' : 'Prüfen', exact: true }).click();
    await page.getByText(serbianUi ? 'Napredak je sačuvan' : 'Lernstand gespeichert', { exact: true }).waitFor();
    const current = await page.evaluate(async () => (await window.zajedno.load()).value);
    const learner = current.profiles.find((profile) => profile.name === (serbianUi ? 'Mix SR' : 'Mix DE'));
    const reviewed = learner.history.at(-1).entryId;
    assert.ok(reviewed.startsWith('home-w'));
    if (seen[index % 2].length < 4) assert.notEqual(reviewed, previous);
    assert.equal(learner.progress[reviewed].reps, 1);
    seen[index % 2].push(reviewed);
    previous = reviewed;
    if (index < 2) {
      await page.evaluate(() => window.scrollTo(0, 0));
      const bounds = await page.locator('.saved-row>button').boundingBox();
      assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 660, 'Next button must fit without scrolling');
      await checkLayout(page, `compact-${serbianUi ? 'sr' : 'de'}-together-feedback`);
      await page.screenshot({ path: path.join(artifacts, `viewport-${serbianUi ? 'sr' : 'de'}-feedback.png`), animations: 'disabled' });
    }
    await page.getByRole('button', { name: serbianUi ? 'Dalje' : 'Weiter', exact: true }).click();
  }
  await page.getByRole('heading', { name: 'Krug je završen', exact: true }).waitFor();
  for (const entries of seen) assert.deepEqual([...entries].sort(), ['home-w1', 'home-w2', 'home-w3', 'home-w4', 'home-w5']);
  record('Full topic-filtered typing round mixes identical queues, preserves all cards and both learner histories');
}

try {
  await stat(executablePath);
  application = await electron.launch({ executablePath, cwd: root, env, args: scaled ? ['--force-device-scale-factor=1.5'] : [], timeout: 45000 });
  const page = await application.firstWindow();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('request', (request) => { if (/^https?:/u.test(request.url())) externalRequests.push(request.url()); });
  await page.getByRole('heading', { name: 'Wer lernt heute?' }).waitFor();
  assert.ok(await page.evaluate(() => !!window.zajedno));
  const security = await application.evaluate(({ BrowserWindow, app }) => {
    const preferences = BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
    return { sandbox: preferences.sandbox, contextIsolation: preferences.contextIsolation, nodeIntegration: preferences.nodeIntegration, userData: app.getPath('userData') };
  });
  assert.equal(security.sandbox, true);
  assert.equal(security.contextIsolation, true);
  assert.equal(security.nodeIntegration, false);
  assert.equal(security.userData, path.join(testHome, 'Zajedno'));
  assert.equal(await page.evaluate(() => typeof window.require), 'undefined');
  record('Packaged startup, narrow preload, sandbox and isolated userData');
  await application.evaluate(async ({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0];
    if (!window.isMaximized()) await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Window did not maximize on startup')), 5000);
      window.once('maximize', () => { clearTimeout(timeout); resolve(); });
    });
  });
  assert.equal(await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isMaximized()), true);
  assert.equal(await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isFullScreen()), false);
  if (scaled) assert.equal(await page.evaluate(() => devicePixelRatio), 1.5);
  await checkLayout(page, 'maximized-start');
  record(`Maximized startup with native window controls; device scale ${await page.evaluate(() => devicePixelRatio)}`);
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].unmaximize());
  await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1240, 900));
  await checkLayout(page, 'desktop-de-first-start');

  if (grammarOnly) {
    await page.evaluate(async () => {
      for (const command of [
        { type: 'addProfile', name: 'Grammar test', target: 'sr', uiLanguage: 'de' },
        { type: 'addEntry', entry: { de: 'der Kühlschrank', sr: 'frižider', topic: 'home', kind: 'word' } },
      ]) {
        const result = await window.zajedno.command(command);
        if (!result.ok) throw new Error(result.error);
      }
      const state = (await window.zajedno.load()).value;
      const result = await window.zajedno.command({ type: 'review', profileId: state.profiles[0].id, target: 'sr', entryId: state.customEntries[0].id, expectedReps: 0, expectedEntryRevision: 1, rating: 3 });
      if (!result.ok) throw new Error(result.error);
    });
    await page.reload();
  } else {
  await page.getByLabel('Name', { exact: true }).fill('Peter');
  await page.getByRole('button', { name: 'Profil anlegen', exact: true }).click();
  await page.getByRole('heading', { name: 'Dein Lernplatz' }).waitFor();
  await checkLayout(page, 'desktop-de-learning');
  await page.getByRole('button', { name: 'Jetzt lernen', exact: true }).click();
  await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click();
  await page.getByRole('button', { name: 'Gewusst', exact: true }).click();
  await page.getByText('Lernstand gespeichert', { exact: true }).waitFor();
  let data = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.equal(data.profiles[0].progress['greetings-w1'].reps, 1);
  record('Solo flashcard grading persists through Electron IPC');
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();
  await page.getByRole('button', { name: 'Zurück zum Lernplatz', exact: true }).click();

  await page.locator('.mode-picker label').filter({ hasText: 'Schreiben' }).click();
  await page.getByRole('combobox', { name: /^Thema/u }).selectOption('home');
  await page.getByRole('button', { name: 'Jetzt lernen', exact: true }).click();
  await page.getByLabel('Deine Antwort', { exact: true }).fill('kuca');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await page.getByText('Achte auf die diakritischen Zeichen.', { exact: true }).waitFor();
  await page.getByText('Lernstand gespeichert', { exact: true }).waitFor();
  record('Typed Serbian diacritics feedback and Again scheduling');
  await page.getByRole('button', { name: 'Zurück zum Lernplatz', exact: true }).click();

  await page.locator('.mode-picker label').filter({ hasText: 'Auswahl' }).click();
  await page.getByRole('combobox', { name: /^Thema/u }).selectOption('food');
  await page.getByRole('button', { name: 'Jetzt lernen', exact: true }).click();
  await page.locator('.choice-grid button').filter({ hasText: 'hleb' }).click();
  await page.getByText('Richtig!', { exact: true }).waitFor();
  await page.getByText('Lernstand gespeichert', { exact: true }).waitFor();
  record('Multiple choice evaluates and persists the correct answer');
  await page.getByRole('button', { name: 'Zurück zum Lernplatz', exact: true }).click();

  await page.getByRole('button', { name: 'Bibliothek', exact: true }).click();
  await page.getByRole('searchbox').fill('casa');
  await page.getByText('čaša', { exact: true }).waitFor();
  assert.equal(await page.locator('.library-list li').count(), 1);
  await page.getByRole('button', { name: 'Als Favorit merken', exact: true }).click();
  await page.getByLabel('Favoriten', { exact: true }).check();
  await page.getByRole('button', { name: 'Favorit entfernen', exact: true }).waitFor();
  record('Accent-tolerant library search and profile favorites');

  await page.getByRole('button', { name: 'Profil hinzufügen', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Name', { exact: true }).fill('Ana');
  await page.getByRole('dialog').getByRole('combobox', { name: /^Ich lerne/u }).selectOption('de');
  await page.getByRole('dialog').getByRole('combobox', { name: /^Oberfläche des Profils/u }).selectOption('sr');
  await page.getByRole('button', { name: 'Profil anlegen', exact: true }).click();
  await page.getByRole('heading', { name: 'Tvoje mesto za učenje' }).waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'sr-Latn');
  await checkLayout(page, 'desktop-sr-learning');

  await page.locator('.mode-picker label').filter({ hasText: 'Pisanje' }).click();
  await page.getByRole('combobox', { name: /^Tema/u }).selectOption('home');
  await page.getByRole('button', { name: 'Počni učenje', exact: true }).click();
  await checkGermanKeys(page.locator('.answer-form'), page.getByLabel('Tvoj odgovor', { exact: true }), ['ä', 'ö', 'ü', 'ß']);
  await page.getByLabel('Tvoj odgovor', { exact: true }).fill('Haus');
  await page.getByRole('button', { name: 'Proveri', exact: true }).click();
  await page.getByText('Potreban je i član.', { exact: true }).waitFor();
  await page.getByText('Napredak je sačuvan', { exact: true }).waitFor();
  record('German article validation in the Serbian interface');
  await page.locator('.plural-details summary').click();
  await page.locator('.plural-details').getByText('die Häuser', { exact: true }).waitFor();
  await page.locator('.plural-details').getByText('kuće', { exact: true }).waitFor();
  record('Plural notes are available after revealing the unchanged singular answer');
  await page.getByRole('button', { name: 'Nazad na početak', exact: true }).click();

  await page.getByRole('button', { name: 'Zajedno', exact: true }).click();
  await page.getByRole('button', { name: 'Počnite zajedno', exact: true }).click();
  await page.getByText('Ana je na redu', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Prikaži odgovor', exact: true }).click();
  const firstSolution = await page.locator('.solution h2').innerText();
  await page.getByRole('button', { name: 'Znam', exact: true }).click();
  await page.getByText('Napredak je sačuvan', { exact: true }).waitFor();
  const firstReview = await page.evaluate(async () => (await window.zajedno.load()).value.profiles.find((profile) => profile.name === 'Ana').history.at(-1).entryId);
  await page.getByRole('button', { name: 'Dalje', exact: true }).click();
  await page.getByText('Peter ist dran', { exact: true }).waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'de');
  assert.notEqual(await page.locator('.prompt h1').innerText(), firstSolution);
  await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click();
  await page.getByRole('button', { name: 'Gewusst', exact: true }).click();
  await page.getByText('Lernstand gespeichert', { exact: true }).waitFor();
  const secondReview = await page.evaluate(async () => (await window.zajedno.load()).value.profiles.find((profile) => profile.name === 'Peter').history.at(-1).entryId);
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();
  await page.getByText('Ana je na redu', { exact: true }).waitFor();
  data = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.equal(data.profiles.find((profile) => profile.name === 'Ana').progress[firstReview].reps, 1);
  assert.equal(data.profiles.find((profile) => profile.name === 'Peter').progress[secondReview].reps, 1);
  assert.notEqual(firstReview, secondReview);
  assert.equal(data.profiles.find((profile) => profile.name === 'Ana').favorites.length, 0);
  record('Together turns switch profile, UI language, answer direction and isolated progress');

  await application.evaluate(({ BrowserWindow }) => { const window = BrowserWindow.getAllWindows()[0]; window.setMinimumSize(400, 600); window.setContentSize(400, 800); });
  await checkLayout(page, 'mobile-sr-question');
  await page.getByRole('button', { name: 'Nazad na početak', exact: true }).click();
  await page.getByRole('button', { name: 'Učenje', exact: true }).click();
  await checkLayout(page, 'mobile-sr-learning');
  await page.getByRole('button', { name: 'Biblioteka', exact: true }).click();
  await checkLayout(page, 'mobile-sr-library');
  await page.getByRole('combobox', { name: /^Jezik prikaza/u }).selectOption('de');
  await page.getByRole('button', { name: 'Lernen', exact: true }).click();
  await checkLayout(page, 'mobile-de-learning');
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await checkLayout(page, 'mobile-de-settings');
  await checkCustomVocabulary(page);
  await checkDictionary(page);

  const invalid = path.join(artifacts, 'invalid-backup.json');
  await writeFile(invalid, '{"version":999}', 'utf8');
  await page.locator('input[type=file]').setInputFiles(invalid);
  await page.getByText(/Keine gültige Zajedno-Sicherung/u).waitFor();
  await page.getByRole('alert').getByRole('button', { name: 'Schließen', exact: true }).click();
  const backup = path.join(artifacts, 'smoke-backup.json');
  data = await page.evaluate(async () => (await window.zajedno.load()).value);
  await writeFile(backup, JSON.stringify({ format: 'zajedno-backup', version: 2, exportedAt: new Date().toISOString(), data }), 'utf8');
  await page.locator('input[type=file]').setInputFiles(backup);
  await page.getByRole('dialog').getByRole('button', { name: 'Abbrechen', exact: true }).click();
  assert.equal((await page.evaluate(async () => (await window.zajedno.load()).value)).revision, data.revision);
  await page.locator('input[type=file]').setInputFiles(backup);
  await page.getByRole('button', { name: 'Sichern und ersetzen', exact: true }).click();
  await page.getByText('Sicherung wiederhergestellt.', { exact: true }).waitFor();
  assert.ok((await readdir(path.join(testHome, 'Zajedno', 'backups'))).length >= 1);
  record('Invalid import rejection, destructive confirmation/cancel, and automatic pre-restore backup');

  const before = await page.evaluate(async () => (await window.zajedno.load()).value);
  await page.reload();
  await page.getByRole('heading', { name: 'Dein Lernplatz' }).waitFor();
  const after = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.deepEqual(after, before);
  const fileState = JSON.parse(await readFile(path.join(testHome, 'Zajedno', 'learners-v1.json'), 'utf8'));
  assert.deepEqual(fileState, after);
  record('Renderer reload preserves the on-disk state');
  await checkSharedTyping(page);
  }
  await checkGrammarAndPlurals(page);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(externalRequests, []);
  record('No renderer exceptions or external HTTP requests during offline workflows');
  const savedBeforeClose = await page.evaluate(async () => (await window.zajedno.load()).value);
  assert.equal(await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isClosable()), true);
  const closed = application.waitForEvent('close', { timeout: 15000 });
  await application.evaluate(({ BrowserWindow }) => { BrowserWindow.getAllWindows()[0].close(); });
  await closed;
  application = undefined;
  assert.deepEqual(JSON.parse(await readFile(path.join(testHome, 'Zajedno', 'learners-v1.json'), 'utf8')), savedBeforeClose);
  record('Native window close exits the app and preserves the saved learner data');
  await writeFile(path.join(artifacts, grammarOnly ? 'grammar-smoke-results.json' : 'desktop-smoke-results.json'), JSON.stringify({ executablePath, checks, security, consoleErrors, externalRequests }, null, 2), 'utf8');
} catch (error) {
  if (application) { const windows = application.windows(); if (windows[0]) await windows[0].screenshot({ path: path.join(artifacts, 'desktop-smoke-failure.png'), fullPage: true }).catch(() => undefined); }
  throw error;
} finally {
  if (application) await application.close();
  await rm(testHome, { recursive: true, force: true });
}