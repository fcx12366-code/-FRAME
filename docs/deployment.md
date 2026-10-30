# Netlify 部署记录

- 日期：2026-10-30。
- 站点：https://frame-cinema-fcx12366.netlify.app
- 管理：https://app.netlify.com/projects/frame-cinema-fcx12366
- 站点 ID：`e58c496c-b3e9-44f4-be71-0044ea6a5b42`。
- 生产部署 ID：`6ae444088c9da940c888ba20`。
- 部署源码 commit：`daabf0e788dd88f87994433bc2b905991e7bf5d0`。
- Netlify 返回状态：`ready`，无部署错误。

## 发布内容

本地重新运行 `npm run build` 后，通过 Netlify 官方 API 上传静态 ZIP 生产包。构建包包含 14 个网站文件，以及由 `netlify.toml` 生成的 `_redirects` 和 `_headers`。没有上传源码、环境文件、依赖、Skill 或认证信息。

所有前端路由回退到 `/index.html`，并配置 `X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options` 和 `Permissions-Policy`。默认使用人工编辑的本地片库，不需要线上 API Key。

当前为手动部署，GitHub 提交不会自动发布。后续手动更新需重新构建并上传完整静态构建包；也可另行连接 GitHub 构建，使用 `npm run build` 和 `dist`。

## 访问验证

首次匿名浏览器检查发现新项目默认为私密，返回 Netlify 团队登录页面（HTTP 401）。生产环境公开后，使用全新、未登录的 Chrome 浏览器会话重新验证通过：

- 首页、电影片库、影片详情、专题、搜索和我的片单共 6 个页面直接访问均返回 HTTP 200，SPA 深层路由可正常加载。
- 响应包含 `X-Content-Type-Options: nosniff` 和 `X-Frame-Options: DENY`。
- 收藏后刷新仍显示已收藏。
- 1440px 桌面视口及 393px 手机视口无横向溢出。
- 《钢铁之泪》在用户点击后实际起播，采样播放时间 1.405562 秒，readyState 为 4，无媒体错误。
- 本轮浏览器检查未出现页面脚本异常。

视频检查仅验证短时起播，不代表完整影片播放、全国网络连通性或长期可用性。没有修改团队默认设置或其他项目。当前没有配置自定义域名，也未启用 GitHub 自动部署。
