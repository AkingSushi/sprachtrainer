# Zajedno

Deutsch und Serbisch (Latinica) lernen, allein oder gemeinsam an einem Windows-PC. Keine Anmeldung, kein Backend, keine Cloud und kein Datenbankserver. Die 320 Wortpaare und 100 Alltagssätze in zehn Themen sind bewusst gebündelte Lerninhalte, keine Test- oder Mock-Daten.

## Deutsch

### Installieren und starten

**Was muss auf den neuen PC?** Für die empfohlene Installation genügt **nur die eine Datei `release/1.3.0/Zajedno-1.3.0-x64-nsis.exe`**. Kopieren und dort ausführen. Keine weiteren Dateien oder Ordner aus dem Projekt sind nötig.

- **Ohne Installation:** Stattdessen nur `release/1.3.0/Zajedno-1.3.0-x64-portable.exe` kopieren und starten. Auch diese einzelne Datei enthält alles für die Anwendung.
- **Wörterbuch:** Bereits in beiden EXE-Ausgaben enthalten, einschließlich der 17.061 Kaikki-Bedeutungseinträge. Auf dem neuen PC nichts herunterladen, anfordern oder separat importieren. Internet und Node.js sind nicht erforderlich.
- **Achtung bei `win-unpacked`:** Die darin liegende `Zajedno.exe` ist keine eigenständige portable Datei. Bei dieser Variante muss der gesamte Ordner `release/1.3.0/win-unpacked` mit allen Unterordnern kopiert werden. Einfacher ist eine der beiden EXE-Ausgaben oben.
- **Bisherige persönliche Daten:** Profile, Lernstände und eigene Vokabeln sind nicht in der Programm-EXE enthalten. Für deren Übertragung auf dem bisherigen PC unter **Einstellungen > Daten & Sicherung** exportieren, die JSON-Sicherung zusätzlich übertragen und auf dem neuen PC wiederherstellen. Dies ersetzt dort den bisherigen Bestand. Für einen frischen Start ist keine Sicherung nötig.

1. Die Datei `release/1.3.0/Zajedno-1.3.0-x64-nsis.exe` auf den Ziel-PC übertragen und starten. Der Assistent installiert nur für den aktuellen Windows-Benutzer und fordert keine Administratorrechte an.
2. Zajedno über Startmenü oder Desktop öffnen. Auf dem Ziel-PC wird kein Node.js benötigt. Die Anwendung und ihre Lerninhalte funktionieren ohne Internet.
3. Einen Namen, die Lernsprache und die Oberflächensprache auswählen. Für die andere Lernrichtung ein separates Profil anlegen. Profile sind lokal, ohne Passwort; sie sind keine Zugriffsschutzgrenze.

Der Installationsassistent ist deutschsprachig. Die Anwendung selbst ist vollständig auf Deutsch und Serbisch (lateinisch) bedienbar. Die portable Ausgabe benötigt keinen Installationsassistenten.

Alternativ `release/1.3.0/Zajedno-1.3.0-x64-portable.exe` starten. Auch die portable Ausgabe speichert Lernstände im Benutzerprofil, nicht neben der EXE. Eine nicht digital signierte Ausgabe kann eine Windows-SmartScreen-Warnung auslösen. Nur aus vertrauenswürdiger Quelle bezogene Dateien öffnen. Die Installation auf einem zweiten, sauberen Windows-PC muss vor Verteilung separat geprüft werden.

**Update auf 1.3.0:** Unter demselben Windows-Benutzer bleiben Profile, Lernstände und eigene Vokabeln erhalten. Vorher eine Sicherung exportieren und die alte Anwendung schließen. Sobald eigene Mehrzahlfelder gespeichert wurden, nur noch Version 1.3.0 oder neuer verwenden: ältere Versionen können diese Daten und Sicherungen nicht lesen.

Zajedno startet maximiert mit der gewohnten Windows-Titelleiste. Zum Beenden oben rechts auf **X** klicken; Esc oder F11 sind nicht erforderlich. Ausstehende Speicheraktionen werden vor dem Schließen abgeschlossen. Bei 150 % Skalierung nutzt die Lernansicht auf niedrigen Bildschirmen geringere Abstände, ohne Schrift oder Schaltflächen zu verkleinern. Lange Inhalte bleiben scrollbar.

