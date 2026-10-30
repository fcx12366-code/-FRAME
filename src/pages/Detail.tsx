import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useCatalog } from '../app/context';
import {
  FilmCard,
  FilmImage,
  PlaybackLink,
  SaveButton,
  availabilityLabel,
} from '../components/Film';
import { safeOfficialUrl } from '../utils/links';
import { NotFound } from '../app/App';
export default function Detail() {
  const { id } = useParams();
  const { films } = useCatalog();
  const film = films.find((f) => f.id === id);
  useEffect(() => {
    document.title = film ? `${film.title} · FRAME 映间` : '未找到影片 · FRAME';
  }, [film]);
  if (!film) return <NotFound />;
  const official = safeOfficialUrl(film.officialUrl);
  const unavailable = availabilityLabel(film) === '资料收录';
  const related = films
    .filter(
      (f) =>
        f.id !== film.id && (f.genres.some((g) => film.genres.includes(g)) || f.type === film.type),
    )
    .slice(0, 4);
  return (
    <>
      <div className="detail-visual">
        <FilmImage film={film} hero />
        <div className="detail-shade" />
        <Link className="back-link container" to={`/browse/${film.type}`}>
          <ArrowLeft size={18} />
          返回片库
        </Link>
      </div>
      <div className="container detail-content">
        <div className="detail-title">
          <div>
            <p className="serif original-title">{film.originalTitle}</p>
            <h1>{film.title}</h1>
            <p className="detail-meta">
              {film.year} <span>/</span> {film.country || '地区待补充'} <span>/</span>{' '}
              {film.genres.join(' · ')}{' '}
              {film.duration ? (
                <>
                  <span>/</span>
                  {film.duration} 分钟
                </>
              ) : null}
            </p>
          </div>
          <SaveButton film={film} />
        </div>
        <div className="detail-columns">
          <div className="film-story">
            <h2>关于这部作品</h2>
            <p className="synopsis">{film.description}</p>
            <dl>
              <div>
                <dt>导演</dt>
                <dd>{film.director || '资料待补充'}</dd>
              </div>
              <div>
                <dt>{film.genres.includes('动画') ? '配音 / 表演' : '主要演员'}</dt>
                <dd>{film.cast?.length ? film.cast.join(' / ') : '暂无已收录演职员资料'}</dd>
              </div>
              <div>
                <dt>作品类别</dt>
                <dd>
                  {film.type === 'movie' ? '电影' : film.type === 'series' ? '电视剧' : '纪录片'}
                </dd>
              </div>
            </dl>
            {film.episodes?.length ? (
              <section className="episodes">
                <h2>分集资料</h2>
                {film.episodes.map((ep) => (
                  <div className="episode" key={ep.id}>
                    <span>
                      第 {ep.season} 季 · 第 {ep.episode} 集
                    </span>
                    <strong>{ep.title}</strong>
                    {safeOfficialUrl(ep.officialUrl) && (
                      <a
                        href={safeOfficialUrl(ep.officialUrl)!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        官方页面 <ArrowUpRight size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </section>
            ) : null}
          </div>
          <aside className="source-panel">
            <p className="source-panel-label">
              <ShieldCheck size={18} /> 正版观看来源
            </p>
            <h2>{unavailable ? '等待一次正式相遇。' : film.provider || '开放电影'}</h2>
            <p>
              {unavailable
                ? '暂无已核实的免费正版入口。你可以先收藏，或查看官方资料。'
                : film.playbackType === 'authorized_embed'
                  ? '创作者以开放许可发布的完整短片，可在本站观看。'
                  : '前往官方平台观看，新窗口打开。免费状态可能随平台调整。'}
            </p>
            <PlaybackLink film={film} />
            {official && (
              <a
                className="official-reference"
                href={official}
                target="_blank"
                rel="noopener noreferrer"
              >
                {unavailable ? '查看官方资料页面' : '访问作品官方页面'} <ArrowUpRight size={15} />
              </a>
            )}
            {film.verifiedAt && !unavailable && (
              <small>来源核实：{film.verifiedAt.slice(0, 10)}</small>
            )}
            {film.sourceNote && <p className="source-note">{film.sourceNote}</p>}
          </aside>
        </div>
        <div className="attribution-block">
          <p>{film.attribution || '本页介绍由 FRAME 整理，影片权益归各权利人。'}</p>
          {film.imageCredit && <p>{film.imageCredit}</p>}
          {safeOfficialUrl(film.licenseUrl) && (
            <a href={safeOfficialUrl(film.licenseUrl)!} target="_blank" rel="noopener noreferrer">
              查看开放许可证 <ArrowUpRight size={12} />
            </a>
          )}
        </div>
        <section className="section">
          <div className="section-heading">
            <h2>如果你喜欢这一部</h2>
            <Link className="section-link" to={`/browse/${film.type}`}>
              继续发现 <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="film-grid home-grid">
            {related.map((f) => (
              <FilmCard key={f.id} film={f} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
