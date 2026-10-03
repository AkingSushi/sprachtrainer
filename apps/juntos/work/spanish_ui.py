from pathlib import Path
import json

UI='''grammar|Gramática
plural|Plural
dePlural|Plural en alemán (opcional)
srPlural|Plural en español (opcional)
pluralMissing|No se ha indicado el plural.
alreadyPlural|Ya está en plural
mass|Normalmente sin plural en este contexto
collective|Forma colectiva
pluralNote|Las formas plurales se muestran como referencia. La respuesta solicitada no cambia.
grammarNote|Explicaciones y ejemplos introductorios; no es una gramática completa.
printBook|Imprimir cuaderno
contents|Índice
lexicon|Diccionario
learningEntries|Tarjetas
adopt|Añadir
alreadyAdded|Ya está en las tarjetas
source|Fuente
meaning|Significado
dictionaryLoading|Cargando el diccionario…
dictionaryError|No se pudo cargar el diccionario local.
dictionaryCredit|FreeDict / WikDict · Wiktionary / DBnary · CC BY-SA 3.0
dictionaryChanges|Conversión del diccionario alemán–español a un formato compacto. Consulta el significado antes de añadir una traducción.
dictionaryDate|Fecha de descarga
derivedEntry|Adaptado · CC BY-SA 3.0
learn|Aprender
together|Juntos
library|Biblioteca
progress|Progreso
settings|Configuración
addEntry|Añadir una tarjeta
editEntry|Editar tarjeta
ownEntries|Tarjetas propias
builtIn|Tarjetas incluidas
allEntries|Todas las tarjetas
origin|Origen
word|Palabra
sentence|Frase
germanText|Alemán
serbianText|Español
edit|Editar
editEntryWarning|Los cambios afectan a todos los perfiles. Cambiar el texto, el tema o el tipo reinicia el progreso de esta tarjeta. Se crea una copia antes.
confirmEntryEdit|Confirmar cambio
deleteEntryTitle|¿Eliminar esta tarjeta propia?
deleteEntryWarning|Se elimina de todos los perfiles, incluidos favoritos y progreso. Se crea una copia antes.
entryInvalid|Indica ambos textos (1–300 caracteres), tema y tipo, sin saltos de línea.
ENTRY_EXISTS|Esta pareja de textos ya existe.
ENTRY_LIMIT|Se permiten hasta 1.000 tarjetas propias.
ENTRY_MISSING|La tarjeta ya no está disponible. Actualiza la vista.
STALE_ENTRY|La tarjeta cambió. Actualiza la vista.
STORAGE_LIMIT|La copia superaría 10 MB. No se guardó el cambio.
offline|Local · Sin conexión
uiLanguage|Idioma de la interfaz
de|Deutsch
sr|Español
target|Estoy aprendiendo
profile|Perfil
profiles|Perfiles
newProfile|Añadir perfil
name|Nombre
create|Crear perfil
welcome|Tu espacio para aprender
firstProfile|¿Quién aprende hoy?
profileIntro|Tu nombre y tu propio progreso.
start|Empezar a aprender
startTogether|Empezar juntos
due|Pendientes
new|Nuevas
started|Empezadas
reviews|Repasos
allTopics|Todos los temas
topic|Tema
content|Contenido
allContent|Palabras y frases
words|Palabras
sentences|Frases
mode|Ejercicio
cards|Tarjetas
choice|Selección
typing|Escritura
round|Duración de la ronda
items|Tarjetas
onlyFavorites|Solo favoritos
favorites|Favoritos
favorite|Añadir a favoritos
unfavorite|Quitar de favoritos
everyday|Tu vida diaria, dos idiomas
topics|Temas
practice|Practicar
firstLearner|Primer perfil
secondLearner|Segundo perfil
togetherTitle|Una mesa. Dos caminos para aprender.
togetherHint|Por turnos · Progreso individual
needsTwo|Para aprender juntos necesitas dos perfiles distintos.
turn|le toca
translateTo|Traduce al
reveal|Mostrar respuesta
again|Todavía no
hard|Difícil
good|Lo sabía
easy|Fácil
answer|Tu respuesta
check|Comprobar
next|Siguiente
finish|Terminar ronda
stop|Volver al inicio
correct|¡Correcto!
incorrect|Repásalo otra vez
article|Incluye el artículo.
diacritics|Comprueba las tildes y la ñ.
solution|Respuesta correcta
saved|Progreso guardado
saving|Guardando…
nextDue|Próximo repaso
complete|Ronda completada
completeHint|Se han guardado tus repasos.
emptyQueue|No hay tarjetas pendientes aquí.
emptyHint|Elige otro tema o consulta la biblioteca.
noFavorites|No hay favoritos que coincidan.
completed|Tarjetas practicadas
back|Volver
search|Buscar palabras y frases
noResults|No hay resultados.
previous|Anterior
page|Página
of|de
results|Resultados
speak|Escuchar
noVoice|No hay ninguna voz local compatible.
speechFailed|La lectura local no está disponible.
audio|Pronunciación
available|Voz local disponible
voiceNote|Se utilizan voces locales de alemán y español. Mateo tiene pronunciación latinoamericana; las tarjetas usan principalmente español de España.
storage|Datos y copias
storagePath|Ubicación de los datos
export|Exportar copia
import|Restaurar copia
exportDone|Copia guardada.
importTitle|¿Reemplazar todos los datos locales?
importWarning|La copia sustituye los perfiles, el progreso y las tarjetas propias. Se crea una copia de los datos actuales antes.
importAction|Guardar copia y reemplazar
imported|Copia restaurada.
cancel|Cancelar
close|Cerrar
delete|Eliminar
rename|Cambiar nombre
save|Guardar
deleteTitle|¿Eliminar el perfil?
deleteWarning|Se eliminará el progreso de este perfil. Se crea una copia antes.
deleteAction|Eliminar perfil
current|Actual
learnedLanguage|Idioma de aprendizaje
profileLanguage|Idioma del perfil
targetNote|Crea otro perfil para la otra dirección de aprendizaje; así se mantienen separados los progresos.
about|Acerca de Juntos
contentNote|500 palabras · 220 frases · 16 temas. Progresión orientativa de A1 a B2, sin certificación. Español principalmente de España. Los comentarios entre paréntesis no se escriben en la respuesta. Las tarjetas no cubren todas las traducciones posibles.
evaluationNote|Las mayúsculas y los signos de puntuación no cuentan. Los artículos, las tildes y la ñ sí cuentan.
backupNote|Las copias JSON contienen los nombres, el progreso y las tarjetas propias. No hay sincronización automática entre ordenadores.
browserNote|Los datos se guardan localmente.
loading|Cargando…
retry|Volver a intentar
storageErrorTitle|No se pudieron abrir los datos
STORAGE_ERROR|No se pudieron guardar los datos.
STORAGE_CORRUPT|Los datos locales no se pudieron leer.
IMPORT_INVALID|La copia no es compatible con Juntos.
NAME_EXISTS|Ya existe un perfil con este nombre.
PROFILE_LIMIT|Se permiten hasta 24 perfiles.
PROFILE_MISSING|El perfil ya no está disponible.
STALE_REVIEW|El progreso cambió. Actualiza la vista.
unexpected|Ha ocurrido un error.
activity|Actividad reciente
noActivity|Todavía no hay actividad.
direction|Dirección
perPerson|por persona
practiceMore|Practicar más
retention|Repaso espaciado
total|Total
topicProgress|Progreso por tema'''

