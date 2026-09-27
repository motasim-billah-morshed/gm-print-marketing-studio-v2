import fs from 'node:fs';
fs.mkdirSync('.public/workspace',{recursive:true});
for(const f of ['index.html','styles.css','bundle.js','requirements.json'])fs.copyFileSync(f,`.public/${f}`);
for(const f of fs.readdirSync('ui'))fs.copyFileSync(`ui/${f}`,`.public/workspace/${f}`);
console.log('Built allowlisted public files; private files and repository documents excluded.');
