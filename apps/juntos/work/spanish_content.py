import json
from pathlib import Path

original=json.loads(Path('work/extracted.json').read_text(encoding='utf-8'))
BASE={
'greetings':('Saludos y encuentros',
'hola|buenos días|buenas tardes|buenas noches|buenas noches|adiós|hasta mañana|hasta pronto|gracias|por favor|perdón|sí|no|quizás|bienvenido|de nada|el nombre|el nombre de pila|el apellido|el idioma|la pregunta|la respuesta|la conversación|el saludo|entender|hablar|preguntar|responder|despacio|juntos|otra vez|cordial',
'''¿Cómo te llamas?
Me llamo Ana.
¿Cómo estás?
Estoy bien, gracias.
Me alegra verte.
Por favor, habla despacio.
No entiendo la pregunta.
¿Puedes repetirlo?
Aprendemos juntos.
¡Hasta mañana por la mañana!'''),
'home':('La vivienda',
'la casa|el apartamento|la puerta|la ventana|la mesa|la silla|la cama|el armario|el sofá|la lámpara|la alfombra|el espejo|la estantería|la almohada|la manta|la pared|el suelo|el tejado|la escalera|la llave|la cocina|el cuarto de baño|el dormitorio|la sala de estar|el pasillo|el balcón|el jardín|la calefacción|el enchufe|la cortina|el cajón|la toalla',
'''La llave está en la mesa.
Por favor, cierra la puerta.
La ventana está abierta.
La lámpara está al lado de la cama.
Estamos sentados en el sofá.
La toalla está en el cuarto de baño.
La cocina es pequeña.
Necesito una almohada.
Hay una mesa en el jardín.
El apartamento está calentito.'''),
'chores':('Las tareas domésticas',
'limpiar|lavar|ordenar|cocinar|hornear|planchar|barrer|pasar la aspiradora|secar|lavar los platos|regar|reparar|abrir|cerrar|ayudar|llevar|la escoba|el cubo|la esponja|el jabón|el detergente|la lavadora|la aspiradora|la plancha|la basura|el cubo de basura|la ropa para lavar|el lavavajillas|limpio|sucio|seco|mojado',
'''Hoy lavo la ropa.
¿Puedes ayudarme?
Ordenamos la cocina.
El cubo está lleno.
Por favor, saca la basura.
Riego las flores.
La toalla todavía está mojada.
La lavadora está funcionando.
Limpiamos la ventana juntos.
El suelo está limpio ahora.'''),
'food':('La comida',
'el pan|la leche|el agua|el café|el té|el zumo|el queso|el huevo|la mantequilla|el arroz|la patata|el tomate|el pepino|la cebolla|la manzana|la pera|el plátano|la fresa|la sopa|la ensalada|la carne|el pescado|la sal|el azúcar|el plato|la taza|el vaso|el tenedor|el cuchillo|la cuchara|el desayuno|la cena',
'''¿Quieres un té?
Bebo café sin azúcar.
El pan está fresco.
Por favor, dame la sal.
La sopa todavía está caliente.
Comemos a las siete.
Quisiera un vaso de agua.
El queso está en la nevera.
El desayuno está listo.
¡Buen provecho!'''),
'family':('La familia y los amigos',
'la familia|la madre|el padre|los padres|la hija|el hijo|la hermana|el hermano|la abuela|el abuelo|el niño|el bebé|la mujer|el hombre|la amiga|el amigo|la vecina|el vecino|la persona|la gente|el cumpleaños|el regalo|la visita|la boda|el amor|la alegría|reír|jugar|visitar|celebrar|joven|viejo',
'''Mi hermana viene hoy.
¿Cómo se llama tu hermano?
Los niños juegan en el jardín.
Visitamos a nuestros padres.
Mañana es el cumpleaños de mi madre.
El regalo es para ti.
A mi padre le gusta cocinar.
La vecina nos ayuda.
Nuestra familia es grande.
Celebramos el sábado.'''),
'work':('El trabajo y el aprendizaje',
'el trabajo|la oficina|la empresa|la profesión|la compañera de trabajo|el compañero de trabajo|la jefa|el jefe|el ordenador|el teclado|la pantalla|la impresora|el teléfono|el mensaje|la carta|el papel|el bolígrafo|el cuaderno|el libro|la escuela|la profesora|el profesor|la tarea|el descanso|trabajar|aprender|leer|escribir|escuchar|explicar|practicar|listo',
'''Hoy trabajo en casa.
El descanso empieza a las doce.
Mi ordenador es lento.
Por favor, escribe tu nombre.
Leo un libro.
La compañera de trabajo explica la tarea.
Practicamos todos los días.
¿Dónde está mi bolígrafo?
Necesito un descanso.
El mensaje es para ti.'''),
'shopping':('Las compras',
'la tienda|el supermercado|el mercado|la panadería|la caja|el precio|el dinero|la factura|la bolsa|la cesta|la botella|el paquete|la oferta|el descuento|la talla|el color|los pantalones|la camisa|el vestido|la chaqueta|el zapato|el calcetín|el sombrero|el abrigo|comprar|pagar|costar|buscar|barato|caro|pequeño|grande',
'''¿Cuánto cuesta esto?
Pago con tarjeta.
¿Tiene una bolsa?
Busco una chaqueta.
Los zapatos son demasiado pequeños.
¿Dónde está la caja?
Necesito dos botellas de agua.
La tienda está cerrada hoy.
Por favor, deme la factura.
Compramos pan en el mercado.'''),
'time':('El tiempo y las citas',
'hoy|mañana|ayer|ahora|más tarde|temprano|tarde|siempre|a menudo|a veces|nunca|pronto|el día|la semana|el mes|el año|la hora|el minuto|el segundo|la mañana|el mediodía|la tarde|la noche|el fin de semana|lunes|martes|miércoles|jueves|viernes|sábado|domingo|el calendario',
'''¿Qué hora es?
Hoy es lunes.
Mañana tengo tiempo.
Nos vemos por la tarde.
Llego en diez minutos.
El domingo nos quedamos en casa.
La cita es la semana que viene.
Me levanto temprano.
Espera un momento, por favor.
Ahora es hora de hacer un descanso.'''),
'travel':('Los viajes y la naturaleza',
'la calle|el camino|la ciudad|el pueblo|la estación de tren|la parada|el autobús|el tren|el coche|la bicicleta|el billete|la maleta|el viaje|las vacaciones|el parque|el bosque|el árbol|la flor|el río|el lago|la montaña|el sol|la lluvia|la nieve|el viento|a la izquierda|a la derecha|todo recto|ir a pie|ir en un vehículo|esperar|llegar',
'''¿Dónde está la parada más cercana?
El autobús llega enseguida.
Vamos a pie.
Gire a la izquierda, por favor.
Necesito un billete.
Hoy hace sol.
Llueve desde esta mañana.
Damos un paseo.
El parque está al lado de la estación de tren.
¿Cuándo llega el tren?'''),
'health':('La salud',
'la cabeza|la mano|el pie|la pierna|el ojo|la oreja|la nariz|la boca|el diente|la espalda|la barriga|el corazón|la médica|el médico|la farmacia|el hospital|el medicamento|la receta|el dolor|la fiebre|la tos|el resfriado|la salud|la tranquilidad|cansado|sano|enfermo|sediento|hambriento|dormir|respirar|descansar',
'''Me duele la cabeza.
Necesito un médico.
¿Dónde está la farmacia más cercana?
Por favor, bebe un poco de agua.
Quiero descansar.
¿Cómo te sientes?
Tengo frío.
Tengo calor.
Hoy he dormido bien.
¡Que te mejores!'''),
}

