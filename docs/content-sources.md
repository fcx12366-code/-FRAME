# FRAME 内容与图像来源核实

核实日期：2026-10-30。仅确认网页与HTTP媒体响应；未把HTTP成功表述为大陆浏览器实际播放成功。

## 内容范围

- `src/data/films.json` 共15条：9部Blender短片、4条央视纪录片播出集、2部国内电视剧。
- `public/images` 的9张电影剧照来源逐条见 [image-sources.json](./image-sources.json)。
- 图像由官方 Studio 作品页 hero-bg 引用，不是杜撰商业海报。计划由主代理压缩webp。
- 影片年份来自 https://studio.blender.org/films/；时长来自官方 video.blender.org/api/v1/videos/:uuid（含片尾，向上取整为分钟）。导演只有页面确证时才填。

## 视频与图像分开授权

Blender Studio 服务条款 https://studio.blender.org/terms-and-conditions/ 明确默认数字内容（网页、视频、图像、3D文件）为 CC BY 4.0，除非另有声明；商标和logo保留权利。这里下载的是当前 Studio 页面上的电影画面。适配裁切后标注改动、作品名、Blender Studio、许可与来源链接。

Sintel 旧官方许可 https://durian.blender.org/sharing/：CC BY 3.0；传播/放映电影保留完整片尾；其他用途使用官方署名；不包括logo与商标。
Big Buck Bunny https://peach.blender.org/about/：CC BY 3.0，官方署名 © 2008 Blender Foundation / www.bigbuckbunny.org。
Tears of Steel https://mango.blender.org/sharing/：CC BY 3.0，同样不包括logo与外来素材。官方下载目录 copyright.txt 是独立原声带的 CC BY-ND，不应错套为电影整体条款。

Sintel、BBB、ToS 三个官方720p MP4全片端点均于本次核实返回 HTTP206、Content-Type video/mp4、正确 Content-Range，非预告。精确URL在 films.json。片尾须保留，勿变成自动循环的无署名裁切片。

Spring 官方视频库标记 Attribution–ShareAlike；因此保守只链接官方作品页，没有在本站嵌入Spring视频。其他6片同样只使用官方入口。部分工程文件/制作花絮收费不等于电影免费观看需要会员。

## 央视集页

以下页面标题、日期、简介均从央视官方HTML核实：

- 航拍中国第二季内蒙古：https://tv.cctv.com/2019/04/08/VIDESJbzVk5j4Z2yQjKglkde190408.shtml
- 航拍中国第四季广西：https://tv.cctv.com/2022/11/18/VIDE4SpKYeeGApFa1BiUUH5M221118.shtml
- 如果国宝会说话第一季第一集（栏目合集，涉及五件器物，不冒充单条5分钟人头壶）：https://tv.cctv.com/2018/01/15/VIDELPWqLjHCcLHiWdlmTKvu180115.shtml
- 如果国宝会说话第三季第二集：https://tv.cctv.com/2020/06/14/VIDE6Zd429T9xSjiq7s0wzxV200614.shtml
  均仅页面存在已核实；没有得出当前免费、全片可播或无地区限制的结论。数据为 unavailable + none，有官方资料链接。未复制其剧照。
  我在故宫修文物检索返回官方精编栏目页 https://tv.cctv.com/2015/12/30/VIDA1451462807578701.shtml ，尚未定位确切完整集，因此没有编造集链接写入数据。

## TMDB 接入条件（当前演示未用TMDB图像）

