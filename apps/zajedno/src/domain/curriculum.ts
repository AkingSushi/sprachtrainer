export type Language = 'de' | 'sr';
export type Entry = { id: string; topic: string; kind: 'word' | 'sentence'; de: string; sr: string; dePlural?: string; srPlural?: string };
type Pair = readonly [string, string];
type Topic = { id: string; de: string; sr: string; words: Pair[]; sentences: Pair[] };

export const topics: Topic[] = [
  {
    id: 'greetings', de: 'Begrüßung & Begegnung', sr: 'Pozdravi i susreti',
    words: [
      ['hallo', 'zdravo'], ['guten Morgen', 'dobro jutro'], ['guten Tag', 'dobar dan'], ['guten Abend', 'dobro veče'],
      ['gute Nacht', 'laku noć'], ['auf Wiedersehen', 'doviđenja'], ['bis morgen', 'vidimo se sutra'], ['bis bald', 'vidimo se uskoro'],
      ['danke', 'hvala'], ['bitte (Bitte äußern)', 'molim'], ['Entschuldigung', 'izvinite'], ['ja', 'da'],
      ['nein', 'ne'], ['vielleicht', 'možda'], ['willkommen', 'dobro došli'], ['gern geschehen', 'nema na čemu'],
      ['der Name', 'ime'], ['der Vorname', 'lično ime'], ['der Nachname', 'prezime'], ['die Sprache', 'jezik'],
      ['die Frage', 'pitanje'], ['die Antwort', 'odgovor'], ['das Gespräch', 'razgovor'], ['der Gruß', 'pozdrav'],
      ['verstehen', 'razumeti'], ['sprechen', 'govoriti'], ['fragen', 'pitati'], ['antworten', 'odgovoriti'],
      ['langsam', 'polako'], ['zusammen', 'zajedno'], ['noch einmal', 'još jednom'], ['herzlich', 'srdačno'],
    ],
    sentences: [
      ['Wie heißt du?', 'Kako se zoveš?'], ['Ich heiße Ana.', 'Zovem se Ana.'],
      ['Wie geht es dir?', 'Kako si?'], ['Mir geht es gut, danke.', 'Dobro sam, hvala.'],
      ['Schön, dich zu sehen.', 'Drago mi je što te vidim.'], ['Bitte sprich langsam.', 'Molim te, govori polako.'],
      ['Ich verstehe die Frage nicht.', 'Ne razumem pitanje.'], ['Kannst du das wiederholen?', 'Možeš li to da ponoviš?'],
      ['Wir lernen zusammen.', 'Učimo zajedno.'], ['Bis morgen früh!', 'Vidimo se sutra ujutru!'],
    ],
  },
  {
    id: 'home', de: 'Zuhause & Dinge', sr: 'Dom i predmeti',
    words: [
      ['das Haus', 'kuća'], ['die Wohnung', 'stan'], ['die Tür', 'vrata'], ['das Fenster', 'prozor'],
      ['der Tisch', 'sto'], ['der Stuhl', 'stolica'], ['das Bett', 'krevet'], ['der Schrank', 'ormar'],
      ['das Sofa', 'sofa'], ['die Lampe', 'lampa'], ['der Teppich', 'tepih'], ['der Spiegel', 'ogledalo'],
      ['das Regal', 'polica'], ['das Kissen', 'jastuk'], ['die Decke', 'ćebe'], ['die Wand', 'zid'],
      ['der Boden', 'pod'], ['das Dach', 'krov'], ['die Treppe', 'stepenice'], ['der Schlüssel', 'ključ'],
      ['die Küche', 'kuhinja'], ['das Badezimmer', 'kupatilo'], ['das Schlafzimmer', 'spavaća soba'], ['das Wohnzimmer', 'dnevna soba'],
      ['der Flur', 'hodnik'], ['der Balkon', 'balkon'], ['der Garten', 'bašta'], ['die Heizung', 'grejanje'],
      ['die Steckdose', 'utičnica'], ['der Vorhang', 'zavesa'], ['die Schublade', 'fioka'], ['das Handtuch', 'peškir'],
    ],
    sentences: [
      ['Der Schlüssel liegt auf dem Tisch.', 'Ključ je na stolu.'], ['Bitte schließe die Tür.', 'Molim te, zatvori vrata.'],
      ['Das Fenster ist offen.', 'Prozor je otvoren.'], ['Die Lampe steht neben dem Bett.', 'Lampa je pored kreveta.'],
      ['Wir sitzen auf dem Sofa.', 'Sedimo na sofi.'], ['Das Handtuch ist im Badezimmer.', 'Peškir je u kupatilu.'],
      ['Die Küche ist klein.', 'Kuhinja je mala.'], ['Ich brauche ein Kissen.', 'Treba mi jastuk.'],
      ['Im Garten steht ein Tisch.', 'U bašti je sto.'], ['Die Wohnung ist warm.', 'Stan je topao.'],
    ],
  },
  {
    id: 'chores', de: 'Haushalt & Helfen', sr: 'Kućni poslovi i pomoć',
    words: [
      ['putzen', 'čistiti'], ['waschen', 'prati'], ['aufräumen', 'pospremati'], ['kochen', 'kuvati'],
      ['backen', 'peći'], ['bügeln', 'peglati'], ['fegen', 'mesti'], ['staubsaugen', 'usisavati'],
      ['trocknen', 'sušiti'], ['spülen', 'ispirati'], ['gießen', 'zalivati'], ['reparieren', 'popravljati'],
      ['öffnen', 'otvoriti'], ['schließen', 'zatvoriti'], ['helfen', 'pomagati'], ['tragen', 'nositi'],
      ['der Besen', 'metla'], ['der Eimer', 'kofa'], ['der Schwamm', 'sunđer'], ['die Seife', 'sapun'],
      ['das Waschmittel', 'deterdžent za veš'], ['die Waschmaschine', 'mašina za veš'], ['der Staubsauger', 'usisivač'], ['das Bügeleisen', 'pegla'],
      ['der Müll', 'smeće'], ['der Mülleimer', 'kanta za smeće'], ['die Wäsche', 'veš'], ['die Spülmaschine', 'mašina za sudove'],
      ['sauber', 'čisto'], ['schmutzig', 'prljavo'], ['trocken', 'suvo'], ['nass', 'mokro'],
    ],
    sentences: [
      ['Ich wasche heute die Wäsche.', 'Danas perem veš.'], ['Kannst du mir helfen?', 'Možeš li da mi pomogneš?'],
      ['Wir räumen die Küche auf.', 'Pospremamo kuhinju.'], ['Der Eimer ist voll.', 'Kofa je puna.'],
      ['Bitte bring den Müll hinaus.', 'Molim te, iznesi smeće.'], ['Ich gieße die Blumen.', 'Zalivam cveće.'],
      ['Das Handtuch ist noch nass.', 'Peškir je još mokar.'], ['Die Waschmaschine läuft.', 'Mašina za veš radi.'],
      ['Wir putzen das Fenster zusammen.', 'Zajedno čistimo prozor.'], ['Der Boden ist jetzt sauber.', 'Pod je sada čist.'],
    ],
  },
  {
    id: 'food', de: 'Essen & Trinken', sr: 'Hrana i piće',
    words: [
      ['das Brot', 'hleb'], ['die Milch', 'mleko'], ['das Wasser', 'voda'], ['der Kaffee', 'kafa'],
      ['der Tee', 'čaj'], ['der Saft', 'sok'], ['der Käse', 'sir'], ['das Ei', 'jaje'],
      ['die Butter', 'puter'], ['der Reis', 'pirinač'], ['die Kartoffel', 'krompir'], ['die Tomate', 'paradajz'],
      ['die Gurke', 'krastavac'], ['die Zwiebel', 'luk'], ['der Apfel', 'jabuka'], ['die Birne', 'kruška'],
      ['die Banane', 'banana'], ['die Erdbeere', 'jagoda'], ['die Suppe', 'supa'], ['der Salat', 'salata'],
      ['das Fleisch', 'meso'], ['der Fisch', 'riba'], ['das Salz', 'so'], ['der Zucker', 'šećer'],
      ['der Teller', 'tanjir'], ['die Tasse', 'šolja'], ['das Glas', 'čaša'], ['die Gabel', 'viljuška'],
      ['das Messer', 'nož'], ['der Löffel', 'kašika'], ['das Frühstück', 'doručak'], ['das Abendessen', 'večera'],
    ],
    sentences: [
      ['Möchtest du einen Tee?', 'Želiš li čaj?'], ['Ich trinke Kaffee ohne Zucker.', 'Pijem kafu bez šećera.'],
      ['Das Brot ist frisch.', 'Hleb je svež.'], ['Bitte gib mir das Salz.', 'Molim te, dodaj mi so.'],
      ['Die Suppe ist noch heiß.', 'Supa je još vruća.'], ['Wir essen um sieben Uhr.', 'Jedemo u sedam sati.'],
      ['Ich möchte ein Glas Wasser.', 'Želim čašu vode.'], ['Der Käse ist im Kühlschrank.', 'Sir je u frižideru.'],
      ['Das Frühstück ist fertig.', 'Doručak je spreman.'], ['Guten Appetit!', 'Prijatno!'],
    ],
  },
  {
    id: 'family', de: 'Familie & Menschen', sr: 'Porodica i ljudi',
    words: [
      ['die Familie', 'porodica'], ['die Mutter', 'majka'], ['der Vater', 'otac'], ['die Eltern', 'roditelji'],
      ['die Tochter', 'ćerka'], ['der Sohn', 'sin'], ['die Schwester', 'sestra'], ['der Bruder', 'brat'],
      ['die Großmutter', 'baka'], ['der Großvater', 'deda'], ['das Kind', 'dete'], ['das Baby', 'beba'],
      ['die Frau', 'žena'], ['der Mann', 'muškarac'], ['die Freundin', 'prijateljica'], ['der Freund', 'prijatelj'],
      ['die Nachbarin', 'komšinica'], ['der Nachbar', 'komšija'], ['der Mensch', 'čovek'], ['die Leute', 'ljudi'],
      ['der Geburtstag', 'rođendan'], ['das Geschenk', 'poklon'], ['der Besuch', 'poseta'], ['die Hochzeit', 'venčanje'],
      ['die Liebe', 'ljubav'], ['die Freude', 'radost'], ['lachen', 'smejati se'], ['spielen', 'igrati se'],
      ['besuchen', 'posetiti'], ['feiern', 'slaviti'], ['jung', 'mlad'], ['alt', 'star'],
    ],
    sentences: [
      ['Meine Schwester kommt heute.', 'Moja sestra dolazi danas.'], ['Wie heißt dein Bruder?', 'Kako se zove tvoj brat?'],
      ['Die Kinder spielen im Garten.', 'Deca se igraju u bašti.'], ['Wir besuchen unsere Eltern.', 'Posećujemo naše roditelje.'],
      ['Meine Mutter hat morgen Geburtstag.', 'Moja majka sutra ima rođendan.'], ['Das Geschenk ist für dich.', 'Poklon je za tebe.'],
      ['Mein Vater kocht gern.', 'Moj otac voli da kuva.'], ['Die Nachbarin hilft uns.', 'Komšinica nam pomaže.'],
      ['Unsere Familie ist groß.', 'Naša porodica je velika.'], ['Wir feiern am Samstag.', 'Slavimo u subotu.'],
    ],
  },
  {
    id: 'work', de: 'Arbeit & Lernen', sr: 'Posao i učenje',
    words: [
      ['die Arbeit', 'posao'], ['das Büro', 'kancelarija'], ['die Firma', 'firma'], ['der Beruf', 'zanimanje'],
      ['die Kollegin', 'koleginica'], ['der Kollege', 'kolega'], ['die Chefin', 'šefica'], ['der Chef', 'šef'],
      ['der Computer', 'računar'], ['die Tastatur', 'tastatura'], ['der Bildschirm', 'ekran'], ['der Drucker', 'štampač'],
      ['das Telefon', 'telefon'], ['die Nachricht', 'poruka'], ['der Brief', 'pismo'], ['das Papier', 'papir'],
      ['der Stift', 'olovka'], ['das Heft', 'sveska'], ['das Buch', 'knjiga'], ['die Schule', 'škola'],
      ['die Lehrerin', 'nastavnica'], ['der Lehrer', 'nastavnik'], ['die Aufgabe', 'zadatak'], ['die Pause', 'pauza'],
      ['arbeiten', 'raditi'], ['lernen', 'učiti'], ['lesen', 'čitati'], ['schreiben', 'pisati'],
      ['zuhören', 'slušati'], ['erklären', 'objasniti'], ['üben', 'vežbati'], ['fertig', 'gotovo'],
    ],
    sentences: [
      ['Ich arbeite heute zu Hause.', 'Danas radim kod kuće.'], ['Die Pause beginnt um zwölf Uhr.', 'Pauza počinje u dvanaest sati.'],
      ['Mein Computer ist langsam.', 'Moj računar je spor.'], ['Bitte schreibe deinen Namen.', 'Molim te, napiši svoje ime.'],
      ['Ich lese ein Buch.', 'Čitam knjigu.'], ['Die Kollegin erklärt die Aufgabe.', 'Koleginica objašnjava zadatak.'],
      ['Wir üben jeden Tag.', 'Vežbamo svaki dan.'], ['Wo ist mein Stift?', 'Gde je moja olovka?'],
      ['Ich brauche eine Pause.', 'Treba mi pauza.'], ['Die Nachricht ist für dich.', 'Poruka je za tebe.'],
    ],
  },
  {
    id: 'shopping', de: 'Einkaufen & Kleidung', sr: 'Kupovina i odeća',
    words: [
      ['das Geschäft', 'prodavnica'], ['der Supermarkt', 'supermarket'], ['der Markt', 'pijaca'], ['die Bäckerei', 'pekara'],
      ['die Kasse', 'kasa'], ['der Preis', 'cena'], ['das Geld', 'novac'], ['die Rechnung', 'račun'],
      ['die Tasche', 'torba'], ['der Korb', 'korpa'], ['die Flasche', 'flaša'], ['die Packung', 'pakovanje'],
      ['das Angebot', 'ponuda'], ['der Rabatt', 'popust'], ['die Größe', 'veličina'], ['die Farbe', 'boja'],
      ['die Hose', 'pantalone'], ['das Hemd', 'košulja'], ['das Kleid', 'haljina'], ['die Jacke', 'jakna'],
      ['der Schuh', 'cipela'], ['die Socke', 'čarapa'], ['der Hut', 'šešir'], ['der Mantel', 'kaput'],
      ['kaufen', 'kupiti'], ['bezahlen', 'platiti'], ['kosten', 'koštati'], ['suchen', 'tražiti'],
      ['billig', 'jeftino'], ['teuer', 'skupo'], ['klein', 'mali'], ['groß', 'veliki'],
    ],
    sentences: [
      ['Wie viel kostet das?', 'Koliko to košta?'], ['Ich bezahle mit Karte.', 'Plaćam karticom.'],
      ['Haben Sie eine Tasche?', 'Imate li torbu?'], ['Ich suche eine Jacke.', 'Tražim jaknu.'],
      ['Die Schuhe sind zu klein.', 'Cipele su premale.'], ['Wo ist die Kasse?', 'Gde je kasa?'],
      ['Ich brauche zwei Flaschen Wasser.', 'Trebaju mi dve flaše vode.'], ['Das Geschäft ist heute geschlossen.', 'Prodavnica je danas zatvorena.'],
      ['Bitte geben Sie mir die Rechnung.', 'Molim vas, dajte mi račun.'], ['Wir kaufen Brot auf dem Markt.', 'Kupujemo hleb na pijaci.'],
    ],
  },
  {
    id: 'time', de: 'Zeit & Alltag', sr: 'Vreme i svakodnevica',
    words: [
      ['heute', 'danas'], ['morgen', 'sutra'], ['gestern', 'juče'], ['jetzt', 'sada'],
      ['später', 'kasnije'], ['früh', 'rano'], ['spät', 'kasno'], ['immer', 'uvek'],
      ['oft', 'često'], ['manchmal', 'ponekad'], ['nie', 'nikada'], ['bald', 'uskoro'],
      ['der Tag', 'dan'], ['die Woche', 'nedelja'], ['der Monat', 'mesec'], ['das Jahr', 'godina'],
      ['die Stunde', 'sat'], ['die Minute', 'minut'], ['die Sekunde', 'sekund'], ['der Morgen', 'jutro'],
      ['der Mittag', 'podne'], ['der Abend', 'veče'], ['die Nacht', 'noć'], ['das Wochenende', 'vikend'],
      ['Montag', 'ponedeljak'], ['Dienstag', 'utorak'], ['Mittwoch', 'sreda'], ['Donnerstag', 'četvrtak'],
      ['Freitag', 'petak'], ['Samstag', 'subota'], ['Sonntag', 'nedelja (dan)'], ['der Kalender', 'kalendar'],
    ],
    sentences: [
      ['Wie spät ist es?', 'Koliko je sati?'], ['Heute ist Montag.', 'Danas je ponedeljak.'],
      ['Morgen habe ich Zeit.', 'Sutra imam vremena.'], ['Wir treffen uns am Abend.', 'Nalazimo se uveče.'],
      ['Ich komme in zehn Minuten.', 'Dolazim za deset minuta.'], ['Am Sonntag bleiben wir zu Hause.', 'U nedelju ostajemo kod kuće.'],
      ['Der Termin ist nächste Woche.', 'Termin je sledeće nedelje.'], ['Ich stehe früh auf.', 'Ustajem rano.'],
      ['Warte bitte einen Moment.', 'Sačekaj trenutak, molim te.'], ['Jetzt ist Zeit für eine Pause.', 'Sada je vreme za pauzu.'],
    ],
  },
  {
    id: 'travel', de: 'Unterwegs & Draußen', sr: 'Na putu i napolju',
    words: [
      ['die Straße', 'ulica'], ['der Weg', 'put'], ['die Stadt', 'grad'], ['das Dorf', 'selo'],
      ['der Bahnhof', 'železnička stanica'], ['die Haltestelle', 'stajalište'], ['der Bus', 'autobus'], ['der Zug', 'voz'],
      ['das Auto', 'automobil'], ['das Fahrrad', 'bicikl'], ['die Fahrkarte', 'vozna karta'], ['der Koffer', 'kofer'],
      ['die Reise', 'putovanje'], ['der Urlaub', 'odmor'], ['der Park', 'park'], ['der Wald', 'šuma'],
      ['der Baum', 'drvo'], ['die Blume', 'cvet'], ['der Fluss', 'reka'], ['der See', 'jezero'],
      ['der Berg', 'planina'], ['die Sonne', 'sunce'], ['der Regen', 'kiša'], ['der Schnee', 'sneg'],
      ['der Wind', 'vetar'], ['links', 'levo'], ['rechts', 'desno'], ['geradeaus', 'pravo'],
      ['gehen', 'ići'], ['fahren', 'voziti se'], ['warten', 'čekati'], ['ankommen', 'stići'],
    ],
    sentences: [
      ['Wo ist die nächste Haltestelle?', 'Gde je najbliže stajalište?'], ['Der Bus kommt gleich.', 'Autobus uskoro dolazi.'],
      ['Wir gehen zu Fuß.', 'Idemo peške.'], ['Biegen Sie bitte links ab.', 'Skrenite levo, molim vas.'],
      ['Ich brauche eine Fahrkarte.', 'Treba mi vozna karta.'], ['Heute scheint die Sonne.', 'Danas sija sunce.'],
      ['Es regnet seit dem Morgen.', 'Kiša pada od jutros.'], ['Wir machen einen Spaziergang.', 'Idemo u šetnju.'],
      ['Der Park ist neben dem Bahnhof.', 'Park je pored železničke stanice.'], ['Wann kommt der Zug an?', 'Kada stiže voz?'],
    ],
  },
  {
    id: 'health', de: 'Körper & Wohlbefinden', sr: 'Telo i zdravlje',
    words: [
      ['der Kopf', 'glava'], ['die Hand', 'ruka'], ['der Fuß', 'stopalo'], ['das Bein', 'noga'],
      ['das Auge', 'oko'], ['das Ohr', 'uvo'], ['die Nase', 'nos'], ['der Mund', 'usta'],
      ['der Zahn', 'zub'], ['der Rücken', 'leđa'], ['der Bauch', 'stomak'], ['das Herz', 'srce'],
      ['die Ärztin', 'lekarka'], ['der Arzt', 'lekar'], ['die Apotheke', 'apoteka'], ['das Krankenhaus', 'bolnica'],
      ['das Medikament', 'lek'], ['das Rezept', 'recept'], ['der Schmerz', 'bol'], ['das Fieber', 'groznica'],
      ['der Husten', 'kašalj'], ['die Erkältung', 'prehlada'], ['die Gesundheit', 'zdravlje'], ['die Ruhe', 'mir'],
      ['müde', 'umoran'], ['gesund', 'zdrav'], ['krank', 'bolestan'], ['durstig', 'žedan'],
      ['hungrig', 'gladan'], ['schlafen', 'spavati'], ['atmen', 'disati'], ['sich ausruhen', 'odmarati se'],
    ],
    sentences: [
      ['Mein Kopf tut weh.', 'Boli me glava.'], ['Ich brauche einen Arzt.', 'Treba mi lekar.'],
      ['Wo ist die nächste Apotheke?', 'Gde je najbliža apoteka?'], ['Bitte trink etwas Wasser.', 'Molim te, popij malo vode.'],
      ['Ich möchte mich ausruhen.', 'Želim da se odmorim.'], ['Wie fühlst du dich?', 'Kako se osećaš?'],
      ['Mir ist kalt.', 'Hladno mi je.'], ['Mir ist warm.', 'Toplo mi je.'],
      ['Ich habe heute gut geschlafen.', 'Danas sam dobro spavao/spavala.'], ['Gute Besserung!', 'Brz oporavak!'],
    ],
  },
];

export const curriculum: Entry[] = topics.flatMap((topic) => [
  ...topic.words.map(([de, sr], index): Entry => ({ id: `${topic.id}-w${index + 1}`, topic: topic.id, kind: 'word', de, sr })),
  ...topic.sentences.map(([de, sr], index): Entry => ({ id: `${topic.id}-s${index + 1}`, topic: topic.id, kind: 'sentence', de, sr })),
]);
export const entryById = new Map(curriculum.map((entry) => [entry.id, entry]));
export const curriculumVersion = 1;

export function acceptedAnswers(entry: Entry, language: Language): string[] {
  if (entry.id === 'health-s9' && language === 'sr') return ['Danas sam dobro spavao.', 'Danas sam dobro spavala.'];
  return [entry[language].replace(/\s*\([^)]*\)/gu, '')];
}