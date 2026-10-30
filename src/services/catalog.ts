import localFilms from '../data/films.json';
import type { Film, FilmFilters } from '../types/film';
import { safeOfficialUrl, safeVideoUrl } from '../utils/links';

export interface CatalogResult {
  films: Film[];
  mode: 'local' | 'api';
  notice?: string;
}
export interface CatalogOptions {
  fetcher?: typeof fetch;
  mode?: 'local' | 'tmdb';
  apiKey?: string;
  timeoutMs?: number;
}

const genreNames: Record<number, string> = {
  12: '冒险',
  14: '奇幻',
  16: '动画',
  18: '剧情',
  27: '恐怖',
  28: '动作',
  35: '喜剧',
  36: '历史',
  37: '西部',
  53: '惊悚',
  80: '犯罪',
  99: '纪录片',
  878: '科幻',
  9648: '悬疑',
  10402: '音乐',
  10749: '爱情',
  10751: '家庭',
  10752: '战争',
  10759: '动作冒险',
  10762: '儿童',
  10763: '新闻',
  10764: '真人秀',
  10765: '科幻奇幻',
  10766: '肥皂剧',
  10767: '脱口秀',
  10768: '战争政治',
};
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === 'string';
const validDate = (value: unknown): boolean =>
  string(value) && value.length > 0 && Number.isFinite(Date.parse(value));

export function hasVerifiedFreeAccess(film: Film): boolean {
  if (!validDate(film.verifiedAt)) return false;
  if (film.availability === 'free') {
    return film.playbackType === 'authorized_embed'
      ? !!safeVideoUrl(film.videoUrl) && !!safeOfficialUrl(film.licenseUrl)
      : film.playbackType === 'official_redirect' && !!safeOfficialUrl(film.officialUrl);
  }
  return (
    film.availability === 'external' &&
    film.playbackType === 'official_redirect' &&
    !!safeOfficialUrl(film.officialUrl) &&
    !!safeOfficialUrl(film.sourceUrl)
  );
}

function getLocalFilms(): Film[] {
  const raw: unknown = localFilms;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is Film =>
      object(item) &&
      string(item.id) &&
      string(item.title) &&
      Number.isInteger(item.year) &&
      ['movie', 'series', 'documentary'].includes(String(item.type)) &&
      Array.isArray(item.genres) &&
      item.genres.every(string) &&
      string(item.poster) &&
      string(item.description) &&
      ['free', 'trial', 'external', 'unavailable'].includes(String(item.availability)) &&
      ['authorized_embed', 'official_redirect', 'none'].includes(String(item.playbackType)),
  );
}

