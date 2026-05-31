import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AccessibleButton from '../components/AccessibleButton.jsx';
import AccessibleTextField from '../components/AccessibleTextField.jsx';
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
    <div className="card form-block">
      <h2 className="section-title">Вход в приложение</h2>
      <form onSubmit={handleSubmit} className="field-group">
        <AccessibleTextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <AccessibleTextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? <div className="error">{error}</div> : null}
        <AccessibleButton type="submit" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </AccessibleButton>
      </form>
      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
