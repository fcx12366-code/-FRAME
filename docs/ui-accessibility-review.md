# FRAME 初次功能与可访问性审查

更新：本文件记录的主要问题已由主代理修复，并经定向Chrome复核通过；当前状态与限制以 docs/design-review.md 为准。

审查日期：2026-10-30。只读 src 主代码，以已安装 UI Craft 的 review.md/accessibility.md、项目 .ui-craft/brief.md 和本次重新获取的 Vercel Web Interface Guidelines 为依据。以下为修复前证据，主代理可能正在同步修复；不能当成修复后的未解决问题清单。

Vercel 规则源 https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md ，本次 blob SHA：3eb3a212b7b89493922ea418489d4c6f67ae8bd5，快照存 work/research/web-interface-guidelines-2026-10-30.md。UI Craft 要求先检查用户是否完成任务，再检查易用性；本报告未作主观审美打分。

## 前五项

| 优先级与定位                                               | Before：证实的问题                                                                                                                                                                             | After：具体修复                                                                                   | Why：规则及影响                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| P1 src/pages/Watch.tsx:18、25                              | preload=none 的视频在用户尚未开始播放时也触发 loadstart→loading；20秒后错误遮罩覆盖播放器。Chrome复现初始paused=true/readyState=0/networkState=1，无媒体错误，等待21秒出现“暂时无法连接视频源” | 只对用户已请求的媒体加载/播放启动超时；idle/suspend不触发错误，等待首次点击保持海报与原生播放控件 | brief原则5“用户主动开始播放”；UI Craft review的状态覆盖与任务可达。当前用户阅读说明后，首次播放按钮即被误判故障遮住 |
| P2 src/app/App.tsx:19、27                                  | Link进入/about#sources后effect强制滚顶并聚焦main，未处理hash。Chrome从首页点“影片与图片来源”，URL正确，但scrollY=18、目标sectionTop=599，未定位到来源说明                                      | 在路径和hash变化后，若hash匹配元素则scrollIntoView；无hash才滚至顶部，保留适当focus处理           | Vercel Navigation & State“Deep-link all stateful UI”；来源/版权说明链接不能到达承诺的段落                           |
| P2 src/components/Film.tsx:10、12；src/pages/Detail.tsx:17 | broken是无src关联的boolean；一个剧照失败后，同一路由组件复用到另一作品仍永久显示文字封面。Chrome故障注入钢铁之泪图片→相关作品《春》，《春》hero仍为type-cover而不是其可用图片                  | 错误状态存失败的src，只有failedSrc===当前src才回退                                                | UI Craft review“State coverage”；brief原则2主视觉。一次资源故障不应污染后续不同作品                                 |
| P2 src/pages/Library.tsx:10、14                            | 收藏/观看记录切换只存在useState；Chrome点观看记录时URL仍/library，刷新后自动回收藏，用户无法链接、刷新保留或用浏览器历史恢复所在视图                                                           | 用经过校验的?tab=history/favorites驱动当前视图                                                    | Vercel Navigation & State“URL reflects state—filters, tabs…”；观看记录是继续观看的核心入口                          |
| P2 src/pages/Browse.tsx:24；src/pages/Library.tsx:14       | 类别与片单切换按钮只有CSS active，没有aria-pressed或等效选中语义。DOM证据显示观看记录按钮仅class=active                                                                                        | 保留原生button，为当前模式按钮设置aria-pressed，组容器用有名称的group                             | UI Craft accessibility的语义与状态要求、Vercel semantic HTML；读屏不能获知当前选中的类别或片单视图                  |

## 复现证据与范围

- work/research/ui-review-dom-evidence.json：本地Chrome DOM与播放器idle超时状态、hash定位、片单刷新。
- work/research/ui-review-image-evidence.json：图片故障后的跨影片详情状态污染。
- work/research/review-dom.mjs / review-image.mjs：只读浏览器复现脚本；为防不必要远程请求，首个脚本中拦截了HTTPS请求。idle超时复现时播放器没有发起播放，且没有video.error；并非把真实断网错误误判成源码问题。
- 本次没有改动任何src源代码，也没有执行对外部署。

另已观察但从前五项中排除：主代理已接手修复首页sr-only中的可聚焦真实播放链接，以及可选API多地区筛选值不一致。没有把字号、主题色或海报网格偏好列为缺陷；这些受用户给定方向与影视产品内容需求约束。

原生video未配置track，属于后续媒体可访问性核对项；仅凭DOM不能证明原片是否自带烧录字幕，因此没有把“没有track”等同已经证实的全部字幕缺失。版权方面，本次代码与本地数据检查可见来源、许可URL、署名和核实时间，并区分资料与播放权限；未据此宣称完成第三方许可有效性或大陆实播可达性验证，也未证实具体侵权。

## 安装与全局配置验收

docs/open-source-review.md 已从原始研究报告复制，并补充实际安装方式：内置安全installer、固定commit、项目.agents/skills内三个可读技能；search.py已由主代理运行。未安装MCP或CLI。

全局 C:\Users\m1965\.codex\config.toml 与 work/backups/codex-config.before-skills.toml SHA-256 实测一致：
067F5C78BA6A4EF8280F99FF4C5E750CE8AD709614BF000DE77EA642236F4B83。