官方FAQ https://developer.themoviedb.org/docs/faq ：非商业项目需归属署名；商业用途需要联系TMDB申请相应许可。需在About/Credits中使用官方批准标志及规定的不背书声明，logo不得比产品标志突出。官方不主张拥有API中图像与数据版权，因此API可取图不等于取得电影传播权或图像的全版权授权。
图像拼接规则见 https://developer.themoviedb.org/docs/image-basics ：从configuration获取base_url和尺寸，再拼数据中的file_path，不虚构海报路径。
缓存：本次没有成功读取完整API Terms（https://www.themoviedb.org/api-terms-of-use 返回403，web检索robots拒绝），因此无法证实硬性缓存期限，尤其不要声称官方规定24小时或6个月。未来接入须由可访问条款的操作者核对当前缓存与删除义务；工程上可设计可失效缓存与删除机制，此为建议，不是已核实条款。没有API key时保持本地数据演示，勿盗用他人key或把密钥打包到前端。

## 追加电视剧资料与演员

- 三体（2023）：导演杨磊；演员张鲁一、于和伟、陈瑾、王子文。官方源：[腾讯WeTV作品页](https://wetv.vip/zh-cn/play/h31rop8wfso9jnh)。页面为中国大陆作品、30集，包含VIP标记。年份与演职员来自同一官方页。
- 漫长的季节（2023）：导演辛爽；演员范伟、秦昊、陈明昊、李庚希。官方源：[腾讯WeTV作品页](https://wetv.vip/zh-cn/play/srw3kfh68aa9y3b)。页面为中国大陆作品、12集，包含VIP标记。
- 上述国际站只作腾讯官方资料依据，不代表目标中国大陆的片源可达或全片免费。两条均 `unavailable`、`none`、空图像，使用本站文字封面。
- 钢铁之泪演员已从[官方视频API](https://video.blender.org/api/v1/videos/8533ea43-4271-4a57-9694-e9d0b35e1aa1)完整description核实：Derek de Lint、Sergio Hasselbaink、Rogier Schippers、Vanja Rukavina、Denise Rebergen、Jody Bhe、Chris Haley。

## 季集编号与播出版本

- 内蒙古为《航拍中国》S2E3；官方央视纪录频道发布标题也明确第三集：[CCTV纪录官方发布](https://www.youtube.com/watch?v=comdBfvGKC4)。本站仍链接已核实央视网页。20190406是该页所标播出日期，不是全季首播日期。
- 广西为S4E2，央视页面标题明确。
- 国宝第一季第一集对应《时代》20180101栏目播出版，一个视频包含人头壶、骨笛、陶鹰鼎等五件器物。这里的episode=1是栏目播出集序，不能误当5分钟单条人头壶版本。
- 国宝第三季第二集也是央视网页标注的栏目播出集，内容涉及云冈石窟和金步摇。episodes数组保留准确官方标题与URL。

## TMDB 标志

[官方开发者FAQ](https://developer.themoviedb.org/docs/faq)页面HTML直接引用的SVG为 https://files.readme.io/29c6fee-blue_short.svg 。文件原样下载为 `public/icons/tmdb.svg`，没有改色、拉伸或旋转。标志归TMDB所有，不套用Blender的CC许可。

启用API数据/图像时，在About/Credits展示TMDB标志和其要求的完整声明：“This product uses the TMDB API but is not endorsed or certified by TMDB.” 标志比FRAME产品标志次要，并链接TMDB。只使用本地编辑数据的模式无需声称数据来自TMDB。专门的[品牌页](https://www.themoviedb.org/about/logos-attribution)本次返回403/robots，因此所用原始SVG的直接证据是官方开发者站自身引用。

## 官方字幕检查

2026-10-30 查询以下PeerTube公开字幕列表，三者均HTTP200返回 `{"total":0,"data":[]}`：

- Sintel：https://video.blender.org/api/v1/videos/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40/captions
- Big Buck Bunny：https://video.blender.org/api/v1/videos/6402b77c-b61f-4a06-96ca-c8420a2becf4/captions
- Tears of Steel：https://video.blender.org/api/v1/videos/8533ea43-4271-4a57-9694-e9d0b35e1aa1/captions

上述API没有公开可下载的英文/中文字幕条目，因此未添加字幕文件或伪造台词。该结论仅针对这些具体视频条目的字幕列表，不代表作品从未在其他官方渠道发布字幕。
