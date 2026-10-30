import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useCatalog } from '../app/context';
import { FilmCard, FilmImage, PlaybackLink } from '../components/Film';
import { collections } from '../data/collections';
import { hasVerifiedFreeAccess } from '../services/catalog';

export default function Home() {
  const { films } = useCatalog();
  const featured = films.find((f) => f.id === 'tears-of-steel') || films[0];
  const selections = ['spring', 'sintel', 'cosmos-laundromat']
    .map((id) => films.find((f) => f.id === id))
    .filter((f) => !!f);
  const free = films.filter(hasVerifiedFreeAccess);
  useEffect(() => {
    document.title = '映间 FRAME · 让电影被更好地发现';
  }, []);
  if (!featured) return null;
  return (
    <>
      <section className="hero">
        <div className="hero-visual">
          <FilmImage film={featured} hero />
        </div>
        <div className="hero-shade" />
        <div className="hero-content container">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="frame-mark" /> 本期放映 · 开放电影计划
            </p>
            <p className="hero-english serif">{featured.originalTitle}</p>
            <h1>{featured.title}</h1>
            <p className="hero-meta">
              {featured.year}
              <span />
              荷兰
              <span />
              科幻 / 短片
              <span />
              {featured.duration || 12} 分钟
            </p>
            <p className="hero-description">
              当记忆成为最后的武器，
              <br />
              人类与机器之间，还剩下什么？
            </p>
            <div className="hero-buttons">
              <Link to={`/film/${featured.id}`} className="button primary">
                查看详情 <ArrowRight size={18} />
              </Link>
              <PlaybackLink film={featured} className="hero-play" />
            </div>
          </div>
          <div className="hero-index">
            <span>本期精选</span>
            <strong>
              01 <i>/ 03</i>
            </strong>
            <div>
              <Link to="/film/tears-of-steel" aria-label="查看钢铁之泪" className="current" />
              <Link to="/film/spring" aria-label="查看春天" />
              <Link to="/film/sintel" aria-label="查看辛特尔" />
            </div>
          </div>
        </div>
        <div className="hero-credit">画面：Blender Studio · Tears of Steel</div>
      </section>
      <div className="intro-strip container">
        <span>独立视角，开放银幕。</span>
        <p>从一部短片开始，发现电影的另一种可能。</p>
        <Link to="/about">
          认识 FRAME <ArrowUpRight size={15} />
        </Link>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="section-kicker">THE EDITOR’S PICK</span>
            <h2>今天，把时间交给电影。</h2>
          </div>
          <Link className="section-link" to="/browse/movie">
            浏览全部 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="editorial-grid">
          {selections.map((film, i) => (
            <FilmCard key={film.id} film={film} wide number={`0${i + 1}`} />
          ))}
        </div>
      </section>
      <section className="free-section section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>好电影，也可以免费。</h2>
              <p>开放授权全片与已核实的官方入口，让观看有据可循。</p>
            </div>
            <Link className="section-link" to="/browse/movie?availability=free">
              免费片单 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="film-shelf">
            {free.slice(0, 6).map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
          <div className="source-strip">
            <span className="source-dot" />
            <p>站内播放保留原片与片尾署名。外部平台的可用状态可能变化。</p>
            <Link to="/about#sources">
              来源说明 <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>
      <section className="collection-feature section container">
        <div className="collection-copy">
          <span className="section-kicker">FRAME COLLECTION / 01</span>
          <h2>
            想象，
            <br />
            不设边界。
          </h2>
          <p className="serif">
            Worlds beyond
            <br />
            the frame.
          </p>
          <p className="collection-description">
            从机械废墟到奇幻山谷，四部短片，四种与现实拉开距离的方式。
          </p>
          <Link to="/collections/open-worlds" className="underlined-link">
            进入专题 <ArrowUpRight size={20} />
          </Link>
        </div>
        <Link
          className="collection-picture"
          to="/collections/open-worlds"
          aria-label="进入想象，不设边界专题"
        >
          <img
            src="/images/sintel.webp"
            alt="辛特尔在山地中的电影画面"
            loading="lazy"
            width="1920"
            height="1080"
          />
          <div className="picture-caption">
            <span>辛特尔 / Sintel</span>
            <span>
              4 部作品 <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>
      </section>
      <section className="section container discover-section">
        <div className="section-heading">
          <div>
            <h2>下一部，遇见什么？</h2>
            <p>从一种情绪、一位创作者，或一段陌生的旅程出发。</p>
          </div>
          <Link className="section-link" to="/browse/movie">
            进入片库 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="film-grid home-grid">
          {films
            .filter((f) => ['agent-327', 'coffee-run', 'charge', 'wing-it'].includes(f.id))
            .map((f) => (
              <FilmCard key={f.id} film={f} />
            ))}
        </div>
      </section>
      <section className="journal-strip container">
        <span className="serif">A different point of view.</span>
        <div>
          <h2>跟着专题，换个角度看电影。</h2>
          <Link to="/collections">
            {collections.length} 个编辑专题 <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
