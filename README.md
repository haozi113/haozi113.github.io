# 个人主页

一个纯静态的单页个人主页，只需要浏览器就能打开，不需要任何构建工具。

**风格方向**：简约专业 + 轻微科技感，信息层次优先，浅色/深色双主题。

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面结构与所有文字内容 |
| `styles.css` | 全部样式（配色变量集中在文件顶部的 `:root`） |
| `script.js` | 交互逻辑（主题切换、动画、复制邮箱等） |

## 怎么打开

直接双击 `index.html` 即可。

如果想用本地服务器预览（推荐，行为更接近线上）：

```powershell
# 在项目根目录执行，任选其一
python -m http.server 8000
npx serve .
```

然后访问 http://localhost:8000

## 怎么改成你自己的内容

1. **头像**：现在用的是 `avatar.png`（`<img class="avatar" src="avatar.png" alt="钱俊昊" />`）。
   想换照片，直接把新图片命名成 `avatar.png` 覆盖掉旧文件即可，代码不用改。
   如果新照片里人物偏高或偏低，调 `styles.css` 里 `.avatar` 的 `object-position`
   第二个数值（百分比越大，画面越往下移）。
2. **身份描述**：首屏的 `hero-desc`、卡片里的 `hero-card-title`，以及“关于我”的正文。
3. **技能数值**：找到 `style="--w:88%"`，把百分比改成符合你情况的数值。
4. **数字统计**：找到 `data-count="5"`，修改数字与 `data-suffix`。
5. **竞赛卡片**：`#awards` 里的每张 `.project-card`（复用项目卡样式），
   要增删比赛直接复制一整块 `<article>` 即可；新卡片记得加个 `.thumb-6` 之类的渐变色。
6. **时间线**：`#education` 里的 `.tl-item`。
7. **打字机文案**：在 `script.js` 的 `words` 数组里增删。

## 页面上现在有什么

| 板块 | 内容 |
| --- | --- |
| 首屏 | 钱俊昊 · 上海师范大学（大三）· 数学建模方向，四个数字统计 |
| 关于我 | 自我介绍 + 基础信息卡 + 关注方向 |
| 技能 | 数学建模能力 / 常用工具 / 知识储备 |
| 竞赛与荣誉 | 数学竞赛省级二等奖、MathorCup 省二等奖、数模国赛、化学实验竞赛（含实验创新设计）上海赛区三等奖 |
| 教育经历 | 上海师范大学 2024 — 至今，以及接下来的计划 |
| 数字分身 | 离线预设问答（v0.1）：知识库在 `script.js` 的 `KB` 数组里，快捷问题在 `#chatChips` |
| 联系 | 邮箱（1000572273@smail.shnu.edu.cn）、学校 |

## 还需要补的信息

| 位置 | 现在写的是什么 | 换成什么 |
| --- | --- | --- |
| 头像 | 已换成 `avatar.png`（154×219，分辨率偏低） | 有条件的话换一张更大的原图，文件名保持 `avatar.png` |
| 竞赛细节 | 只写了奖项名称与等级 | 数模国赛最终有没有获奖、各项比赛的年份 |
| 入学年份 | 时间线写的是 2024 — 至今 | 按你的实际入学年份改 |
| 技能横条 | 我按常规估的百分比 | 改成你自己的感受 |

## 数字分身与常见问题

- 行为规范写在根目录的《分身说明书.md》里：身份、事实清单、说话方式、边界、校准样本、排错表都在那。
- 问答内容全部来自 `script.js` 里的 `KB` 数组（触发词 + 回答），改资料时记得同步这里。
- 快捷问题按钮在 `index.html` 的 `#chatChips` 里，增删按钮改那里。
- 右下角有常驻的「问我」浮动入口（`#chatLauncher`），滚到问答区时会自动隐藏。
- `#twin` 区块下半部分是 FAQ（原生 `<details>`，不依赖 JS）。
- **安全底线**：以后接真实大模型时，API Key 绝对不能写进这几个前端文件，要放在服务端代理里。

## 存档与回退（Git 最小闭环）

项目已经是一个 git 仓库，常用就三条命令：

```powershell
git add -A                                  # 把改动放进暂存区
git commit -m "存档：改了什么"                # 存一个可以回来的点
git log --oneline                            # 看历史；要退回某个版本用 git checkout <版本号> -- .
```

想回到上一个可用版本：`git checkout HEAD -- .`（丢弃当前未提交的改动）。

## 接入真正的 AI（可选）

默认是离线预设问答。想让它变成真会聊的分身，需要一层服务端代理来保管 API Key
（**Key 不能写进前端代码**）。代理代码已经写好：`server/worker.js`，对应 Cloudflare Workers。

1. 注册 Cloudflare → **Workers & Pages → Create → Worker**，名字随意（如 `twin-proxy`），先 Deploy。
2. **Edit code** → 把 `server/worker.js` 全文粘进去 → Deploy。
3. **Settings → Variables and Secrets** 添加：
   - `DEEPSEEK_API_KEY` = 你的 DeepSeek Key（类型选 **Secret**）
   - `DEEPSEEK_MODEL` = 可选，默认 `deepseek-flash`（以 DeepSeek 控制台显示的模型名为准）
   - `ALLOW_ORIGIN` = 可选，上线后建议改成 `https://haozi113.github.io`
