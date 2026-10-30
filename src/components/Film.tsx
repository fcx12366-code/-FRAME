import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bookmark, Check, Play } from 'lucide-react';
import type { Film } from '../types/film';
import { useLibrary } from '../app/context';
import { toggleFavorite } from '../services/storage';
import { safeOfficialUrl, safeVideoUrl } from '../utils/links';
import { hasVerifiedFreeAccess } from '../services/catalog';

export function FilmImage({ film, hero = false }: { film: Film; hero?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const src = hero ? film.backdrop || film.poster : film.poster;
  return src && failedSrc !== src ? (
    <img
      src={src}
      alt={`${film.title}电影画面`}
      loading={hero ? 'eager' : 'lazy'}
      fetchPriority={hero ? 'high' : 'auto'}
      onError={() => setFailedSrc(src)}
      width="1920"
      height="1080"
    />
  ) : (
    <div className="type-cover">
      <span>FRAME / 影像档案</span>
      <strong>{film.title}</strong>
      <small>{film.year} · 编辑文字封面</small>
    </div>
  );
}
export function availabilityLabel(film: Film) {
  if (!hasVerifiedFreeAccess(film) && film.availability !== 'trial') return '资料收录';
  if (
    film.playbackType === 'authorized_embed' &&
    film.availability === 'free' &&
    safeVideoUrl(film.videoUrl)
  )
    return '免费 · 站内观看';
  if (film.playbackType === 'official_redirect' && safeOfficialUrl(film.officialUrl))
    return film.availability === 'trial'
      ? '官方试看'
      : film.availability === 'external' || film.availability === 'free'
        ? '官方免费入口'
        : '资料收录';
  return '资料收录';
}
export function SaveButton({ film, compact = false }: { film: Film; compact?: boolean }) {
  const saved = useLibrary().favorites.includes(film.id);
  return (
    <button
      className={`save-button ${compact ? 'compact' : 'button secondary'}`}
      aria-label={`${saved ? '取消收藏' : '收藏'}《${film.title}》`}
      aria-pressed={saved}
      onClick={() => toggleFavorite(film.id)}
    >
      {saved ? <Check size={18} /> : <Bookmark size={18} />}
      {!compact && (saved ? '已收藏' : '加入片单')}
    </button>
  );
}
export function PlaybackLink({ film, className = '' }: { film: Film; className?: string }) {
  if (!film.verifiedAt || (film.availability !== 'trial' && !hasVerifiedFreeAccess(film)))
    return null;
  if (
    film.playbackType === 'authorized_embed' &&
    film.availability === 'free' &&
    safeVideoUrl(film.videoUrl)
  )
    return (
      <Link className={`button primary ${className}`} to={`/watch/${film.id}`}>
        <Play size={16} fill="currentColor" />
        免费开始观看
      </Link>
    );
  const url = safeOfficialUrl(film.officialUrl);
  if (url && film.playbackType === 'official_redirect' && film.availability !== 'unavailable')
    return (
      <a
        className={`button primary ${className}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {film.availability === 'trial' ? '观看官方试看' : '前往免费观看'}
        <ArrowUpRight size={18} />
        <span className="sr-only">（新窗口打开官方平台）</span>
      </a>
    );
  return null;
}
export function FilmCard({
  film,
  wide = false,
  number,
}: {
  film: Film;
  wide?: boolean;
  number?: string;
}) {
  return (
    <article className={`film-card ${wide ? 'wide' : ''}`}>
      <div className="film-art">
        <Link to={`/film/${film.id}`} tabIndex={-1} aria-hidden="true">
          <FilmImage film={film} />
        </Link>
        <span className="availability">{availabilityLabel(film)}</span>
        <SaveButton film={film} compact />
      </div>
      <div className="card-caption">
        {number && <span className="card-number">{number}</span>}
        <div>
          <h3>
            <Link to={`/film/${film.id}`}>{film.title}</Link>
          </h3>
          <p>
            {film.year}
            <span> / </span>
            {film.genres.slice(0, 2).join(' · ')}
            {film.duration ? ` / ${film.duration} 分钟` : ''}
          </p>
        </div>
        <ArrowUpRight size={18} className="caption-arrow" aria-hidden="true" />
      </div>
      {wide && film.editorial && <p className="editor-note">{film.description}</p>}
    </article>
  );
}
