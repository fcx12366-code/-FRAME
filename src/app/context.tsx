import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { Film } from '../types/film';
import local from '../data/films.json';
import { getCatalog } from '../services/catalog';
import { getSnapshot, subscribe } from '../services/storage';
const Catalog = createContext<{ films: Film[]; mode: string; notice?: string }>({
  films: local as Film[],
  mode: 'local',
});
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<{ films: Film[]; mode: string; notice?: string }>({
    films: local as Film[],
    mode: 'local',
  });
  useEffect(() => {
    let alive = true;
    getCatalog()
      .then((result) => {
        if (alive) setCatalog(result);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return <Catalog.Provider value={catalog}>{children}</Catalog.Provider>;
}
export const useCatalog = () => useContext(Catalog);
export const useLibrary = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
