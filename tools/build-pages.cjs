const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const workspaceRoot = path.resolve(__dirname, '..');
const plansRoot = path.join(workspaceRoot, 'plans');

marked.setOptions({ gfm: true, breaks: false });

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function collectMarkdown(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(fullPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

function pageTemplate({ plan, title, body, prefix }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="${escapeHtml(plan.description)}：${escapeHtml(title)}" />
    <title>${escapeHtml(title)}｜${escapeHtml(plan.title)}</title>
    <link rel="icon" href="${prefix}assets/site/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="${prefix}assets/styles/research.css" />
  </head>
  <body>
    <header class="research-header">
      <a class="research-brand" href="${prefix}index.html">${escapeHtml(plan.title)}</a>
      <nav aria-label="页面导航">
        <a class="back-link" href="${prefix}index.html">回到海南计划</a>
        <a class="back-link" href="${prefix}../../index.html">全部旅行计划</a>
      </nav>
    </header>
    <main class="research-shell">
      <p class="document-note">朋友讨论版 · 详细资料</p>
      <article class="research-content">${body}</article>
      <aside class="research-footer-note">
        <strong>这是一份可继续修改的计划资料。</strong>
        <p>航班、天气、海况、酒店价格和交通规定都可能变化。发现不合理的地方时，先回到计划首页对照路线和待讨论事项。</p>
        <a href="${prefix}index.html#decision">回到待讨论事项</a>
      </aside>
    </main>
    <footer class="research-footer">${escapeHtml(plan.title)} · 详细资料页</footer>
  </body>
</html>`;
}

function buildPlan(planDirectory) {
  const configPath = path.join(planDirectory, 'plan.json');
  if (!fs.existsSync(configPath)) return;

  const plan = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const contentRoot = path.join(planDirectory, plan.contentDirectory || 'content');
  const outputRoot = path.join(planDirectory, plan.outputDirectory || 'pages');

  if (!fs.existsSync(contentRoot)) {
    throw new Error(`Missing content directory: ${path.relative(workspaceRoot, contentRoot)}`);
  }

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  for (const markdownPath of collectMarkdown(contentRoot)) {
    const relativeSource = path.relative(contentRoot, markdownPath);
    const relativePage = relativeSource.replace(/\.md$/i, '.html');
    const outputPath = path.join(outputRoot, relativePage);
    const depth = path.relative(planDirectory, path.dirname(outputPath)).split(path.sep).length;
    const prefix = '../'.repeat(depth);
    const markdown = fs.readFileSync(markdownPath, 'utf8');
    const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || path.basename(markdownPath, '.md');
    let body = marked.parse(markdown);

    body = body.replace(/href="([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, pageTemplate({ plan, title, body, prefix }), 'utf8');
    console.log(path.relative(workspaceRoot, outputPath));
  }
}

for (const entry of fs.readdirSync(plansRoot, { withFileTypes: true })) {
  if (entry.isDirectory()) buildPlan(path.join(plansRoot, entry.name));
}
