import { useEffect, useMemo, useState } from 'react';
import AccessibleButton from '../components/AccessibleButton.jsx';
import AccessibleCheckbox from '../components/AccessibleCheckbox.jsx';
import AccessibleTextField from '../components/AccessibleTextField.jsx';
import { fetchTopics, fetchQuestionsByTopic, startInterviewSession } from '../api.js';

export default function TopicsPage({ onSessionCreated }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(() => setError('Не удалось загрузить темы.'));
  }, []);

  useEffect(() => {
    if (!selectedTopicId) {
      setQuestions([]);
      setSelectedIds([]);
      return;
    }

    fetchQuestionsByTopic(selectedTopicId)
      .then((data) => setQuestions(data.data || []))
      .catch(() => setError('Не удалось загрузить вопросы для темы.'));
  }, [selectedTopicId]);

  const hasSelection = selectedIds.length > 0;
  const selectedTopic = useMemo(() => topics.find((topic) => topic.id === Number(selectedTopicId)), [topics, selectedTopicId]);

  const toggleSelection = (questionId) => {
    setSelectedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleStartSession = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await startInterviewSession(selectedIds);
      setMessage('Сессия успешно создана. Перейдите на страницу сессии.');
      onSessionCreated(result.data);
    } catch (err) {
      setError(err.payload?.message || 'Не удалось создать сессию.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-block">
      <h2 className="section-title">Темы и вопросы</h2>
      <div className="field-group">
        <label className="block text-sm font-medium text-slate-800">Выберите тему</label>
        <select
          className="input-field"
          value={selectedTopicId}
          onChange={(event) => setSelectedTopicId(event.target.value)}
        >
          <option value="">-- Выберите тему --</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </div>

      {selectedTopic ? (
        <div className="card" style={{ padding: '18px' }}>
          <h3>{selectedTopic.title}</h3>
          <p>{selectedTopic.description || 'Описание темы отсутствует.'}</p>
        </div>
      ) : null}

      {questions.length ? (
        <div className="card-grid" style={{ marginTop: '20px' }}>
          {questions.map((question) => (
            <div key={question.id} className="card" style={{ padding: '18px' }}>
              <div className="flex items-center justify-between">
                <h4>{question.question_text}</h4>
                <AccessibleCheckbox
                  label="Выбрать"
                  isSelected={selectedIds.includes(question.id)}
                  onChange={() => toggleSelection(question.id)}
                  value={String(question.id)}
                  name="selectedQuestions"
                />
              </div>
              <p>{question.expected_answer}</p>
            </div>
          ))}
        </div>
      ) : selectedTopicId ? (
        <p className="message">У данной темы нет доступных вопросов.</p>
      ) : null}

      {message ? <div className="success message">{message}</div> : null}
      {error ? <div className="error message">{error}</div> : null}

      <AccessibleButton type="button" disabled={!hasSelection || loading} onPress={handleStartSession}>
        {loading ? 'Создаем сессию...' : 'Создать сессию из выбранных вопросов'}
      </AccessibleButton>
    </div>
  );
}
