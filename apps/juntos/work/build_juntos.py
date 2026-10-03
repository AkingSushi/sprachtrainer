import gzip, hashlib, json, os, re, shutil, struct, tarfile, unicodedata
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT=Path.cwd()
BASE=ROOT/'base'
OUT=ROOT/'outputs'/'Juntos'
WORK=ROOT/'work'/'juntos-app'
WORK.mkdir(parents=True,exist_ok=True)
OUT.mkdir(parents=True,exist_ok=True)

def compact(value): return json.dumps(value,ensure_ascii=False,separators=(',',':'))
def load(name): return json.loads((ROOT/'work'/name).read_text(encoding='utf-8'))
data=load('extracted.json'); topics=load('spanish-topics.json')
esUI=load('es-ui.json'); grammar=load('grammar-es.json')
assert set(esUI)==set(data['deUI']), (set(data['deUI'])-set(esUI),set(esUI)-set(data['deUI']))

# Verify the upstream download before converting dictionary data.
archive=ROOT/'work/downloads/freedict-deu-spa.src.tar.xz'
digest=hashlib.sha512(archive.read_bytes()).hexdigest()
assert digest==(ROOT/'work/downloads/freedict-deu-spa.sha512').read_text().split()[0]
with tarfile.open(archive) as tar:
    tei=ET.fromstring(tar.extractfile('deu-spa/deu-spa.tei').read())
ns={'t':'http://www.tei-c.org/ns/1.0'}
source='https://freedict.org/downloads/#deu-spa'
rows=[]; seen=set(); headwords=0
for entry in tei.findall('.//t:body/t:entry',ns):
    headwords+=1
    lemma=entry.findtext('t:form/t:orth','',ns).strip()
    gen=entry.findtext('t:gramGrp/t:gen','',ns)
    pos=entry.findtext('t:gramGrp/t:pos','',ns)
    de=lemma
    for sense in entry.findall('t:sense',ns):
        meaning='; '.join(' '.join(x.itertext()).strip() for x in sense.findall('.//t:def',ns))
        meaning=re.sub(r'\s+',' ',meaning)[:500]
        for quote in sense.findall('t:cit[@type="trans"]/t:quote',ns):
            es=' '.join(quote.itertext()).strip()
            pair=(de,es,meaning)
            if not de or not es or len(de)>300 or len(es)>300 or pair in seen: continue
            if re.search(r'[\x00-\x1f\x7f]',de+es+meaning): continue
            seen.add(pair)
            rows.append(dict(id=f'fd-{len(rows)+1}',de=de,es=es,sense=meaning,source=source))
dictionary=dict(provider='FreeDict / WikDict',license='CC-BY-SA-3.0',version='2025.11.23',
                retrievedAt='2026-10-03T00:00:00Z',headwords=headwords,entries=rows)

def read_asset(path):
    return (BASE/path).read_bytes()
def write(path,value):
    p=WORK/path;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_bytes(value.encode('utf-8') if isinstance(value,str) else value)

deUI=data['deUI'].copy()
deUI.update(sr='Español',serbianText='Spanisch',srPlural='Mehrzahl Spanisch (optional)',
    dictionaryCredit='FreeDict / WikDict · Wiktionary / DBnary · CC BY-SA 3.0',
    dictionaryChanges='Deutsch–Spanisch-Wörterbuch in ein kompaktes Format umgewandelt. Bedeutungsangabe vor dem Übernehmen prüfen.',
    derivedEntry='Übernommen / bearbeitet · CC BY-SA 3.0',
    contentNote='500 Wortpaare · 220 Sätze · 16 Themen. Orientierende Progression von A1 bis B2, keine zertifizierte Niveaueinstufung. Überwiegend spanischer Sprachgebrauch aus Spanien. Anmerkungen in Klammern werden nicht mitgetippt. Nicht alle möglichen Übersetzungen werden als Antwort akzeptiert.',
    about='Über Juntos',
    voiceNote='Lokale deutsche und spanische Stimmen. Mateo spricht lateinamerikanisch; die Lernkarten verwenden überwiegend spanischen Sprachgebrauch aus Spanien.',
    entryInvalid='Bitte beide Texte (je 1–300 Zeichen), Thema und Inhaltsart angeben, ohne Zeilenumbrüche.',
    pluralNote='Mehrzahlformen dienen als Ergänzung. Die abgefragte Antwort bleibt unverändert. Bei fehlender Form kann sie in eigenen Karten ergänzt werden.',
    IMPORT_INVALID='Die Sicherung ist nicht mit dieser Deutsch–Spanisch-Version kompatibel.')

# Keep known German plurals; Spanish forms are supplied for simple nouns only.
old_plural={row[0]:row[2] for row in data['plurals']}
exceptions={'el agua':'las aguas','el azúcar':'los azúcares','el autobús':'los autobuses','el mes':'los meses','el currículum':'los currículos','el régimen':'los regímenes'}
def plural(es):
    if es in exceptions:return exceptions[es]
    m=re.fullmatch(r'(el|la) ([\wáéíóúüñ]+)',es)
    if not m:return ''
    article,noun=m.groups()
    if noun.endswith('s'):return ''
    if noun.endswith('z'):p=noun[:-1]+'ces'
    elif noun.endswith(('ión','án','ín','ón','ún')):p=''.join(c for c in unicodedata.normalize('NFD',noun) if not unicodedata.combining(c))+'es'
    elif noun[-1] in 'aeiouáéó':p=noun+'s'
    else:p=noun+'es'
    return ('los ' if article=='el' else 'las ')+p
