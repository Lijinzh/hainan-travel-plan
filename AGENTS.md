# TravelPlanner 项目协作规则

## 项目目标

这是一个持续维护的个人旅行计划与 GitHub Pages 静态网站仓库。根页面汇总所有目的地，`plans/` 下每个目录保存一份彼此独立的旅行计划。

当前主要计划是 `plans/hainan/`：两位朋友从长沙出发的海南 7 天东线旅行。网站同时承担行程讨论、资料归档、预算估算、装备核对和公开浏览功能。

## 目录与维护边界

- `index.html`：全部旅行计划的总入口，手工维护。
- `assets/`：总入口使用的公共样式与资源。
- `plans/<destination>/index.html`：目的地计划首页，手工维护。
- `plans/<destination>/plan.json`：目的地名称、标题、描述和生成目录配置。
- `plans/<destination>/content/`：详细资料的 Markdown 原稿，是内容的唯一真实来源。
- `plans/<destination>/content-en/`：英文详细资料原稿，与中文 Markdown 保持相同相对路径。
- `plans/<destination>/pages/`：由 `tools/build-pages.cjs` 自动生成的 HTML。
- `plans/<destination>/pages-en/`：由英文 Markdown 自动生成的英文 HTML。
- `plans/<destination>/assets/`：目的地专属图片、样式、脚本和站点图标。
- `tools/build-pages.cjs`：将各目的地 Markdown 原稿转换为详细资料页。
- `tools/check-links.cjs`：检查本地 HTML 链接和资源引用。

不要直接维护 `plans/<destination>/pages/` 中的正文。详细资料需要修改时，先改对应的 `content/**/*.md`，再运行构建命令，并将原稿和生成后的 HTML 一起提交。

中文和英文内容必须成对维护。`content/` 与 `content-en/` 应拥有相同的相对 Markdown 路径；修改事实、日期、价格、路线或安全结论时，在同一轮改动中更新两种语言并重新生成 `pages/` 与 `pages-en/`。英文不是机器占位文本，应保持自然、准确并保留所有限制条件。

## 内容准确性

- 简体中文是主要语言；像素界面中的简短英文系统标签可以保留。
- 不虚构价格、库存、天气、海况、交通法规、酒店权益、营业状态、评分、距离或旅行体验。
- 机票、酒店、租车、天气、海况、景区开放和交通限制都属于动态信息。更新时必须注明查询日期、旅行日期、路线、税费、行李、退改或其他关键条件。
- 旧截图和历史价格只能作为历史样本，不得表述为当前报价或已锁定库存。
- 修改天数或旅行日期时，检查路线、住宿晚数、天气、交通、装备、预算、摄影计划、首页文案和生成页，避免留下旧日期或旧天数。
- 安全和法规优先于景点密度。不要为了行程或摄影建议危险驾驶、违规骑行、无人机禁飞区拍摄或不可靠的水上活动安排。

## 图片与许可

- 网页图片优先保存到 `plans/<destination>/assets/images/`，不要依赖第三方热链。
- 只使用用户拥有、明确授权、公共领域或具有清晰开放许可的图片。
- 不得未经许可下载并重新发布小红书、抖音、图虫、视觉中国、旅游平台或普通网页中的受版权保护图片。
- 新增或替换第三方图片时，同步更新该计划的 `content/sources/image-credits.md`，记录本地文件、作品页、作者、许可和必要的衍生处理说明，然后重新生成页面。
- 有意义的图片必须提供准确的中文替代文本。装饰图片应使用空 `alt`。
- 提交前应适当压缩大图，同时保证桌面展示清晰；避免仅为展示加入体积过大的原始文件。

## 视觉与前端规则

- 保持现有 8-bit 像素旅行日志方向：深蓝黑、米白、青色、橙色和金色，使用硬边框、像素阴影、扫描线和清晰的层级。
- 图标和品牌标记使用像素化、硬边缘绘制；不要引入与整体风格冲突的圆润渐变图标或通用企业模板。
- 保持页面可读性，不要为了像素效果牺牲中文正文、价格、日期、图表和交互状态的辨识度。
- 所有有意义的交互控件必须支持键盘操作，并保留清晰的焦点状态。
- 外部链接使用新窗口时必须带 `rel="noreferrer"`。
- 尊重 `prefers-reduced-motion`，不要把重要内容隐藏在动画之后。
- 修改样式或布局后，至少验证桌面 `1440 × 1000` 和手机 `390 × 844`，不得出现横向滚动、内容裁切、遮挡、图片破损或不可操作的导航。

## 构建与验证

首次安装依赖：

```powershell
pnpm install
```

常用命令：

```powershell
pnpm build
pnpm check
pnpm verify
git diff --check
```

提交任何内容或前端变更前，至少运行：

```powershell
pnpm verify
git diff --check
```

`pnpm verify` 会重新生成 `plans/*/pages/`，因此运行后必须检查生成文件是否属于预期改动。

如果 Windows 环境中 `node` 不在 `PATH`，优先使用 Codex 工作区提供的 Node：

```powershell
& 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tools\build-pages.cjs
& 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tools\check-links.cjs
```

渲染页面变更还必须检查：

1. 页面标题和主要内容正确加载，不是空白页或错误页。
2. 本地图片完成加载，`naturalWidth` 和 `naturalHeight` 均大于零。
3. 控制台没有与本站有关的错误或警告。
4. 至少实际操作一个受影响的控件，例如手机菜单、行李勾选或预算开关。
5. 桌面和 `390 × 844` 手机视口没有横向溢出或布局破损。

## 新增目的地

新增目的地时，在 `plans/` 下创建独立同级目录，并遵循现有结构：

```text
plans/<destination>/
├─ index.html
├─ plan.json
├─ README.md
├─ content/
├─ pages/
└─ assets/
```

同时在根目录 `index.html` 增加入口。不要为了新增计划修改无关目的地的内容。

## Git 与发布

- 生产分支为 `main`，GitHub Pages 从仓库根目录发布。
- 当前正式远端为 `origin`：`git@github.com:Lijinzh/travel-planner.git`。
- 保留用户已有及无关改动，不使用 `git reset --hard`、强制推送或其他破坏性操作。
- 提交前检查 `git status`、差异和未跟踪文件，只提交当前任务范围内的内容。
- 需要“全部同步”时，先 `git fetch --prune`，只进行可安全解释的快进或普通整合，不使用 force push。
- 推送后验证本地 `HEAD`、`origin/main` 和 `git ls-remote` 的提交一致，并确认分歧为 `0/0`、工作区干净。
- 页面发布不能只以 Git 推送成功为准。必须等待 GitHub Pages 构建对应提交完成，再用带缓存绕过参数的线上 URL 检查桌面和手机页面。
- 只有源代码、远端提交和实际线上网页均已验证，才能宣称发布完成。

## 安全与隐私

- 这是公开仓库。不要提交 API 密钥、令牌、Cookie、`.env`、私人地址、证件、订单号、精确个人行踪或其他敏感信息。
- 截图和旅行证据提交前应检查是否包含姓名、手机号、会员号、支付信息或可识别的私人数据。
- 不要把临时测试脚本、浏览器配置、下载缓存或 QA 截图提交到仓库，除非用户明确要求将它们作为正式项目资源。
