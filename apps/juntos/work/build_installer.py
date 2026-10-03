from pathlib import Path
import json

root=Path.cwd()
app=root/'outputs/Juntos'
readme=app/'LIESMICH.txt'
text=readme.read_text(encoding='utf-8')
start=text.index('Speicherersparnis auf diesem Rechner:')
end=text.index('Wörterbuchquelle und Lizenz:', start)
text=text[:start]+'''Installation auf einem anderen Rechner: Juntos-Setup-1.0.0-x64.exe starten.
Der Installer enthält die vollständige Anwendung und die spanische Stimme Mateo.
Für die Installation der Stimme werden Administratorrechte abgefragt.
Die Anwendung selbst wird für den aktuellen Windows-Benutzer installiert.
Der Installer benötigt keinen Internetzugang. Lernstände werden separat gespeichert
und bleiben bei der Deinstallation erhalten.

'''+text[end:]
readme.write_text(text, encoding='utf-8')
files=sorted(p.relative_to(app) for p in app.rglob('*') if p.is_file())
delete='\n'.join('  Delete "$INSTDIR\\'+str(p)+'"' for p in files)
nsi=r'''Unicode true
!include "MUI2.nsh"
!include "FileFunc.nsh"
Name "Juntos – Deutsch und Spanisch"
OutFile "@ROOT@\outputs\Juntos-Setup-1.0.0-x64.exe"
InstallDir "$LOCALAPPDATA\Programs\Juntos"
RequestExecutionLevel user
SetCompressor /SOLID lzma
SetCompressorDictSize 32
BrandingText "Juntos – 720 Lernkarten und Offline-Wörterbuch"
VIProductVersion "1.0.0.0"
VIAddVersionKey /LANG=1031 "ProductName" "Juntos Deutsch–Spanisch"
VIAddVersionKey /LANG=1031 "FileDescription" "Juntos Offline-Installationspaket"
VIAddVersionKey /LANG=1031 "FileVersion" "1.0.0"
VIAddVersionKey /LANG=1031 "LegalCopyright" "Open-Source-Komponenten: siehe enthaltene Lizenzen"
Var TestMode
!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "German"
Function .onInit
  ${GetParameters} $0
  ClearErrors
  ${GetOptions} $0 "/TEST" $1
  IfErrors +2
  StrCpy $TestMode "1"
FunctionEnd
Section "Juntos (erforderlich)" SEC_APP
  SectionIn RO
  SetOutPath "$INSTDIR"
  File /r "@ROOT@\outputs\Juntos\*"
  SetOutPath "$INSTDIR\Sprachpakete"
  File /oname=RHVoice-Mateo-setup.exe "@ROOT@\work\downloads\RHVoice-Mateo-setup.exe"
  WriteUninstaller "$INSTDIR\Juntos-deinstallieren.exe"
  StrCmp $TestMode "1" app_done
  SetShellVarContext current
  CreateDirectory "$SMPROGRAMS\Juntos"
  CreateShortcut "$SMPROGRAMS\Juntos\Juntos.lnk" "$INSTDIR\Juntos.exe"
  CreateShortcut "$DESKTOP\Juntos.lnk" "$INSTDIR\Juntos.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Juntos" "DisplayName" "Juntos – Deutsch und Spanisch"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Juntos" "DisplayVersion" "1.0.0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Juntos" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Juntos" "UninstallString" '$\"$INSTDIR\Juntos-deinstallieren.exe$\"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Juntos" "DisplayIcon" "$INSTDIR\Juntos.exe"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Juntos" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Juntos" "NoRepair" 1
  app_done:
SectionEnd
Section "Spanische Vorlesestimme Mateo" SEC_VOICE
  StrCmp $TestMode "1" voice_done
  DetailPrint "Installiere Mateo. Windows fragt dafür Administratorrechte ab."
  ExecWait `"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -WindowStyle Hidden -Command "try { $$p = Start-Process -FilePath '$INSTDIR\Sprachpakete\RHVoice-Mateo-setup.exe' -ArgumentList '/S' -Verb RunAs -Wait -PassThru; exit $$p.ExitCode } catch { exit 1 }"` $0
  StrCmp $0 "0" voice_done
  MessageBox MB_OK|MB_ICONEXCLAMATION "Die Installation der Vorlesestimme wurde nicht abgeschlossen. Sie können sie später im Unterordner Sprachpakete erneut starten."
  voice_done:
SectionEnd
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC_APP} "720 Lernkarten, 16 Themen und das deutsch-spanische Offline-Wörterbuch."
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC_VOICE} "Offline-Vorlesen mit RHVoice Mateo. Für die Stimme sind Administratorrechte erforderlich."
!insertmacro MUI_FUNCTION_DESCRIPTION_END
Function un.onInit
  ${GetParameters} $0
  ClearErrors
  ${GetOptions} $0 "/TEST" $1
  IfErrors +2
  StrCpy $TestMode "1"
FunctionEnd
Section "Uninstall"
  StrCmp $TestMode "1" un_files
  SetShellVarContext current
  Delete "$SMPROGRAMS\Juntos\Juntos.lnk"
  RMDir "$SMPROGRAMS\Juntos"
  Delete "$DESKTOP\Juntos.lnk"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Juntos"
  un_files:
@DELETE@
  Delete "$INSTDIR\Sprachpakete\RHVoice-Mateo-setup.exe"
  Delete "$INSTDIR\Juntos-deinstallieren.exe"
  RMDir "$INSTDIR\Sprachpakete"
  RMDir "$INSTDIR\resources"
  RMDir "$INSTDIR\locales"
  RMDir "$INSTDIR"
SectionEnd
'''.replace('@ROOT@',str(root)).replace('@DELETE@',delete)
(root/'work/Juntos.nsi').write_text(nsi,encoding='utf-8-sig')
(root/'work/installer-manifest.json').write_text(json.dumps([str(p) for p in files]),encoding='utf-8')
