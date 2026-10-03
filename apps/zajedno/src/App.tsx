import { useDeferredValue, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Clock3, Download, Flame, Home, Languages, Leaf, ListChecks, Pencil, Play, Plus, RotateCcw, Search, Settings, ShieldCheck, Sparkles, Star, Trash2, TrendingUp, Upload, Users, Volume2, VolumeX, X, type LucideIcon } from 'lucide-react';
import { api } from './api';
import { curriculum, topics, type Entry, type Language } from './domain/curriculum';
import { advanceTurn, allEntries, entryFieldsSchema, learningQueue, MAX_CUSTOM_ENTRIES, MAX_IMPORT_BYTES, parseBackup, profileStats, sourceLanguage, type AppState, type Command, type CustomEntry, type EntryFields, type LocalSpeechVoice, type Profile, type StorageInfo } from './domain/state';
import { choiceAnswers, evaluateEntryAnswer, localSapiVoice, localVoice } from './domain/practice';
import { dictionary, errorText, languageName, type Text } from './i18n';
import { searchDictionary, type DictionaryEntry, type Lexicon } from './domain/lexicon';
import { nounForms } from './domain/nounForms';
import { Grammar } from './Grammar';

type View = 'learn' | 'together' | 'library' | 'grammar' | 'progress' | 'settings';
type Mode = 'cards' | 'choice' | 'typing';
type LearningSession = { profileIds: string[]; queues: string[][]; turn: number; total: number; completed: number; byProfile: Record<string, number>; mode: Mode };
const navigation: { id: View; icon: LucideIcon }[] = [{ id: 'learn', icon: BookOpen }, { id: 'together', icon: Users }, { id: 'library', icon: Search }, { id: 'grammar', icon: Languages }, { id: 'progress', icon: TrendingUp }, { id: 'settings', icon: Settings }];
const topicIcons: LucideIcon[] = [Languages, Home, Sparkles, Leaf, Users, Pencil, Star, Clock3, Play, ShieldCheck];

function IconButton({ icon: Icon, label, onClick, disabled, active, className = '' }: { icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean; active?: boolean; className?: string }) {
  return <button type="button" className={`icon-button ${active ? 'selected' : ''} ${className}`} title={label} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick}><Icon size={21} aria-hidden="true" /></button>;
}

function Modal({ title, close, children, cancel, busy = false }: { title: string; close: () => void; children: ReactNode; cancel: string; busy?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); return () => dialog.current?.close(); }, []);
  return <dialog ref={dialog} className="modal" aria-labelledby="modal-title" onCancel={(event) => { event.preventDefault(); if (!busy) close(); }}>
    <div className="section-title"><h2 id="modal-title">{title}</h2><IconButton icon={X} label={cancel} disabled={busy} onClick={close} /></div>{children}
  </dialog>;
}

function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [sapiVoices, setSapiVoices] = useState<LocalSpeechVoice[]>([]);
  const [failed, setFailed] = useState(false);
  const requestId = useRef(0);
  const sapiSpeaking = useRef(false);
  useEffect(() => {
    let active = true;
    const update = () => { if ('speechSynthesis' in window) setVoices(window.speechSynthesis.getVoices()); };
    update();
    if ('speechSynthesis' in window) window.speechSynthesis.addEventListener('voiceschanged', update);
    void api.speechVoices?.().then((result) => { if (active && result.ok) setSapiVoices(result.value); }).catch(() => undefined);
    return () => {
      active = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', update);
        window.speechSynthesis.cancel();
      }
      sapiSpeaking.current = false;
      void api.cancelSpeech?.();
    };
  }, []);
  const voice = (language: Language) => language === 'sr' ? localSapiVoice(sapiVoices, language) ?? localVoice(voices, language) : localVoice(voices, language);
  const cancel = () => {
    requestId.current += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (sapiSpeaking.current) {
      sapiSpeaking.current = false;
      void api.cancelSpeech?.();
    }
  };
  const speak = async (value: string, language: Language) => {
    cancel();
    const currentRequest = requestId.current;
    const matching = voice(language);
    if (!matching) return;
    const cleanText = value.replace(/\s*\([^)]*\)/gu, '');
    if ('sapi' in matching) {
      sapiSpeaking.current = true;
      try {
        const result = await api.speakSapi?.(cleanText, matching.name);
        if (!result?.ok || !result.value) throw new Error('SAPI_SPEECH_FAILED');
        if (requestId.current === currentRequest) setFailed(false);
      } catch { if (requestId.current === currentRequest) setFailed(true); }
      finally { if (requestId.current === currentRequest) sapiSpeaking.current = false; }
      return;
    }
    if (!('speechSynthesis' in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = matching; utterance.lang = matching.lang; utterance.rate = 0.85;
      utterance.onerror = (event) => { if (requestId.current === currentRequest && event.error !== 'interrupted' && event.error !== 'canceled') setFailed(true); };
      setFailed(false); window.speechSynthesis.speak(utterance);
    } catch { setFailed(true); }
  };
  return { voice, speak, cancel, failed };
}
type Speech = ReturnType<typeof useSpeech>;
function Audio({ value, language, speech, text }: { value: string; language: Language; speech: Speech; text: Text }) {
  const available = !!speech.voice(language);
  return <span className="audio-control" title={available ? text.speak : text.noVoice}><IconButton icon={available ? Volume2 : VolumeX} label={available ? text.speak : text.noVoice} disabled={!available} onClick={() => speech.speak(value, language)} /></span>;
}

function ProfileForm({ text, ui, busy, onSubmit }: { text: Text; ui: Language; busy: boolean; onSubmit: (name: string, target: Language, language: Language) => Promise<void> }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState<Language>(ui === 'de' ? 'sr' : 'de');
  const [language, setLanguage] = useState<Language>(ui);
  return <form className="form-stack" onSubmit={(event) => { event.preventDefault(); if (name.trim()) void onSubmit(name.trim(), target, language); }}>
    <label>{text.name}<input autoFocus maxLength={40} required value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" /></label>
    <label>{text.target}<select value={target} onChange={(event) => setTarget(event.target.value as Language)}><option value="sr">{languageName('sr', ui)}</option><option value="de">{languageName('de', ui)}</option></select></label>
    <label>{text.profileLanguage}<select value={language} onChange={(event) => setLanguage(event.target.value as Language)}><option value="de">Deutsch</option><option value="sr">Srpski</option></select></label>
    <button className="primary" disabled={busy || !name.trim()}><Plus size={20} />{text.create}</button>
  </form>;
}

