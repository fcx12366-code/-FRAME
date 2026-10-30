import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bookmark, Clock, Trash2 } from 'lucide-react';
import { useCatalog, useLibrary } from '../app/context';
import { FilmCard } from '../components/Film';
import { clearHistory, storageAvailable } from '../services/storage';
export default function Library() {
  const { films } = useCatalog();
  const { favorites, history } = useLibrary();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'history' ? 'history' : 'favorites';
  const setTab = (value: 'favorites' | 'history') =>
    setParams(value === 'history' ? { tab: 'history' } : {});
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    document.title = '我的片单 · FRAME 映间';
  }, []);
  const selected =
    tab === 'favorites'
      ? favorites.map((id) => films.find((f) => f.id === id)).filter((f) => !!f)
      : Object.keys(history)
          .sort((a, b) => history[b].updatedAt.localeCompare(history[a].updatedAt))
          .map((id) => films.find((f) => f.id === id))
          .filter((f) => !!f);
  return (
    <div className="page container">
      <div className="page-heading">
        <p className="section-kicker">YOUR PRIVATE SCREENING ROOM</p>
        <h1>
          留给下一次，
          <br />
          属于电影的时间。
        </h1>
        <p>收藏和观看进度仅保存在当前浏览器，无需登录。</p>
        {!storageAvailable() && (
          <p role="alert">浏览器存储不可用，当前片单仅在本次打开期间保留。</p>
        )}
      </div>
      <div className="library-toolbar">
        <div className="browse-tabs">
          <button
            aria-pressed={tab === 'favorites'}
            className={tab === 'favorites' ? 'active' : ''}
            onClick={() => {
              setTab('favorites');
              setConfirm(false);
            }}
          >
            <Bookmark size={16} />
            我的收藏 <small>{favorites.length}</small>
          </button>
          <button
            aria-pressed={tab === 'history'}
            className={tab === 'history' ? 'active' : ''}
            onClick={() => setTab('history')}
          >
            <Clock size={16} />
            观看记录 <small>{Object.keys(history).length}</small>
          </button>
        </div>
        {tab === 'history' && selected.length > 0 && (
          <button className="reset-filter" onClick={() => setConfirm(true)}>
            <Trash2 size={16} />
            清空观看记录
          </button>
        )}
      </div>
      {confirm && (
        <div className="confirmation" role="alert">
          <p>确定清空此浏览器的观看进度？收藏会保留。</p>
          <button className="button secondary" onClick={() => setConfirm(false)}>
            保留记录
          </button>
          <button
            className="button primary"
            onClick={() => {
              clearHistory();
              setConfirm(false);
            }}
          >
            确认清空
          </button>
        </div>
      )}
      {selected.length ? (
        <div className="film-grid">
          {selected.map((film) => (
            <div key={film.id}>
              <FilmCard film={film} />
              {tab === 'history' && (
                <div className="progress-caption">
                  <progress
                    value={history[film.id].time}
                    max={history[film.id].duration || 1}
                    aria-label={`${film.title}观看进度`}
                  />
                  <Link to={`/watch/${film.id}`}>
                    继续观看 · {Math.floor(history[film.id].time / 60)} 分钟{' '}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Bookmark size={36} />
          <h2>{tab === 'favorites' ? '你的私人片单，等第一部电影。' : '还没有开始一场放映。'}</h2>
          <p>
            {tab === 'favorites'
              ? '点击影片上的收藏图标，把想看的留在这里。'
              : '观看站内授权短片后，这里会记住你的进度。'}
          </p>
          <Link className="button primary" to="/browse/movie">
            去发现电影 <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
