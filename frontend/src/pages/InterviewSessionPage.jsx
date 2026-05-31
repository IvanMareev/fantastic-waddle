import { useState } from 'react';
import AccessibleButton from '../components/AccessibleButton.jsx';
import AccessibleTextField from '../components/AccessibleTextField.jsx';
import { uploadAnswer } from '../api.js';

export default function InterviewSessionPage({ session }) {
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="card form-block">
        <h2 className="section-title">Сессия интервью</h2>
        <p className="message">Сначала создайте новую сессию на странице «Темы и вопросы».</p>
      </div>
    );
  }

  const questionOptions = session.session_questions || [];

  const handleUpload = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedQuestionId || !audioFile) {
      setError('Выберите вопрос и загрузите аудиофайл.');
      return;
    }

    setLoading(true);

    try {
      await uploadAnswer(session.id, Number(selectedQuestionId), audioFile);
      setMessage('Аудио отправлено, обработка запущена.');
      setAudioFile(null);
      setSelectedQuestionId('');
    } catch (err) {
      setError(err.payload?.message || 'Не удалось загрузить аудиофайл.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-block">
      <h2 className="section-title">Сессия интервью #{session.id}</h2>
      <div className="message">
        Статус: <span className="badge">{session.status}</span>
      </div>

      <div className="card-grid" style={{ marginTop: '20px' }}>
        {questionOptions.map((item) => (
          <div key={item.id} className="card" style={{ padding: '18px' }}>
            <h4>{item.question.question_text}</h4>
            <p>{item.question.expected_answer}</p>
            <div className="badge">Вопрос #{item.question_order}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleUpload} className="field-group" style={{ marginTop: '22px' }}>
        <div>
          <label className="block text-sm font-medium text-slate-800">Выберите вопрос</label>
          <select
            className="input-field"
            value={selectedQuestionId}
            onChange={(event) => setSelectedQuestionId(event.target.value)}
          >
            <option value="">-- Вопрос для ответа --</option>
            {questionOptions.map((item) => (
              <option key={item.id} value={item.question.id}>
                {item.question.question_text}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800">Аудиофайл</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
            className="input-field"
          />
        </div>

        {message ? <div className="success">{message}</div> : null}
        {error ? <div className="error">{error}</div> : null}

        <AccessibleButton type="submit" disabled={loading}>
          {loading ? 'Отправка...' : 'Загрузить аудио ответа'}
        </AccessibleButton>
      </form>
    </div>
  );
}