function Stats({ profile, text, catalog }: { profile: Profile; text: Text; catalog: Entry[] }) {
  const stats = profileStats(profile, new Date(), catalog);
  return <dl className="stats"><div><dt><Clock3 size={18} />{text.due}</dt><dd>{stats.due}</dd></div><div><dt><Sparkles size={18} />{text.new}</dt><dd>{stats.new}</dd></div><div><dt><CheckCircle2 size={18} />{text.started}</dt><dd>{stats.started}<small> / {catalog.length}</small></dd></div><div><dt><RotateCcw size={18} />{text.reviews}</dt><dd>{stats.reviews}</dd></div></dl>;
}

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [view, setView] = useState<View>('learn');
  const [fallbackUi, setFallbackUi] = useState<Language>('de');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<StorageInfo | null>(null);
  const [addProfile, setAddProfile] = useState(false);
  const [deleting, setDeleting] = useState<Profile | null>(null);
  const [renaming, setRenaming] = useState<Profile | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [restoring, setRestoring] = useState<{ text: string; state: AppState } | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<LearningSession | null>(null);
  const speech = useSpeech();
  const active = state?.profiles.find((profile) => profile.id === state.activeProfileId);
  const turnProfile = session && state?.profiles.find((profile) => profile.id === session.profileIds[session.turn]);
  const ui = (turnProfile && session?.queues.some((queue) => queue.length) ? turnProfile.uiLanguage : state?.uiLanguage) ?? fallbackUi;
  const text = dictionary(ui);
  const catalog = state ? allEntries(state) : curriculum;
  const entryById = new Map(catalog.map((entry) => [entry.id, entry]));

  useEffect(() => { document.documentElement.lang = ui === 'sr' ? 'sr-Latn' : 'de'; }, [ui]);
  async function load() {
    setLoading(true); setError('');
    try {
      const result = await api.load();
      if (result.ok) setState(result.value); else setError(result.error);
      const details = await api.info(); if (details.ok) setInfo(details.value);
    } catch { setError('STORAGE_ERROR'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function run(command: Command): Promise<AppState | null> {
    if (lock.current) return null;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const result = await api.command(command);
      if (!result.ok) { setError(result.error); return null; }
      setState((current) => !current || result.value.revision >= current.revision ? result.value : current);
      return result.value;
    } catch { setError('STORAGE_ERROR'); return null; }
    finally { lock.current = false; setBusy(false); }
  }

  async function createProfile(name: string, target: Language, language: Language) {
    const result = await run({ type: 'addProfile', name, target, uiLanguage: language });
    if (result) { setAddProfile(false); setView('learn'); }
  }

  async function exportData() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { const result = await api.exportData(); if (!result.ok) setError(result.error); else if (result.value) setNotice('exportDone'); }
    catch { setError('STORAGE_ERROR'); }
    finally { lock.current = false; setBusy(false); }
  }

  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('IMPORT_INVALID');
      const contents = await file.text();
      setRestoring({ text: contents, state: parseBackup(contents) }); setError('');
    } catch { setError('IMPORT_INVALID'); }
    if (importInput.current) importInput.current.value = '';
  }

  async function restore() {
    if (!restoring || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const result = await api.importData(restoring.text);
      if (!result.ok) { setError(result.error); return; }
      setState(result.value); setSession(null); setRestoring(null); setNotice('imported'); setView('learn');
    } catch { setError('STORAGE_ERROR'); }
    finally { lock.current = false; setBusy(false); }
  }

  const leaveSession = () => { setSession(null); speech.cancel(); };
  const changeView = (next: View) => { if (!busy) { leaveSession(); setView(next); setNotice(''); setError(''); } };
  const favorite = (profile: Profile, entry: Entry) => run({ type: 'favorite', profileId: profile.id, entryId: entry.id, value: !profile.favorites.includes(entry.id) });
  const begin = (ids: string[], mode: Mode, options: Parameters<typeof learningQueue>[1]) => {
    if (!state) return;
    const queues = ids.map((id) => learningQueue(state.profiles.find((profile) => profile.id === id)!, options, new Date(), catalog, ids.length > 1 ? Math.random : undefined));
    const turn = queues.findIndex((queue) => queue.length > 0);
    setSession({ profileIds: ids, queues, mode, turn: Math.max(0, turn), total: queues.reduce((total, queue) => total + queue.length, 0), completed: 0, byProfile: {} });
  };
  const nextQuestion = () => {
    if (!session) return;
    const { queues, turn } = advanceTurn(session.turn, session.queues);
    const id = session.profileIds[session.turn];
    setSession({ ...session, queues, turn: turn ?? session.turn, completed: session.completed + 1, byProfile: { ...session.byProfile, [id]: (session.byProfile[id] ?? 0) + 1 } });
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); changeView('learn'); }}><img src="./zajedno.png" alt="" width="44" height="44" /><span>Zajedno<small>Deutsch & Srpski</small></span></a>
      <nav aria-label="Zajedno">{navigation.map(({ id, icon: Icon }) => <button key={id} disabled={busy} className={view === id ? 'nav-link active' : 'nav-link'} aria-current={view === id ? 'page' : undefined} onClick={() => changeView(id)} title={text[id]}><Icon size={23} /><span>{text[id]}</span></button>)}</nav>
      <div className="sidebar-bottom"><ShieldCheck size={19} /><span>{text.offline}</span></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="profile-picker"><Users size={20} />{state?.profiles.length ? <select aria-label={text.profile} value={turnProfile?.id ?? state.activeProfileId ?? ''} disabled={busy || !!session} onChange={(event) => { void run({ type: 'selectProfile', profileId: event.target.value }); }}>
          {state.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
        </select> : <span>{text.profile}</span>}{!session && <IconButton icon={Plus} label={text.newProfile} disabled={busy || !state} onClick={() => setAddProfile(true)} />}</div>
        <label className="language-picker"><Languages size={19} /><span className="sr-only">{text.uiLanguage}</span><select value={ui} disabled={busy || !!session} onChange={(event) => { const language = event.target.value as Language; if (state) void run({ type: 'language', language }); else setFallbackUi(language); }}><option value="de">Deutsch</option><option value="sr">Srpski</option></select></label>
      </header>
      <main id="main" className="main-content">
        {info && !info.desktop && <div className="browser-notice"><ShieldCheck size={17} />{text.browserNote}</div>}
        {error && <div className="notice error" role="alert"><CircleHelp size={22} /><div><strong>{text.storageErrorTitle}</strong><p>{errorText(error, text)}</p></div><IconButton icon={X} label={text.close} onClick={() => setError('')} /></div>}
        {notice && <div className="notice success" role="status"><CheckCircle2 size={20} />{text[notice as keyof Text]}</div>}
        {speech.failed && <p role="status" className="notice">{text.speechFailed}</p>}
        {loading ? <div className="empty-state"><Leaf size={36} /><h1>Zajedno</h1><p role="status">{text.loading}</p></div>
          : !state ? <section className="empty-state"><ShieldCheck size={40} /><h1>{text.storageErrorTitle}</h1><p>{errorText(error || 'STORAGE_ERROR', text)}</p><div className="button-row"><button className="primary" onClick={() => void load()}><RotateCcw size={20} />{text.retry}</button><button onClick={() => importInput.current?.click()}><Upload size={20} />{text.import}</button></div></section>
          : !active ? <section className="onboarding"><div className="welcome-image"><img src="./table-for-two.png" alt="" /></div><h1>{text.firstProfile}</h1><p className="muted">{text.profileIntro}</p><ProfileForm text={text} ui={ui} busy={busy} onSubmit={createProfile} /><div className="onboarding-restore"><button disabled={busy} onClick={() => importInput.current?.click()}><Upload size={20} />{text.import}</button></div></section>
          : session ? <section className="session-view">
            <div className="section-title"><button className="text-button" disabled={busy} onClick={leaveSession}><ArrowLeft size={19} />{text.stop}</button><span className="pill">{session.completed} / {session.total}</span></div>
            <progress className="session-progress" max={session.total || 1} value={session.completed} aria-label={text.completed} />
            {session.queues.some((queue) => queue.length) && turnProfile ? <Question key={`${turnProfile.id}-${session.completed}`} catalog={catalog} entry={entryById.get(session.queues[session.turn][0])!} profile={turnProfile} mode={session.mode} text={text} ui={ui} speech={speech} busy={busy} isTogether={session.profileIds.length > 1} onFavorite={() => { void favorite(turnProfile, entryById.get(session.queues[session.turn][0])!); }} onGrade={async (rating) => {
              const entryId = session.queues[session.turn][0];
              return !!await run({ type: 'review', profileId: turnProfile.id, target: turnProfile.target, entryId, rating, expectedReps: turnProfile.progress[entryId]?.reps ?? 0, expectedEntryRevision: state.customEntries.find((entry) => entry.id === entryId)?.revision ?? 0 });
            }} onNext={nextQuestion} /> : <div className="empty-state session-complete"><CheckCircle2 size={54} /><h1>{session.total ? text.complete : text.emptyQueue}</h1><p>{session.total ? text.completeHint : text.emptyHint}</p>
              {session.total > 0 && <dl className="round-results">{session.profileIds.map((id) => <div key={id}><dt>{state.profiles.find((profile) => profile.id === id)?.name}</dt><dd>{session.byProfile[id] ?? 0} <small>{text.items}</small></dd></div>)}</dl>}
              <button className="primary" onClick={leaveSession}><ArrowLeft size={20} />{text.stop}</button>
            </div>}
          </section>
          : view === 'learn' || view === 'together' ? <LearnSetup key={`${view}-${active.id}`} catalog={catalog} active={active} profiles={state.profiles} together={view === 'together'} text={text} ui={ui} onBegin={begin} onAdd={() => setAddProfile(true)} />
          : view === 'library' ? <Library catalog={catalog} customEntries={state.customEntries} error={error} clearError={() => setError('')} onCommand={run} profile={active} text={text} ui={ui} speech={speech} busy={busy} onFavorite={(entry) => { void favorite(active, entry); }} />
          : view === 'progress' ? <Progress catalog={catalog} profile={active} text={text} ui={ui} />
          : view === 'grammar' ? <Grammar key={active.id} target={active.target} text={text} />
          : <section>
            <PageHeading title={text.settings} subtitle="Zajedno 1.3.0" />
            <section className="settings-section"><div className="section-title"><h2>{text.profiles}</h2><button onClick={() => setAddProfile(true)} disabled={busy}><Plus size={19} />{text.newProfile}</button></div>
              <ul className="profile-list">{state.profiles.map((profile) => <li key={profile.id}><span className="avatar">{Array.from(profile.name)[0].toLocaleUpperCase()}</span><div className="profile-details"><strong>{profile.name}</strong><span>{languageName(sourceLanguage(profile.target), ui)} → {languageName(profile.target, ui)}{profile.id === active.id ? ` · ${text.current}` : ''}</span></div><IconButton icon={Pencil} label={`${text.rename}: ${profile.name}`} disabled={busy} onClick={() => { setRenaming(profile); setRenameValue(profile.name); }} /><IconButton icon={Trash2} label={`${text.delete}: ${profile.name}`} disabled={busy} onClick={() => setDeleting(profile)} /></li>)}</ul><p className="muted">{text.targetNote}</p>
            </section>
            <section className="settings-section"><h2>{text.storage}</h2><p>{text.backupNote}</p><div className="button-row"><button className="primary" disabled={busy} onClick={() => void exportData()}><Download size={20} />{text.export}</button><button disabled={busy} onClick={() => importInput.current?.click()}><Upload size={20} />{text.import}</button></div><dl className="storage-path"><dt>{text.storagePath}</dt><dd>{info?.path ?? '—'}</dd></dl></section>
            <section className="settings-section"><h2>{text.audio}</h2>{(['de', 'sr'] as const).map((language) => <div key={language} className="voice-row"><strong>{languageName(language, ui)}</strong><span>{speech.voice(language) ? `${text.available}: ${speech.voice(language)!.name}` : text.noVoice}</span><Audio value={language === 'de' ? 'Guten Tag!' : 'Dobar dan!'} language={language} speech={speech} text={text} /></div>)}<p className="muted">{text.voiceNote}</p></section>
            <section className="settings-section"><h2>{text.about}</h2><p>{text.contentNote}</p><p>{text.evaluationNote}</p><p className="muted">FSRS · Nunito Sans · Lucide</p></section>
          </section>}
      </main>
      <footer className="footer"><span>Zajedno</span><span>{text.offline}</span></footer>
    </div>
    <input type="file" className="sr-only" tabIndex={-1} ref={importInput} accept="application/json,.json" aria-label={text.import} onChange={(event) => { void importFile(event.target.files?.[0]); }} />
    {addProfile && <Modal title={text.newProfile} close={() => setAddProfile(false)} cancel={text.close} busy={busy}>{error && <p role="alert" className="inline-error">{errorText(error, text)}</p>}<ProfileForm text={text} ui={ui} busy={busy} onSubmit={createProfile} /></Modal>}
    {deleting && <Modal title={text.deleteTitle} close={() => setDeleting(null)} cancel={text.close} busy={busy}><p><strong>{deleting.name}</strong></p><p>{text.deleteWarning}</p>{error && <p role="alert" className="inline-error">{errorText(error, text)}</p>}<div className="button-row"><button disabled={busy} onClick={() => setDeleting(null)}>{text.cancel}</button><button className="danger" disabled={busy} onClick={async () => { if (await run({ type: 'removeProfile', profileId: deleting.id, confirmed: true })) setDeleting(null); }}><Trash2 size={19} />{text.deleteAction}</button></div></Modal>}
    {renaming && <Modal title={text.rename} close={() => setRenaming(null)} cancel={text.cancel} busy={busy}><form className="form-stack" onSubmit={async (event) => { event.preventDefault(); if (await run({ type: 'renameProfile', profileId: renaming.id, name: renameValue.trim() })) setRenaming(null); }}><label>{text.name}<input required maxLength={40} value={renameValue} onChange={(event) => setRenameValue(event.target.value)} /></label>{error && <p role="alert" className="inline-error">{errorText(error, text)}</p>}<button className="primary" disabled={busy || !renameValue.trim()}><Check size={19} />{text.save}</button></form></Modal>}
    {restoring && <Modal title={text.importTitle} close={() => setRestoring(null)} cancel={text.close} busy={busy}><p>{text.importWarning}</p><p><strong>{restoring.state.profiles.length} {text.profiles}</strong> · {restoring.state.profiles.map((profile) => profile.name).join(', ') || '0'}</p>{error && <p role="alert" className="inline-error">{errorText(error, text)}</p>}<div className="button-row"><button disabled={busy} onClick={() => setRestoring(null)}>{text.cancel}</button><button className="danger" disabled={busy} onClick={() => void restore()}><Upload size={19} />{text.importAction}</button></div></Modal>}
  </div>;
}

