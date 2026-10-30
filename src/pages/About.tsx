import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useCatalog } from '../app/context';
import { safeOfficialUrl } from '../utils/links';
export default function About() {
  const { films, mode } = useCatalog();
  useEffect(() => {
    document.title = '关于与来源 · FRAME 映间';
  }, []);
  return (
    <div className="page container about-page">
      <div className="page-heading">
        <p className="section-kicker">ABOUT FRAME</p>
        <h1>
          电影值得，
          <br />
          被认真发现。
        </h1>
        <p>映间是一份可观看的电影片单。我们从作品出发，整理影片资料、编辑专题与合法观看来源。</p>
      </div>
      <section>
        <h2>一份小而明确的片库</h2>
        <p>
          当前内容是人工整理的本地编辑片库，默认不调用在线影视
          API。它不是全网电影库，也不承诺所有影片都能免费完整观看。收藏和站内观看进度仅保存在当前浏览器。
        </p>
      </section>
      <section id="sources">
        <h2>每个观看入口，都说明来源</h2>
        <div className="source-types">
          <div>
            <strong>站内免费观看</strong>
            <p>
              仅对具有明确开放许可的完整影片启用原生播放器，直接连接授权来源，不解析或代理受保护视频。
            </p>
          </div>
          <div>
            <strong>前往官方平台</strong>
            <p>离开 FRAME，进入作品的官方播放页面。官方平台可能调整地区、广告、账号和付费条件。</p>
          </div>
          <div>
            <strong>官方试看</strong>
            <p>仅指平台明确提供的试看内容，与免费全片分开显示。当前片库不虚构试看入口。</p>
          </div>
          <div>
            <strong>资料收录</strong>
            <p>暂未核实免费播放条件的影片只展示资料。页面可访问，不等于已验证免费全片。</p>
          </div>
        </div>
        <h3>开放电影与图像署名</h3>
        <p>
          本站开放电影剧照来自 Blender Studio
          官方项目页，依其内容条款使用。图像经过尺寸优化与展示裁切，未使用 Blender
          品牌标志。影片的视频许可分别标明；电影和素材权利属于原创作者。
        </p>
        <a
          href="https://studio.blender.org/terms-and-conditions/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Blender Studio 图像来源条款 <ArrowUpRight size={14} />
        </a>
        {' · '}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          剧照 CC BY 4.0 许可证 <ArrowUpRight size={14} />
        </a>
        <div className="credits-list">
          {films
            .filter((f) => f.imageCredit || f.attribution)
            .map((f) => (
              <div key={f.id}>
                <strong>
                  {f.title} / {f.originalTitle}
                </strong>
                <p>{f.imageCredit || f.attribution}</p>
                {safeOfficialUrl(f.sourceUrl || f.officialUrl) && (
                  <a
                    href={safeOfficialUrl(f.sourceUrl || f.officialUrl)!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    官方来源 <ArrowUpRight size={13} />
                  </a>
                )}
                {safeOfficialUrl(f.licenseUrl) && (
                  <a
                    href={safeOfficialUrl(f.licenseUrl)!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    许可条款 <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            ))}
        </div>
        <p>部分国内作品使用 FRAME 自制的文字档案封面，并在封面上注明。这些封面不冒充官方海报。</p>
        <h3>可选 TMDB 资料模式</h3>
        <p>
          启用后，TMDB 仅提供影视资料，不提供播放授权。网络失败时自动回到本地片库。使用方须核对 TMDB
          的用途许可、品牌署名和图像使用条件。
        </p>
        {mode === 'api' && (
          <img className="tmdb-logo" src="/icons/tmdb.svg" alt="TMDB" width="120" height="32" />
        )}
        <p lang="en">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        <a
          href="https://developer.themoviedb.org/docs/faq"
          target="_blank"
          rel="noopener noreferrer"
        >
          TMDB 使用说明 <ArrowUpRight size={14} />
        </a>
      </section>
      <section id="copyright">
        <h2>版权与外部平台说明</h2>
        <p>
          FRAME 不提供盗版聚合、VIP 解析、DRM
          绕过或未许可的嵌入。对尚未证实免费状态的条目，我们不会展示免费标签。
        </p>
        <p>
          外部平台自行负责其内容和服务。来源核实时间仅表示当次证据检查，不能保证永久免费或在所有网络环境可播放。发现失效链接或署名问题，可通过项目
          GitHub 提交 issue，附影片名称与官方证据，便于复核。
        </p>
        <a
          href="https://github.com/fcx12366-code/-FRAME/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          向项目反馈 <ArrowUpRight size={14} />
        </a>
      </section>
    </div>
  );
}
