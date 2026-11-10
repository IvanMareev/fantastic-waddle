import { useEffect, useState } from 'react';
import AccessibleButton from '../components/AccessibleButton.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import Alert from '../components/Alert.jsx';
import { fetchTopics, fetchQuestionsByTopic, startInterviewSession } from '../api.js';

export default function TopicsPage({ onSessionCreated }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [answerModalQuestion, setAnswerModalQuestion] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(() => setError('Не удалось загрузить темы.'));
  }, []);

  useEffect(() => {
    if (!selectedTopicIds || selectedTopicIds.length === 0) {
      setQuestions([]);
      setSelectedIds([]);
      return;
    }

    Promise.all(selectedTopicIds.map((t) => fetchQuestionsByTopic(t).then((r) => r.data || []).catch(() => [])))
      .then((arrays) => {
        const merged = arrays.flat();
        const map = new Map();
        merged.forEach((q) => map.set(q.id, q));
        setQuestions(Array.from(map.values()));
      })
      .catch(() => setError('Не удалось загрузить вопросы для выбранных тем.'));
  }, [selectedTopicIds]);

  const hasSelection = selectedIds.length > 0;

  const toggleTopic = (topicId) => {
    setSelectedTopicIds((prev) => (prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]));
  };

  const toggleSelection = (questionId) => {
    setSelectedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const randomPick = (n) => {
    const pool = [...questions];
    const picked = [];
    while (pool.length && picked.length < n) {
      const idx = Math.floor(Math.random() * pool.length);
      const [q] = pool.splice(idx, 1);
      picked.push(q.id);
    }
    setSelectedIds((prev) => Array.from(new Set([...(prev || []), ...picked])));
  };

  const clearSelection = () => setSelectedIds([]);

  const handleStartSession = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await startInterviewSession(selectedIds);
      setMessage('Сессия успешно создана. Переходим к интервью…');
      onSessionCreated(result.data);
    } catch (err) {
      setError(err.payload?.message || 'Не удалось создать сессию.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">Темы и вопросы</h1>
        <p className="page-subtitle">Выберите темы, отметьте вопросы и создайте интервью-сессию.</p>
      </div>

      {error && !topics.length ? <Alert variant="error">{error}</Alert> : null}

      <section>
        <h2 className="section__title" style={{ fontSize: 20 }}>Темы</h2>
        <div style={{ marginTop: 14 }}>
          {topics.length ? (
            <div className="topics-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`chip ${selectedTopicIds.includes(topic.id) ? 'is-selected' : ''}`}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <span className="chip__dot">{String(topic.id).padStart(2, '0')}</span>
                  {topic.title}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="spinner" />
              <p className="empty__text">Загружаем темы…</p>
            </div>
          )}
        </div>
      </section>

      {selectedTopicIds.length ? (
        <>
          <section>
            <div className="selection-bar">
              <div className="selection-bar__info">
                <span className="selection-bar__count">
                  Выбрано вопросов: {selectedIds.length}
                </span>
                <span className="selection-bar__hint">
                  Всего вопросов в выбранных темах: {questions.length}
                </span>
              </div>
              <AccessibleButton
                variant="primary"
                type="button"
                disabled={!hasSelection || loading}
                onPress={handleStartSession}
              >
                {loading ? 'Создаём сессию…' : `Создать сессию из ${selectedIds.length} вопросов`}
              </AccessibleButton>
            </div>
          </section>

          {questions.length ? (
            <section>
              <div className="page-header__row">
                <div className="page-header" style={{ gap: 4 }}>
                  <h2 className="section__title" style={{ fontSize: 20 }}>Вопросы</h2>
                  <p className="page-subtitle" style={{ fontSize: 14 }}>
                    Нажмите на карточку, чтобы выбрать вопрос для сессии.
                  </p>
                </div>
              </div>

              <div className="quick-actions" style={{ margin: '16px 0' }}>
                <span className="quick-actions__label">Быстрый выбор:</span>
                <AccessibleButton variant="secondary" size="sm" type="button" onPress={() => randomPick(5)}>5</AccessibleButton>
                <AccessibleButton variant="secondary" size="sm" type="button" onPress={() => randomPick(10)}>10</AccessibleButton>
                <AccessibleButton variant="secondary" size="sm" type="button" onPress={() => randomPick(20)}>20</AccessibleButton>
                <AccessibleButton variant="secondary" size="sm" type="button" onPress={() => randomPick(30)}>30</AccessibleButton>
                <AccessibleButton variant="secondary" size="sm" type="button" onPress={() => setSelectedIds(questions.map((q) => q.id))}>
                  Все
                </AccessibleButton>
                <AccessibleButton variant="ghost" size="sm" type="button" onPress={clearSelection}>
                  Очистить
                </AccessibleButton>
              </div>

              <div className="question-grid">
                {questions.map((question, idx) => (
                  <QuestionCard
                    key={question.id}
                    order={idx + 1}
                    question={question}
                    selected={selectedIds.includes(question.id)}
                    onClick={() => toggleSelection(question.id)}
                    onShowAnswer={() => setAnswerModalQuestion(question)}
                  />
                ))}
              </div>
            </section>
          ) : (
            <div className="empty">
              <p className="empty__title">Вопросы загружаются…</p>
              <div className="spinner spinner--lg" />
            </div>
          )}
        </>
      ) : (
        <div className="empty">
          <p className="empty__title">Выберите хотя бы одну тему</p>
          <p className="empty__text">После выбора темы здесь появятся вопросы для интервью-сессии.</p>
        </div>
      )}

      {message ? <Alert variant="success">{message}</Alert> : null}
      {error && topics.length ? <Alert variant="error">{error}</Alert> : null}

      {answerModalQuestion ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setAnswerModalQuestion(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Закрыть" onClick={() => setAnswerModalQuestion(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3 className="modal-title">Ожидаемый ответ</h3>
            <p className="modal-body">{answerModalQuestion.expected_answer || 'Описание ожидаемого ответа отсутствует.'}</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}