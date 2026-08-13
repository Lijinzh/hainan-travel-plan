# Travel Planner

这是一个会持续更新的个人旅行计划仓库。当前任务是 **东莞自由潜旅行**，原有 **海南 7 天东线计划**继续保留。每个目的地都在 `plans/` 下拥有独立目录。

## 项目结构

```text
TravelPlanner/
├─ index.html                 # 所有旅行计划的总入口
├─ assets/                    # 总入口使用的公共样式
├─ plans/
│  ├─ README.md               # 新增目的地的约定
│  ├─ dongguan/               # 当前东莞自由潜计划
│  └─ hainan/                 # 保留的海南计划
└─ tools/
   └─ build-pages.cjs         # 为各目的地生成详细资料网页
```

## 当前计划

- [东莞｜向下潜，向外走](plans/dongguan/README.md)
- [海南｜去补上那片海](plans/hainan/README.md)（保留）

## 更新方法

1. 修改 `plans/<目的地>/content/` 中的 Markdown。
2. 运行 `pnpm install`（首次）和 `pnpm build`。
3. 检查 `plans/<目的地>/pages/` 中生成的网页。
4. 提交 Markdown 原稿和生成后的 HTML。

英文资料位于 `plans/<目的地>/content-en/`，通过同一构建命令生成到 `pages-en/`。中英文 Markdown 必须保持相同的相对路径，并在同一次内容更新中同步维护。

网页入口只链接 `.html`，不会把访客带到裸 Markdown 页面。

## 双语网页

- 中文总入口：`/`
- 英文总入口：`/en/`
- 中文东莞计划：`/plans/dongguan/`
- 英文东莞计划：`/plans/dongguan/en/`
- 中文海南计划：`/plans/hainan/`
- 英文海南计划：`/plans/hainan/en/`
