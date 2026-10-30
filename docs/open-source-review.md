# FRAME 开发前开源与技能审查

## 当前安装验收状态（2026-10-30 更新）

主代理已使用本机内置安全 skill-installer，以本报告列明的固定 commit SHA 将 UI Craft、UI UX Pro Max、Vercel Web Design Guidelines 三项技能安装到项目 .agents/skills。三个 SKILL.md 均存在且可读取；UI UX Pro Max 的 search.py 已实际运行。没有安装 UI Craft MCP、UI Craft CLI 或 UI UX CLI；下文 CLI 命令保留为研究参考，不代表实际安装方式。

Codex 全局配置已备份至 work/backups/codex-config.before-skills.toml，未修改全局配置。报告原始研究阶段未执行安装的陈述，描述的是研究子任务当时的操作；项目当前状态以本节为准。

检查日期：2026-10-30。仅研究、保存源文件证据、查询 npm 公共漏洞数据库；没有安装全局技能、执行远程安装脚本、安装依赖或实现网站。

## 结论

FRAME 应使用用户指定的 React + TypeScript + Vite + Tailwind + React Router + lucide-react 从头实现。电影库只参考功能信息架构和数据类型，不继承运行环境、视觉设计或锁文件。三项技能作为开发与审查资料，均不需要成为网站的运行依赖。

UI Craft 采用官方支持的 skill-only 项目安装即可；无需配套 CLI、MCP、钩子或审查代理。UI UX Pro Max 可使用官方固定版本 CLI 在项目内生成；Vercel Web Design Guidelines 采用官方 skills CLI 定向项目安装。安装者应记录实际落地文件和哈希，区别“文件已安装”和“当前聊天技能目录已被自动发现”；当前聊天可以按绝对路径读取并使用。

## 固定版本与维护情况

| 仓库                                 | 审查默认分支 commit                      | commit 日期 UTC | LICENSE 实证                                                                 | 判断                                                                     |
| ------------------------------------ | ---------------------------------------- | --------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Lazhari/react-movies-finder          | 7a4c862d3e76de291c5f61fae6e9065a94f11b35 | 2026-03-31      | 根 LICENSE: MIT，2019 Lazhari                                                | 未归档；本次默认分支约 7 个月未提交，不能把 README 功能多等同于依赖安全  |
| educlopez/ui-craft                   | 49b751742b013ebb3e0495eb7992423185f04be0 | 2026-10-19      | 根 LICENSE: MIT，2026 Eduardo Calvo                                          | 未归档；仓库 pushed_at=2026-10-30，默认分支提交和其他分支推送日期需区分  |
| nextlevelbuilder/ui-ux-pro-max-skill | 28b3b8dee8c976df4fa3e94aed4e092ad43fcb03 | 2026-10-26      | 根 LICENSE: MIT，2024 Next Level Builder                                     | 未归档；近期仍修复搜索语义问题                                           |
| vercel-labs/agent-skills             | 1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62 | 2026-10-27      | README 宣称 MIT，但树中无 LICENSE 文件，API license=null，根 LICENSE 返回404 | 未归档；许可声明和实际许可证文件缺失应一并记录，不称为已核实 MIT LICENSE |

完整 API 元数据、README 原文和 LICENSE 原文在 github-evidence.json。各 commit 可通过 https://github.com/OWNER/REPO/commit/SHA 复核。

## 电影库的技术与功能复用

该仓库目前是 Screenbox v3，不是旧 CRA 应用。package.json 为 Next.js 16.2.1、React/React DOM 19.2.0、TypeScript ^5.8、Tailwind ^4.2.2、Radix/shadcn、Framer Motion ^12.38、lucide-react ^1.7、Embla。README 还声明 TMDB v3、Vercel 部署。不可把 Next App Router、Server Actions、next/image、next revalidate 配置原样搬到 Vite。

可借鉴：趋势/热门/即将上映入口、影片与剧集分类搜索、类型探索、影片详情、演员片目、系列电影、播放来源、随机挑片、localStorage 片单及分享链接。这些是参考产品思路，不要求 FRAME 全部照搬。

需重做：FRAME 的品牌、版式、色彩与字体、海报/剧照节奏、卡片与详情构图、响应式导航、交互状态、加载/空/错误反馈、键盘焦点、URL 中筛选与搜索状态，以及符合 React Router 的路由和数据适配层。内容密集影视产品可自然使用海报集合网格；技能中针对模板式落地页的禁令不能机械地禁止此类网格。

源码风险：

- src/lib/api/tmdb.ts 从服务端环境变量读取 TMDB key，使用 next: { revalidate: 3600 }。Vite 的 VITE_* 环境变量会进入浏览器包，不能照搬保密假设；正式需要私钥的集成应放可信服务端代理，演示则使用明确本地数据。
- src/hooks/use-watchlist.ts 的 readStorage 只 JSON.parse，没有验证数组/字段；writeStorage 未捕获存储拒绝/配额异常；decodeWatchlist 接受任意 Number 与首字符，缺少正整数/类型/上限验证。FRAME 应重写健壮存储，而非复制该 hook。
- 各 useWatchlist 实例持有各自 state，无统一订阅机制，跨组件/标签页同步需要另做。
- package.json 的 test 仅输出“tests are removed for the time being”后成功退出，不构成测试覆盖。

