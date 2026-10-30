import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, LoaderCircle, Play } from 'lucide-react';
import { useCatalog } from '../app/context';
import { getHistory, saveProgress } from '../services/storage';
import { safeOfficialUrl, safeVideoUrl } from '../utils/links';
import { NotFound } from '../app/App';
import { PlaybackLink, SaveButton } from '../components/Film';
import { hasVerifiedFreeAccess } from '../services/catalog';
export default function Watch() {
  const { id } = useParams();
  const { films } = useCatalog();
  const film = films.find((f) => f.id === id);
  const ref = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [attempt, setAttempt] = useState(0);
  const lastSaved = useRef(0);
  useEffect(() => {
    document.title = `${film?.title || '放映室'} · FRAME 放映室`;
  }, [film]);
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus('error'), 20000);
    return () => clearTimeout(timer);
  }, [status]);
  useEffect(() => {
    const video = ref.current;
    const persist = () => {
      if (video && id && video.currentTime > 0) saveProgress(id, video.currentTime, video.duration);
    };
    window.addEventListener('pagehide', persist);
    return () => {
      persist();
      window.removeEventListener('pagehide', persist);
    };
  }, [id, attempt]);
  if (!film) return <NotFound />;
  const src =
    film.playbackType === 'authorized_embed' && hasVerifiedFreeAccess(film)
      ? safeVideoUrl(film.videoUrl)
      : null;
  if (!src)
    return (
      <div className="page container empty-state">
        <h1>这部作品在官方平台放映</h1>
        <p>本站没有此片的站内播放授权。</p>
        <PlaybackLink film={film} />
        <Link className="underlined-link" to={`/film/${film.id}`}>
          返回影片详情
        </Link>
      </div>
    );
  const official = safeOfficialUrl(film.officialUrl);
  const persist = () => {
    const v = ref.current;
    if (v && v.currentTime > 0) saveProgress(film.id, v.currentTime, v.duration);
  };
  return (
    <div className="watch-page container">
      <Link className="back-inline" to={`/film/${film.id}`}>
        <ArrowLeft size={18} />
        返回影片详情
      </Link>
      <div className="player-frame">
        <video
          key={attempt}
          ref={ref}
          controls
          playsInline
          preload="none"
          poster={film.backdrop || film.poster}
          src={src}
          aria-label={`${film.title}授权全片播放器`}
          onLoadStart={() => {
            if (ref.current && !ref.current.paused) setStatus('loading');
          }}
          onPlay={() => {
            if (ref.current && ref.current.readyState < 3) setStatus('loading');
          }}
          onLoadedMetadata={() => {
            const v = ref.current;
            const progress = getHistory()[film.id];
            if (v && progress && progress.time < v.duration - 5) v.currentTime = progress.time;
            setStatus('ready');
          }}
          onCanPlay={() => setStatus('ready')}
          onPlaying={() => setStatus('ready')}
          onWaiting={() => {
            if (ref.current && !ref.current.paused) setStatus('loading');
          }}
          onError={() => setStatus('error')}
          onPause={persist}
          onEnded={persist}
          onTimeUpdate={() => {
            if (Date.now() - lastSaved.current > 4000) {
              persist();
              lastSaved.current = Date.now();
            }
          }}
        />
        {status === 'idle' && (
          <button
            className="button primary player-start"
            onClick={() => {
              setStatus('loading');
              ref.current?.play().catch(() => setStatus('error'));
            }}
          >
            <Play size={20} fill="currentColor" /> 开始放映
          </button>
        )}
        {status === 'loading' && (
          <div className="player-status" role="status">
            <LoaderCircle size={20} />
            视频加载中…
          </div>
        )}
        {status === 'error' && (
          <div className="player-error" role="alert">
            <h2>暂时无法连接视频源</h2>
            <p>影片由官方服务器提供，可能受到网络或地区可用性的影响。</p>
            <div>
              <button
                className="button primary"
                onClick={() => {
                  setStatus('idle');
                  setAttempt((n) => n + 1);
                }}
              >
                重新加载
              </button>
              {official && (
                <a
                  className="button secondary"
                  href={official}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  前往官方页面 <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="watch-caption">
        <div>
          <p className="section-kicker">FRAME SCREENING ROOM</p>
          <h1>
            {film.title}
            <span className="serif">{film.originalTitle}</span>
          </h1>
          <p>
            {film.year} · 完整影片 · {film.provider}
          </p>
        </div>
        <SaveButton film={film} />
      </div>
      <div className="watch-notes">
        <p>{film.attribution}</p>
        <p>
          保留影片原始片尾。进度仅保存在当前浏览器，可在“我的收藏 →
          观看记录”中管理。字幕以原片为准，当前未提供额外中文字幕。
        </p>
        <Link to="/about#sources">
          播放与授权说明 <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
