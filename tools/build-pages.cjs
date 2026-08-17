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

function pageTemplate({ plan, title, body, prefix, locale, relativePage }) {
  const english = locale === 'en';
  const lang = english ? 'en' : 'zh-CN';
  const currentPath = english ? `pages-en/${relativePage}` : `pages/${relativePage}`;
  const alternatePath = english ? `pages/${relativePage}` : `pages-en/${relativePage}`;
  const canonical = `https://lijinzh.github.io/travel-planner/plans/${plan.slug}/${currentPath.replaceAll('\\', '/')}`;
  const alternate = `https://lijinzh.github.io/travel-planner/plans/${plan.slug}/${alternatePath.replaceAll('\\', '/')}`;
  const planHome = english ? `${prefix}en/index.html` : `${prefix}index.html`;
  const archiveHome = english ? `${prefix}../../en/index.html` : `${prefix}../../index.html`;
  const alternateHref = `${prefix}${alternatePath.replaceAll('\\', '/')}`;
  const titleSeparator = english ? ' | ' : '｜';
  const descriptionSeparator = english ? ': ' : '：';
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#07090d" />
    <meta name="description" content="${escapeHtml(plan.description)}${descriptionSeparator}${escapeHtml(title)}" />
    <title>${escapeHtml(title)}${titleSeparator}${escapeHtml(plan.title)}</title>
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="zh-CN" href="${english ? alternate : canonical}" />
    <link rel="alternate" hreflang="en" href="${english ? canonical : alternate}" />
    <link rel="alternate" hreflang="x-default" href="${english ? alternate : canonical}" />
    <link rel="icon" href="${prefix}assets/site/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="${prefix}assets/site/favicon.png" type="image/png" sizes="64x64" />
    <link rel="apple-touch-icon" href="${prefix}assets/site/apple-touch-icon.png" />
    <link rel="stylesheet" href="${prefix}assets/styles/research.css" />
  </head>
  <body class="pixel-research">
    <div class="research-ticker" aria-hidden="true"><span>TRAVEL RESEARCH ARCHIVE // ${escapeHtml(plan.name)} // SOURCE CHECK // PLAYER NOTES //</span></div>
    <header class="research-header">
      <a class="research-brand" href="${planHome}"><b><img src="${prefix}assets/site/pixel-travel-icon.png" alt="" /></b><span>${escapeHtml(plan.title)}<small>RESEARCH FILE</small></span></a>
      <nav aria-label="${english ? 'Page navigation' : '页面导航'}">
        <a class="back-link" href="${planHome}">${english ? `${escapeHtml(plan.name)} plan` : `回到${escapeHtml(plan.name)}计划`}</a>
        <a class="back-link" href="${archiveHome}">${english ? 'All plans' : '全部旅行计划'}</a>
        <a class="research-language" href="${alternateHref}" hreflang="${english ? 'zh-CN' : 'en'}" lang="${english ? 'zh-CN' : 'en'}">${english ? '中文' : 'EN'}</a>
      </nav>
    </header>
    <main class="research-shell">
      <p class="document-note">${english ? 'FRIEND DISCUSSION · RESEARCH FILE' : '朋友讨论版 · 详细资料'}</p>
      <article class="research-content">${body}</article>
      <aside class="research-footer-note">
        <strong>${english ? 'This remains an editable planning document.' : '这是一份可继续修改的计划资料。'}</strong>
        <p>${english ? 'Flights, weather, marine conditions, hotel prices, and transport rules can change. Recheck the plan before booking.' : '航班、天气、海况、酒店价格和交通规定都可能变化。发现不合理的地方时，先回到计划首页对照路线和待讨论事项。'}</p>
        <a href="${planHome}#decision">${english ? 'Return to decisions' : '回到待讨论事项'}</a>
      </aside>
    </main>
    <footer class="research-footer">${escapeHtml(plan.title)} · ${english ? 'Research file' : '详细资料页'}</footer>
  </body>
</html>`;
}

function buildLocale(planDirectory, basePlan, localeConfig = {}, locale = 'zh-CN') {
  const plan = { ...basePlan, ...localeConfig };
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
    fs.writeFileSync(outputPath, pageTemplate({ plan, title, body, prefix, locale, relativePage }), 'utf8');
    console.log(path.relative(workspaceRoot, outputPath));
  }
}

function buildPlan(planDirectory) {
  const configPath = path.join(planDirectory, 'plan.json');
  if (!fs.existsSync(configPath)) return;

  const plan = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  buildLocale(planDirectory, plan, {}, 'zh-CN');
  for (const [locale, localeConfig] of Object.entries(plan.locales || {})) {
    buildLocale(planDirectory, plan, localeConfig, locale);
  }
}

for (const entry of fs.readdirSync(plansRoot, { withFileTypes: true })) {
  if (entry.isDirectory()) buildPlan(path.join(plansRoot, entry.name));
}
