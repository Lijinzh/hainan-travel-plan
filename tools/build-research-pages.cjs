const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['.git', 'qa', 'tools', 'node_modules']);

marked.setOptions({ gfm: true, breaks: false });

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function collectMarkdown(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(fullPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

function pageTemplate({ title, body, prefix }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="我们的海南环岛计划详细调研：${escapeHtml(title)}" />
    <title>${escapeHtml(title)}｜我们的海南计划</title>
    <link rel="icon" href="${prefix}assets/site/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="${prefix}research.css" />
  </head>
  <body>
    <header class="research-header">
      <a class="research-brand" href="${prefix}index.html">我们的海南计划</a>
      <a class="back-link" href="${prefix}index.html">← 回到计划首页</a>
    </header>
    <main class="research-shell">
      <p class="document-note">朋友讨论版 · 详细资料</p>
      <article class="research-content">${body}</article>
      <aside class="research-footer-note">
        <strong>这是一份可继续修改的计划资料。</strong>
        <p>航班、天气、海况、酒店价格和交通规定都可能变化。发现不合理的地方时，先回到首页对照路线和待讨论事项。</p>
        <a href="${prefix}index.html#decision">回到待讨论事项</a>
      </aside>
    </main>
    <footer class="research-footer">我们的海南计划 · 详细资料页</footer>
  </body>
</html>`;
}

for (const markdownPath of collectMarkdown(root)) {
  const relative = path.relative(root, markdownPath);
  const depth = relative.split(path.sep).length - 1;
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  const markdown = fs.readFileSync(markdownPath, 'utf8');
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || path.basename(markdownPath, '.md');
  let body = marked.parse(markdown);

  body = body.replace(/href="([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"');

  const outputPath = markdownPath.replace(/\.md$/i, '.html');
  fs.writeFileSync(outputPath, pageTemplate({ title, body, prefix }), 'utf8');
  console.log(path.relative(root, outputPath));
}
