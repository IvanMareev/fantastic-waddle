import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { clearToken, me as fetchMe, logout as apiLogout } from './api.js';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TopicsPage from './pages/TopicsPage.jsx';
import InterviewSessionPage from './pages/InterviewSessionPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import SessionsPage from "./pages/SessionsPage.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe()
      .then((data) => setUser(data))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));

  }, []);

  const handleLogout = async () => {
    await apiLogout();
    clearToken();
    setUser(null);
    setSession(null);
    navigate('/login');
  };

  if (loading) {
    return <div className="app-shell container">Загрузка...</div>;
  }

  return (
    <div className="app-shell container">
      <header className="header">
        <div>
          <h1>Fantastic Waddle UI</h1>
          <p>Приложение для управления интервью и вопросами через ваш Laravel API.</p>
        </div>
        <nav className="nav-links">
          {user ? (
            <>
              <Link to="/">Главная</Link>
              <Link to="/topics">Темы и вопросы</Link>
              <Link to="/session">Сессия</Link>
              <Link to="/session/results">Результаты</Link>
                <Link to="/sessions">Начатые интервью</Link>
              <button className="secondary-button" type="button" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Войти</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </nav>
      </header>

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
                  }}/>
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
  );
}

export default App;