def chapter(id,title,paragraphs,examples):
    return dict(id=id,title=title,paragraphs=paragraphs,examples=examples)

GRAMMAR={'es':dict(title='Spanische Grammatik',subtitle='A1–B2 · Grundlagen und Satzmuster auf Deutsch',explanationLanguage='de',chapters=[
chapter('sounds','1. Aussprache und Schreibweise',[
'ñ ist ein eigener Buchstabe (wie nj in vielen deutschen Annäherungen). Das h ist stumm. j und g vor e/i werden je nach Region als Reibelaut gesprochen. Die Stimme Mateo verwendet lateinamerikanische Aussprache.',
'Akzente können Wortbedeutung und Betonung ändern: si heißt wenn, sí heißt ja. Frage- und Ausrufezeichen stehen im Spanischen auch am Satzanfang. Beim Schreiben werden Akzente und ñ geprüft; Satzzeichen werden nicht bewertet.'
],[['el año / el ano','das Jahr / der After'],['si / sí','wenn / ja'],['¿Cómo estás?','Wie geht es dir?']]),
chapter('nouns','2. Artikel, Plural und Adjektive',[
'Maskuline Nomen haben meist el, feminine la. Es gibt Ausnahmen: la mano, el día. Vor betontem a verwenden manche feminine Nomen im Singular el: el agua fría, im Plural las aguas frías.',
'Der Plural endet häufig auf -s nach Vokal und -es nach Konsonant; z wird zu c (luz → luces). Adjektive passen sich in Geschlecht und Zahl an. Zusammengesetzte Wörter und Ausnahmen müssen einzeln gelernt werden.'
],[['el libro / los libros','das Buch / die Bücher'],['la casa blanca / las casas blancas','das weiße Haus / die weißen Häuser'],['el lápiz / los lápices','der Bleistift / die Bleistifte']]),
chapter('present','3. Präsens, ser, estar und hay',[
'Regelmäßige Verben: hablar → hablo, hablas, habla, hablamos, habláis, hablan. Wichtige unregelmäßige Verben sind ser, estar, ir, tener und hacer.',
'Ser beschreibt unter anderem Identität und Herkunft; estar beschreibt Zustände und Orte. Hay bedeutet es gibt. Das Subjektpronomen wird oft weggelassen. Gustar richtet sich nach dem, was gefällt.'
],[['Soy médica. Estoy cansada.','Ich bin Ärztin. Ich bin müde.'],['Hay una farmacia. La farmacia está aquí.','Es gibt eine Apotheke. Die Apotheke ist hier.'],['Me gusta el libro. Me gustan los libros.','Das Buch gefällt mir. Die Bücher gefallen mir.']]),
chapter('past','4. Vergangenheitsformen',[
'Das indefinido erzählt abgeschlossene Ereignisse: ayer fui, compré, vi. Das imperfecto beschreibt Hintergründe, Gewohnheiten und laufende Vorgänge: era, iba, compraba.',
'Das perfecto (he comprado) verbindet Vergangenes häufig mit der Gegenwart; sein Gebrauch unterscheidet sich regional. Das pluscuamperfecto (había comprado) beschreibt eine Handlung vor einer anderen vergangenen Handlung.'
],[['Mientras cenábamos, sonó el teléfono.','Während wir zu Abend aßen, klingelte das Telefon.'],['Ya había salido cuando llegaste.','Ich war schon gegangen, als du ankamst.'],['Hoy he aprendido algo nuevo.','Heute habe ich etwas Neues gelernt.']]),
chapter('subjunctive','5. Subjuntivo und Nebensätze',[
'Der subjuntivo steht oft nach Wunsch, Zweifel, Bewertung oder Zweck: quiero que vengas; dudo que sea verdad; es importante que practiques; para que puedas aprender.',
'Mit zukünftiger Bedeutung steht nach cuando, en cuanto und hasta que häufig subjuntivo: te llamaré cuando llegue. Vergangene oder hypothetische Bezugspunkte können imperfecto de subjuntivo verlangen: quería que vinieras. Bei aunque hängt die Form davon ab, ob etwas als feststehende Tatsache oder als mögliche bzw. eingeräumte Bedingung formuliert wird.'
],[['No creo que sea fácil.','Ich glaube nicht, dass es leicht ist.'],['Te llamaré en cuanto llegue.','Ich rufe dich an, sobald ich ankomme.'],['Quería que me ayudaras.','Ich wollte, dass du mir hilfst.']]),
chapter('conditions','6. Bedingungen und komplexes Argumentieren',[
'Reale Bedingung: si + Präsens, dann Präsens oder Zukunft. Hypothetisch: si + imperfecto de subjuntivo, dann condicional. Vergangene nicht erfüllte Bedingung: si + pluscuamperfecto de subjuntivo, dann condicional compuesto.',
'Verbinde Gedanken mit aunque, sin embargo, por eso, mientras und siempre que. Die fortgeschrittenen Karten üben diese Muster; die Niveauangaben sind eine Orientierung, keine Prüfungseinstufung.'
],[['Si tengo tiempo, iré.','Wenn ich Zeit habe, gehe ich hin.'],['Si tuviera tiempo, iría.','Wenn ich Zeit hätte, würde ich hingehen.'],['Si hubiera tenido tiempo, habría ido.','Wenn ich Zeit gehabt hätte, wäre ich hingegangen.']])]),
'de':dict(title='Gramática alemana',subtitle='Fundamentos y ejemplos en español',explanationLanguage='es',chapters=[
chapter('articles','1. Artículos y casos',['Aprende cada sustantivo con su artículo y su plural. El alemán distingue nominativo, acusativo, dativo y genitivo. El artículo cambia según el caso.'],[['der Mann / den Mann / dem Mann','el hombre en nominativo / acusativo / dativo'],['Ich helfe dem Kind.','Ayudo al niño.'],['Ich sehe den Mann.','Veo al hombre.']]),
chapter('verbs','2. Verbos y posición',['En una oración principal, el verbo conjugado ocupa la segunda posición. En una pregunta sin interrogativo aparece al principio. En muchas subordinadas va al final.'],[['Heute lerne ich Deutsch.','Hoy aprendo alemán.'],['Lernst du Deutsch?','¿Aprendes alemán?'],['Ich weiß, dass du Deutsch lernst.','Sé que aprendes alemán.']]),
chapter('past','3. Pasado',['El perfecto se forma con haben o sein y el participio. El pretérito es frecuente en textos y con sein, haben y verbos modales. El pluscuamperfecto describe un hecho anterior a otro hecho pasado.'],[['Ich habe gelernt. Ich bin gekommen.','He aprendido. He venido.'],['Ich war müde.','Estaba cansado.'],['Ich hatte schon gegessen.','Ya había comido.']]),
chapter('modal','4. Verbos modales y condiciones',['Los verbos modales se combinan con un infinitivo al final. El Konjunktiv II expresa condiciones hipotéticas y peticiones corteses.'],[['Ich muss heute arbeiten.','Tengo que trabajar hoy.'],['Könnten Sie mir helfen?','¿Podría ayudarme?'],['Wenn ich Zeit hätte, würde ich kommen.','Si tuviera tiempo, vendría.']]),
chapter('connectors','5. Conectores',['Weil, obwohl y dass introducen subordinadas con el verbo al final. Deshalb y trotzdem se usan con el orden de una oración principal.'],[['Obwohl es regnet, gehen wir spazieren.','Aunque llueve, damos un paseo.'],['Es regnet. Trotzdem gehen wir spazieren.','Llueve. Aun así damos un paseo.']])])}

Path('work/es-ui.json').write_text(json.dumps(dict(line.split('|',1) for line in UI.splitlines()),ensure_ascii=False),encoding='utf-8')
Path('work/grammar-es.json').write_text(json.dumps(GRAMMAR,ensure_ascii=False),encoding='utf-8')
