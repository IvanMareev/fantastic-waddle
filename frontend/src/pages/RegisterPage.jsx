import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AccessibleButton from '../components/AccessibleButton.jsx';
import AccessibleTextField from '../components/AccessibleTextField.jsx';
import { register } from '../api.js';

export default function RegisterPage({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFieldChange = (setter) => (valueOrEvent) => {
    if (valueOrEvent && typeof valueOrEvent === 'object' && 'target' in valueOrEvent) {
      setter(valueOrEvent.target.value);
    } else {
      setter(valueOrEvent ?? '');
    }
  };

  const handleSubmit = async (event) => {
      alert('sdSA')
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(name, email, password);
        console.log(result)
      if (result.user) {
        onRegister(result.user);
        navigate('/topics');
      }
    } catch (err) {
      setError(err.payload?.message || 'Не удалось зарегистрироваться. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-block">
      <h2 className="section-title">Регистрация</h2>
      <form onSubmit={handleSubmit} className="field-group">
        <AccessibleTextField
          label="Имя"
          type="text"
          value={name}
          onChange={setName}
          required
        />
        <AccessibleTextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <AccessibleTextField
          label="Пароль"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        {error ? <div className="error">{error}</div> : null}
        <AccessibleButton type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </AccessibleButton>
      </form>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}
