import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AccessibleButton from '../components/AccessibleButton.jsx';
import AccessibleTextField from '../components/AccessibleTextField.jsx';
import Alert from '../components/Alert.jsx';
import { login, me } from '../api.js';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.access_token) {
        const profile = await me();
        onLogin(profile);
        navigate('/topics');
      }
    } catch (err) {
      setError(err.payload?.error || 'Не удалось войти. Проверьте e-mail и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <div className="auth-card__logo" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </div>
          <h1 className="page-title">Вход</h1>
          <p className="page-subtitle">Продолжите подготовку к собеседованиям.</p>
        </div>

        <form onSubmit={handleSubmit} className="stack">
          <AccessibleTextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            placeholder="you@example.com"
          />
          <AccessibleTextField
            label="Пароль"
            type="password"
            value={password}
            onChange={setPassword}
            required
            placeholder="Ваш пароль"
          />
          {error ? <Alert variant="error">{error}</Alert> : null}
          <AccessibleButton type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Входим…' : 'Войти'}
          </AccessibleButton>
        </form>

        <p className="auth-card__foot">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}