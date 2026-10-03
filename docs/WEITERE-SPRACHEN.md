# Weitere Sprachen ergänzen

Eine Sammlung, ein Repository; derzeit ein Windows-Programm pro Sprachpaar. Die beiden vorhandenen Lernstände bleiben getrennt.

1. Für ein neues Sprachpaar einen Eintrag `languages/de-xx.json` anlegen. Pflichtfelder sind `id`, `name`, `appDirectory`, `languages`, `cards`, `offline` und `preferredVoice`.
2. Unter `apps/<Name>` die Inhalte und die Bedienoberfläche der neuen Sprache ablegen. Wörter, Sätze, Themen und Grammatik sollen getrennt bearbeitbar bleiben. UTF-8, eindeutige Kartenkennungen und maximal 300 Zeichen je Lerntext verwenden.
3. Ein geeignetes herunterladbares Wörterbuch auswählen, dessen Lizenz die Verteilung erlaubt. Originalquelle, Version, Prüfsumme, Lizenztext und Änderungen dokumentieren. Roharchive und konvertierte Daten nicht unnötig doppelt versionieren.
4. Einen eigenen Anwendungsnamen, eine eigene Anwendungskennung und einen separaten Lernstandsordner vergeben. Sicherungen anderer Sprachen nicht versehentlich übernehmen.
5. Falls verfügbar eine lokale Stimme integrieren. Den mitgelieferten Stimmeninstaller, seine Quelle und nötige Administratorrechte dokumentieren.
6. Lerninhalte, Sonderzeichen, Wiederholung, Sicherungen und Speicherung prüfen. Den Installer ohne eine vorhandene Zajedno-Installation testen.
7. Den Installer als GitHub-Release-Datei veröffentlichen und die Downloadtabelle in der Hauptanleitung ergänzen. Keine EXE, Electron-Laufzeit, persönlichen Sicherungen oder `node_modules` in Git aufnehmen.

Wenn weitere Sprachen tatsächlich umgesetzt werden, sollten die sprachunabhängigen Teile aus `apps/zajedno` in eine gemeinsame Engine ausgelagert werden: Profile, Wiederholung, Training, Sicherungen und Oberfläche. Spracheigene Inhalte, Antwortnormalisierung, Grammatik, Wörterbuch und Stimmenauswahl werden dann als Sprachpakete geladen. Die jetzigen JSON-Metadaten beschreiben die vorhandenen Anwendungen; sie bewirken noch keinen automatischen Sprachwechsel.