plurals=[]
for topic in topics:
    for de,es in topic['words']:
        dp=old_plural.get(de,'');ep=plural(es)
        if dp or ep:plurals.append([de,es,dp,ep])

front=read_asset('dist/assets/index-BcQt9-d6.js').decode().replace('\r\n','\n')
replacements=[]
for key,value in [('topics',topics),('plurals',plurals),('grammar',grammar),('deUI',deUI),('esUI',esUI)]:
    start,end=data[key+'Range'];replacements.append((start,end,compact(value)))
for start,end,value in sorted(replacements,reverse=True):front=front[:start]+value+front[end:]
front=re.sub(r'function cT\(a,i\)\{.*?\}const oi=',lambda _:r'function cT(a,i){return[a[i].replace(/\s*\([^)]*\)/gu,"")]}const oi=',front,count=1)
front=front.replace('oT=1;','oT=2;')
front=front.replace('curriculumVersion:1','curriculumVersion:2')
front=front.replace('u.name==="Dragana"','u.name==="Mateo"')
front=front.replace('startsWith("sr-")','startsWith("es-")')
front=front.replace('[.,!?;:', '[¿¡.,!?;:')
front=front.replace('BT[Q]','BT[Q%BT.length]')
front=front.replace('children:["10 ",s.topics]','children:[La.length," ",s.topics]')
front=front.replace('"nemački"','"alemán"').replace('"srpski"','"español"')
front=front.replace('fetch("./kaikki.json").then(we=>{if(!we.ok)throw new Error("DICTIONARY");return we.json()})',
    'fetch("./dictionary.json.gz").then(async we=>{if(!we.ok)throw new Error("DICTIONARY");return new Response(we.body.pipeThrough(new DecompressionStream("gzip"))).json()})')
assert 'fetch("./dictionary.json.gz")' in front
front=front.replace('Srpski (latinica)','Español').replace('sr-Latn-RS','es-ES').replace('sr-Latn','es')
front=front.replace('Prikaz nije otvoren. Sačuvani napredak ostaje sačuvan.','No se pudo abrir la vista. El progreso guardado se conserva.')
front=front.replace('Neu laden / Učitaj ponovo','Neu laden / Recargar')

main=read_asset('dist-electron/main.cjs').decode().replace('\r\n','\n')
start=main.index('var topics = ')
end=main.index('\nvar curriculum = ',start)
main=main[:start]+'var topics = '+compact(topics)+';\n'+main[end:]
main=main.replace('var curriculumVersion = 1;','var curriculumVersion = 2;')
main=main.replace('curriculumVersion: 1','curriculumVersion: 2')

def common(s,native=False):
    s=s.replace('srPlural','esPlural').replace('serbianText','spanishText')
    s=s.replace('"sr"','"es"').replace("'sr'","'es'")
    s=re.sub(r'\bsr\s*:', 'es:',s)
    s=re.sub(r'\.sr\b','.es',s)
    if native:s=re.sub(r'\bsr\b','es',s)
    s=s.replace('Wiktionary / Kaikki','FreeDict / WikDict').replace('CC-BY-SA-4.0','CC-BY-SA-3.0').replace('CC BY-SA 4.0','CC BY-SA 3.0')
    s=s.replace(r'/^https:\/\/de\.wiktionary\.org\/wiki\/[^\s?#]+#Deutsch$/u',r'/^https:\/\/freedict\.org\/downloads\/#deu-spa$/u')
    s=s.replace('https://kaikki.org/dewiktionary/','https://freedict.org/downloads/#deu-spa')
    s=s.replace('https://creativecommons.org/licenses/by-sa/4.0/','https://creativecommons.org/licenses/by-sa/3.0/')
    s=s.replace('Serbisch','Spanisch').replace('serbisch','spanisch').replace('Srpski','Español')
    s=s.replace('Zajedno','Juntos').replace('zajedno','juntos').replace('ZAJEDNO','JUNTOS')
    return s
front=common(front)
main=common(main,True)

write('dist/assets/index-BcQt9-d6.js',front)
write('dist-electron/main.cjs',main)
write('dist-electron/preload.cjs',common(read_asset('dist-electron/preload.cjs').decode()))
write('dist/index.html',common(read_asset('dist/index.html').decode()))
write('dist/dictionary.json.gz',gzip.compress(compact(dictionary).encode(),compresslevel=9,mtime=0))
for name in sorted(p.name for p in (BASE/'dist/assets').iterdir() if p.is_file()):
    if not name.endswith('.js'):write('dist/assets/'+name,read_asset('dist/assets/'+name))