## npm 漏洞实测

使用每库固定 commit 的原始 package.json 与 package-lock.json，在研究目录内执行 npm audit --package-lock-only --ignore-scripts --json。未 npm install，未运行依赖生命周期脚本。数据库会随时间变化；下列计数为受影响依赖条目数，不是已验证可利用漏洞数。

| 对象                               | 结果                                         | 影响与限制                                                                                                             | 本地证据                      |
| ---------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Screenbox 上游整份锁文件           | 12：1 critical / 8 high / 2 moderate / 1 low | Next 条目达到 critical；含条件性的 RCE、DoS、SSRF 等多条公告，不能直接推断每条均在其部署配置中可利用；不继承这份依赖锁 | movie-audit/audit.json        |
| UI UX 官方 CLI 2.5.0 上游锁文件    | 0                                            | 不代表完整供应链安全认证；仅说明本次 npm 数据库未报已知依赖漏洞                                                        | uipro-cli-audit/audit.json    |
| UI Craft 可选 MCP 0.9.0 上游锁文件 | 5：2 high / 3 moderate                       | zod 为直接依赖高危条目，另有 body-parser、qs、fast-uri、@hono/node-server；只装文本 skill 不会引入该服务               | ui-craft-mcp-audit/audit.json |

Next 代表性公告：https://github.com/advisories/GHSA-p293-qw3h-jr36 、https://github.com/advisories/GHSA-2464-fhr4-w9xw 。这些为 npm 审计返回的风险匹配，尚未进行漏洞复现。

## 三项技能内容与边界

### UI Craft

已读 README 和 skills/ui-craft/SKILL.md。主目录含36个树条目，主要为 SKILL.md 和 references，未发现安装所需 symlink。可用于发现现有约束、建立最小 token、选择有目的的版式、控制强调色与动画、补齐状态/可访问性并做审查。主技能要求读取 craft-intent.md 和匹配 surface recipe；影视内容产品不应硬套营销落地页配方。

官方 README 推荐的 Windows“irm URL | iex”会立即执行远程脚本，本次没有使用。README 明确 npx skills add 为官方支持的仅技能安装，且去掉 -g 可项目级安装。仅技能模式不附带 MCP、钩子、独立代理或全套命令，必须如实说明。

主技能有一个非核心的 ../../examples/animation-storyboard.md 外部相对引用；若只安装 skills/ui-craft，动画分镜功能需单独读取上游该文件。常用 references 都在主技能目录内。不要为此擅自创建额外全局配置。

### UI UX Pro Max

已读 README、.claude/skills/ui-ux-pro-max/SKILL.md、search.py、core.py、design_system.py、CLI init.ts/template.ts 以及 Codex/universal 平台配置。完整可独立拷贝的 skill 在 .claude/skills/ui-ux-pro-max，而不是只含数据和脚本的 src/ui-ux-pro-max。该目录80个树条目，真实文件、无 symlink。

Python 核心搜索使用标准库，按脚本位置读取相邻 data。search.py 导入 core/design_system；design_system 再导入 reasoning_contract。执行时应使用落地 search.py 绝对路径。Claude 镜像 SKILL.md 示例含 CLAUDE_PLUGIN_ROOT，不应在 Codex 中逐字照抄。

官方 CLI 包名 ui-ux-pro-max-cli，版本2.5.0，命令仍为 uipro；不要安装旧 uipro-cli。init.ts 默认以 process.cwd() 为项目根，只有 --global 才走 home。cli/assets/templates/platforms/codex.json 明确 root=.agents、skillPath=skills/ui-ux-pro-max。--offline 是兼容选项，默认模板方式本来就从捆绑资产生成。CLI 还会拷贝6个附带设计子技能，安装范围比仅主技能大，应记录。

可用于检索产品风格、调色、字体、交互和 React/Tailwind 指导。数据库命中仅供参考，用户的 FRAME 方向和既有 token 优先；不要把泛化推荐当作自动设计结论。--persist 必须显式 --output-dir 项目路径；不覆盖已有 MASTER，除非已获 --force 授权。没有必要安装 Python 或其他系统软件来满足技能；先检查已有运行时。

### Vercel Web Design Guidelines

已读 README、skills/web-design-guidelines/SKILL.md 和其指定上游 command.md。技能本体是说明文档，无 Node 运行依赖或安装脚本。它要求每次审查前抓取 https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md ，因此固定技能 commit 不会固定未来规则，实际审查时应记录规则快照或抓取时间。

