import { useState } from 'react';
import { Printer } from 'lucide-react';
import { grammarBooks } from './domain/grammar';
import type { Language } from './domain/curriculum';
import { dictionary, type Text } from './i18n';

export function Grammar({ target, text }: { target: Language; text: Text }) {
  const [language, setLanguage] = useState(target);
  const book = grammarBooks[language];
  return <section className="grammar-book">
    <div className="grammar-tools">
      <label>{text.direction}<select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
        <option value="sr">Serbisch auf Deutsch</option><option value="de">Nemački na srpskom</option>
      </select></label>
      <button onClick={() => window.print()}><Printer size={21} />{text.printBook}</button>
    </div>
    <article lang={book.explanationLanguage === 'sr' ? 'sr-Latn' : 'de'}>
      <header className="grammar-heading"><p className="eyebrow">Zajedno · {book.subtitle}</p><h1>{book.title}</h1></header>
      <nav className="grammar-contents" aria-label={text.contents}>{book.chapters.map((chapter) => <a key={chapter.id} href={`#grammar-${chapter.id}`} onClick={(event) => { event.preventDefault(); document.getElementById(`grammar-${chapter.id}`)?.scrollIntoView({ block: 'start' }); }}>{chapter.title}</a>)}</nav>
      {book.chapters.map((chapter) => <section className="grammar-chapter" id={`grammar-${chapter.id}`} key={chapter.id}>
        <h2>{chapter.title}</h2>
        {chapter.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <dl className="grammar-examples">{chapter.examples.map(([example, translation]) => <div key={example}><dt lang={language === 'sr' ? 'sr-Latn' : 'de'}>{example}</dt><dd>{translation}</dd></div>)}</dl>
      </section>)}
    </article>
    <p className="muted" lang={book.explanationLanguage === 'sr' ? 'sr-Latn' : 'de'}>{dictionary(book.explanationLanguage).grammarNote}</p>
  </section>;
}