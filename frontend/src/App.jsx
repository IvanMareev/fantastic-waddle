import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, me as fetchMe, logout as apiLogout } from './api.js';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TopicsPage from './pages/TopicsPage.jsx';
import InterviewSessionPage from './pages/InterviewSessionPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import SessionsPage from "./pages/SessionsPage.jsx";

function BrandLogo({ size }) {
  return (
    <svg
      width={size || 18}
      height={size || 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

const NAV_LINKS = [
  { to: '/', label: 'Главная', end: true },
  { to: '/topics', label: 'Темы и вопросы' },
  { to: '/session', label: 'Сессия' },
  { to: '/sessions', label: 'Начатые интервью' },
  { to: '/session/results', label: 'Результаты' },
];

function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMe()
      .then((data) => setUser(data))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await apiLogout();
    clearToken();
    setUser(null);
    setSession(null);
    setMenuOpen(false);
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : '?';

  if (loading) {
    return (
      <div className="splash">
        <div className="splash__logo">
          <BrandLogo size={26} />
        </div>
        <div className="spinner spinner--lg" />
        <div className="splash__text">Загрузка приложения…</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand__logo"><BrandLogo size={16} /></span>
            <span className="brand__name">PrepVoice</span>
          </Link>

          {user ? (
            <nav className="nav desktop" aria-label="Основная навигация">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="header__actions">
            <div className="header__auth">
              {user ? (
                <>
                  <span className="user-chip">
                    <span className="user-chip__avatar">{initials}</span>
                    {user.name || user.email}
                  </span>
                  <button type="button" className="btn btn--secondary" onClick={handleLogout}>
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn--ghost">Войти</Link>
                  <Link to="/register" className="btn btn--primary">Регистрация</Link>
                </>
              )}
            </div>
            <button
              type="button"
              className="menu-toggle"
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className={`nav-sheet container ${menuOpen ? 'nav-sheet--open' : ''}`}>
          {user ? (
            <>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="nav-sheet__user">
                <span className="user-chip">
                  <span className="user-chip__avatar">{initials}</span>
                  {user.name || user.email}
                </span>
              </div>
              <button type="button" className="btn btn--secondary nav-sheet__logout" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav__link">Войти</Link>
              <Link to="/register" className="nav__link">Регистрация</Link>
            </>
          )}
        </div>
      </header>

      <main className="app-shell__main">
        <div className="container">
          <Routes>
            <Route path="/" element={user ? <DashboardPage user={user} /> : <LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={setUser} />} />
            <Route path="/register" element={<RegisterPage onRegister={setUser} />} />
            <Route
              path="/topics"
              element={
                user ? (
                  <TopicsPage onSessionCreated={(sessionData) => {
                    setSession(sessionData);
                    navigate('/session');
                  }} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/session"
              element={
                user ? (
                  <InterviewSessionPage session={session} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/sessions"
              element={
                user ? (
                  <SessionsPage onSessionContinue={(sessionData) => {
                    setSession(sessionData);
                    navigate('/session');
                  }} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/session/results"
              element={
                user ? (
                  <ResultsPage session={session} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;