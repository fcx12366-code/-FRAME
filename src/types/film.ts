export type FilmType = 'movie' | 'series' | 'documentary';
export type Availability = 'free' | 'trial' | 'external' | 'unavailable';
export type PlaybackType = 'authorized_embed' | 'official_redirect' | 'none';

export interface Film {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  type: FilmType;
  genres: string[];
  country?: string;
  duration?: number;
  description: string;
  director?: string;
  cast?: string[];
  poster: string;
  backdrop?: string;
  availability: Availability;
  provider?: string;
  officialUrl?: string;
  playbackType: PlaybackType;
  verifiedAt?: string;
  attribution?: string;
  videoUrl?: string;
  licenseUrl?: string;
  sourceUrl?: string;
  sourceNote?: string;
  imageCredit?: string;
  editorial?: number | boolean;
  seasons?: number;
  episodes?: {
    id: string;
    title: string;
    season: number;
    episode: number;
    officialUrl?: string;
    verifiedAt?: string;
  }[];
}

export type FilmSort = 'editorial' | 'year-desc' | 'year-asc' | 'title';
export interface FilmFilters {
  query?: string;
  type?: FilmType | 'all';
  genre?: string;
  year?: number | 'all';
  country?: string;
  availability?: Availability | 'all';
  sort?: FilmSort;
}

export interface Progress {
  time: number;
  duration: number;
  updatedAt: string;
}