function PageHeading({ title, subtitle, image = false }: { title: string; subtitle?: string; image?: boolean }) {
  return <div className="page-heading"><div>{subtitle && <p className="eyebrow">{subtitle}</p>}<h1>{title}</h1></div>{image && <img src="./table-for-two.png" alt="" width="300" height="110" />}</div>;
}

function PluralLine({ entry, language, text }: { entry: Entry; language: Language; text: Text }) {
  if (entry.kind !== 'word') return null;
  const forms = nounForms(entry);
  const form = forms[language];
  if (!form && !entry.id.startsWith('custom-') && !Object.keys(forms).length) return null;
  return <small className="plural-line">{language === 'de' ? 'DE' : 'SR'} · {text.plural}: {form ? <><span lang={language === 'sr' ? 'sr-Latn' : 'de'}>{form.form}</span>{form.usage !== 'plural' && <> ({text[form.usage]})</>}</> : text.pluralMissing}</small>;
}

function PluralInput({ language, value, label, busy, onChange }: { language: Language; value: string; label: string; busy: boolean; onChange: (value: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return <div className="plural-input"><label>{label}<input ref={input} value={value} maxLength={300} disabled={busy} lang={language === 'sr' ? 'sr-Latn' : 'de'} onChange={(event) => onChange(event.target.value)} /></label>
    <div className="character-keys">{(language === 'de' ? ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'] : ['č', 'ć', 'š', 'ž', 'đ']).map((character) => <button key={character} type="button" disabled={busy || value.length >= 300} onClick={() => {
      const start = input.current?.selectionStart ?? value.length;
      const end = input.current?.selectionEnd ?? start;
      onChange(value.slice(0, start) + character + value.slice(end));
      input.current?.focus();
      requestAnimationFrame(() => input.current?.setSelectionRange(start + 1, start + 1));
    }}>{character}</button>)}</div>
  </div>;
}

