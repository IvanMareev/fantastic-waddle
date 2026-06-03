import { useEffect, useState } from 'react';
import AccessibleButton from '../components/AccessibleButton.jsx';
import { uploadAnswer, fetchSessionAnswer } from '../api.js';

export default function InterviewSessionPage({ session }) {
  const [sessionQuestions, setSessionQuestions] = useState(session?.session_questions || []);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [answerResult, setAnswerResult] = useState(null);
  const [pollingQuestionId, setPollingQuestionId] = useState(null);

  useEffect(() => {
    setSessionQuestions(session?.session_questions || []);
  }, [session]);

  useEffect(() => {
    if (!pollingQuestionId || !session?.id) {
      return undefined;
    }

    let isCancelled = false;
    let intervalId = null;

    const pollAnswerStatus = async () => {
      try {
        const result = await fetchSessionAnswer(session.id, Number(pollingQuestionId));
        const status = result.status || result.data?.processing_step || '';

        if (isCancelled) {
          return;
        }

        setCurrentStatus(status);

        if (result.data) {
          setAnswerResult(result.data);
          setSessionQuestions((prev) =>
            prev.map((item) =>
              item.id === result.data.session_question_id
                ? { ...item, user_answers: [result.data] }
                : item
            )
          );
        }

        if (status === 'completed' || status === 'failed') {
          setPolling(false);
          setPollingQuestionId(null);
          setMessage(status === 'completed' ? 'Ответ обработан.' : 'Обработка ответа завершилась с ошибкой.');
        }
      } catch (err) {
        if (isCancelled) {
          return;
        }

        setError(err.payload?.message || 'Не удалось получить статус ответа.');
        setPolling(false);
        setPollingQuestionId(null);
      }
    };

    setPolling(true);
    setMessage('Ожидание результата проверки ответа...');
    setError('');
    pollAnswerStatus();
    intervalId = setInterval(pollAnswerStatus, 500);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [pollingQuestionId, session?.id]);

  if (!session) {
    return (
      <div className="card form-block">
        <h2 className="section-title">Сессия интервью</h2>
        <p className="message">Сначала создайте новую сессию на странице «Темы и вопросы».</p>
      </div>
    );
  }

  const questionOptions = sessionQuestions || [];
  const isBusy = loading || polling;

  const parseAiExplanation = (explanation) => {
    if (!explanation) {
      return null;
    }

    try {
      return JSON.parse(explanation);
    } catch {
      return null;
    }
  };

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
      const result = await uploadAnswer(session.id, Number(selectedQuestionId), audioFile);
      const feedback = result.message || 'Аудио отправлено, проверка запущена.';

      if (result.success) {
        setMessage(feedback);
        setAnswerResult(null);
        setCurrentStatus('uploaded');
        setPollingQuestionId(selectedQuestionId);
        setAudioFile(null);
        setSelectedQuestionId('');
      } else if (result.status) {
        setMessage(feedback);
        setCurrentStatus(result.status);
        setPollingQuestionId(selectedQuestionId);
      } else {
        setError(feedback);
      }
    } catch (err) {
      setError(err.payload?.message || 'Не удалось загрузить аудиофайл.');
    } finally {
      setLoading(false);
    }
  };

  const parsedExplanation = parseAiExplanation(answerResult?.ai_explanation);

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
            {item.user_answers?.[0]?.processing_step ? (
              <div className="badge secondary" style={{ marginTop: '8px' }}>
                Статус: {item.user_answers[0].processing_step}
              </div>
            ) : null}
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
              <option key={item.id} value={item.id}>
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
        {currentStatus ? (
          <div className="message">
            Статус проверки: <strong>{currentStatus}</strong>
          </div>
        ) : null}
        {error ? <div className="error">{error}</div> : null}

        <AccessibleButton type="submit" disabled={isBusy}>
          {isBusy ? 'Ожидание...' : 'Загрузить аудио ответа'}
        </AccessibleButton>
      </form>

      {answerResult ? (
        <div className="card" style={{ marginTop: '22px', padding: '18px' }}>
          <h3>Результат проверки</h3>
          <p>
            <strong>Статус:</strong> {answerResult.processing_step}
          </p>
          {answerResult.transcript ? (
            <p>
              <strong>Транскрипт:</strong> {answerResult.transcript}
            </p>
          ) : null}
          {answerResult.is_correct !== null ? (
            <p>
              <strong>Правильность:</strong> {answerResult.is_correct ? 'Да' : 'Нет'}
            </p>
          ) : null}
          {parsedExplanation ? (
            <div>
              <p>
                <strong>Итог:</strong> {parsedExplanation.final_comment}
              </p>
              <p>
                <strong>Общий балл:</strong> {parsedExplanation.summary_score}
              </p>
            </div>
          ) : answerResult.ai_explanation ? (
            <div>
              <strong>AI объяснение:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{answerResult.ai_explanation}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
