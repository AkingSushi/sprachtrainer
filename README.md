# Sprachtrainer: Zajedno und Juntos

Lokale Windows-Lernprogramme für Deutsch und weitere Sprachen. Ohne Konto, Internetverbindung oder laufende Gebühren im Betrieb.

## Installieren und teilen

**[Alle Downloads öffnen](https://github.com/AkingSushi/sprachtrainer/releases/latest)**

| Anwendung | Sprachen | Lernkarten | Windows-Installer |
|---|---|---:|---|
| Zajedno 1.3.0 | Deutsch ↔ Serbisch | 420 | [Zajedno herunterladen](https://github.com/AkingSushi/sprachtrainer/releases/download/v2026.10.03/Zajedno-1.3.0-x64-nsis.exe) |
| Juntos 1.0.0 | Deutsch ↔ Spanisch | 720 | [Juntos herunterladen](https://github.com/AkingSushi/sprachtrainer/releases/download/v2026.10.03/Juntos-Setup-1.0.0-x64.exe) |

Für Windows mit 64 Bit. Eine Installer-Datei genügt zum Übertragen auf einen USB-Stick. Lernfortschritte sind separat: in der Anwendung eine Sicherung exportieren und auf dem Zielrechner wiederherstellen. Die beiden Sprachversionen verwenden getrennte Lernstände und Sicherungsformate.

Juntos enthält das deutsch-spanische Offline-Wörterbuch (36.744 Stichwörter, 57.601 Übersetzungszeilen) und den Installer für RHVoice Mateo. Die Stimme verlangt Administratorrechte und spricht lateinamerikanisch. Die Lernkarten verwenden überwiegend spanischen Sprachgebrauch aus Spanien; A1–B2 dient als Orientierung, nicht als zertifizierte Einstufung.

Der unveränderte Zajedno-Installer enthält das serbische Wörterbuch, aber keine serbische Stimme. **[RHVoice Dragana](https://github.com/AkingSushi/sprachtrainer/releases/download/v2026.10.03/RHVoice-voice-Serbian-Dragana-v4.9.1014.22-setup.exe)** daher zusätzlich herunterladen und installieren; danach Zajedno neu starten.

Die Installer sind nicht digital signiert. Windows kann einen unbekannten Herausgeber melden.

## Gemeinsames Repository

```text
apps/
  zajedno/    ursprünglicher TypeScript-/React-/Electron-Quellcode
  juntos/     spanische Lerninhalte, Anpassungs- und Installationsskripte
languages/
  de-sr.json  Metadaten der serbischen Anwendung
  de-es.json  Metadaten der spanischen Anwendung
docs/
  WEITERE-SPRACHEN.md
```

Installer und Electron-Laufzeitdateien liegen in GitHub Releases, nicht in der Git-Historie. Persönliche Profile, Lernstände und lokale Projektverwaltungsdateien sind nicht enthalten.

Zajedno und Juntos sind derzeit zwei eigenständige Anwendungen. Juntos wird reproduzierbar aus einem mitgelieferten Zajedno-1.3.0-Bündel angepasst. Eine gemeinsame, dynamisch umschaltbare Sprach-Engine ist noch nicht implementiert. Das Bündel liegt mit Prüfsummen unter `apps/juntos/base`; die lesbaren Originalquellen stehen unter `apps/zajedno`.

## Entwicklung

Zajedno: siehe [Anleitung](apps/zajedno/README.md). Juntos: siehe [Build-Anleitung](apps/juntos/README.md). Neue Sprachen: siehe [Erweiterungsleitfaden](docs/WEITERE-SPRACHEN.md).

Die Wörterbücher und Drittanbieterkomponenten behalten ihre jeweiligen Lizenzen. Quellen, Bearbeitungsvermerke und Lizenztexte liegen bei jeder Anwendung. Für den eigenen Anwendungscode wurde mit dieser Veröffentlichung keine zusätzliche Lizenz gewählt.
