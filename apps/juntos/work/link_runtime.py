import argparse, json, os, shutil
from pathlib import Path
parser=argparse.ArgumentParser(description='Electron-Laufzeit für Juntos bereitstellen')
parser.add_argument('--runtime-dir',type=Path,default=Path('../zajedno/node_modules/electron/dist'))
parser.add_argument('--hardlink',action='store_true',help='Optional: vorhandene Dateien auf demselben Laufwerk teilen')
args=parser.parse_args()
src=args.runtime_dir.resolve()
assert src.is_dir(), f'Electron-Laufzeit fehlt: {src}. In apps/zajedno zuerst npm ci ausführen.'
dst=Path('outputs/Juntos')
exe=next((name for name in ['electron.exe','Zajedno.exe'] if (src/name).is_file()),None)
assert exe, 'Windows-Electron-Laufzeit erforderlich'
count=0
for p in src.rglob('*'):
    if not p.is_file(): continue
    rel=p.relative_to(src)
    if rel.parts[0]=='resources' or p.name.lower().startswith(('uninstall','rhvoice')): continue
    if rel.parts[0]=='locales' and p.name not in ['de.pak','en-US.pak','es.pak','es-419.pak']: continue
    target=dst/('Juntos.exe' if p.name==exe else rel)
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists(): continue
    if args.hardlink: os.link(p,target)
    else: shutil.copy2(p,target)
    count+=1
print(json.dumps({'runtimeFilesAdded':count,'output':str(dst)}))
