import type { Language } from './curriculum';

export type GrammarChapter = { id: string; title: string; paragraphs: string[]; examples: [string, string][] };
export type GrammarBook = { title: string; subtitle: string; explanationLanguage: Language; chapters: GrammarChapter[] };

export const grammarBooks: Record<Language, GrammarBook> = {
  sr: {
    title: 'Serbische Grammatik', subtitle: 'Grundlagen auf Deutsch · Serbisch in Latinica', explanationLanguage: 'de',
    chapters: [
      { id: 'sounds', title: '1. Schrift und Aussprache', paragraphs: [
        'Serbisch wird hier ausschließlich lateinisch geschrieben. č und ć sowie dž und đ sind unterschiedliche Laute. š klingt ungefähr wie deutsches „sch“, ž wie das „g“ in „Garage“. c klingt wie „z“ in „Zeit“, j wie deutsches „j“.',
        'lj, nj und dž gelten im serbischen Alphabet jeweils als ein Buchstabe. č ist ein härterer, ć ein weicherer tsch-artiger Laut; Hörbeispiele helfen mehr als deutsche Umschreibungen. Betonung und Vokallänge sind in gewöhnlichen Texten meist nicht markiert.',
      ], examples: [['čaj / ćerka', 'Tee / Tochter'], ['žena / škola / noć', 'Frau / Schule / Nacht']] },
      { id: 'nouns', title: '2. Substantive, Geschlecht und Artikel', paragraphs: [
        'Serbisch hat keine Artikel wie „der“, „die“, „das“ oder „ein“. kuća kann je nach Zusammenhang „Haus“, „das Haus“ oder „ein Haus“ bedeuten.',
        'Es gibt männliches, weibliches und sächliches Geschlecht. Ein Konsonant am Wortende weist oft auf männlich, -a oft auf weiblich und -o oder -e oft auf sächlich hin. Das sind Hinweise, keine sicheren Regeln: noć ist weiblich; tata und deda bezeichnen männliche Personen.',
        'Adjektive richten sich nach Geschlecht, Zahl und Fall des Substantivs. Lerne deshalb kleine Wortgruppen statt nur einzelner Endungen.',
      ], examples: [['nov stan / nova kuća / novo selo', 'eine neue Wohnung / ein neues Haus / ein neues Dorf'], ['dobar čovek / dobra žena / dobro dete', 'ein guter Mensch / eine gute Frau / ein gutes Kind']] },
      { id: 'plural', title: '3. Einzahl und Mehrzahl', paragraphs: [
        'Die hier gezeigte Mehrzahl ist der Nominativ Plural, also die Grundform der Mehrzahl. Andere Fälle und Zahlenwörter können andere Formen verlangen.',
        'Viele männliche Wörter bilden den Plural mit -i; kurze Wörter erhalten häufig -ovi oder -evi. Weibliche Wörter auf -a haben oft -e, sächliche auf -o oft -a. Lautwechsel und unregelmäßige Formen müssen mitgelernt werden.',
        'dete → deca und čovek → ljudi sind wichtige Sonderfälle. vrata, usta, leđa und pantalone stehen schon in einer Mehrzahlform, auch wenn die deutsche Übersetzung Einzahl ist. Stoffwörter wie mleko werden im gewöhnlichen Gebrauch nicht wie einzelne Gegenstände gezählt.',
      ], examples: [['stan → stanovi; ključ → ključevi', 'Wohnung → Wohnungen; Schlüssel → Schlüssel'], ['kuća → kuće; selo → sela', 'Haus → Häuser; Dorf → Dörfer'], ['oko → oči; uvo → uši', 'Auge → Augen; Ohr → Ohren']] },
      { id: 'cases', title: '4. Die sieben Fälle', paragraphs: [
        'Der Fall zeigt die Rolle eines Wortes im Satz. Nominativ: Wer oder was? Genitiv: wessen, Herkunft oder Menge. Dativ: Empfänger, wem? Akkusativ: direktes Objekt oder häufig Bewegungsziel. Vokativ: Anrede. Instrumental: Mittel oder Begleitung. Lokativ: Orts- oder Themenangabe nach Präpositionen.',
        'Beispiel žena: Nominativ žena, Genitiv žene, Dativ ženi, Akkusativ ženu, Vokativ ženo, Instrumental ženom, Lokativ ženi. Das ist ein Muster, nicht die Deklination aller Substantive.',
        'Bei einem männlichen belebten Substantiv gleicht der Akkusativ Singular häufig dem Genitiv: Vidim brata. Bei vielen unbelebten gleicht er dem Nominativ: Vidim sto.',
      ], examples: [['Žena čita. Vidim ženu.', 'Die Frau liest. Ich sehe die Frau.'], ['Dajem knjigu ženi.', 'Ich gebe der Frau ein Buch.'], ['Razgovaram sa ženom.', 'Ich spreche mit der Frau.']] },
      { id: 'verbs', title: '5. Personalpronomen und Gegenwart', paragraphs: [
        'Die Personalpronomen sind ja, ti, on/ona/ono, mi, vi, oni/one/ona. Die letzte Gruppe unterscheidet männliche oder gemischte, weibliche und sächliche Mehrzahl. Als höfliche Anrede dient Vi.',
        'Pronomen können oft wegfallen, weil die Verbendung die Person zeigt: Govorim srpski. Das Präsens von raditi lautet radim, radiš, radi, radimo, radite, rade. Andere Verben haben andere Muster: čitam, čitaš, čita, čitamo, čitate, čitaju.',
        'Die kurzen Präsensformen von biti (sein) sind sam, si, je, smo, ste, su. Sie stehen normalerweise nicht am Satzanfang, sondern schließen sich an eine frühe betonte Einheit an: Ja sam Ana. Heute bin ich hier: Danas sam ovde.',
      ], examples: [['Ja sam ovde. Mi smo kod kuće.', 'Ich bin hier. Wir sind zu Hause.'], ['Imam knjigu. Imaš li vremena?', 'Ich habe ein Buch. Hast du Zeit?']] },
      { id: 'questions', title: '6. Fragen, Verneinung und Wortstellung', paragraphs: [
        'Ja/Nein-Fragen können mit da li beginnen: Da li govoriš nemački? Häufig steht li nach dem Verb: Govoriš li nemački? Fragewörter sind unter anderem ko (wer), šta (was), gde (wo), kada (wann), kako (wie) und zašto (warum).',
        'ne steht bei den meisten Verben getrennt: ne znam, ne govorim. Wichtige Ausnahmen sind nisam, nisi, nije, nismo, niste, nisu (nicht sein), nemam (nicht haben) und neću (nicht wollen bzw. verneinte Zukunft).',
        'Die Wortstellung ist beweglicher als im Deutschen, aber nicht beliebig. Unbetonte Wörter wie sam, se und kurze Objektpronomen haben feste Stellungsbedingungen. Für den Anfang sind gelernte ganze Satzmuster hilfreich.',
      ], examples: [['Gde je stanica?', 'Wo ist die Haltestelle?'], ['Ne razumem. Nisam umoran.', 'Ich verstehe nicht. Ich bin nicht müde.'], ['Nemam vremena.', 'Ich habe keine Zeit.']] },
      { id: 'past-future', title: '7. Vergangenheit, Zukunft und Aspekt', paragraphs: [
        'Das häufige Perfekt besteht aus einer Form von biti und dem aktiven Partizip. Dieses richtet sich nach Geschlecht und Zahl: radio/radila, radilo; radili/radile/radila. Eine Frau sagt Radila sam., ein Mann Radio sam.',
        'Die Zukunft wird unter anderem mit ću, ćeš, će, ćemo, ćete, će und dem Infinitiv gebildet: Ja ću raditi. Bei nachgestelltem Hilfsverb steht für raditi die Form radiću; Verben auf -ći bleiben getrennt: doći ću.',
        'Viele Tätigkeiten haben ein unvollendetes und ein vollendetes Verb: čitati beschreibt das Lesen als Verlauf oder Wiederholung, pročitati das abgeschlossene Durchlesen. Aspekt ist nicht einfach eine andere Zeitform.',
      ], examples: [['Čitao sam knjigu. Pročitao sam knjigu.', 'Ich habe in einem Buch gelesen. Ich habe das Buch durchgelesen.'], ['Sutra ću doći.', 'Morgen werde ich kommen.']] },
      { id: 'possession', title: '8. Besitz, Orte und Zahlen', paragraphs: [
        'Besitzwörter passen sich dem besessenen Gegenstand an: moj brat, moja sestra, moje dete. Weitere Grundformen sind tvoj, njegov, njen, naš und vaš. svoj verweist auf das Subjekt: Ana čita svoju knjigu.',
        'u und na stehen beim Ort mit Lokativ, beim Ziel häufig mit Akkusativ: u kući (im Haus), u kuću (ins Haus). sa mit Instrumental bezeichnet Begleitung. od und bez verlangen Genitiv.',
        'Nach jedan steht eine passende Einzahlform. Nach dva, tri und četiri stehen besondere Zählformen, z. B. dva stola, dve kuće. Ab pet folgt normalerweise Genitiv Plural: pet stolova, pet kuća. Die Mehrzahl-Grundform allein reicht nach Zahlen also nicht immer aus.',
      ], examples: [['Idem u kuću. Nalazim se u kući.', 'Ich gehe ins Haus. Ich befinde mich im Haus.'], ['jedna knjiga / dve knjige / pet knjiga', 'ein Buch / zwei Bücher / fünf Bücher']] },
      { id: 'practice', title: '9. Kleine Übungen mit Lösungen', paragraphs: [
        'Ergänze zuerst selbst: 1. Ja ___ Ana. 2. nova kuća → nove ___. 3. Vidim ___ (žena). 4. Mi ___ kod kuće. 5. „Ich habe keine Zeit.“',
        'Lösungen: 1. sam. 2. kuće. 3. ženu. 4. smo. 5. Nemam vremena. Sprich danach jeden vollständigen Satz laut und ändere jeweils nur eine Person oder ein Substantiv.',
      ], examples: [['Ja učim srpski. Učimo zajedno.', 'Ich lerne Serbisch. Wir lernen zusammen.']] },
    ],
  },
  de: {
    title: 'Nemačka gramatika', subtitle: 'Osnove na srpskom · Latinica', explanationLanguage: 'sr',
    chapters: [
      { id: 'sounds', title: '1. Slova i izgovor', paragraphs: [
        'Nemački koristi ä, ö, ü i ß. Glasovi ö i ü nemaju isti izgovor kao o i u: za ü postavi jezik kao za i, a usne kao za u; za ö približno kao e uz zaobljene usne. Slušanje je važno.',
        'sch se obično izgovara kao š, z kao c, a w kao v. ei se obično čita kao aj, ie kao dugo i. ß se izgovara kao s, ali nije uvek zamenljivo sa ss. Imenice se pišu velikim početnim slovom.',
      ], examples: [['die Tür / die Türen', 'vrata / vrata (množina)'], ['heißen / lesen / schreiben', 'zvati se / čitati / pisati']] },
      { id: 'articles', title: '2. Rod i članovi', paragraphs: [
        'Nemački ima tri roda: muški der, ženski die i srednji das. Rod često nije isti kao u srpskom: das Mädchen je gramatički srednjeg roda. Imenicu uči zajedno sa članom.',
        'Određeni član označava nešto poznato: der Tisch. Neodređeni član uvodi nešto neodređeno: ein Tisch, eine Lampe, ein Haus. U množini nema neodređenog člana: Häuser. Određeni član u nominativu množine je die za sva tri roda.',
      ], examples: [['der Tisch / die Lampe / das Haus', 'sto / lampa / kuća'], ['ein Tisch / eine Lampe / ein Haus', 'jedan sto / jedna lampa / jedna kuća']] },
      { id: 'plural', title: '3. Jednina i množina', paragraphs: [
        'Množinu uči uz imenicu. Česti nastavci su -e, -er, -(e)n i -s, a neke imenice nemaju nastavak. Moguća je promena samoglasnika u ä, ö ili ü. Ne postoji jedno pravilo za sve imenice.',
        'Oblik množine prikazan uz karticu je nominativ množine. U dativu se obično dodaje -n ako množina već ne završava na -n ili -s: mit den Kindern, ali mit den Autos.',
        'die Eltern i die Leute već su oblici množine. Das Wasser, die Milch i druge gradivne imenice u svakodnevnom značenju obično se ne broje. Za količine se kaže zwei Gläser Wasser. Posebna značenja i vrste mogu imati množinu.',
      ], examples: [['der Tag → die Tage; das Kind → die Kinder', 'dan → dani; dete → deca'], ['das Haus → die Häuser; die Frau → die Frauen', 'kuća → kuće; žena → žene'], ['der Schlüssel → die Schlüssel; das Auto → die Autos', 'ključ → ključevi; automobil → automobili']] },
      { id: 'cases', title: '4. Četiri padeža', paragraphs: [
        'Nominativ označava subjekat (wer/was?), akuzativ često direktni objekat (wen/was?), dativ primaoca (wem?), a genitiv pripadnost (wessen?). Glagoli i predlozi određuju koji padež je potreban.',
        'Određeni članovi redom muški/ženski/srednji/množina: nominativ der/die/das/die; akuzativ den/die/das/die; dativ dem/der/dem/den; genitiv des/der/des/der.',
        'Neodređeni članovi za muški/ženski/srednji rod: nominativ ein/eine/ein; akuzativ einen/eine/ein; dativ einem/einer/einem; genitiv eines/einer/eines. U genitivu muškog i srednjeg roda imenica često dobija -(e)s. Neke imenice imaju dodatne promene, npr. der Mensch → den Menschen.',
      ], examples: [['Der Mann sieht den Hund.', 'Muškarac vidi psa.'], ['Ich gebe der Frau das Buch.', 'Dajem ženi knjigu.'], ['Das ist das Auto des Nachbarn.', 'To je komšijin automobil.']] },
      { id: 'verbs', title: '5. Zamenice i prezent', paragraphs: [
        'Lične zamenice su ich (ja), du (ti), er/sie/es (on/ona/ono), wir (mi), ihr (vi, neformalno), sie (oni/one/ona). Učtivo obraćanje piše se velikim slovom Sie i koristi glagol kao množinsko sie.',
        'Pravilan glagol lernen: ich lerne, du lernst, er/sie/es lernt, wir lernen, ihr lernt, sie/Sie lernen. Kod nekih glagola menja se samoglasnik: du liest, er liest; du fährst, er fährt.',
        'Sein: ich bin, du bist, er ist, wir sind, ihr seid, sie sind. Haben: ich habe, du hast, er hat, wir haben, ihr habt, sie haben. U običnoj nemačkoj rečenici subjekat se uglavnom ne izostavlja.',
      ], examples: [['Ich lerne Deutsch. Wir lernen zusammen.', 'Učim nemački. Učimo zajedno.'], ['Sind Sie müde? Hast du Zeit?', 'Da li ste umorni? Imaš li vremena?']] },
      { id: 'order', title: '6. Red reči, pitanja i negacija', paragraphs: [
        'U glavnoj izjavnoj rečenici promenjeni glagol stoji na drugom mestu: Heute lerne ich Deutsch. Prvo mesto može zauzimati cela grupa reči, ne samo jedna reč.',
        'U pitanju bez upitne reči glagol je prvi: Lernst du Deutsch? Sa upitnom reči stoji iza nje: Wann lernst du? Posle weil i dass promenjeni glagol obično ide na kraj zavisne rečenice.',
        'kein negira imenicu uz neodređeni član ili bez člana: Ich habe kein Auto. nicht negira glagol, pridev ili određeni deo rečenice: Ich komme nicht. Das ist nicht teuer. Položaj nicht zavisi od toga šta se negira.',
      ], examples: [['Ich bleibe zu Hause, weil ich müde bin.', 'Ostajem kod kuće jer sam umoran/umorna.'], ['Ich habe keine Zeit. Ich verstehe nicht.', 'Nemam vremena. Ne razumem.']] },
      { id: 'tenses', title: '7. Prošlost, budućnost i modalni glagoli', paragraphs: [
        'U razgovoru se prošlost često izražava perfektom: haben ili sein u prezentu + particip na kraju. Ich habe gelernt. Ich bin gekommen. Sein se koristi, između ostalog, uz mnoge neprelazne glagole promene mesta ili stanja. Oblik pomoćnog glagola uči uz glagol.',
        'Particip pravilnih glagola često ima ge- i -t: gemacht. Nepravilni oblici se uče: gelesen, geschrieben. Glagoli na -ieren nemaju ge-: telefoniert. War i hatte su česti oblici prošlosti glagola sein i haben.',
        'Budućnost se često izražava prezentom uz vreme: Morgen komme ich. Futur: Ich werde kommen. Modalni glagoli können, müssen, wollen, sollen, dürfen i mögen menjaju značenje; infinitiv stoji na kraju: Ich kann kommen. Möchte je čest učtiv oblik za želju.',
        'Kod odvojivih glagola prefiks u glavnoj rečenici ide na kraj: Ich stehe früh auf. Perfekt je Ich bin früh aufgestanden.',
      ], examples: [['Ich habe das Buch gelesen.', 'Pročitao/pročitala sam knjigu.'], ['Ich möchte einen Tee. Ich muss arbeiten.', 'Želeo/želela bih čaj. Moram da radim.']] },
      { id: 'adjectives', title: '8. Prisvojne reči, pridevi i predlozi', paragraphs: [
        'Prisvojne reči su mein, dein, sein, ihr, unser, euer, ihr i učtivo Ihr. Nastavak zavisi od imenice: mein Vater, meine Mutter, mein Kind. Akuzativ muškog roda je meinen: Ich sehe meinen Vater.',
        'Pridev ispred imenice dobija nastavak: der gute Mann, ein guter Mann, die gute Frau, ein gutes Kind. Posle sein ostaje bez nastavka: Der Mann ist gut. Nastavci zavise od člana, roda, broja i padeža.',
        'mit, nach, bei, seit, von, zu i aus traže dativ; durch, für, gegen, ohne i um traže akuzativ. in, an, auf, über, unter, vor, hinter, neben i zwischen imaju dativ za mesto, a akuzativ za usmeravanje ka cilju. Nije svako kretanje automatski akuzativ: Ich gehe im Park spazieren.',
      ], examples: [['Ich bin in der Küche. Ich gehe in die Küche.', 'U kuhinji sam. Idem u kuhinju.'], ['mit meinem Bruder / für meine Schwester', 'sa mojim bratom / za moju sestru']] },
      { id: 'practice', title: '9. Kratke vežbe sa rešenjima', paragraphs: [
        'Prvo dopuni samostalno: 1. Ich ___ Ana. 2. das Haus → die ___. 3. Ich sehe ___ Mann. 4. Heute ___ ich Deutsch. (lernen) 5. „Nemam vremena.“',
        'Rešenja: 1. bin. 2. Häuser. 3. den. 4. lerne. 5. Ich habe keine Zeit. Pročitaj cele rečenice naglas, a zatim promeni lice ili imenicu.',
      ], examples: [['Wir üben jeden Tag.', 'Vežbamo svakog dana.']] },
    ],
  },
};