function LearnSetup({ active, profiles, together, text, ui, catalog, onBegin, onAdd }: { active: Profile; profiles: Profile[]; together: boolean; text: Text; ui: Language; catalog: Entry[]; onBegin: (ids: string[], mode: Mode, options: Parameters<typeof learningQueue>[1]) => void; onAdd: () => void }) {
  const [topic, setTopic] = useState('');
  const [kind, setKind] = useState('');
  const [mode, setMode] = useState<Mode>('cards');
  const [limit, setLimit] = useState(10);
  const [favorites, setFavorites] = useState(false);
  const [customOnly, setCustomOnly] = useState(false);
  const [first, setFirst] = useState(active.id);
  const [second, setSecond] = useState(profiles.find((profile) => profile.id !== active.id)?.id ?? '');
  const modes: { value: Mode; icon: LucideIcon }[] = [{ value: 'cards', icon: BookOpen }, { value: 'choice', icon: ListChecks }, { value: 'typing', icon: Pencil }];
  const start = (selectedTopic = topic) => onBegin(together ? [first, second] : [active.id], mode, { topic: selectedTopic, kind, favorites, limit, customOnly });
  const valid = !together || (first !== second && !!first && !!second);
  return <section>
    <PageHeading title={together ? text.togetherTitle : text.welcome} subtitle={together ? text.togetherHint : `${active.name} · ${languageName(sourceLanguage(active.target), ui)} → ${languageName(active.target, ui)}`} image />
    {!together && <Stats profile={active} text={text} catalog={catalog} />}
    <section className="practice-setup">
      {together && (profiles.length < 2 ? <div className="notice"><Users size={24} /><p>{text.needsTwo}</p><button onClick={onAdd}><Plus size={20} />{text.newProfile}</button></div> : <div className="partner-selectors"><label>{text.firstLearner}<select value={first} onChange={(event) => setFirst(event.target.value)}>{profiles.map((profile) => <option key={profile.id} value={profile.id} disabled={profile.id === second}>{profile.name} · {languageName(profile.target, ui)}</option>)}</select></label><Users size={25} /><label>{text.secondLearner}<select value={second} onChange={(event) => setSecond(event.target.value)}>{profiles.map((profile) => <option key={profile.id} value={profile.id} disabled={profile.id === first}>{profile.name} · {languageName(profile.target, ui)}</option>)}</select></label></div>)}
      <fieldset className="mode-fieldset"><legend>{text.mode}</legend><div className="mode-picker">{modes.map(({ value, icon: Icon }) => <label key={value} className={mode === value ? 'checked' : ''}><input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} /><Icon size={22} /><span>{text[value]}</span></label>)}</div></fieldset>
      <div className="setup-fields"><label>{text.topic}<select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">{text.allTopics}</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic[ui]}</option>)}</select></label><label>{text.content}<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="">{text.allContent}</option><option value="word">{text.words}</option><option value="sentence">{text.sentences}</option></select></label><label>{text.round}<select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>{[5, 10, 20].map((number) => <option key={number} value={number}>{number} {text.items}{together ? ` · ${text.perPerson}` : ''}</option>)}</select></label></div>
      <div className="start-row"><div className="setup-options"><label className="checkbox"><input type="checkbox" checked={favorites} onChange={(event) => setFavorites(event.target.checked)} /><Star size={19} />{text.onlyFavorites}</label><label className="checkbox"><input type="checkbox" checked={customOnly} onChange={(event) => setCustomOnly(event.target.checked)} /><Pencil size={19} />{text.ownEntries}</label></div><button className="primary start-button" disabled={!valid} onClick={() => start()}><Play size={20} />{together ? text.startTogether : text.start}<ArrowRight size={20} /></button></div>
    </section>
    <section className="topic-section"><div className="section-title"><h2>{text.everyday}</h2><span className="muted">10 {text.topics}</span></div><div className="topic-grid">{topics.map((topic, index) => {
      const Icon = topicIcons[index];
      const entries = catalog.filter((entry) => entry.topic === topic.id && (!customOnly || entry.id.startsWith('custom-')));
      return <button className={`topic-card topic-color-${index % 4}`} key={topic.id} disabled={!valid} onClick={() => { setTopic(topic.id); start(topic.id); }}><Icon size={27} /><strong>{topic[ui]}</strong><span>{entries.filter((entry) => entry.kind === 'word').length} {text.words} · {entries.filter((entry) => entry.kind === 'sentence').length} {text.sentences}</span><ArrowRight className="topic-arrow" size={18} /></button>;
    })}</div></section>
  </section>;
}