for name in ('table-for-two.png','zajedno.png','zajedno.ico'):
    write('dist/'+name.replace('zajedno','juntos'),read_asset('dist/'+name))
write('dist/THIRD-PARTY-LICENSES.txt',read_asset('dist/THIRD-PARTY-LICENSES.txt'))
with tarfile.open(archive) as tar:
    write('dist/FREEDICT-LICENSE.txt',tar.extractfile('deu-spa/COPYING').read())
write('dist/DICTIONARY-NOTICE.txt',f'''Deutsch–Spanisch: FreeDict + WikDict, Version 2025.11.23
Maintainer: Karl Bartel; Ausgangsdaten: Wiktionary-Mitwirkende, via DBnary.
Quelle: https://download.freedict.org/dictionaries/deu-spa/2025.11.23/freedict-deu-spa-2025.11.23.src.tar.xz
Lizenz: Creative Commons Attribution-ShareAlike 3.0 Unported
https://creativecommons.org/licenses/by-sa/3.0/
Änderungen: TEI nach JSON konvertiert; Übersetzungen je Bedeutung getrennt,
Bedeutungsangaben
auf 500 Zeichen gekürzt, Steuerzeichen/zu lange Lerntexte ausgeschlossen,
doppelte identische Paare entfernt, gzip-komprimiert. Lizenztext beiliegend.
{headwords} Quellstichwörter; {len(rows)} durchsuchbare Übersetzungszeilen.
Download-SHA512: {digest}
Der Wörterbuchinhalt ist automatisch erstellt; mehrdeutige Übersetzungen
vor Übernahme in den Lernbestand prüfen.
''')
write('package.json',compact(dict(name='juntos',productName='Juntos',version='1.0.0',private=True,
    description='Deutsch und Spanisch gemeinsam lernen. Lokal und offline.',main='dist-electron/main.cjs')))

# A small ASAR contains only executable application bundles and actual assets.
def pack_asar(folder,target):
    tree={'files':{}}; payload=[]; offset=0
    for p in sorted(folder.rglob('*')):
        if not p.is_file():continue
        buf=p.read_bytes();parts=p.relative_to(folder).as_posix().split('/');node=tree
        for part in parts[:-1]:node=node['files'].setdefault(part,{'files':{}})
        node['files'][parts[-1]]={'size':len(buf),'offset':str(offset)}
        payload.append(buf);offset+=len(buf)
    js=compact(tree).encode(); padded=(4+len(js)+3)//4*4
    header_pickle=struct.pack('<II',padded,len(js))+js+b'\0'*(padded-4-len(js))
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(struct.pack('<II',4,len(header_pickle))+header_pickle+b''.join(payload))

pack_asar(WORK,OUT/'resources/app.asar')
readme=f'''Juntos – Deutsch und Spanisch

Start: Juntos.exe in diesem Ordner. Alle Funktionen arbeiten lokal/offline.
720 Lernkarten: 500 Wortpaare und 220 Sätze in 16 Themen.
10 Alltagsthemen (A1–A2); 6 vertiefende Themen (B1–B2 als Orientierung).
Wörterbuch: {headwords:,} deutsche Stichwörter, {len(rows):,} Übersetzungszeilen
(FreeDict/WikDict, CC BY-SA 3.0). In der Bibliothek → Wörterbuch suchen,
Übersetzung auswählen und bis zu 1.000 eigene Karten hinzufügen.
Spanischer Sprachgebrauch vorwiegend Spanien; Mateo spricht lateinamerikanisch.
Die Schreibprüfung erwartet die hinterlegte Übersetzung, nicht alle möglichen
sinngleichen Formulierungen. Anmerkungen in Klammern werden weggelassen.

Lernstände: %LOCALAPPDATA%\\Juntos. Zajedno verwendet einen anderen Ordner.
Zajedno-Sicherungen sind wegen der anderen Sprache und Inhalte nicht kompatibel.
Sicherungen können unter Einstellungen exportiert und wiederhergestellt werden.

Speicherersparnis auf diesem Rechner: Electron-Laufzeitdateien sind NTFS-Hardlinks
auf die vorhandene Zajedno-Installation. Beide Apps haben eigene Programmpakete
und Lernstände. Die Laufzeitdateien nie direkt überschreiben. Zum Übertragen auf
einen anderen Rechner muss der gesamte Ordner kopiert werden; dort wird die
Laufzeit regulär gespeichert und Mateo muss separat installiert werden.

Wörterbuchquelle und Lizenz: resources\\app.asar enthält DICTIONARY-NOTICE.txt
und FREEDICT-LICENSE.txt. Sie liegen zusätzlich im benachbarten Ordner Juntos-Quellen.
'''
(OUT/'LIESMICH.txt').write_text(readme,encoding='utf-8')
stats=dict(cards=720,words=500,sentences=220,topics=len(topics),headwords=headwords,
    dictionaryRows=len(rows),dictionaryBytes=(WORK/'dist/dictionary.json.gz').stat().st_size,
    appBytes=(OUT/'resources/app.asar').stat().st_size)
(ROOT/'work/build-stats.json').write_text(compact(stats))
print(compact(stats))
