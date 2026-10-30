import { Component, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bookmark, Menu, Search, X } from 'lucide-react';
import { CatalogProvider, useCatalog, useLibrary } from './context';
import Home from '../pages/Home';
import Browse from '../pages/Browse';
import Detail from '../pages/Detail';
import Library from '../pages/Library';
import Collections from '../pages/Collections';
import About from '../pages/About';
import Watch from '../pages/Watch';

function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { favorites } = useLibrary();
  useEffect(() => {
    setOpen(false);
    const frame = requestAnimationFrame(() => {
      let hashId = location.hash.slice(1);
      try {
        hashId = decodeURIComponent(hashId);
      } catch {
        /* Malformed fragments remain harmless text. */
      }
      const target = hashId ? document.getElementById(hashId) : null;
      if (target) {
        target.scrollIntoView();
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      } else {
        window.scrollTo(0, 0);
        document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        document.querySelector<HTMLElement>('.menu-toggle')?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  const links = [
    ['/', '首页'],
    ['/browse/movie', '电影'],
    ['/browse/series', '电视剧'],
    ['/browse/documentary', '纪录片'],
    ['/collections', '专题'],
  ];
  return (
    <header className={`header ${scrolled || location.pathname !== '/' ? 'solid' : ''}`}>
      <div className="nav-shell">
        <Link to="/" className="brand" aria-label="FRAME 映间首页">
          FR<span>A</span>ME<i>映间</i>
        </Link>
        <nav
          className={`nav-links ${open ? 'expanded' : ''}`}
          id="main-navigation"
          aria-label="主导航"
        >
          {links.map(([to, text]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>
              {text}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to="/search" className="icon-link" aria-label="搜索影片">
            <Search size={20} />
          </Link>
          <Link to="/library" className="library-link">
            <Bookmark size={18} />
            <span>我的收藏</span>
            {favorites.length > 0 && <small>{favorites.length}</small>}
          </Link>
          <button
            className="icon-link menu-toggle"
            aria-label={open ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
function Footer() {
  const { mode, notice } = useCatalog();
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <Link to="/" className="brand">
            FRAME<i>映间</i>
          </Link>
          <p>让电影被更好地发现。</p>
        </div>
        <div className="footer-links">
          <Link to="/about">
            关于映间 <ArrowUpRight size={14} />
          </Link>
          <Link to="/about#sources">影片与图片来源</Link>
          <Link to="/about#copyright">版权与外部平台说明</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} FRAME · 独立电影发现计划</span>
        <span>
          {mode === 'api' ? '影视资料 API + 编辑片库' : '本地编辑片库'} · 观看状态以官方平台为准
        </span>
      </div>
      {notice && (
        <p className="data-notice" role="status">
          {notice}
        </p>
      )}
    </footer>
  );
}
export function NotFound() {
  return (
    <div className="empty-state container">
      <span className="serif">Not in this frame.</span>
      <h1>这一页暂时不在画面里</h1>
      <p>链接可能有误，去片库发现下一部电影。</p>
      <Link className="button primary" to="/browse/movie">
        浏览电影 <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty-state">
        <h1>画面暂时中断</h1>
        <p>请重新加载。你的浏览器片单不会因此被清空。</p>
        <button className="button primary" onClick={() => window.location.reload()}>
          重新加载
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <CatalogProvider>
        <a href="#main" className="skip-link">
          跳至主要内容
        </a>
        <Navigation />
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse/:type" element={<Browse />} />
            <Route path="/search" element={<Browse search />} />
            <Route path="/film/:id" element={<Detail />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/library" element={<Library />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:id" element={<Collections />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </CatalogProvider>
    </ErrorBoundary>
  );
}
