# 映间 FRAME

一个面向中国大陆影迷的电影发现与正版观看入口网站。以编辑式片单、宽屏电影画面和明确的播放来源帮助用户找片。

本轮只进行本地开发、测试和 GitHub 源代码上传。**尚未部署 Netlify，也没有创建自动部署流程。** `netlify.toml` 仅预留静态构建和 SPA 路由刷新配置。

## 本地运行（Windows）

要求 Node.js 22.12+ 或兼容的较新 LTS；开发环境实测 Node 24.21.0、npm 11.19.0。在 PowerShell 中执行：

```powershell
cd D:\Codex\FrameCinema
npm ci
npm run dev
```

打开终端打印的本地 URL。默认无需配置任何 API Key。首次安装后可执行 `npm run build`，构建输出为 `dist/`；`npm run preview` 本地预览生产包。

## 已实现

- 首页：电影主视觉、今日精选、合法免费片单、编辑专题、更多作品、来源页脚。
- 电影 / 电视剧 / 纪录片分类；类型、年份、地区、免费入口组合过滤；推荐、年份和片名排序。
- 中文 / 英文片名、导演、演员和类型搜索；建议、清空、无结果状态；筛选状态保存在 URL。
- 独立详情与相关推荐；官方来源、核实日期、视频和剧照署名分别展示。
- 三个真实影片专题与对应片单。
- 收藏、取消收藏、刷新持久化；授权站内视频进度、继续观看、清空观看记录；跨标签页同步；浏览器存储损坏或拒绝时容错。
- 授权视频的原生播放、暂停、进度、音量、全屏、加载提示、错误恢复；默认不自动播放。
- 手机导航、可见键盘焦点、跳转主要内容、减少动态效果、图片失败文字封面。
- 本地数据适配层与可选 TMDB 资料模式；在线失败或超时自动保留本地片库。

## 技术栈

React 19、TypeScript 6、Vite 8、Tailwind CSS 4（Vite 插件）、React Router 7、Lucide。采用统一 CSS 变量与独立编辑式布局，不使用 shadcn 页面模板。没有独立后端、登录系统或 Supabase。

开发检查：ESLint、Vitest、Playwright（使用本机 Chrome）、Prettier。依赖精确解析版本见 `package-lock.json`。

## 片库与播放边界

默认数据是**人工编辑的本地片库**，共 15 条作品资料：9 部开放电影、4 条央视纪录片节目、2 部电视剧。并非实时全网影视数据库。

| 状态         | 当前内容                         | 行为                                               |
| ------------ | -------------------------------- | -------------------------------------------------- |
| 免费站内播放 | 《钢铁之泪》《辛特尔》《大雄兔》 | CC BY 3.0 完整片，官方视频服务器直连，保留片尾     |
| 官方免费入口 | 6 部 Blender 开放电影            | 跳转已核实的官方完整作品入口；不嵌入第三方网页     |
| 资料收录     | 4 条央视节目、三体、漫长的季节   | 免费完整播放条件未核实，不显示免费标签或站内播放器 |
| 官方试看     | 已实现状态与按钮，无虚构条目     | 仅在未来具有具体官方试看证据时启用                 |

图像来自 Blender Studio 官方作品页，按 CC BY 4.0 条款署名，转换 WebP 并按显示区域裁切。中国作品采用明确标注的原创文字档案封面，未冒充官方海报。不同译名可能存在，本地中文名是编辑用名。

媒体服务器可能受到网络或地区限制，HTTP 响应并不等于完整观看验证。实际浏览器短时播放结果见 `docs/testing.md`。未接入国内盗版聚合接口、未提取受保护地址、未代理视频、未绕过 DRM。三个官方视频字幕 API 返回空列表，当前没有额外中英字幕轨道；不能将其宣称为完整字幕无障碍支持。

详细证据与使用条件：

- [内容与授权核实](docs/content-sources.md)
- [逐张图像来源](docs/image-sources.json)
- [开源与 Skill 审查](docs/open-source-review.md)
- [设计审查与修复](docs/design-review.md)
- [测试与限制](docs/testing.md)

## 可选 TMDB 模式

复制 `.env.example` 为 `.env.local`，设置 `VITE_CATALOG_MODE=tmdb` 与 `VITE_TMDB_API_KEY`。代码请求官方中文每周趋势资料，与本地编辑数据去重合并；页面搜索在当前载入的数据中进行，**不是 TMDB 全库远程搜索**。异常响应、断网或四秒超时回到本地数据。

**纯静态站点无法保密客户端凭据：所有 `VITE_*` 值都会出现在浏览器构建包中。** 此接口只适合明确允许公开客户端使用的开发凭据。不要填私人访问令牌或任何必须保密的 Key；需要保密时必须另行设计可信后端，本版未提供。`.env.local` 被 Git 忽略，本仓库没有实际 Key。

TMDB 资料不包含电影播放授权，所有远程条目默认 `unavailable / none`。About 页面在 API 模式显示官方 TMDB 标志及不背书声明。非商业、商业使用、图像权益与缓存义务须根据当前 TMDB 条款分别核对；本轮未能读取完整 API Terms，不虚构缓存期限，未接入真实 Key。没有将示例 API 响应宣称为已验证在线数据。

## 测试

```powershell
npm run build
npm run lint
npm run test
```

浏览器测试使用已安装 Chrome，并需要独立终端运行 `npm run dev -- --port 5173`：

```powershell
npm run test:e2e
```

Playwright 覆盖搜索、过滤、收藏刷新、观看进度、空态、错误状态、移动菜单、减少动态效果及 1920 / 1440 / 1024 / 768 / 430 / 393 / 375px。视频测试另行保存真实外网播放诊断，不把网络失败包装成可播放。进度持久化用例使用 DOM 事件模拟时间，与真实播放测试分开记录。中间截图/报告写入 Git 忽略的 `work/qa/`。

格式检查：`npx prettier --check src tests vite.config.ts playwright.config.ts eslint.config.js package.json tsconfig.json index.html`。

## 设计 Skill 与复用

三项 Skill 安装在本项目 `.agents/skills/`，不修改全局配置，不随网站部署，也不作为运行依赖：UI Craft、UI UX Pro Max、Vercel Web Design Guidelines。安装前备份全局配置至本地 `work/backups/`，备份不提交。固定 commit、官方安装方法与审查结果见开源报告。

本项目仅借鉴 Screenbox 的搜索、分类和片单思路，未复制源码、样式或依赖锁。UI Craft 主导视觉，UI UX Pro Max 用于交互检查，Vercel Guidelines 用于可访问性审查；不采用与用户颜色、布局要求冲突的通用建议。

## 项目结构

```text
src/app/          应用入口、路由、片库与浏览器状态
src/components/   影片展示与来源按钮
src/pages/        首页、片库、详情、专题、片单、播放器、来源
src/data/         本地真实资料和专题
src/services/     资料适配、搜索筛选、浏览器存储
src/types/        统一 Film 类型
src/utils/        官方 URL 和视频地址校验
src/styles/       FRAME 设计变量与响应式样式
public/           许可图像与品牌图标
tests/            单元测试与实际浏览器测试
docs/             来源、开源、设计和测试记录
.ui-craft/        设计规范
```

本项目未对第三方影视素材声明所有权；素材继续遵循各自许可。仓库未设置一个可以覆盖第三方内容的统一素材许可证。
