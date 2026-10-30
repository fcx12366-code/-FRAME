import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { collections } from '../data/collections';
import { useCatalog } from '../app/context';
import { FilmCard } from '../components/Film';
import { NotFound } from '../app/App';
export default function Collections() {
  const { id } = useParams();
  const { films } = useCatalog();
  const collection = collections.find((c) => c.id === id);
  useEffect(() => {
    document.title = `${collection?.title || '电影专题'} · FRAME 映间`;
  }, [collection]);
  if (id && !collection) return <NotFound />;
  return (
    <div className="page container">
      {collection ? (
        <>
          <div className="collection-page-heading">
            <span className="issue-number">{collection.number}</span>
            <div>
              <p className="section-kicker">{collection.label}</p>
              <h1>{collection.title}</h1>
              <p className="serif">{collection.english}</p>
              <p>{collection.description}</p>
            </div>
          </div>
          {collection.image && (
            <img
              className="collection-banner"
              src={collection.image}
              alt={`${collection.title}专题电影画面`}
              width="1920"
              height="650"
            />
          )}
          <div className="collection-list">
            {collection.films
              .map((id) => films.find((f) => f.id === id))
              .filter((f) => !!f)
              .map((film, i) => (
                <div className="collection-entry" key={film.id}>
                  <span className="serif">0{i + 1}</span>
                  <FilmCard film={film} wide />
                  <div>
                    <h2>{film.title}</h2>
                    <p>{film.description}</p>
                    <Link className="underlined-link" to={`/film/${film.id}`}>
                      查看作品 <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <>
          <div className="page-heading">
            <p className="section-kicker">THE FRAME COLLECTIONS</p>
            <h1>
              电影之间，
              <br />
              还有另一种联系。
            </h1>
            <p>沿着一条线索，看见不同影像之间的回声。</p>
          </div>
          <div className="collections-index">
            {collections.map((c) => (
              <Link className="collection-index-entry" key={c.id} to={`/collections/${c.id}`}>
                <div className={`collection-index-image ${!c.image ? 'textual' : ''}`}>
                  {c.image ? (
                    <img src={c.image} alt={c.title} width="1920" height="650" loading="lazy" />
                  ) : (
                    <span className="serif">
                      Time &<br />
                      Memory.
                    </span>
                  )}
                  <span className="issue-number">{c.number}</span>
                </div>
                <div>
                  <p>
                    {c.label} · {c.films.length} 部作品
                  </p>
                  <h2>
                    {c.title}
                    <ArrowUpRight size={24} />
                  </h2>
                  <p>{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
