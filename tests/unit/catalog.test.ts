import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  filterFilms,
  getCatalog,
  hasVerifiedFreeAccess,
  normalizeTmdbFilm,
} from '../../src/services/catalog';
import type { Film } from '../../src/types/film';

const fixture: Film = {
  id: 'sintel',
  title: '辛特尔',
  originalTitle: 'Sintel',
  year: 2010,
  type: 'movie',
  genres: ['动画', '奇幻'],
  country: '荷兰',
  duration: 15,
  description: '寻找伙伴的旅程',
  director: 'Colin Levy',
  cast: ['Halina Reijn'],
  poster: '/poster.webp',
  availability: 'free',
  playbackType: 'authorized_embed',
  verifiedAt: '2026-10-30',
  videoUrl: 'https://download.blender.org/demo/movies/Sintel.mp4',
  licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
  editorial: 10,
};
const remote = {
  id: 12,
  media_type: 'movie',
  title: 'Remote movie',
  original_title: 'Original',
  release_date: '2025-01-01',
  genre_ids: [18],
  overview: '',
  poster_path: '/poster.jpg',
  availability: 'free',
  videoUrl: 'https://evil.example/movie.mp4',
  director: 'Invented Director',
  cast: ['Invented Actor'],
};

afterEach(() => {
  vi.useRealTimers();
});
describe('catalog authorization and filtering', () => {
  it('never infers access or credits from unknown API fields', () => {
    const film = normalizeTmdbFilm(remote);
    expect(film).toMatchObject({
      availability: 'unavailable',
      playbackType: 'none',
      type: 'movie',
    });
    expect(film?.director).toBeUndefined();
    expect(film?.cast).toBeUndefined();
    expect(film?.videoUrl).toBeUndefined();
    expect(hasVerifiedFreeAccess(film!)).toBe(false);
  });
  it('normalizes TV separately and rejects invalid records', () => {
    expect(
      normalizeTmdbFilm({ ...remote, media_type: 'tv', name: '剧集', first_air_date: '2024-01-01' })
        ?.type,
    ).toBe('series');
    expect(normalizeTmdbFilm({ ...remote, genre_ids: 'bad' })).toBeNull();
    expect(normalizeTmdbFilm({ ...remote, release_date: 'not-a-date' })).toBeNull();
    expect(normalizeTmdbFilm({ ...remote, id: '__proto__' })).toBeNull();
  });
  it('combines filters and searches Chinese/English titles, director, cast and type', () => {
    const other: Film = {
      ...fixture,
      id: 'other',
      title: '其他',
      originalTitle: 'Other',
      year: 2020,
      type: 'series',
      availability: 'unavailable',
      editorial: 0,
    };
    expect(
      filterFilms([other, fixture], {
        query: 'sintel',
        type: 'movie',
        genre: '动画',
        year: 2010,
        country: '荷兰',
        availability: 'free',
      }),
    ).toEqual([fixture]);
    expect(filterFilms([fixture], { query: 'colin' })).toHaveLength(1);
    expect(filterFilms([fixture], { query: 'halina' })).toHaveLength(1);
    expect(filterFilms([fixture], { query: '电影' })).toHaveLength(1);
    expect(filterFilms([fixture], { query: 'series' })).toHaveLength(0);
    expect(filterFilms([fixture, other], { sort: 'year-desc' })[0].id).toBe('other');
    expect(filterFilms([other, fixture], { sort: 'editorial' })[0].id).toBe('sintel');
  });
  it('requires verification and source evidence for free external results', () => {
    const external: Film = {
      ...fixture,
      availability: 'external',
      playbackType: 'official_redirect',
      officialUrl: 'https://studio.blender.org/films/sintel/',
      sourceUrl: undefined,
    };
    expect(filterFilms([external], { availability: 'free' })).toEqual([]);
    expect(
      filterFilms([{ ...external, sourceUrl: external.officialUrl }], { availability: 'free' }),
    ).toHaveLength(1);
    expect(
      filterFilms(
        [
          { ...fixture, verifiedAt: undefined },
          { ...fixture, videoUrl: 'https://evil.example/a.mp4' },
        ],
        { availability: 'free' },
      ),
    ).toEqual([]);
  });
  it('uses the actual TMDB fetch endpoint and keeps remote entries unavailable', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ results: [remote] }) });
    const result = await getCatalog({ mode: 'tmdb', apiKey: 'public-key', fetcher });
    expect(result.mode).toBe('api');
    expect(fetcher.mock.calls[0][0]).toContain('https://api.themoviedb.org/3/trending/all/week');
    expect(result.films.find((film) => film.id === 'tmdb-movie-12')?.availability).toBe(
      'unavailable',
    );
  });
  it('falls back when requests exceed four seconds, even if fetch ignores abort', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>(() => new Promise<Response>(() => {}));
    const request = getCatalog({ mode: 'tmdb', apiKey: 'public-key', fetcher });
    await vi.advanceTimersByTimeAsync(4000);
    expect((await request).mode).toBe('local');
    const signal = fetcher.mock.calls[0][1]?.signal;
    expect(signal?.aborted).toBe(true);
  });
  it('falls back on network or schema errors and does not call API without config', async () => {
    const invalid = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ results: [{ bad: true }] }) });
    expect((await getCatalog({ mode: 'tmdb', apiKey: 'key', fetcher: invalid })).mode).toBe(
      'local',
    );
    const failing = vi.fn().mockRejectedValue(new Error('offline'));
    expect((await getCatalog({ mode: 'tmdb', apiKey: 'key', fetcher: failing })).mode).toBe(
      'local',
    );
    const unused = vi.fn();
    expect((await getCatalog({ mode: 'local', fetcher: unused })).mode).toBe('local');
    expect(unused).not.toHaveBeenCalled();
  });
  it('deduplicates local editorial films and preserves their verified access', async () => {
    const local = (await getCatalog({ mode: 'local' })).films[0];
    const duplicate = {
      ...remote,
      title: local.title,
      original_title: local.originalTitle,
      release_date: `${local.year}-01-01`,
    };
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [duplicate, remote, remote] }),
    });
    const result = await getCatalog({ mode: 'tmdb', apiKey: 'key', fetcher });
    expect(result.films.find((film) => film.id === local.id)?.availability).toBe(
      local.availability,
    );
    expect(result.films.filter((film) => film.id === 'tmdb-movie-12')).toHaveLength(1);
    expect(result.films.filter((film) => film.title === local.title)).toHaveLength(1);
  });
});