4. 复制 Worker 地址（形如 `https://twin-proxy.xxx.workers.dev`），填进 `script.js` 顶部的 `TWIN_API`。
5. 把 `index.html`、`script.js`、`styles.css` 传到 GitHub，刷新页面即可。

代理里已经做了三层保护：单次回答限制 `max_tokens: 400`、单个 IP 每分钟最多 6 次、
提问最长 300 字。接口不通时页面会自动回落到离线知识库，不会开天窗。

### 怎么让它"更像你"（校准循环）

让它像你的不是形容词，而是**样本**。改口味按这个顺序，每次只动一层：

1. **改语气** → 打开 `server/worker.js` 里的 `FEW_SHOT`，把你希望的回答写成"问 + 答"一对，
   照着现在那 6 组的长度和口吻写。加一对就多一分像。
2. **改事实** → 先改《分身说明书.md》，再同步两份：`worker.js` 的 `SYSTEM_PROMPT`（给 AI 看的）
   和 `script.js` 的 `KB`（离线兜底用的）。两边不一致时，访客会在"接口通"和"接口挂"两种状态下听到不同答案。
3. **改边界** → 想让它拒答什么，就在 `SYSTEM_PROMPT` 的【边界】里补一条，并在 `FEW_SHOT` 里放一个
   拒答示范——示范比规则管用。

调完把 `worker.js` 重新部署一次（或把 `script.js` 传上 GitHub），改一处、看一眼，别同时改好几层。

### 想用免费模型？换三个变量就行，不用改代码

| 平台 | UPSTREAM_URL | 说明 |
| --- | --- | --- |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | 有免费的 Flash 型号，国内直连，实名即可 |
| 硅基流动 | `https://api.siliconflow.cn/v1/chat/completions` | 有免费小模型，国内直连 |
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` | 有 `:free` 结尾的免费模型，注意每日额度 |
| DeepSeek（默认） | `https://api.deepseek.com/chat/completions` | 不免费但极便宜 |

在 Cloudflare 里把 `UPSTREAM_URL` 和 `MODEL` 改成对应平台的值，`UPSTREAM_KEY` 换成那个平台的 Key，
重新部署即可。三个平台的接口路径都实测过，都是 OpenAI 兼容格式，无需改代码。

#### 免费方案的实测结论（2026-10-14 复核）

| 方案 | 要 Key 吗 | 要服务器吗 | 实测结论 |
| --- | --- | --- | --- |
| Pollinations（号称无需 Key） | 不要 | 不要 | ❌ 已返回 **402 需付费**，匿名不可用，不要采用 |
| 智谱 GLM 的 Flash 型号 | 要（免费领） | 要 | ✅ 推荐：免费额度、国内直连、中文原生 |
| 硅基流动免费小模型 | 要（免费领） | 要 | ✅ 可用，模型偏小，回答短 |
| OpenRouter `:free` 模型 | 要（免费领） | 要 | ✅ 可用，但国内线路不稳、有每日额度上限 |

**结论**：现在没有"不需要 Key 又能在浏览器里安全调用"的免费模型。OpenRouter 文档里的
`HTTP-Referer` 是用于排名统计的可选头，**不是**域名白名单，别指望用它来保护 Key。
所以免费 AI 的最小路径 = 一个免费 Key + 一层代理（本仓库的 `server/worker.js`）。

### 当前线上用的是哪种接法（2026-10-14 记）

**用的是「直连模式」**：`script.js` 顶部的 `ZHIPU` 配置里放着智谱的 Key 和免费模型列表，
浏览器直接调用，不需要任何服务器，国内可访问。代价写在下面。

代理那条路也已经部署好了（Cloudflare Worker `twin-proxy`，账号 `haozi113` 子域），
但实测发现 **`workers.dev` 域名在国内被 DNS 污染**：`twin-proxy.haozi113.workers.dev`
解析到 `192.133.77.145`（Facebook 的地址段），TCP 连不上。
而 `pages.dev`、`api.cloudflare.com` 解析正常——所以 Cloudflare 本身没问题，
是 `workers.dev` 这个域名被针对了。

**想切回更安全的代理模式**（Key 藏在服务端）：需要一个自己的域名（约 40 元/年），
在 Cloudflare 里把域名绑到 Worker 上，然后把 `script.js` 的 `TWIN_API` 填成那个域名，
并把 `ZHIPU.key` 清空即可。代码开关已经留好，不用改逻辑。

> ⚠️ **直连模式的安全代价**：`script.js` 里那串 Key 会随代码公开。
> 它只能消耗你的免费额度，但演示结束后请立刻去智谱后台删掉或重置这个 Key。

## 配色方案

改 `styles.css` 顶部 `:root` 中的 `--accent` 和 `--accent-2` 两个值，
整站的主色调就换了；深色模式对应 `[data-theme="dark"]` 中的同名变量。

## 已实现的功能

- 响应式布局（手机 / 平板 / 桌面）
- 浅色 / 深色主题切换，自动跟随系统并记住选择
- 滚动入场动画、数字滚动、打字机效果
- 导航自动高亮当前板块
- 一键复制邮箱、回到顶部
- 尊重 `prefers-reduced-motion`，支持打印样式