function Question({ entry, profile, mode, text, ui, speech, busy, isTogether, catalog, onFavorite, onGrade, onNext }: { entry: Entry; profile: Profile; mode: Mode; text: Text; ui: Language; speech: Speech; busy: boolean; isTogether: boolean; catalog: Entry[]; onFavorite: () => void; onGrade: (rating: number) => Promise<boolean>; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [grade, setGrade] = useState<number | null>(null);
  const [choices] = useState(() => choiceAnswers(entry, profile.target, Math.random, catalog));
  const input = useRef<HTMLInputElement>(null);
  const source = sourceLanguage(profile.target);
  const topic = topics.find((topic) => topic.id === entry.topic)!;
  async function submitGrade(rating: number) {
    setGrade(rating);
    if (await onGrade(rating)) setSaved(true);
  }
  async function evaluate(value: string) {
    if (busy || saved) return;
    const verdict = evaluateEntryAnswer(entry, profile.target, value, mode === 'choice' ? 'choice' : 'typing');
    setAnswer(value); setResult(verdict); setRevealed(true);
    await submitGrade(verdict === 'correct' ? 3 : 1);
  }
  function submit(event: FormEvent) { event.preventDefault(); if (answer.trim()) void evaluate(answer); }
  return <div className="question-area">
    <div className="turn-line"><span className="avatar">{Array.from(profile.name)[0].toLocaleUpperCase()}</span><div><strong>{profile.name}{isTogether ? ` ${text.turn}` : ''}</strong><span>{languageName(source, ui)} → {languageName(profile.target, ui)}</span></div><span className="pill">{text[mode]}</span></div>
    <article className="question-card">
      <div className="question-meta"><span>{topic[ui]} · {entry.kind === 'word' ? text.words : text.sentences}</span><IconButton icon={Star} label={profile.favorites.includes(entry.id) ? text.unfavorite : text.favorite} active={profile.favorites.includes(entry.id)} disabled={busy} onClick={onFavorite} /></div>
      <p className="prompt-label">{text.translateTo} {languageName(profile.target, ui)}</p>
      <div className="prompt"><h1 lang={source === 'sr' ? 'sr-Latn' : 'de'}>{entry[source]}</h1><Audio value={entry[source]} language={source} text={text} speech={speech} /></div>
      {mode === 'cards' && !revealed && <button className="primary reveal" onClick={() => setRevealed(true)}><RotateCcw size={20} />{text.reveal}</button>}
      {mode === 'choice' && !revealed && <div className="choice-grid">{choices.map((option, index) => <button key={option} disabled={busy} onClick={() => void evaluate(option)} lang={profile.target === 'sr' ? 'sr-Latn' : 'de'}><span className="option-number">{index + 1}</span>{option}</button>)}</div>}
      {mode === 'typing' && !revealed && <form className="answer-form" onSubmit={submit}><label>{text.answer}<input ref={input} autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} maxLength={300} lang={profile.target === 'sr' ? 'sr-Latn' : 'de'} /></label><div className="answer-actions"><div className="character-keys">{(profile.target === 'sr' ? ['č', 'ć', 'š', 'ž', 'đ'] : ['ä', 'ö', 'ü', 'ß']).map((character) => <button type="button" key={character} onClick={() => { const start = input.current?.selectionStart ?? answer.length; const end = input.current?.selectionEnd ?? start; setAnswer(answer.slice(0, start) + character + answer.slice(end)); input.current?.focus(); requestAnimationFrame(() => input.current?.setSelectionRange(start + 1, start + 1)); }}>{character}</button>)}</div><button className="primary" disabled={busy || !answer.trim()}><Check size={20} />{text.check}</button></div></form>}
      {revealed && <div className={`answer-panel ${result && result !== 'correct' ? 'answer-correction' : ''}`} aria-live="polite">
        {result && <div className="verdict">{result === 'correct' ? <CheckCircle2 size={23} /> : <RotateCcw size={23} />}<strong>{result === 'correct' ? text.correct : result === 'article' ? text.article : result === 'diacritics' ? text.diacritics : text.incorrect}</strong></div>}
        {answer && result !== 'correct' && <p className="submitted-answer">{text.answer}: {answer}</p>}
        <p className="prompt-label">{text.solution}</p><div className="solution"><h2 lang={profile.target === 'sr' ? 'sr-Latn' : 'de'}>{entry[profile.target]}</h2><Audio value={entry[profile.target]} language={profile.target} text={text} speech={speech} /></div>
      </div>}
      {mode === 'cards' && revealed && !saved && <div className="grading">{([{ value: 1, label: text.again, icon: RotateCcw }, { value: 2, label: text.hard, icon: Flame }, { value: 3, label: text.good, icon: Check }, { value: 4, label: text.easy, icon: Sparkles }]).map(({ value, label, icon: Icon }) => <button key={value} disabled={busy} className={`grade grade-${value}`} onClick={() => void submitGrade(value)}><Icon size={20} />{label}</button>)}</div>}
      {revealed && mode !== 'cards' && !saved && !busy && grade !== null && <button onClick={() => void submitGrade(grade)}><RotateCcw size={20} />{text.retry}</button>}
      {busy && <p className="muted" role="status">{text.saving}</p>}
      {saved && <div className="saved-row"><div><span><CheckCircle2 size={18} />{text.saved}</span>{profile.progress[entry.id] && <small>{text.nextDue}: {new Intl.DateTimeFormat(ui === 'de' ? 'de-DE' : 'sr-Latn-RS', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(profile.progress[entry.id].due))}</small>}</div><button className="primary" autoFocus onClick={onNext}>{text.next}<ArrowRight size={21} /></button></div>}
      {revealed && entry.kind === 'word' && (entry.id.startsWith('custom-') || Object.keys(nounForms(entry)).length > 0) && <details className="plural-details"><summary>{text.plural}</summary><PluralLine entry={entry} language="de" text={text} /><PluralLine entry={entry} language="sr" text={text} /><p>{text.pluralNote}</p></details>}
    </article>
  </div>;
}

