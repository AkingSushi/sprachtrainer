import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/nunito-sans/latin-400.css';
import '@fontsource/nunito-sans/latin-600.css';
import '@fontsource/nunito-sans/latin-700.css';
import '@fontsource/nunito-sans/latin-800.css';
import '@fontsource/nunito-sans/latin-ext-400.css';
import '@fontsource/nunito-sans/latin-ext-600.css';
import '@fontsource/nunito-sans/latin-ext-700.css';
import '@fontsource/nunito-sans/latin-ext-800.css';
import App from './App';
import './styles.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="fatal"><img src="./zajedno.png" alt="" width="64" height="64" /><h1>Zajedno</h1><p>Die Ansicht konnte nicht geöffnet werden. Gespeicherte Lernstände bleiben erhalten.</p><p>Prikaz nije otvoren. Sačuvani napredak ostaje sačuvan.</p><button onClick={() => location.reload()}>Neu laden / Učitaj ponovo</button></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>);