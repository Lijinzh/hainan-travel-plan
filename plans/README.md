# 旅行计划目录

`plans/` 下的每个子目录代表一次独立的目的地计划。当前包含正在维护的 `dongguan/` 与保留的 `hainan/`，未来还可以继续增加其他目的地。

每个计划遵循同一结构：

```text
<destination>/
├─ index.html       # 给同行朋友看的计划首页
├─ plan.json        # 标题和构建配置
├─ README.md        # 该计划的维护说明
├─ content/         # Markdown 原稿
├─ content-en/      # 英文 Markdown 原稿，与 content/ 路径对应
├─ pages/           # 自动生成的 HTML
├─ pages-en/        # 自动生成的英文 HTML
└─ assets/          # 该目的地专属资源
```

根目录负责汇总，目的地目录彼此独立。新增计划时，不需要修改已有海南内容，只需要新增一个同级目录，并在根目录 `index.html` 增加入口。

支持英文的计划还需要在 `plan.json` 中配置 `locales.en`，并保持 `content/` 与 `content-en/` 的 Markdown 相对路径完全一致。