function EntryEditor({ entry, initialFields, text, ui, busy, error, onSave, onCancel }: { entry: CustomEntry | null; initialFields?: EntryFields; text: Text; ui: Language; busy: boolean; error: string; onSave: (fields: EntryFields) => Promise<void>; onCancel: () => void }) {
  const [fields, setFields] = useState<EntryFields>(entry ? { de: entry.de, sr: entry.sr, topic: entry.topic, kind: entry.kind, provenance: entry.provenance, dePlural: entry.dePlural, srPlural: entry.srPlural } : initialFields ?? { de: '', sr: '', topic: 'home', kind: 'word' });
  const [confirmed, setConfirmed] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const germanInput = useRef<HTMLInputElement>(null);
  const serbianInput = useRef<HTMLInputElement>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = entryFieldsSchema.safeParse(fields);
    if (!parsed.success) { setInvalid(true); return; }
    if (!busy && (!entry || confirmed)) { setInvalid(false); void onSave(parsed.data); }
  };
  return <form className="form-stack entry-editor" onSubmit={submit}>
    {fields.provenance && <div className="dictionary-provenance"><strong>{text.source}: {fields.provenance.provider}</strong><p>{fields.provenance.sense}</p><small>{text.derivedEntry}</small><p>{fields.provenance.url}</p></div>}
    <label>{text.germanText}<input ref={germanInput} autoFocus required maxLength={300} lang="de" value={fields.de} disabled={busy} onChange={(event) => setFields({ ...fields, de: event.target.value })} /></label>
    <div className="character-keys">{['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((character) => <button key={character} type="button" disabled={busy || fields.de.length >= 300} onClick={() => {
      const start = germanInput.current?.selectionStart ?? fields.de.length;
      const end = germanInput.current?.selectionEnd ?? start;
      setFields({ ...fields, de: fields.de.slice(0, start) + character + fields.de.slice(end) });
      germanInput.current?.focus();
      requestAnimationFrame(() => germanInput.current?.setSelectionRange(start + 1, start + 1));
    }}>{character}</button>)}</div>
    <label>{text.serbianText}<input ref={serbianInput} required maxLength={300} lang="sr-Latn" value={fields.sr} disabled={busy} onChange={(event) => setFields({ ...fields, sr: event.target.value })} /></label>
    <div className="character-keys">{['č', 'ć', 'š', 'ž', 'đ'].map((character) => <button key={character} type="button" disabled={busy || fields.sr.length >= 300} onClick={() => {
      const start = serbianInput.current?.selectionStart ?? fields.sr.length;
      const end = serbianInput.current?.selectionEnd ?? start;
      setFields({ ...fields, sr: fields.sr.slice(0, start) + character + fields.sr.slice(end) });
      serbianInput.current?.focus();
      requestAnimationFrame(() => serbianInput.current?.setSelectionRange(start + 1, start + 1));
    }}>{character}</button>)}</div>
    {fields.kind === 'word' && <div className="entry-fields"><PluralInput language="de" value={fields.dePlural ?? ''} label={text.dePlural} busy={busy} onChange={(value) => setFields({ ...fields, dePlural: value })} /><PluralInput language="sr" value={fields.srPlural ?? ''} label={text.srPlural} busy={busy} onChange={(value) => setFields({ ...fields, srPlural: value })} /></div>}
    <div className="entry-fields"><label>{text.topic}<select value={fields.topic} disabled={busy} onChange={(event) => setFields({ ...fields, topic: event.target.value })}>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic[ui]}</option>)}</select></label>
      <label>{text.content}<select value={fields.kind} disabled={busy} onChange={(event) => setFields({ ...fields, kind: event.target.value as EntryFields['kind'] })}><option value="word">{text.word}</option><option value="sentence">{text.sentence}</option></select></label></div>
    {entry && <><p className="edit-warning">{text.editEntryWarning}</p><label className="checkbox"><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} />{text.confirmEntryEdit}</label></>}
    {(invalid || error) && <p className="inline-error" role="alert">{invalid ? text.entryInvalid : errorText(error, text)}</p>}
    <div className="button-row"><button type="button" disabled={busy} onClick={onCancel}>{text.cancel}</button><button className="primary" disabled={busy || !fields.de.trim() || !fields.sr.trim() || (!!entry && !confirmed)}><Check size={19} />{text.save}</button></div>
  </form>;
}

