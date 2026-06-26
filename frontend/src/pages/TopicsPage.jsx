import { useEffect, useMemo, useState } from 'react';
import AccessibleButton from '../components/AccessibleButton.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import { fetchTopics, fetchQuestionsByTopic, startInterviewSession } from '../api.js';

export default function TopicsPage({ onSessionCreated }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
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
    // Load questions for all selected topics
    if (!selectedTopicIds || selectedTopicIds.length === 0) {
      setQuestions([]);
      setSelectedIds([]);
      return;
    }

    Promise.all(selectedTopicIds.map((t) => fetchQuestionsByTopic(t).then((r) => r.data || []).catch(() => [])))
      .then((arrays) => {
        const merged = arrays.flat();
        // unique by id
        const map = new Map();
        merged.forEach((q) => map.set(q.id, q));
        setQuestions(Array.from(map.values()));
      })
      .catch(() => setError('Не удалось загрузить вопросы для выбранных тем.'));
  }, [selectedTopicIds]);

  const hasSelection = selectedIds.length > 0;
  const selectedTopic = useMemo(() => topics.find((topic) => topic.id === Number(selectedTopicId)), [topics, selectedTopicId]);

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
        <label className="block text-sm font-medium text-slate-800">Выберите темы (можно несколько)</label>
        <div className="topics-row">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className={`topic-chip ${selectedTopicIds.includes(topic.id) ? 'selected' : ''}`}
              onClick={() => toggleTopic(topic.id)}
            >
              {topic.title}
            </button>
          ))}
        </div>
      </div>

      {selectedTopicIds.length ? (
        <div className="card" style={{ padding: '18px' }}>
          <h3>Выбранные темы</h3>
          <p className="muted">{selectedTopicIds.length} тем(ы) выбраны. Пул вопросов обновлён.</p>
        </div>
      ) : null}

      {questions.length ? (
        <>
          <div className="quick-actions" style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <AccessibleButton type="button" onPress={() => randomPick(5)}>Выбрать 5 случайных</AccessibleButton>
            <AccessibleButton type="button" onPress={() => randomPick(10)}>Выбрать 10 случайных</AccessibleButton>
            <AccessibleButton type="button" onPress={() => randomPick(20)}>Выбрать 20 случайных</AccessibleButton>
            <AccessibleButton type="button" onPress={() => randomPick(30)}>Выбрать 30 случайных</AccessibleButton>
            <AccessibleButton type="button" onPress={() => setSelectedIds(questions.map((q) => q.id))}>Выбрать все</AccessibleButton>
            <AccessibleButton type="button" onPress={clearSelection}>Очистить выбор</AccessibleButton>
            <div style={{ marginLeft: 'auto', alignSelf: 'center' }}><strong>Выбрано вопросов: {selectedIds.length}</strong></div>
          </div>

          <div className="card-grid" style={{ marginTop: '20px' }}>
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
        </>
      ) : selectedTopicIds.length ? (
        <p className="message">У выбранных тем нет доступных вопросов.</p>
      ) : null}

      {message ? <div className="success message">{message}</div> : null}
      {error ? <div className="error message">{error}</div> : null}

      <AccessibleButton type="button" disabled={!hasSelection || loading} onPress={handleStartSession}>
        {loading ? 'Создаем сессию...' : `Создать сессию из ${selectedIds.length} вопросов`}
      </AccessibleButton>

      {answerModalQuestion ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <button className="modal-close" type="button" onClick={() => setAnswerModalQuestion(null)}>✕</button>
            <div className="modal-content">
              <h3>Ожидаемый ответ</h3>
              <p className="muted" style={{ marginTop: '12px', lineHeight: 1.8 }}>{answerModalQuestion.expected_answer}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