ADVANCED=[
('opinions','B1 · Meinungen & Argumente','B1 · Opiniones y argumentos',
'''die Meinung|la opinión
das Argument|el argumento
der Standpunkt|el punto de vista
der Vorteil|la ventaja
der Nachteil|la desventaja
die Begründung|la justificación
die Schlussfolgerung|la conclusión
der Beweis|la prueba
der Zweifel|la duda
die Überzeugung|la convicción
die Voraussetzung|el requisito
der Zusammenhang|la relación
der Gegensatz|el contraste
die Ausnahme|la excepción
die Behauptung|la afirmación
zustimmen|estar de acuerdo
widersprechen|discrepar
begründen|justificar
überzeugen|convencer
abwägen|sopesar
vergleichen|comparar
berücksichtigen|tener en cuenta
behaupten|afirmar
bezweifeln|poner en duda
allerdings|sin embargo
obwohl|aunque
deshalb|por eso
dennoch|aun así
einerseits|por un lado
andererseits|por otro lado''',
'''Meiner Meinung nach sollten wir mehr Zeit einplanen.|En mi opinión, deberíamos prever más tiempo.
Ich bin damit einverstanden, solange die Kosten nicht steigen.|Estoy de acuerdo con eso, siempre que no aumenten los costes.
Obwohl dein Vorschlag sinnvoll ist, habe ich noch Zweifel.|Aunque tu propuesta es razonable, todavía tengo dudas.
Es ist wichtig, dass wir beide Seiten berücksichtigen.|Es importante que tengamos en cuenta ambas partes.
Ich glaube nicht, dass diese Lösung für alle geeignet ist.|No creo que esta solución sea adecuada para todos.
Einerseits sparen wir Geld, andererseits verlieren wir Zeit.|Por un lado ahorramos dinero; por otro lado perdemos tiempo.
Kannst du erklären, worauf sich deine Meinung stützt?|¿Puedes explicar en qué se basa tu opinión?
Je mehr Informationen wir haben, desto besser können wir entscheiden.|Cuanta más información tengamos, mejor podremos decidir.
Das bedeutet nicht unbedingt, dass du recht hast.|Eso no significa necesariamente que tengas razón.
Ich würde zustimmen, wenn es dafür überzeugende Beweise gäbe.|Estaría de acuerdo si hubiera pruebas convincentes de ello.
Wir sollten die Vorteile gegen die Nachteile abwägen.|Deberíamos sopesar las ventajas y las desventajas.
Was spricht deiner Ansicht nach gegen diesen Vorschlag?|¿Qué argumentos hay, en tu opinión, en contra de esta propuesta?
Es wäre besser, zunächst die Ursachen zu untersuchen.|Sería mejor investigar primero las causas.
Ich bezweifle, dass sich das Problem von selbst löst.|Dudo que el problema se resuelva por sí solo.
Trotz der Schwierigkeiten halte ich das Ziel für erreichbar.|A pesar de las dificultades, considero que el objetivo es alcanzable.
Lass uns auf die ursprüngliche Frage zurückkommen.|Volvamos a la pregunta inicial.
Dieser Vergleich überzeugt mich nicht, weil die Bedingungen verschieden sind.|Esta comparación no me convence porque las condiciones son diferentes.
Wir sind zu dem Schluss gekommen, dass wir den Plan ändern müssen.|Hemos llegado a la conclusión de que debemos cambiar el plan.
Ich verstehe deinen Standpunkt, teile ihn aber nicht vollständig.|Entiendo tu punto de vista, pero no lo comparto del todo.
Entscheidend ist, ob die Lösung langfristig funktioniert.|Lo decisivo es si la solución funciona a largo plazo.'''),
('experiences','B1 · Erlebnisse & Vergangenheit','B1 · Experiencias y pasado',
'''die Erfahrung|la experiencia
die Erinnerung|el recuerdo
die Kindheit|la infancia
die Jugend|la juventud
die Gewohnheit|la costumbre
das Ereignis|el acontecimiento
die Überraschung|la sorpresa
die Enttäuschung|la decepción
der Erfolg|el éxito
der Misserfolg|el fracaso
der Umzug|la mudanza
die Begegnung|el encuentro
die Gelegenheit|la oportunidad
das Abenteuer|la aventura
die Veränderung|el cambio
sich erinnern|recordar
vergessen|olvidar
erleben|vivir una experiencia
entdecken|descubrir
aufwachsen|crecer
sich gewöhnen|acostumbrarse
vermissen|echar de menos
geschehen|ocurrir
erzählen|contar
bereuen|arrepentirse
damals|entonces
früher|antes
inzwischen|mientras tanto
plötzlich|de repente
seitdem|desde entonces''',
'''Als ich klein war, verbrachte ich jeden Sommer bei meinen Großeltern.|Cuando era pequeño, pasaba todos los veranos con mis abuelos.
Gestern traf ich jemanden, den ich seit Jahren nicht gesehen hatte.|Ayer me encontré con alguien a quien no había visto desde hacía años.
Während wir zu Abend aßen, klingelte das Telefon.|Mientras cenábamos, sonó el teléfono.
Ich hatte die Fahrkarte schon gekauft, bevor die Reise abgesagt wurde.|Ya había comprado el billete antes de que se cancelara el viaje.
Seit ich umgezogen bin, gehe ich öfter zu Fuß.|Desde que me mudé, voy a pie más a menudo.
Früher dachte ich, dass das Lernen einer Sprache leicht wäre.|Antes pensaba que aprender un idioma sería fácil.
Wir waren gerade angekommen, als es zu regnen begann.|Acabábamos de llegar cuando empezó a llover.
Ich erinnere mich noch genau an den Tag, an dem wir uns kennengelernt haben.|Todavía recuerdo perfectamente el día en que nos conocimos.
Hättest du mich gefragt, hätte ich dir geholfen.|Si me hubieras preguntado, te habría ayudado.
Ich bereue, dass ich damals nicht mehr Fragen gestellt habe.|Me arrepiento de no haber hecho más preguntas entonces.
Diese Erfahrung hat meine Sicht auf die Dinge verändert.|Esta experiencia ha cambiado mi forma de ver las cosas.
Als wir dort wohnten, kannten wir alle Nachbarn.|Cuando vivíamos allí, conocíamos a todos los vecinos.
Ich habe noch nie einen so schönen Sonnenuntergang gesehen.|Nunca he visto una puesta de sol tan bonita.
Nachdem sie die Prüfung bestanden hatte, feierte sie mit ihren Freunden.|Después de haber aprobado el examen, lo celebró con sus amigos.
Am Anfang fiel es mir schwer, mich an den Alltag zu gewöhnen.|Al principio me costaba acostumbrarme a la vida cotidiana.
Was hättest du an meiner Stelle getan?|¿Qué habrías hecho en mi lugar?
Ich wusste nicht, dass ihr schon abgereist wart.|No sabía que ya os habíais marchado.
Je länger ich dort blieb, desto wohler fühlte ich mich.|Cuanto más tiempo me quedaba allí, más a gusto me sentía.
Damals hätten wir uns diese Entwicklung nicht vorstellen können.|Entonces no habríamos podido imaginar esta evolución.
Das war eine Gelegenheit, die ich nicht verpassen wollte.|Era una oportunidad que no quería perder.'''),
('career','B1–B2 · Beruf & Entscheidungen','B1–B2 · Trabajo y decisiones',
'''die Bewerbung|la solicitud de empleo
das Vorstellungsgespräch|la entrevista de trabajo
der Lebenslauf|el currículum
die Ausbildung|la formación profesional
die Weiterbildung|la formación continua
die Verantwortung|la responsabilidad
die Frist|el plazo
die Vereinbarung|el acuerdo
die Verhandlung|la negociación
das Gehalt|el salario
die Kündigung|el despido
der Vertrag|el contrato
die Arbeitsbelastung|la carga de trabajo
die Zusammenarbeit|la colaboración
die Beförderung|el ascenso
sich bewerben|solicitar un empleo
einstellen (Personal)|contratar
kündigen (selbst)|renunciar
verhandeln|negociar
vereinbaren|acordar
erledigen|llevar a cabo
verschieben|aplazar
delegieren|delegar
bewerten|evaluar
scheitern|fracasar
zuverlässig|fiable
verfügbar|disponible
zuständig|responsable
fristgerecht|dentro del plazo
langfristig|a largo plazo''',
'''Ich möchte mich um die ausgeschriebene Stelle bewerben.|Quisiera solicitar el puesto anunciado.
Könnten Sie mir mitteilen, welche Unterlagen noch fehlen?|¿Podría indicarme qué documentos faltan todavía?
Bevor ich den Vertrag unterschreibe, möchte ich die Bedingungen klären.|Antes de firmar el contrato, quisiera aclarar las condiciones.
Falls der Termin verschoben wird, informieren Sie mich bitte rechtzeitig.|Si se aplaza la cita, infórmeme con suficiente antelación, por favor.
Es ist notwendig, dass alle die Frist einhalten.|Es necesario que todos cumplan el plazo.
Ich hätte die Aufgabe früher erledigt, wenn die Informationen vollständig gewesen wären.|Habría terminado la tarea antes si la información hubiera estado completa.
Wir müssen entscheiden, welche Aufgaben wir delegieren können.|Tenemos que decidir qué tareas podemos delegar.
Ich bin für die Planung zuständig, nicht für die Durchführung.|Soy responsable de la planificación, no de la ejecución.
Der Vertrag wird verlängert, sofern beide Seiten zustimmen.|El contrato se prorrogará siempre que ambas partes estén de acuerdo.
Ich würde gern wissen, ob flexible Arbeitszeiten möglich sind.|Me gustaría saber si es posible tener un horario flexible.
Das Gehalt ist wichtig, aber die Arbeitsbedingungen sind ebenso entscheidend.|El salario es importante, pero las condiciones de trabajo son igual de decisivas.
Wir haben vereinbart, die Ergebnisse bis Freitag vorzulegen.|Hemos acordado presentar los resultados antes del viernes.
Ich schlage vor, dass wir die Aufgaben gerechter verteilen.|Propongo que repartamos las tareas de forma más justa.
Nachdem der Fehler entdeckt worden war, wurde der Ablauf geändert.|Después de que se descubriera el error, se modificó el procedimiento.
Diese Weiterbildung könnte meine beruflichen Möglichkeiten verbessern.|Esta formación continua podría mejorar mis oportunidades profesionales.
Es kommt darauf an, wie zuverlässig die Zusammenarbeit ist.|Depende de lo fiable que sea la colaboración.
Ich habe gekündigt, weil ich mich beruflich verändern wollte.|Renuncié porque quería dar un nuevo rumbo a mi carrera.
Bitte lassen Sie mich wissen, sobald eine Entscheidung getroffen wurde.|Por favor, avíseme en cuanto se haya tomado una decisión.
Wir sollten vermeiden, dass einzelne Mitarbeitende überlastet werden.|Deberíamos evitar que algunos empleados estén sobrecargados.
Unter diesen Bedingungen wäre ich bereit, das Angebot anzunehmen.|En estas condiciones, estaría dispuesto a aceptar la oferta.'''),
('society','B2 · Gesellschaft & Umwelt','B2 · Sociedad y medio ambiente',
'''die Gesellschaft|la sociedad
die Bevölkerung|la población
die Gleichberechtigung|la igualdad de derechos
die Ungleichheit|la desigualdad
die Bildung|la educación
die Demokratie|la democracia
die Wahl (Abstimmung)|las elecciones
die Regierung|el gobierno
die Öffentlichkeit|la opinión pública
die Nachhaltigkeit|la sostenibilidad
der Klimawandel|el cambio climático
die Verschmutzung|la contaminación
die Ressource|el recurso
die Maßnahme|la medida
die Auswirkung|la repercusión
vermeiden|evitar
fördern|fomentar
schützen|proteger
verbrauchen|consumir
wiederverwenden|reutilizar
entsorgen|desechar
teilnehmen|participar
beitragen|contribuir
fordern|exigir
verändern|cambiar
nachhaltig|sostenible
erneuerbar|renovable
gerecht|justo
umstritten|controvertido
verantwortungsbewusst|responsable''',
'''Damit die Maßnahme wirkt, müssen sich möglichst viele beteiligen.|Para que la medida funcione, debe participar el mayor número posible de personas.
Es reicht nicht aus, nur über den Klimawandel zu sprechen.|No basta con hablar del cambio climático.
Wenn wir weniger Energie verbrauchen würden, könnten wir die Umwelt entlasten.|Si consumiéramos menos energía, podríamos reducir el impacto ambiental.
Die Frage ist, wie die Kosten gerecht verteilt werden können.|La cuestión es cómo se pueden repartir los costes de forma justa.
Viele Menschen fordern, dass öffentliche Verkehrsmittel günstiger werden.|Muchas personas exigen que el transporte público sea más barato.
Ob diese Entscheidung sinnvoll ist, hängt von ihren langfristigen Folgen ab.|Que esta decisión sea razonable depende de sus consecuencias a largo plazo.
Je mehr wir wiederverwenden, desto weniger Abfall entsteht.|Cuanto más reutilizamos, menos residuos se generan.
Niemand sollte aufgrund seiner Herkunft benachteiligt werden.|Nadie debería ser discriminado por su origen.
Die Regierung hat angekündigt, neue Maßnahmen zu ergreifen.|El gobierno ha anunciado que tomará nuevas medidas.
Es wäre wünschenswert, dass alle Zugang zu guter Bildung hätten.|Sería deseable que todos tuvieran acceso a una buena educación.
Auch wenn die Lösung teuer ist, könnte sie sich langfristig lohnen.|Aunque la solución es cara, podría merecer la pena a largo plazo.
Wir sollten prüfen, ob es nachhaltigere Alternativen gibt.|Deberíamos comprobar si hay alternativas más sostenibles.
Der Bericht zeigt, wie stark sich die Lebensbedingungen verändert haben.|El informe muestra cuánto han cambiado las condiciones de vida.
Ich halte es für problematisch, dass manche Stimmen kaum gehört werden.|Me parece problemático que algunas voces apenas sean escuchadas.
Anstatt neue Dinge zu kaufen, können wir vieles reparieren.|En lugar de comprar cosas nuevas, podemos reparar muchas cosas.
Die Entscheidung wurde getroffen, ohne die Betroffenen ausreichend einzubeziehen.|La decisión se tomó sin implicar suficientemente a los afectados.
Welche Folgen hätte es, wenn wir nichts unternehmen würden?|¿Qué consecuencias tendría que no hiciéramos nada?
Es ist entscheidend, dass die Regeln für alle gleichermaßen gelten.|Es fundamental que las normas se apliquen a todos por igual.
Trotz unterschiedlicher Ansichten haben wir ein gemeinsames Ziel.|A pesar de nuestras distintas opiniones, tenemos un objetivo común.
Jeder kann dazu beitragen, Ressourcen bewusster zu nutzen.|Todos pueden contribuir a utilizar los recursos de forma más consciente.'''),
('conflicts','B1–B2 · Gefühle & Konflikte','B1–B2 · Sentimientos y conflictos',
'''das Vertrauen|la confianza
das Missverständnis|el malentendido
die Entschuldigung|la disculpa
der Vorwurf|el reproche
der Kompromiss|el compromiso
die Rücksicht|la consideración
die Erwartung|la expectativa
die Geduld|la paciencia
die Angst|el miedo
die Erleichterung|el alivio
die Beziehung|la relación
die Grenze|el límite
die Unterstützung|el apoyo
die Versöhnung|la reconciliación
die Ehrlichkeit|la sinceridad
sich entschuldigen|disculparse
verzeihen|perdonar
sich beschweren|quejarse
streiten|discutir
zuhören (aufmerksam)|escuchar con atención
vertrauen|confiar
enttäuschen|decepcionar
ermutigen|animar
respektieren|respetar
nachgeben|ceder
verletzt (emotional)|dolido
erleichtert|aliviado
besorgt|preocupado
geduldig|paciente
ehrlich|sincero''',
'''Es tut mir leid, dass ich dich unterbrochen habe.|Siento haberte interrumpido.
Ich wünsche mir, dass du mir erst zuhörst, bevor du antwortest.|Me gustaría que me escucharas antes de responder.
Wenn ich gewusst hätte, wie du dich fühlst, hätte ich anders reagiert.|Si hubiera sabido cómo te sentías, habría reaccionado de otra manera.
Ich habe den Eindruck, dass wir aneinander vorbeireden.|Tengo la impresión de que no nos estamos entendiendo.
Lass uns versuchen, einen Kompromiss zu finden.|Intentemos encontrar un compromiso.
Ich verstehe, dass du enttäuscht bist, aber das war nicht meine Absicht.|Entiendo que estés decepcionado, pero esa no era mi intención.
Es wäre mir lieber, wenn wir in Ruhe darüber sprechen könnten.|Preferiría que pudiéramos hablar de ello con calma.
Bitte sag mir ehrlich, was dich stört.|Por favor, dime sinceramente qué te molesta.
Wir müssen nicht dieselbe Meinung haben, um einander zu respektieren.|No tenemos que tener la misma opinión para respetarnos.
Ich möchte vermeiden, dass dieses Missverständnis unsere Beziehung belastet.|Quiero evitar que este malentendido afecte a nuestra relación.
Ich bin erleichtert, dass wir das geklärt haben.|Me alivia que lo hayamos aclarado.
Es ärgert mich, wenn meine Grenzen nicht respektiert werden.|Me molesta que no se respeten mis límites.
Könntest du mir erklären, warum du so reagiert hast?|¿Podrías explicarme por qué reaccionaste así?
Ich hätte mir gewünscht, dass du mich vorher gefragt hättest.|Me habría gustado que me hubieras preguntado antes.
Auch wenn es mir schwerfällt, möchte ich dir verzeihen.|Aunque me cuesta, quiero perdonarte.
Wir sollten uns gegenseitig unterstützen, statt uns Vorwürfe zu machen.|Deberíamos apoyarnos mutuamente en vez de hacernos reproches.
Ich brauche etwas Zeit, um darüber nachzudenken.|Necesito algo de tiempo para pensar en ello.
Es ist verständlich, dass du dir Sorgen machst.|Es comprensible que estés preocupado.
Seit wir offener miteinander sprechen, streiten wir seltener.|Desde que hablamos más abiertamente, discutimos menos.
Was könnten wir tun, damit sich diese Situation nicht wiederholt?|¿Qué podríamos hacer para que esta situación no se repita?'''),
('planning','B1–B2 · Pläne & Bedingungen','B1–B2 · Planes y condiciones',
'''die Absicht|la intención
das Ziel|el objetivo
die Möglichkeit|la posibilidad
die Entscheidung|la decisión
das Risiko|el riesgo
die Wahrscheinlichkeit|la probabilidad
die Bedingung|la condición
die Folge|la consecuencia
die Alternative|la alternativa
die Vorbereitung|la preparación
die Herausforderung|el reto
die Lösung|la solución
der Aufwand|el esfuerzo
die Priorität|la prioridad
die Ungewissheit|la incertidumbre
planen|planificar
vorhaben|tener intención de
entscheiden|decidir
vorbereiten|preparar
erreichen|alcanzar
abschätzen|estimar
anpassen|adaptar
verzichten|renunciar a
vorschlagen|proponer
ermöglichen|hacer posible
wahrscheinlich|probable
unwahrscheinlich|improbable
vorläufig|provisional
rechtzeitig|a tiempo
gegebenenfalls|si es necesario''',
'''Wenn ich mehr Zeit hätte, würde ich jeden Tag Spanisch üben.|Si tuviera más tiempo, practicaría español todos los días.
Sobald ich die Bestätigung erhalte, werde ich die Reise buchen.|En cuanto reciba la confirmación, reservaré el viaje.
Wir bleiben hier, bis der Regen aufhört.|Nos quedaremos aquí hasta que deje de llover.
Ich werde dich anrufen, bevor ich losfahre.|Te llamaré antes de salir.
Für den Fall, dass der Zug ausfällt, sollten wir eine Alternative haben.|Por si se cancela el tren, deberíamos tener una alternativa.
Ich möchte, dass du selbst entscheidest, was für dich wichtig ist.|Quiero que decidas por ti mismo qué es importante para ti.
Es ist möglich, dass wir den Termin verschieben müssen.|Es posible que tengamos que aplazar la cita.
Wenn alles nach Plan läuft, werden wir nächste Woche fertig sein.|Si todo va según lo previsto, habremos terminado la semana que viene.
Ich hätte das Angebot angenommen, wenn die Bedingungen besser gewesen wären.|Habría aceptado la oferta si las condiciones hubieran sido mejores.
Wir sollten nur Risiken eingehen, deren Folgen wir verstehen.|Solo deberíamos asumir riesgos cuyas consecuencias entendamos.
Damit du dich besser vorbereiten kannst, schicke ich dir die Unterlagen.|Para que puedas prepararte mejor, te envío los documentos.
Was würdest du tun, wenn du die Entscheidung allein treffen müsstest?|¿Qué harías si tuvieras que tomar la decisión tú solo?
Ich hoffe, dass wir eine Lösung finden, mit der alle zufrieden sind.|Espero que encontremos una solución con la que todos estén satisfechos.
Solange das Ziel klar ist, können wir den Weg dorthin anpassen.|Mientras el objetivo esté claro, podemos adaptar la manera de alcanzarlo.
Wir müssen berücksichtigen, dass nicht alles vorhersehbar ist.|Tenemos que tener en cuenta que no todo es previsible.
Ich werde erst zusagen, nachdem ich die Einzelheiten geprüft habe.|Solo confirmaré después de haber revisado los detalles.
Es wäre sinnvoll, die wichtigsten Aufgaben zuerst zu erledigen.|Sería conveniente realizar primero las tareas más importantes.
Je früher wir anfangen, desto mehr Spielraum haben wir.|Cuanto antes empecemos, más margen tendremos.
Ohne deine Unterstützung hätten wir das Ziel nicht erreicht.|Sin tu apoyo no habríamos alcanzado el objetivo.
Ich bin bereit, auf etwas zu verzichten, wenn sich dadurch die Situation verbessert.|Estoy dispuesto a renunciar a algo si con ello mejora la situación.'''),
]

def pairs(text):
    return [line.split('|') for line in text.strip().splitlines()]

topics=[]
for t in original['topics']:
    title,words,sentences=BASE[t['id']]
    words=words.split('|'); sentences=sentences.splitlines()
    assert len(words)==len(t['words'])==32 and len(sentences)==len(t['sentences'])==10,t['id']
    topics.append(dict(id=t['id'],de='A1–A2 · '+t['de'],es='A1–A2 · '+title,
        words=[[old[0],es] for old,es in zip(t['words'],words)],
        sentences=[[old[0],es] for old,es in zip(t['sentences'],sentences)]))
for id,de,es,words,sentences in ADVANCED:
    w,s=pairs(words),pairs(sentences)
    assert len(w)==30 and len(s)==20,(id,len(w),len(s))
    assert all(len(p)==2 for p in w+s)
    topics.append(dict(id=id,de=de,es=es,words=w,sentences=s))
Path('work/spanish-topics.json').write_text(json.dumps(topics,ensure_ascii=False,indent=2),encoding='utf-8')
print('Curriculum:',sum(len(t['words']) for t in topics),'words,',sum(len(t['sentences']) for t in topics),'sentences,',len(topics),'topics')