### Lernen

- **Karteikarten:** Antwort anzeigen und mit Noch nicht / Schwer / Gewusst / Leicht bewerten. Die echte Bibliothek `ts-fsrs` plant Wiederholungen lokal mit einer gewünschten Erinnerungsrate von 90 Prozent.
- **Auswahl:** Eine von vier Antworten auswählen. Richtige Antworten entsprechen FSRS Good, falsche Again.
- **Schreiben:** Groß-/Kleinschreibung, Leerraum und übliche Satzzeichen werden ignoriert. Deutsche Artikel und `č ć š ž đ` zählen; fehlende Artikel und Diakritika erhalten gezielte Rückmeldung und Again. Zeichen können über die kleinen Zeichentasten eingegeben werden. Anmerkungen in Klammern werden nicht mitgetippt. Bei `spavao/spavala` sind beide vollständigen Satzvarianten zulässig.
- **Zusammen:** Zwei verschiedene Profile auswählen. Die Oberfläche, Lernrichtung und Speicherung folgen dem jeweils aktiven Profil. Neue Karten werden für jede Person getrennt gemischt, auch mit Themenfilter. Beim Zugwechsel wird dieselbe Karte nicht direkt wiederholt, solange die nächste Person eine andere Karte übrig hat. Sobald die Warteschlange einer Person leer ist, lernt die andere weiter. Ein beendeter Zug wird erst nach erfolgreichem Speichern fortgesetzt. **Schreiben** steht sowohl unter **Lernen** als auch unter **Zusammen** zur Verfügung.
- **Bibliothek:** Beide Sprachen durchsuchen, nach Thema oder Inhaltsart filtern und persönliche Favoriten setzen. Die Suche darf ohne Diakritika erfolgen; die Antwortbewertung bleibt strenger.
- **Runden:** Fällige Karten werden vor neuen Karten für die Runde ausgewählt. Im gemeinsamen Spiel kann eine andere Karte vorgezogen werden, um eine direkte Wiederholung beim Zugwechsel zu vermeiden. Eine Runde enthält 5, 10 oder 20 Karten pro Person. Künftige Wiederholungen werden nicht vorzeitig in die Warteschlange aufgenommen. Bereits gespeicherte Antworten bleiben auch beim vorzeitigen Verlassen einer Runde erhalten.

### Eigene Wörter und Sätze

In **Bibliothek > Eintrag hinzufügen** Deutsch, Serbisch (lateinisch), Thema und Wort/Satz auswählen. Beide Texte sind erforderlich (höchstens 300 Zeichen); die Zeichentasten ergänzen `ä ö ü ß Ä Ö Ü` sowie `č ć š ž đ`. Wörter haben zusätzlich optionale Mehrzahlfelder in beiden Sprachen, ebenfalls mit Zeichentasten. Bis zu 1.000 eigene Einträge sind möglich. Identische Textpaare werden auch bei anderer Großschreibung oder abweichenden Leerzeichen abgewiesen. Die Übersetzung wird nicht automatisch erzeugt oder fachlich geprüft.

Eigene Einträge stehen allen Profilen an diesem Rechner zur Verfügung. Lernfortschritte und Favoriten bleiben pro Profil getrennt. Der Herkunftsfilter zeigt eigene, mitgelieferte oder alle Einträge. Mitgelieferte Inhalte sind schreibgeschützt. Über die Stift- und Papierkorb-Symbole lassen sich eigene Einträge bearbeiten und löschen.

Bearbeiten erfordert eine Bestätigung. Änderungen an Wortlaut, Thema oder Wort/Satz setzen nur den Lernfortschritt dieses Eintrags in allen Profilen zurück; seine Kennung und Favoriten bleiben erhalten. Reine Änderungen der Mehrzahlfelder erhalten den Lernfortschritt vollständig. Löschen entfernt den Eintrag einschließlich seiner Fortschritte und Favoriten aus allen Profilen. Vor beiden Aktionen wird automatisch gesichert. Abbrechen verändert nichts. Unter **Lernen** und **Zusammen** kann mit **Eigene Einträge** gezielt der Zusatzwortschatz geübt werden; alle drei Übungsarten sind verfügbar.