function Library({ profile, text, ui, speech, busy, catalog, customEntries, error, clearError, onCommand, onFavorite }: { profile: Profile; text: Text; ui: Language; speech: Speech; busy: boolean; catalog: Entry[]; customEntries: CustomEntry[]; error: string; clearError: () => void; onCommand: (command: Command) => Promise<AppState | null>; onFavorite: (entry: Entry) => void }) {
  const [tab, setTab] = useState<'cards' | 'dictionary'>('cards');
  const [initialFields, setInitialFields] = useState<EntryFields>();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [topic, setTopic] = useState('');
  const [kind, setKind] = useState('');
  const [favorites, setFavorites] = useState(false);
  const [page, setPage] = useState(0);
  const [origin, setOrigin] = useState('');
  const [editing, setEditing] = useState<CustomEntry | 'new' | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<CustomEntry | null>(null);
  const closeEditor = () => { setEditing(null); setInitialFields(undefined); clearError(); };
  const customById = new Map(customEntries.map((entry) => [entry.id, entry]));
  const folded = (value: string) => value.toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd');
  const found = catalog.filter((entry) => (!topic || entry.topic === topic) && (!kind || entry.kind === kind) && (!origin || (origin === 'custom' ? customById.has(entry.id) : !customById.has(entry.id))) && (!favorites || profile.favorites.includes(entry.id)) && folded(`${entry.de} ${entry.sr}`).includes(folded(deferredSearch.trim())));
  const totalPages = Math.max(1, Math.ceil(found.length / 24));
  const currentPage = Math.min(page, totalPages - 1);
  return <section><PageHeading title={text.library} subtitle={`${catalog.length} ${text.results}`} />
    <div className="dictionary-tabs" role="tablist" aria-label={text.library}><button role="tab" aria-selected={tab === 'cards'} onClick={() => setTab('cards')}><BookOpen size={20} />{text.learningEntries}</button><button role="tab" aria-selected={tab === 'dictionary'} onClick={() => setTab('dictionary')}><Search size={20} />{text.lexicon}</button></div>
    {tab === 'dictionary' ? <DictionaryLookup text={text} catalog={catalog} busy={busy || customEntries.length >= MAX_CUSTOM_ENTRIES} onAdopt={(entry) => {
      clearError(); setInitialFields({ de: entry.de, sr: entry.sr, topic: 'home', kind: 'word', provenance: { provider: 'Wiktionary / Kaikki', license: 'CC-BY-SA-4.0', url: entry.source, sense: entry.sense } }); setEditing('new');
    }} /> : <>
    <div className="library-actions"><label>{text.origin}<select value={origin} onChange={(event) => { setOrigin(event.target.value); setPage(0); }}><option value="">{text.allEntries}</option><option value="custom">{text.ownEntries} ({customEntries.length})</option><option value="built-in">{text.builtIn}</option></select></label><button className="primary" disabled={busy || customEntries.length >= MAX_CUSTOM_ENTRIES} onClick={() => { clearError(); setEditing('new'); }}><Plus size={20} />{text.addEntry}</button></div>
    <div className="library-filters"><label className="search-field"><Search size={22} /><span className="sr-only">{text.search}</span><input type="search" placeholder={text.search} value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} /></label><div className="filter-row"><label><span className="sr-only">{text.topic}</span><select value={topic} onChange={(event) => { setTopic(event.target.value); setPage(0); }}><option value="">{text.allTopics}</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic[ui]}</option>)}</select></label><label><span className="sr-only">{text.content}</span><select value={kind} onChange={(event) => { setKind(event.target.value); setPage(0); }}><option value="">{text.allContent}</option><option value="word">{text.words}</option><option value="sentence">{text.sentences}</option></select></label><label className="checkbox"><input type="checkbox" checked={favorites} onChange={(event) => { setFavorites(event.target.checked); setPage(0); }} /><Star size={18} />{text.favorites}</label></div></div>
    <div className="library-count" role="status">{found.length} {text.results}</div>
    {found.length ? <><div className="library-header"><span>Deutsch</span><span>Srpski</span></div><ul className="library-list">{found.slice(currentPage * 24, currentPage * 24 + 24).map((entry) => <li key={entry.id}>
      <div className="translation"><div><strong lang="de">{entry.de}</strong><PluralLine entry={entry} language="de" text={text} /></div><Audio value={entry.de} language="de" text={text} speech={speech} /></div>
      <div className="translation"><div><span lang="sr-Latn">{entry.sr}</span><PluralLine entry={entry} language="sr" text={text} /></div><Audio value={entry.sr} language="sr" text={text} speech={speech} /></div>
      <div className="entry-actions"><IconButton icon={Star} active={profile.favorites.includes(entry.id)} disabled={busy} label={profile.favorites.includes(entry.id) ? text.unfavorite : text.favorite} onClick={() => onFavorite(entry)} />
        {customById.has(entry.id) && <><IconButton icon={Pencil} label={`${text.edit}: ${entry.de}`} disabled={busy} onClick={() => { clearError(); setEditing(customById.get(entry.id)!); }} /><IconButton icon={Trash2} label={`${text.delete}: ${entry.de}`} disabled={busy} onClick={() => { clearError(); setDeletingEntry(customById.get(entry.id)!); }} /></>}
      </div>
      {customById.get(entry.id)?.provenance && <details className="saved-provenance"><summary>{text.source}: Wiktionary / Kaikki</summary><p>{text.derivedEntry}</p><p>{customById.get(entry.id)!.provenance!.sense}</p><p>{customById.get(entry.id)!.provenance!.url}</p></details>}
    </li>)}</ul><div className="pagination"><IconButton icon={ChevronLeft} label={text.previous} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} /><span>{text.page} {currentPage + 1} {text.of} {totalPages}</span><IconButton icon={ChevronRight} label={text.next} disabled={currentPage === totalPages - 1} onClick={() => setPage(currentPage + 1)} /></div></> : <div className="empty-state"><Search size={38} /><h2>{favorites ? text.noFavorites : text.noResults}</h2></div>}
    </>}
    {editing && <Modal title={editing === 'new' ? text.addEntry : text.editEntry} cancel={text.close} close={closeEditor} busy={busy}><EntryEditor entry={editing === 'new' ? null : editing} initialFields={initialFields} text={text} ui={ui} busy={busy} error={error} onCancel={closeEditor} onSave={async (entry) => {
      const command: Command = editing === 'new' ? { type: 'addEntry', entry } : { type: 'editEntry', entry, entryId: editing.id, expectedRevision: editing.revision, confirmed: true };
      if (await onCommand(command)) { closeEditor(); setTab('cards'); setOrigin('custom'); setSearch(''); setTopic(''); setKind(''); setFavorites(false); setPage(0); }
    }} /></Modal>}
    {deletingEntry && <Modal title={text.deleteEntryTitle} cancel={text.close} close={() => { setDeletingEntry(null); clearError(); }} busy={busy}><p className="entry-preview"><strong>{deletingEntry.de}</strong><br />{deletingEntry.sr}</p><p>{text.deleteEntryWarning}</p>{error && <p role="alert" className="inline-error">{errorText(error, text)}</p>}<div className="button-row"><button disabled={busy} onClick={() => { setDeletingEntry(null); clearError(); }}>{text.cancel}</button><button className="danger" disabled={busy} onClick={async () => {
      if (await onCommand({ type: 'removeEntry', entryId: deletingEntry.id, expectedRevision: deletingEntry.revision, confirmed: true })) setDeletingEntry(null);
    }}><Trash2 size={19} />{text.deleteAction}</button></div></Modal>}
  </section>;
}