/** Metadata providers convey discovery information, never playback authorization. */
export function normalizeTmdbFilm(item: unknown): Film | null {
  if (
    !object(item) ||
    !Number.isInteger(item.id) ||
    Number(item.id) <= 0 ||
    !['movie', 'tv'].includes(String(item.media_type))
  )
    return null;
  const isTv = item.media_type === 'tv';
  const title = isTv ? item.name : item.title;
  const originalTitle = isTv ? item.original_name : item.original_title;
  const date = isTv ? item.first_air_date : item.release_date;
  if (
    !string(title) ||
    !title.trim() ||
    !string(date) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !validDate(date)
  )
    return null;
  if (!Array.isArray(item.genre_ids) || !item.genre_ids.every((id) => Number.isInteger(id)))
    return null;
  if (item.overview !== undefined && !string(item.overview)) return null;
  const image = (path: unknown, size: string) =>
    string(path) && /^\/[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(path)
      ? `https://image.tmdb.org/t/p/${size}${path}`
      : '';
  const genres = item.genre_ids
    .map((id) => genreNames[Number(id)])
    .filter((name): name is string => !!name);
  return {
    id: `tmdb-${isTv ? 'tv' : 'movie'}-${item.id}`,
    title: title.trim(),
    originalTitle: string(originalTitle) ? originalTitle : undefined,
    year: Number(date.slice(0, 4)),
    type: isTv ? 'series' : item.genre_ids.includes(99) ? 'documentary' : 'movie',
    genres,
    country:
      Array.isArray(item.origin_country) && item.origin_country.every(string)
        ? item.origin_country.join(', ')
        : undefined,
    description: string(item.overview) ? item.overview : '',
    poster: image(item.poster_path, 'w500'),
    backdrop: image(item.backdrop_path, 'w1280') || undefined,
    availability: 'unavailable',
    playbackType: 'none',
    attribution: '影片资料及图片来自 TMDB；TMDB 不代表播放授权。',
    imageCredit: 'TMDB',
  };
}

function sameFilm(left: Film, right: Film): boolean {
  if (left.id === right.id) return true;
  const names = (film: Film) =>
    [film.title, film.originalTitle]
      .filter((name): name is string => !!name)
      .map((name) => name.trim().toLocaleLowerCase());
  return (
    left.year === right.year &&
    (left.type === 'series') === (right.type === 'series') &&
    names(left).some((name) => names(right).includes(name))
  );
}

export async function getCatalog(options: CatalogOptions = {}): Promise<CatalogResult> {
  const local = getLocalFilms();
  const env = import.meta.env;
  const mode = options.mode ?? env.VITE_CATALOG_MODE;
  const apiKey = options.apiKey ?? env.VITE_TMDB_API_KEY;
  if (mode !== 'tmdb' || !apiKey)
    return {
      films: local,
      mode: 'local',
      notice: mode === 'tmdb' ? '未配置 TMDB API Key，已使用本地编辑片库。' : undefined,
    };
  // VITE_* values are public in a static build. Never put private tokens here.
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error('Catalog request timed out'));
      }, options.timeoutMs ?? 4000);
    });
    const request = (async () => {
      const url = new URL('https://api.themoviedb.org/3/trending/all/week');
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('language', 'zh-CN');
      const response = await (options.fetcher ?? fetch)(url.href, { signal: controller.signal });
      if (!response.ok) throw new Error('Catalog response failed');
      const data: unknown = await response.json();
      if (!object(data) || !Array.isArray(data.results)) throw new Error('Invalid catalog schema');
      const remote: Film[] = [];
      for (const item of data.results) {
        // Trending also includes people, which are intentionally excluded.
        if (object(item) && item.media_type === 'person') continue;
        const normalized = normalizeTmdbFilm(item);
        if (!normalized) throw new Error('Invalid film schema');
        remote.push(normalized);
      }
      const films = [...local];
      for (const film of remote)
        if (!films.some((existing) => sameFilm(existing, film))) films.push(film);
      return {
        films,
        mode: 'api' as const,
        notice: '已连接 TMDB 影片资料；播放权限以本地核实记录为准。',
      };
    })();
    return await Promise.race([request, timeout]);
  } catch {
    return { films: local, mode: 'local', notice: '在线影片资料暂不可用，已使用本地编辑片库。' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function filterFilms(films: Film[], filters: FilmFilters = {}): Film[] {
  const query = filters.query?.trim().toLocaleLowerCase();
  const result = films.filter((film) => {
    if (
      query &&
      ![
        film.title,
        film.originalTitle,
        film.director,
        ...(film.cast ?? []),
        ...film.genres,
        film.type,
        film.type === 'movie' ? '电影' : film.type === 'series' ? '剧集' : '纪录片',
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
        .includes(query)
    )
      return false;
    if (filters.type && filters.type !== 'all' && film.type !== filters.type) return false;
    if (filters.genre && filters.genre !== 'all' && !film.genres.includes(filters.genre))
      return false;
    if (filters.year !== undefined && filters.year !== 'all' && film.year !== filters.year)
      return false;
    if (
      filters.country &&
      filters.country !== 'all' &&
      !film.country
        ?.split(/[,，、/]/)
        .map((country) => country.trim())
        .includes(filters.country)
    )
      return false;
    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'free') {
        if (!hasVerifiedFreeAccess(film)) return false;
      } else if (film.availability !== filters.availability) return false;
    }
    return true;
  });
  return result.sort((a, b) => {
    if (filters.sort === 'year-desc') return b.year - a.year;
    if (filters.sort === 'year-asc') return a.year - b.year;
    if (filters.sort === 'title') return a.title.localeCompare(b.title, 'zh-CN');
    return Number(b.editorial ?? 0) - Number(a.editorial ?? 0);
  });
}