### Grammatik und Mehrzahl

**Grammatik** enthält zwei offline verfügbare Grundlagenhefte: serbische Grammatik auf Deutsch und deutsche Grammatik auf Serbisch in Latinica. Je neun Kapitel behandeln Schrift, Geschlecht/Artikel, Mehrzahl, Fälle, Verben, Satzbau, Zeiten und weitere Grundlagen sowie kleine Übungen mit Lösungen. Über **Heft drucken** lässt sich das gewählte Heft ausdrucken oder mit einem vorhandenen PDF-Drucker speichern. Fertige PDF-Ausgaben liegen zusätzlich unter `release/1.3.0/`.

In der **Bibliothek** stehen die hinterlegten Mehrzahlformen bei den Substantiven. In einer Lernrunde werden sie erst nach Aufdecken beziehungsweise Bewerten unter **Mehrzahl** sichtbar. Abgefragt wird weiterhin das ursprüngliche Wort, nicht zusätzlich der Plural; vorhandene Kartenkennungen und Lernstände ändern sich nicht.

Die Angaben sind Nominativ-Pluralformen oder gekennzeichnete Sammel-/Stoffformen bzw. bereits im Plural stehende Wörter. Nicht jedes Wort hat einen gewöhnlichen Plural. Nach Zahlen oder in anderen Fällen können andere Formen erforderlich sein. Fehlende Angaben werden nicht automatisch geraten: Bei drei serbischen Wochentagen fehlen noch Formen, und Wörterbucheinträge erhalten keine automatische Flexion. Bei eigenen Wörtern lassen sich Formen ergänzen; sie werden mitgesichert. Grundlagen und Formen sind nicht muttersprachlich geprüft.

### Offline-Wörterbuch von Kaikki

**Bibliothek > Wörterbuch** durchsucht Deutsch und Serbisch, auch ohne Diakritika. Über das Plus einen Treffer übernehmen, Texte und Thema prüfen und speichern. Die Karte erscheint unter den eigenen Einträgen. Bereits vorhandene Textpaare sind gesperrt. Übernommene Karten können wie andere eigene Einträge bearbeitet und gelöscht werden; Quellenangabe und ursprüngliche Bedeutungsangabe bleiben erhalten.

