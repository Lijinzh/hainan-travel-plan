const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'qa']);
const errors = [];

function collectHtml(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(fullPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

function isExternal(reference) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(reference);
}

for (const htmlPath of collectHtml(workspaceRoot)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const references = html.matchAll(/(?:href|src)="([^"]+)"/g);

  for (const match of references) {
    const reference = match[1];
    if (!reference || reference.startsWith('#') || isExternal(reference)) continue;

    const cleanReference = decodeURIComponent(reference.split('#')[0].split('?')[0]);
    if (cleanReference.endsWith('.md')) {
      errors.push(`${path.relative(workspaceRoot, htmlPath)} -> Markdown link: ${reference}`);
      continue;
    }

    let target = path.resolve(path.dirname(htmlPath), cleanReference);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) {
      errors.push(`${path.relative(workspaceRoot, htmlPath)} -> Missing: ${reference}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('All local HTML links and assets resolve; no HTML page links to Markdown.');
}
