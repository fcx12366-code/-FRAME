import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useCatalog } from '../app/context';
import { FilmCard } from '../components/Film';
import { filterFilms } from '../services/catalog';
import type { Film } from '../types/film';

export default function Browse({ search = false }: { search?: boolean }) {
  const { films } = useCatalog();
  const { type = 'movie' } = useParams();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const title = search
    ? '在这里，找到你的下一部。'
    : type === 'series'
      ? '故事，未完待续。'
      : type === 'documentary'
        ? '真实，自有力量。'
        : '把世界，收入片单。';
  useEffect(() => {
    document.title = `${search ? '搜索' : type === 'series' ? '电视剧' : type === 'documentary' ? '纪录片' : '电影片库'} · FRAME 映间`;
  }, [search, type]);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'all') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: key === 'q' });
  };
  const result = filterFilms(films, {
    query,
    type: search ? ((params.get('type') || 'all') as Film['type'] | 'all') : (type as Film['type']),
    genre: params.get('genre') || 'all',
    year: params.get('year') ? Number(params.get('year')) : 'all',
    country: params.get('country') || 'all',
    availability: (params.get('availability') || 'all') as Film['availability'] | 'all',
    sort: (params.get('sort') || 'editorial') as 'editorial' | 'year-desc' | 'year-asc' | 'title',
  });
  const genres = [...new Set(films.flatMap((f) => f.genres))];
  const countries = [
    ...new Set(
      films.flatMap((f) => f.country?.split(/[,，、/]/).map((c) => c.trim()) || []).filter(Boolean),
    ),
  ];
  const years = [...new Set(films.map((f) => f.year))].sort((a, b) => b - a);
  const suggestions = query.trim() ? filterFilms(films, { query }).slice(0, 4) : [];
  return (
    <div className="page container">
      <div className="page-heading">
        <p className="section-kicker">{search ? 'FIND YOUR NEXT FRAME' : 'THE FRAME LIBRARY'}</p>
        <h1>{title}</h1>
        <p>
          {search
            ? '片名、导演、演员或类型，都可以成为线索。'
            : '一个持续整理的编辑片库。播放来源与影片资料，分别核实。'}
        </p>
      </div>
      <form
        className={`search-field ${search ? 'large' : ''}`}
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="film-search">
          搜索片名、导演、演员或类型
        </label>
        <input
          id="film-search"
          type="search"
          name="q"
          autoComplete="off"
          value={query}
          onChange={(e) => update('q', e.target.value)}
          placeholder={search ? '搜索电影、导演、演员…' : '在片库中搜索…'}
        />
        {query && (
          <button type="button" aria-label="清除搜索" onClick={() => update('q', '')}>
            <X size={20} />
          </button>
        )}
      </form>
      {search && (
        <div className="search-suggestions">
          <span>{query ? '相关线索' : '试试这些'}</span>
          {query
            ? suggestions.map((f) => (
                <Link key={f.id} to={`/film/${f.id}`}>
                  {f.title}
                  <ArrowUpRight size={14} />
                </Link>
              ))
            : ['奇幻', '科幻', '春天', 'Sintel'].map((text) => (
                <button key={text} onClick={() => update('q', text)}>
                  {text}
                </button>
              ))}
          {query && !suggestions.length && <span>没有匹配的搜索建议</span>}
        </div>
      )}
      <div className="browse-tabs" aria-label="作品类别">
        {search
          ? [
              ['all', '全部作品'],
              ['movie', '电影'],
              ['series', '电视剧'],
              ['documentary', '纪录片'],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={(params.get('type') || 'all') === value}
                className={(params.get('type') || 'all') === value ? 'active' : ''}
                onClick={() => update('type', value)}
              >
                {label}
              </button>
            ))
          : [
              ['movie', '电影'],
              ['series', '电视剧'],
              ['documentary', '纪录片'],
            ].map(([value, label]) => (
              <Link
                key={value}
                aria-current={type === value ? 'page' : undefined}
                className={type === value ? 'active' : ''}
                to={`/browse/${value}`}
              >
                {label}
              </Link>
            ))}
      </div>
      <div className="filter-bar">
        <span className="filter-label">
          <SlidersHorizontal size={16} />
          筛选
        </span>
        {[
          ['genre', '类型', genres],
          ['year', '年份', years],
          ['country', '地区', countries],
        ].map(([key, label, options]) => (
          <label className="select-wrap" key={String(key)}>
            <span className="sr-only">{String(label)}</span>
            <select
              aria-label={String(label)}
              value={params.get(String(key)) || 'all'}
              onChange={(e) => update(String(key), e.target.value)}
            >
              <option value="all">全部{String(label)}</option>
              {(options as (string | number)[]).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label className="free-filter">
          <input
            type="checkbox"
            checked={params.get('availability') === 'free'}
            onChange={(e) => update('availability', e.target.checked ? 'free' : 'all')}
          />
          有免费入口
        </label>
        <label className="sort-select">
          <span className="sr-only">排序</span>
          <select
            aria-label="排序"
            value={params.get('sort') || 'editorial'}
            onChange={(e) => update('sort', e.target.value)}
          >
            <option value="editorial">编辑推荐</option>
            <option value="year-desc">年份从新到旧</option>
            <option value="year-asc">年份从旧到新</option>
            <option value="title">片名排序</option>
          </select>
        </label>
      </div>
      <div className="results-heading">
        <p role="status" aria-live="polite">
          共 <strong>{result.length}</strong> 部作品{query && ` · “${query}”`}
        </p>
        {params.size > 0 && (
          <button className="reset-filter" onClick={() => setParams({})}>
            重置全部 <X size={14} />
          </button>
        )}
      </div>
      {result.length ? (
        <div className="film-grid">
          {result.map((f) => (
            <FilmCard key={f.id} film={f} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={32} />
          <h2>还没有找到这束光</h2>
          <p>换个关键词，或减少筛选条件。片库会继续补充。</p>
          <button className="button secondary" onClick={() => setParams({})}>
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