检查点包括语义 HTML、按钮与链接职责、标签、键盘与可见焦点、异步反馈、图片尺寸和加载优先级、reduced-motion、URL 状态、触控、主题色及字体性能。规则需结合实际功能判断，不能机械给原生 button 额外添加重复键盘处理。根 LICENSE 缺失问题见上表，保留 README 许可声明和来源。

## 官方安装命令与较小范围替代

以下命令由主代理负责执行。本次研究未执行安装。必须在 D:\Codex\FrameCinema 作为 cwd，不传 -g、--global 或 --all；--copy 避免 Windows symlink 权限问题。

UI Craft：npx skills add https://github.com/educlopez/ui-craft/tree/49b751742b013ebb3e0495eb7992423185f04be0/skills/ui-craft --skill ui-craft -a codex --copy -y

Vercel：npx skills add https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines --skill web-design-guidelines -a codex --copy -y

UI UX（先预览）：npx --package ui-ux-pro-max-cli@2.5.0 uipro init --ai codex --offline --dry-run

UI UX（预览路径正确后）：npx --package ui-ux-pro-max-cli@2.5.0 uipro init --ai codex --offline

skills CLI 官方 README 当前要求 Node>=22.20；应先检查运行时。可进一步把 skills 自身固定到验证版本，避免未固定 npx latest 的漂移；本研究没有查询其 npm 发布版本，不应编造版本号。

本机已提供 skill-installer 的安装脚本，经审阅只下载归档、校验路径和复制文件。若官方 CLI 因网络或兼容性失败，可作为项目级等价安装替代，必须记录采用了替代方式：
python C:\Users\m1965\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py --repo OWNER/REPO --ref COMMIT --path EXACT_SKILL_PATH --dest D:\Codex\FrameCinema\.agents\skills --method download

三项 EXACT_SKILL_PATH 分别为 skills/ui-craft、.claude/skills/ui-ux-pro-max、skills/web-design-guidelines。该替代不会运行远程安装代码，也不会带入 MCP/钩子。Python helper 默认临时目录不在项目；若严格要求所有写入均留项目，应为该进程指定项目 work 下的临时目录或下载到项目后作路径审查复制。

官方 skills CLI 文档另明确支持从本地目录安装；可先用 Git 获取并审查固定 SHA，再将上述 URL 换成已审查的本地 skill 目录，实现使用官方安装器且固定源内容。

安装验收应确认三个 SKILL.md 均存在、frontmatter name 正确、引用文件存在；UI UX 用绝对 search.py 路径进行一次 --domain ux 和 --stack react 查询，确认返回 domain/stack 与结果相关；实际界面实现后再依据 Vercel 最新规则进行文件行号审查。

## 主要证据链接

- 电影库 README：https://github.com/Lazhari/react-movies-finder/blob/7a4c862d3e76de291c5f61fae6e9065a94f11b35/README.md
- 电影库许可证：https://github.com/Lazhari/react-movies-finder/blob/7a4c862d3e76de291c5f61fae6e9065a94f11b35/LICENSE
- 电影库 package：https://github.com/Lazhari/react-movies-finder/blob/7a4c862d3e76de291c5f61fae6e9065a94f11b35/package.json
- 电影库 TMDB：https://github.com/Lazhari/react-movies-finder/blob/7a4c862d3e76de291c5f61fae6e9065a94f11b35/src/lib/api/tmdb.ts
- 电影库片单：https://github.com/Lazhari/react-movies-finder/blob/7a4c862d3e76de291c5f61fae6e9065a94f11b35/src/hooks/use-watchlist.ts
- UI Craft README：https://github.com/educlopez/ui-craft/blob/49b751742b013ebb3e0495eb7992423185f04be0/README.md
- UI Craft skill：https://github.com/educlopez/ui-craft/blob/49b751742b013ebb3e0495eb7992423185f04be0/skills/ui-craft/SKILL.md
- UI Craft LICENSE：https://github.com/educlopez/ui-craft/blob/49b751742b013ebb3e0495eb7992423185f04be0/LICENSE
- UI Craft MCP package：https://github.com/educlopez/ui-craft/blob/49b751742b013ebb3e0495eb7992423185f04be0/mcp/package.json
- UI UX README：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03/README.md
- UI UX LICENSE：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03/LICENSE
- UI UX skill：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03/.claude/skills/ui-ux-pro-max/SKILL.md
- UI UX Codex配置：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03/cli/assets/templates/platforms/codex.json
- UI UX CLI实现：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03/cli/src/commands/init.ts
- Vercel README：https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/README.md
- Vercel skill：https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines/SKILL.md
- 官方安装器说明：https://github.com/vercel-labs/skills/blob/main/README.md
- 官方安装参数：https://github.com/vercel-labs/skills/blob/main/docs/commands.md
- 指南规则源：https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md

源文本快照另见 skill-source-evidence.json。研究报告并未声称许可证审查等同法律意见，亦未声称 npm 审计等同完整安全测试。