Version 1.2.0 bündelt 17.061 Bedeutungseinträge (14.840 unterschiedliche Wortpaare), abgerufen am 23.09.2026 aus dem [deutschen Wiktionary über Kaikki/Wiktextract](https://kaikki.org/dewiktionary/). Kein zusätzlicher Download auf dem zweiten PC und keine Netzwerkverbindung im Betrieb. Dies ist ein ergänzendes Nachschlagewerk, kein vollständiger oder muttersprachlich geprüfter Alltagswortschatz; es enthält auch Fachbegriffe und unterschiedliche Sprachvarianten.

Verwendet werden ausschließlich als Serbisch markierte Übersetzungen deutscher Stichwörter, entweder bereits lateinisch oder mit einer von der Quelle bereitgestellten lateinischen Umschrift. Keine eigene automatische Umschrift, keine Umdeklarierung bosnischer oder kroatischer Datensätze. 111 Übersetzungen scheiterten an Schrift-/Textgrenzen; vier nichtleere ungültige Exportzeilen wurden ausgelassen. Der gesamte Ausgabebestand einschließlich Bedeutungen ist auf verbliebene kyrillische Zeichen geprüft. Quellen können besondere Akzentnotationen enthalten; Texte vor der Übernahme prüfen.

**Lizenz:** Wiktionary-Mitwirkende; Extraktion Kaikki/Wiktextract. Der abgeleitete Wörterbuchbestand und daraus übernommene Inhalte stehen unter [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Änderungen durch Zajedno: Auswahl deutscher Stichwörter mit serbischen Übersetzungen, Latinica-Auswahl, Ergänzung eindeutiger deutscher Artikel, Normalisierung und Dublettenbereinigung. Jeder Eintrag enthält den Link zum Originalartikel mit Versionsgeschichte. Quelle und Lizenz werden in Sicherungen mitgeführt. Bei Weitergabe abgeleiteter Wörterbuchinhalte gelten Namensnennung und Weitergabe unter gleicher Lizenz; die Programmlizenz wird dadurch nicht pauschal geändert. Daten mit Quellenangaben benötigen Zajedno 1.2.0 oder neuer, nicht Version 1.1.0.

### Daten und Sicherung

Windows-Speicherort: `%LOCALAPPDATA%\Zajedno\learners-v1.json`. Electron `userData` wird ausdrücklich dorthin gesetzt, außerhalb des Projekt- und OneDrive-Verzeichnisses. Wird `LOCALAPPDATA` auf einem ungewöhnlich konfigurierten System nicht bereitgestellt, wird Electron `appData` als Ersatz verwendet. Nur eine App-Instanz pro Benutzer ist zulässig.

Unter **Einstellungen > Daten & Sicherung** eine JSON-Sicherung exportieren. Neue Sicherungen verwenden `zajedno-backup`, Version 2, einschließlich eigener Einträge. Version 1 bleibt importierbar (maximal 10 MB). Wiederherstellen ersetzt nach ausdrücklicher Bestätigung den gesamten Bestand, nicht einzelne Profile: auch den eigenen Wortschatz. Alte Sicherungen ohne eigenen Wortschatz entfernen deshalb vorhandene eigene Einträge. Es handelt sich nicht um einen Wortschatz-Import mit Zusammenführung. Vorher wird der Bestand unter `%LOCALAPPDATA%\Zajedno\backups` gesichert. Auch vor einer Profillöschung entsteht eine Sicherung. Eine Sicherung mit Endung `.json` kann erneut importiert werden; `.damaged.txt` bewahrt beschädigte Originaldaten für eine manuelle Untersuchung und ist keine importierbare Sicherung.

Beim ersten Laden einer Version-1-Datei wird nach einer Sicherung automatisch auf Datenformat 2 umgestellt, ohne bisherige Profile, Favoriten oder Lernfortschritte zu ändern. Der Dateiname `learners-v1.json` bleibt aus Kompatibilitätsgründen als Speicherort bestehen. Danach nur Zajedno 1.1.0 oder neuer verwenden: Version 1.0.0 kann das erweiterte Format nicht lesen. Auch die Browser-Vorschau übernimmt ihren eigenen Altbestand mit einer Sicherung.

Es gibt keine automatische Bereinigung dieser Sicherungen. Alte Sicherungen bei Bedarf im Explorer verwalten. Bei Schreibfehlern wird kein erfolgreicher Lernzug angezeigt. Bei beschädigten Daten erfolgt kein stiller Reset; eine gültige Sicherung kann über den Fehlerbildschirm wiederhergestellt werden. Namen und Lernstände sind unverschlüsselt. Daten nur an vertrauenswürdigen Orten sichern. Eine Deinstallation löscht den Lernstand absichtlich nicht.

Andere PCs haben unabhängige Lernstände. Übertragung erfolgt manuell per Export/Import; keine automatische Zusammenführung. Die Browser-Vorschau verwendet IndexedDB mit Transaktionen und einem eigenen `backups`-Store, getrennt von den Desktopdaten. Sie ist keine installierte Offline-Web-App und benötigt den lokalen Entwicklungsserver. Browserdaten können vom Browser gelöscht werden.

### Aussprache und Inhalte

Nur Stimmen mit `localService === true` und passendem Sprachcode `de` beziehungsweise `sr` werden verwendet; explizite `sr-Cyrl`-Stimmen sind ausgeschlossen. Keine Ersatzstimme einer anderen Sprache, kein Online-Sprachdienst, keine Mikrofonberechtigung. Verfügbare Stimmen hängen von Windows und Electron ab; insbesondere eine serbische Stimme ist nicht garantiert. Die Anwendung bleibt ohne Sprachausgabe vollständig nutzbar. Installierte Stimmen und deren Offline-Verhalten sollten auf jedem Ziel-PC geprüft werden.

Die Texte sind eigenständige Lerntexte, nicht muttersprachlich geprüft. Serbisch wird ausschließlich lateinisch, überwiegend ekavisch geschrieben. Manche Adjektive stehen in der männlichen Grundform; Wortbedeutungen sind auf Alltagssituationen beschränkt. Höfliche Formen stehen in den entsprechenden Sätzen. Vor pädagogischer Veröffentlichung wird eine fachliche Prüfung durch deutsch- und serbischsprachige Personen empfohlen. Keine Behauptung muttersprachlich geprüfter Genauigkeit.

## Srpski (latinica)

### Instalacija

**Šta preneti na novi računar?** Za preporučenu instalaciju dovoljna je **samo datoteka `release/1.3.0/Zajedno-1.3.0-x64-nsis.exe`**. Kopiraj je i pokreni na novom računaru. Ostale datoteke i direktorijumi projekta nisu potrebni.

- **Bez instalacije:** Kopiraj i pokreni samo `release/1.3.0/Zajedno-1.3.0-x64-portable.exe`. I ova datoteka sadrži celu aplikaciju.
- **Rečnik:** Obe EXE verzije već sadrže 17.061 Kaikki stavku sa značenjima. Nema dodatnog preuzimanja, zahteva niti zasebnog uvoza rečnika. Internet i Node.js nisu potrebni.
- **Važno za `win-unpacked`:** Njegova `Zajedno.exe` ne radi samostalno. Za tu varijantu kopiraj ceo direktorijum `release/1.3.0/win-unpacked` sa svim poddirektorijumima. Jednostavnije je koristiti jednu od dve EXE verzije iznad.
- **Lični podaci:** Profili, napredak i sopstvene stavke nisu u programskoj EXE datoteci. Za prenos izvezi JSON kopiju preko **Podešavanja > Podaci i rezervne kopije**, prenesi i tu kopiju i vrati je na novom računaru. Vraćanje zamenjuje postojeće podatke na njemu. Za novi početak kopija nije potrebna.

1. Prenesi `release/1.3.0/Zajedno-1.3.0-x64-nsis.exe` na Windows računar i pokreni instalaciju. Instalacija važi za trenutnog korisnika; administratorska prava nisu potrebna.
2. Otvori Zajedno iz menija Start ili sa radne površine. Node.js i internet nisu potrebni za korišćenje instalirane aplikacije.
3. Unesi ime, jezik učenja i jezik prikaza. Za drugi smer učenja napravi novi profil. Profili nemaju lozinke i ne pružaju zaštitu od drugih korisnika istog Windows naloga.

Čarobnjak za instalaciju je na nemačkom. Sama aplikacija je dostupna na nemačkom i srpskom (latinica). Prenosiva verzija ne zahteva instalaciju.

Prenosiva verzija je `release/1.3.0/Zajedno-1.3.0-x64-portable.exe`. I ona čuva podatke u korisničkom direktorijumu, ne pored EXE datoteke. Nepotpisana aplikacija može izazvati SmartScreen upozorenje. Otvaraj samo datoteke iz pouzdanog izvora. Instalaciju na drugom, čistom Windows računaru treba posebno proveriti.

**Ažuriranje na 1.3.0:** Pod istim Windows nalogom ostaju profili, napredak i sopstvene stavke. Pre ažuriranja izvezi rezervnu kopiju i zatvori staru aplikaciju. Posle čuvanja sopstvenih oblika množine koristi samo verziju 1.3.0 ili noviju: starije verzije ne mogu da čitaju te podatke i kopije.

Zajedno se otvara u maksimizovanom prozoru sa Windows naslovnom trakom. Za izlaz klikni na **X** gore desno; Esc i F11 nisu potrebni. Čuvanje podataka završava se pre zatvaranja. Pri skaliranju od 150 % i manjoj visini prozora razmaci su manji, bez smanjivanja slova ili dugmadi. Duži sadržaj može da se pomera.

### Učenje

- Kartice imaju četiri ocene: Još ne znam / Teško / Znam / Lako. Biblioteka `ts-fsrs` lokalno planira ponavljanja.
- Izbor nudi četiri odgovora. Pisanje proverava nemačke članove i srpske znakove `č ć š ž đ`; velika slova, razmaci i uobičajena interpunkcija se zanemaruju. Napomene u zagradama ne unose se u odgovor. Za `spavao/spavala` prihvataju se obe pune rečenice.
- U zajedničkom režimu dva profila odgovaraju naizmenično. Jezik prikaza, smer učenja i napredak pripadaju osobi koja je na redu. Nove kartice se mešaju za svaku osobu posebno, i uz izbor teme. Ista kartica se ne ponavlja odmah pri promeni osobe dok sledeća osoba ima drugu preostalu karticu. Ako jedna osoba nema više kartica, druga nastavlja. **Pisanje** je dostupno i u **Učenje** i u **Zajedno**.
- Biblioteka omogućava pretragu na oba jezika, izbor teme, reči ili rečenica i lične omiljene stavke. Pretraga radi i bez dijakritičkih znakova.
- Krug ima 5, 10 ili 20 kartica po osobi. Za krug se prvo biraju dospela ponavljanja, zatim nove kartice. U zajedničkom režimu druga kartica može doći ranije da se izbegne neposredno ponavljanje pri promeni osobe. Sačuvani odgovori ostaju i ako prekineš krug.

### Sopstvene reči i rečenice

U **Biblioteka > Dodaj stavku** unesi nemački i srpski tekst (latinica), temu i vrstu sadržaja. Oba teksta su obavezna, do 300 znakova. Dugmad omogućavaju unos znakova `ä ö ü ß Ä Ö Ü` i `č ć š ž đ`. Za reči postoje i neobavezna polja za množinu na oba jezika, sa dugmadima za posebne znakove. Moguće je dodati do 1.000 stavki. Isti par tekstova ne može se dodati više puta; velika slova i višak razmaka se zanemaruju. Prevod se ne generiše i ne proverava automatski.

Stavke su dostupne svim profilima na ovom računaru, uz odvojen napredak i omiljene stavke. Filter **Poreklo** prikazuje sopstvene, ugrađene ili sve stavke. Ugrađeni sadržaj se ne menja. Olovka i korpa omogućavaju izmenu i brisanje sopstvenih stavki.

Potvrđena izmena teksta, teme ili vrste poništava napredak samo te stavke u svim profilima; identifikator i omiljene oznake ostaju. Izmena samo polja množine čuva ceo napredak. Brisanje uklanja stavku i njen napredak i oznake iz svih profila. Pre obe radnje čuva se rezervna kopija. Otkazivanje ništa ne menja. U **Učenje** i **Zajedno** izaberi **Sopstvene stavke** za vežbanje dodatog sadržaja.

### Gramatika i množina

**Gramatika** sadrži dva priručnika bez interneta: srpsku gramatiku na nemačkom i nemačku gramatiku na srpskom, latinicom. Svaki ima devet poglavlja sa osnovama, primerima i kratkim vežbama sa rešenjima. **Štampaj priručnik** otvara štampanje; PDF izdanja nalaze se i u `release/1.3.0/`.

**Biblioteka** prikazuje sačuvane oblike množine uz imenice. Tokom učenja dostupni su pod **Množina** tek nakon prikaza ili provere odgovora. I dalje se proverava prvobitna reč, bez promene kartice i njenog napretka.

Prikazan je nominativ množine ili označen zbirni oblik, gradivna imenica odnosno reč koja je već u množini. Posle brojeva i u drugim padežima oblici mogu biti drugačiji. Nedostajući oblici se ne nagađaju automatski: tri srpska naziva dana još nemaju unetu množinu; rečnik nema automatsku promenu oblika. Sopstvene oblike možeš dopuniti i sačuvati u rezervnoj kopiji. Tekstove i oblike još nije proverio izvorni govornik.

### Lokalni Kaikki rečnik

U **Biblioteka > Rečnik** pretražuj na oba jezika, i bez dijakritičkih znakova. Dugme plus otvara unos sa ponuđenim prevodom: proveri tekst, izaberi temu i sačuvaj. Karticu zatim možeš menjati ili obrisati među sopstvenim stavkama. Postojeći parovi ne dodaju se ponovo; izvor i prvobitno značenje ostaju sačuvani i posle izmene.

Verzija 1.2.0 sadrži 17.061 stavku sa značenjima, odnosno 14.840 različitih parova, preuzetih 23.09.2026 sa [nemačkog Wiktionary-ja preko Kaikki/Wiktextract](https://kaikki.org/dewiktionary/). Nema dodatnog preuzimanja na drugom računaru niti interneta tokom korišćenja. Rečnik nije potpun niti ga je proverio izvorni govornik; sadrži i stručne izraze i jezičke varijante.

Koriste se samo prevodi označeni kao srpski, sa latiničnim zapisom iz izvora. Nema samostalne transliteracije niti preimenovanja bosanskih ili hrvatskih podataka u srpske. Izostavljeno je 111 prevoda koji nisu prošli proveru pisma ili dužine, kao i četiri neispravna neprazna reda izvoza. Proveren je ceo izlaz, uključujući značenja: nema ćiriličkih znakova. Moguća je posebna akcenatska notacija iz izvora; proveri tekst pre preuzimanja.

Izvor: saradnici Wiktionary-ja; ekstrakcija Kaikki/Wiktextract. Izvedeni rečnik i preuzeti sadržaj koriste [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Zajedno bira srpske latinične prevode, dodaje jednoznačne nemačke članove, normalizuje tekst i uklanja duplikate. Svaka stavka sadrži adresu izvornog članka sa istorijom izmena. Izvor i licenca ostaju u rezervnim kopijama. Pri daljoj distribuciji izvedenog sadržaja navedi izvor i zadrži istu licencu. Za podatke sa izvorima koristi Zajedno 1.2.0 ili noviji, ne 1.1.0.

### Rezervne kopije

Podaci se čuvaju u `%LOCALAPPDATA%\Zajedno\learners-v1.json`, izvan projekta i OneDrive direktorijuma. U **Podešavanja > Podaci i rezervne kopije** možeš izvesti JSON kopiju verzije 2 sa sopstvenim stavkama. Prihvataju se verzije 1 i 2, do 10 MB. Vraćanje nakon potvrde zamenjuje sve profile, napredak i sopstvene stavke. Stara kopija bez sopstvenih stavki uklanja postojeće sopstvene stavke. Ovo nije spajanje rečnika. Pre zamene ili brisanja profila kopija nastaje u `%LOCALAPPDATA%\Zajedno\backups`.

Pri prvom učitavanju stari podaci prelaze na format 2, uz prethodnu rezervnu kopiju i očuvanje profila, napretka i omiljenih stavki. Naziv datoteke ostaje isti. Posle toga koristi Zajedno 1.1.0 ili noviji: verzija 1.0.0 ne može da čita novi format. Pregled u pregledaču zasebno prenosi svoje podatke uz rezervnu kopiju.

Kopije nisu šifrovane i sadrže imena. Čuvaj ih na pouzdanom mestu. Automatske kopije se ne brišu same. Datoteke `.damaged.txt` čuvaju oštećene podatke za pregled, ali nisu kopije za uvoz. Greška skladišta ne izaziva automatsko brisanje podataka. Deinstalacija namerno ostavlja podatke o učenju.

Računari se ne sinhronizuju. Ručni prenos koristi izvoz i uvoz, bez spajanja podataka. Pregled u pregledaču ima sopstvenu IndexedDB bazu odvojenu od Windows aplikacije; potreban mu je lokalni razvojni server i nije instalirana veb-aplikacija za rad bez interneta.

### Izgovor i kvalitet teksta

Koriste se samo lokalni glasovi odgovarajućeg jezika. Nema prelaska na hrvatski, engleski ili mrežni servis. Dostupnost nemačkog i naročito srpskog glasa zavisi od sistema Windows i Electron-a. Ako odgovarajući glas ne postoji, dugme za izgovor je isključeno. Proveri glasove bez interneta na svakom ciljnom računaru.

Sadržaj obuhvata 320 parova reči i 100 originalnih kratkih rečenica u deset tema. Tekstove nije proverio izvorni govornik. Koristi se srpska latinica i uglavnom ekavski oblici; neki pridevi su u muškom osnovnom obliku. Pre obrazovne distribucije preporučuje se stručna jezička provera.

## Development / Razvoj

Run commands with this folder as the working directory, not the unrelated NGx repository. Node.js 22.12+ and npm are development prerequisites. Initial dependency installation and the first Windows packaging may download tools; the installed application has no runtime network requirement.

```powershell
npm ci
npm test
npm run typecheck
npm run build
npm run desktop
```

`npm run dev`: browser-only Vite development preview, default port 5173 or next free port. `npm run desktop`: one Vite server plus Electron, using an available localhost port. Exit Electron to stop its server. Do not run a second dev server for the same preview.

```powershell
npm run package:win
npm run package:dir
```

`package:win` builds both NSIS and portable x64 executables into `release/`. `package:dir` builds the unpacked desktop app into `release/win-unpacked/`. No signing certificate or automatic update service is configured. NSIS is per-user, with elevation disabled. The installed runtime includes Electron, so Node.js is not required on the destination PC.

The 1.3.0 artifacts use a separate output directory: `npm run package:win -- --config.directories.output=release/1.3.0`. To test that directory, set `$env:ZAJEDNO_TEST_RELEASE = 'release/1.3.0'`, then run `npm run test:desktop` and `npm run test:desktop -- --scale-150`. The latter forces Electron's device scale factor to 1.5 without changing Windows display settings. Add `--grammar-only` for focused grammar/PDF/plural checks. Test learner data uses the OS temporary directory, outside the OneDrive project; screenshots and PDFs remain in `.preview/`.

### Files and architecture

The bundled dictionary is `public/kaikki.json`. To rebuild it, run `npm run dictionary:prepare` (downloads about 310 MB and streams the raw German-edition export), or `npm run dictionary:prepare -- .preview/kaikki/de.jsonl.gz` to reuse the local archive. The [raw-data page](https://kaikki.org/dewiktionary/rawdata.html) links the original download. Generation records the archive SHA-256, processing date and exclusion counts; no automatic updates run in the app. Do not import the raw archive as a learner backup. Attribution and license details are in `public/DICTIONARY-NOTICE.txt` and the dictionary UI.

- `src/domain/curriculum.ts`: intentional static curriculum and answer variants.
- `src/domain/state.ts`: strict Zod schemas, immutable profile commands, FSRS schedules, backup format and learning queues.
- `src/domain/evaluate.mjs`, `src/domain/practice.ts`: evaluation, choice generation and local voice filtering.
- `src/i18n.ts`: complete German and Serbian Latin UI dictionaries.
- `src/App.tsx`, `src/styles.css`: learning, together mode, library, progress, profile and backup controls.
- `src/api/index.ts`: real Electron IPC client or transactional IndexedDB browser implementation, not a mock client.
- `electron/store.ts`: serialized asynchronous commands, flushed temporary writes, atomic rename, pre-restore/deletion backups.
- `electron/main.ts`, `electron/preload.ts`: sandbox, context isolation, disabled Node integration, exact sender-frame checks, narrow IPC, disabled navigation and remote requests.
- `scripts/create-assets.mjs`: original local bitmap illustration and application icon generator; outputs are bundled from `public/`.
- `tests/`: evaluator, curriculum, scheduling, profile isolation, import, filesystem concurrency, choice and voice tests.

The renderer cannot choose filesystem paths for local storage. Export uses a native Save dialog. Imports are validated independently in renderer and main process; UI confirmation precedes restore. Profile direction is immutable by design. Review commands include expected repetition count and target language, rejecting stale or wrong-direction updates. Application close waits for the storage queue to finish. Backups are deliberately not synchronized or silently pruned.

### Release gates

Required before distribution: automated tests, typecheck, production build, desktop and 400px UI review in both languages, packaged Electron startup, offline voice behavior and a clean second-PC per-user installation. Build success alone does not prove installation or language quality. See `IMPLEMENTATION-REPORT.md` for verified results and outstanding gates.

## Assets and licenses

`public/table-for-two.png`, `public/zajedno.png` and `public/zajedno.ico` are original programmatically generated bitmap artwork for this project, without external media. Nunito Sans is bundled locally under SIL Open Font License 1.1; Lucide icons under ISC. Dependency license notices are in `THIRD-PARTY-NOTICES.md`; installed packages carry their full license texts. No remote fonts, images or CDN scripts are used.