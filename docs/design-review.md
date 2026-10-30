# FRAME 设计与可访问性复核

日期：2026-10-30。范围：已发现问题的定向修复复核；以已安装 UI Craft、Vercel Web Design Guidelines 和项目 brief 为依据。没有用主观审美评分代替功能检查。

## Checked

- 浏览器：本机 Chrome，由 Playwright 访问 http://127.0.0.1:5173 ，1440×1000 单一视口。没有重新执行全站多宽度测试。
- 实际检查：首页可见播放入口、授权播放器未播放的idle状态、来源hash导航及畸形hash、图片失败后跨影片导航、片单tab刷新、类别和片单选中语义、可选多地区数据筛选。
- 依据：UI Craft references/review.md 的 Value→Ease 与证据门槛、accessibility.md 的焦点/状态规则；Vercel本次新获取规则blob SHA 3eb3a212b7b89493922ea418489d4c6f67ae8bd5。
- 规则快照：work/research/web-interface-guidelines-2026-10-30.md，来源 https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md 。
- 只读主代码；修复由主代理完成。本审查仅写文档和研究证据。

## Before / After / Why

| 定位                                                 | Before                                                               | After（实际复核）                                                                                                                | Why                                                    |
| ---------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| src/pages/Watch.tsx:25；超时effect:18                | 用户尚未点播放，preload=none仍触发loading，20秒后错误层阻挡播放器    | onLoadStart/onWaiting只有非paused才进入loading，onPlay负责发起等待；Chrome停留21秒，paused=true/readyState=0，无加载层、无错误层 | 未开始观看的idle不应成为网络故障；保留主动播放         |
| src/app/App.tsx:19                                   | /about#sources滚到页顶，焦点main，来源目标没有定位                   | 路径/hash变更后定位目标并focus；Chrome焦点为sources，目标在视口内。/about#%ZZ无pageerror，正常显示关于页                         | 来源和版权信息可通过深链接到达；无效片段不能使页面崩溃 |
| src/components/Film.tsx:10                           | 一个图片错误把后续不同作品的详情主图也永久变文字封面                 | failedSrc与当前src比较；注入钢铁之泪图像失败后点《春》，详情恢复为/images/spring.webp的img                                       | 错误回退局限于发生故障的资源                           |
| src/pages/Library.tsx:10                             | 观看记录只有内存tab，刷新后回收藏                                    | URL变/library?tab=history；实际刷新后仍显示观看记录                                                                              | 用户能保留和分享具体片单视图；URL反映tab状态           |
| src/pages/Browse.tsx:24；src/pages/Library.tsx:16    | 当前视图仅CSS active，辅助技术没有选中状态                           | 类别/片单按钮带正确aria-pressed，类别导航Link带aria-current；Chrome电视剧=true、其余=false，观看记录=true                        | 当前选择不能仅依赖视觉样式                             |
| src/pages/Home.tsx:17                                | sr-only包裹真实播放链接，Tab可进入不可见目标                         | 主视觉中存在可见“免费开始观看”，162×49，未处于sr-only，点击进入/watch/tears-of-steel                                             | 主操作可见且行为与标签一致                             |
| src/pages/Browse.tsx:19；src/services/catalog.ts:128 | 下拉选项用完整“US, GB”，过滤逻辑按单国家匹配，多地区值可能过滤掉自身 | UI选项与过滤器使用相同分隔方式；浏览器执行真实normalize/filter模块，以US, GB样例分别选US/GB均返回1                               | 避免选择合拍地区后错误清空结果                         |

## Verdict

本次已报告的五项主要问题及两个补充问题均已修复，定向复核通过。当前复核范围内没有遗留的已证实阻断项。此结论不是“全站无缺陷”或完整WCAG认证。

版权和UI一致性方面，代码保留来源/许可/署名和核实日期，区分资料与可播放权限；首页主操作与实际路由一致。本次未证实新的具体侵权问题，也没有把影视海报网格、用户指定炭黑/沙金或中文字体方向列为审美缺陷。

## Evidence

- work/research/ui-review-dom-evidence.before.json：首次复现状态；work/research/ui-review-dom-evidence.json：修复后hash、21秒idle、片单URL/刷新与aria状态。
- work/research/ui-review-image-evidence.before.json：首次图片错误污染；work/research/ui-review-image-evidence.json：修复后下一作品的真实img元素。
- work/research/ui-review-followup-evidence.json：畸形hash、类别aria、可见主视觉播放入口、多地区过滤结果。
- 复现脚本：work/research/review-dom.mjs、review-image.mjs、review-followup.mjs。
- 历史初查：docs/ui-accessibility-review.md；当前修复状态以本报告为准。

## Limits

- 没有重复全站宽度测试；该项由其他代理负责。
- 未在本次定向复核中下载或完整播放远端影片，也未证明大陆不同网络的媒体可达性。idle检查拦截远端HTTPS且没有用户播放意图，验证的是界面状态逻辑。
- 未使用真实屏幕阅读器做朗读验收；选中状态与焦点通过DOM及浏览器API验证。
- video没有额外track；仅凭DOM不能排除原片烧录字幕，因此未将其直接写为已证实字幕全部缺失。字幕与字幕语言仍需结合具体影片内容验收。
- 没有重新做法律许可结论、外部平台免费性审计或全面安全测试；这些不由视觉审查代替。
- 可选API国家筛选用真实模块及合拍地区fixture验证，未开启真实TMDB账户调用。

## Skill installation verification

docs/open-source-review.md已补实际安装状态：内置安全installer以固定SHA把三项技能安装到项目.agents/skills，SKILL.md均可读；search.py已由主代理执行，没有安装MCP或CLI。

全局Codex配置与work/backups/codex-config.before-skills.toml实测SHA-256一致：
067F5C78BA6A4EF8280F99FF4C5E750CE8AD709614BF000DE77EA642236F4B83。