function DictionaryLookup({ text, catalog, busy, onAdopt }: { text: Text; catalog: Entry[]; busy: boolean; onAdopt: (entry: DictionaryEntry) => void }) {
  const [data, setData] = useState<Lexicon | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [page, setPage] = useState(0);
  useEffect(() => {
    let active = true;
    fetch('./kaikki.json').then((response) => { if (!response.ok) throw new Error('DICTIONARY'); return response.json(); })
      .then((value: Lexicon) => { if (active) setData(value); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  const matches = searchDictionary(data?.entries ?? [], deferred);
  const pages = Math.max(1, Math.ceil(matches.length / 20));
  const currentPage = Math.min(page, pages - 1);
  const normalizePair = (entry: { de: string; sr: string }) => `${entry.de.normalize('NFC').toLowerCase().replace(/\s+/gu, ' ').trim()}\u0000${entry.sr.normalize('NFC').toLowerCase().replace(/\s+/gu, ' ').trim()}`;
  const existing = new Set(catalog.map(normalizePair));
  return <section className="dictionary-lookup" aria-label={text.lexicon}>
    <label className="search-field"><Search size={22} /><span className="sr-only">{text.lexicon}: {text.search}</span><input type="search" value={query} placeholder={text.search} onChange={(event) => { setQuery(event.target.value); setPage(0); }} /></label>
    {failed ? <p role="alert">{text.dictionaryError}</p> : !data ? <p role="status">{text.dictionaryLoading}</p> : <>
      <p className="library-count" role="status">{matches.length} {text.results} · Deutsch / Srpski (latinica)</p>
      <ul className="dictionary-list">{matches.slice(currentPage * 20, currentPage * 20 + 20).map((entry) => <li key={entry.id}>
        <div><strong lang="de">{entry.de}</strong><span lang="sr-Latn">{entry.sr}</span>{entry.sense && <p lang="de">{entry.sense}</p>}<details><summary>{text.source}</summary><p>Wiktionary / Kaikki · CC BY-SA 4.0</p><p>{entry.source}</p></details></div>
        <IconButton icon={existing.has(normalizePair(entry)) ? Check : Plus} disabled={busy || existing.has(normalizePair(entry))} label={`${existing.has(normalizePair(entry)) ? text.alreadyAdded : text.adopt}: ${entry.de} / ${entry.sr}`} onClick={() => onAdopt(entry)} />
      </li>)}</ul>
      {!matches.length && <p>{text.noResults}</p>}
      <div className="pagination"><IconButton icon={ChevronLeft} label={text.previous} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} /><span>{text.page} {currentPage + 1} {text.of} {pages}</span><IconButton icon={ChevronRight} label={text.next} disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)} /></div>
      <div className="dictionary-provenance"><p>{text.dictionaryCredit}</p><p>{text.dictionaryChanges}</p><p>{text.dictionaryDate}: {data.retrievedAt.slice(0, 10)}</p><p>https://kaikki.org/dewiktionary/</p><p>https://creativecommons.org/licenses/by-sa/4.0/</p></div>
    </>}
  </section>;
}

function Progress({ profile, text, ui, catalog }: { profile: Profile; text: Text; ui: Language; catalog: Entry[] }) {
  const entryById = new Map(catalog.map((entry) => [entry.id, entry]));
  return <section><PageHeading title={text.progress} subtitle={`${profile.name} · ${text.retention}`} /><Stats profile={profile} text={text} catalog={catalog} />
    <section className="settings-section"><h2>{text.topicProgress}</h2><div className="topic-progress">{topics.map((topic) => {
      const total = catalog.filter((entry) => entry.topic === topic.id).length;
      const count = catalog.filter((entry) => entry.topic === topic.id && profile.progress[entry.id]).length;
      return <div key={topic.id}><div><strong>{topic[ui]}</strong><span>{count} / {total}</span></div><progress value={count} max={total} aria-label={topic[ui]} /></div>;
    })}</div></section>
    <section className="settings-section"><h2>{text.activity}</h2>{profile.history.length ? <ul className="activity-list">{profile.history.slice(-12).reverse().map((event, index) => <li key={`${event.at}-${index}`}><div><strong>{entryById.get(event.entryId)?.[profile.target]}</strong><span>{entryById.get(event.entryId)?.[sourceLanguage(profile.target)]}</span></div><span className="pill">{[text.again, text.hard, text.good, text.easy][event.rating - 1]}</span><time dateTime={event.at}>{new Intl.DateTimeFormat(ui === 'de' ? 'de-DE' : 'sr-Latn-RS', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(event.at))}</time></li>)}</ul> : <p className="muted">{text.noActivity}</p>}</section>
  </section>;
}