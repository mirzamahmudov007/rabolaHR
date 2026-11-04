const fs = require('fs');
const path = require('path');

const roots = process.argv.slice(2);
const out = new Map();

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.next') walk(f); continue; }
    if (!/\.(ts|tsx)$/.test(e.name)) continue;
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/'((?:[^'\n\\]|\\.)*)'|`((?:[^`\n\\]|\\.)*)`/g)) {
      const v = (m[1] ?? m[2] ?? '').trim();
      if (v.length < 2) continue;
      if (!/[\p{L}]/u.test(v)) continue;
      if (/^[a-zA-Z0-9_.\-/]+$/.test(v) && !/['’]/.test(v) && v.length < 18 && /^[a-z]/.test(v)) continue; // camel ids
      if (/^#|^[a-z]+-\$|^(bg|text|border|ring|hover|focus|md|sm|lg|xl)-/.test(v)) continue;
      if (/^(src|app|features|shared)\//.test(v)) continue;
      if (/^[\d\s:.\-–—%]+$/.test(v)) continue;
      if (!out.has(v)) out.set(v, new Set());
      out.get(v).add(f.replace('src/', ''));
    }
  }
}

roots.forEach(walk);
const rows = [...out.entries()].sort((a, b) => a[0].localeCompare(b[0]));
console.log('TOTAL', rows.length);
for (const [v, files] of rows) console.log(JSON.stringify(v) + '  <-  ' + [...files].join(', '));
