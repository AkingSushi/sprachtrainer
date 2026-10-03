# Juntos – Deutsch und Spanisch

720 Lernkarten: 500 Wortpaare und 220 Sätze in 16 Themen. Offline-Wörterbuch von FreeDict/WikDict unter CC BY-SA 3.0. Die funktionierende Windows-Ausgabe liegt in den [Releases](https://github.com/AkingSushi/sprachtrainer/releases/latest).

## Anwendung erzeugen

Python 3 und Node.js werden zum Bauen und Testen benötigt. Die Sprache wird aus dem festgehaltenen Zajedno-1.3.0-Bündel unter `base/` erzeugt; auf dem Entwicklungsrechner muss Zajedno nicht installiert sein. Das geprüfte FreeDict-Archiv ist enthalten.

Im Ordner `apps/juntos` ausführen:

```powershell
python work/build_juntos.py
node work/verify_juntos.cjs
```

Dies erzeugt `outputs/Juntos/resources/app.asar` und prüft Lerninhalte, Profile, Wiederholung, Wörterbuchübernahme, Sicherungen, Akzente und die lokale Speicherung.

## Windows-Laufzeit ergänzen

Einmal im Ordner `apps/zajedno` `npm ci` ausführen. Das installiert die in der Sperrdatei festgelegte Electron-Laufzeit. Anschließend im Ordner `apps/juntos`:

```powershell
python work/link_runtime.py
```

Alternativ `python work/link_runtime.py --runtime-dir <Ordner>` mit einem entpackten Zajedno- oder Electron-Windows-Paket ausführen. Optional reduziert `--hardlink` den lokalen Speicherbedarf auf demselben Laufwerk. Zum Übertragen immer den ganzen erzeugten Ordner verwenden oder einen Installer bauen.

## Installer erzeugen

1. [Mateo 4.14 herunterladen](https://github.com/RHVoice/mateo-spa/releases/download/4.14/RHVoice-voice-Spanish-Mateo-v4.14.1044.23-setup.exe) und als `work/downloads/RHVoice-Mateo-setup.exe` speichern.
2. SHA256 prüfen: `ea4b0170bcf215b65eb41f4aafc74d63162e2da7344cb7cc549edb3a3ef66eff`.
3. `python work/build_installer.py` ausführen.
4. Das erzeugte `work/Juntos.nsi` mit dem Unicode-Compiler von [NSIS](https://nsis.sourceforge.io/Download) kompilieren, z. B. `makensis work/Juntos.nsi`. Die veröffentlichte Version wurde mit NSIS 3.0.4.1 aus den offiziellen electron-builder-binaries gebaut.

Ergebnis: `outputs/Juntos-Setup-1.0.0-x64.exe`. Das Paket enthält die vollständige Laufzeit und den Mateo-Installer. Die Installation der Stimme erfolgt über eine Windows-Abfrage für Administratorrechte. Bei Abbruch kann der mitgelieferte Stimmeninstaller später im installierten Ordner `Sprachpakete` gestartet werden.

## Inhalte bearbeiten

- `work/spanish-topics.json`: Themen, Wörter und Sätze; aus `work/spanish_content.py` erzeugbar.
- `work/es-ui.json`: spanische Bedienoberfläche.
- `work/grammar-es.json`: Grammatikhinweise; beide Dateien aus `work/spanish_ui.py` erzeugbar.
- `DICTIONARY-NOTICE.txt` und `FREEDICT-LICENSE.txt`: Wörterbuchquelle und Lizenz.

Der Anpassungsschritt ist an das mitgelieferte Ausgangsbündel gebunden. Bei Änderungen der ursprünglichen Benutzeroberfläche müssen auch die Ersetzungsbereiche in `work/extracted.json` aktualisiert werden. Für mehrere zusätzliche Sprachen empfiehlt sich als nächster Entwicklungsschritt eine gemeinsame Engine mit Sprachpaketen; dieser Umbau ist nicht Bestandteil der vorliegenden Veröffentlichung.
