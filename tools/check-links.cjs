const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'qa']);
const errors = [];

function collectRelativeFiles(directory, extension, root = directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectRelativeFiles(fullPath, extension, root);
    if (!entry.isFile() || !entry.name.endsWith(extension)) return [];
    return [path.relative(root, fullPath)];
  });
}

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

for (const entry of fs.readdirSync(path.join(workspaceRoot, 'plans'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const planRoot = path.join(workspaceRoot, 'plans', entry.name);
  const configPath = path.join(planRoot, 'plan.json');
  if (!fs.existsSync(configPath)) continue;
  const plan = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  for (const localeConfig of Object.values(plan.locales || {})) {
    const sourceRoot = path.join(planRoot, plan.contentDirectory || 'content');
    const localeRoot = path.join(planRoot, localeConfig.contentDirectory);
    const sourceFiles = collectRelativeFiles(sourceRoot, '.md').sort();
    const localeFiles = collectRelativeFiles(localeRoot, '.md').sort();
    const sourceSet = new Set(sourceFiles);
    const localeSet = new Set(localeFiles);

    for (const file of sourceFiles) {
      if (!localeSet.has(file)) errors.push(`${path.relative(workspaceRoot, localeRoot)} -> Missing locale source: ${file}`);
    }
    for (const file of localeFiles) {
      if (!sourceSet.has(file)) errors.push(`${path.relative(workspaceRoot, localeRoot)} -> Orphan locale source: ${file}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('All local HTML links and assets resolve; no HTML page links to Markdown.');
}
