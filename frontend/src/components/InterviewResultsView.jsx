import { Link } from 'react-router-dom';

export default function InterviewResultsView({ sessionQuestions }) {
  const getScore = (question) => {
    const answer = question.user_answers?.[0];
    const parsed = answer?.ai_explanation ? (() => {
      try { return JSON.parse(answer.ai_explanation); } catch { return null; }
    })() : null;

    return parsed?.summary_score ?? answer?.score ?? null;
  };

  const scores = sessionQuestions
    .map((question) => getScore(question))
    .filter((score) => score != null)
    .map(Number);

  const averageScore = scores.length
    ? (scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1)
    : null;

  const answered = sessionQuestions.filter((question) => question.user_answers?.length).length;

  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="result-top" style={{ alignItems: 'center' }}>
        <div className="start-card__icon" aria-hidden>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="8 12 11 15 16 9" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 className="page-title" style={{ fontSize: 24 }}>Интервью завершено</h2>
          <p className="page-subtitle">Вы прошли все вопросы сессии. Ниже — итоговая статистика.</p>
        </div>
      </div>

      <div className="results-summary" style={{ marginTop: 20 }}>
        <div className="result-stat card card--muted">
          <span className="result-stat__label">Всего вопросов</span>
          <span className="result-stat__value">{sessionQuestions?.length || 0}</span>
        </div>
        <div className="result-stat card card--muted">
          <span className="result-stat__label">Отвечено</span>
          <span className="result-stat__value">{answered}</span>
        </div>
        <div className="result-stat card card--muted">
          <span className="result-stat__label">Средняя оценка</span>
          <span className="result-stat__value">{averageScore != null ? `${averageScore}/10` : '—'}</span>
        </div>
      </div>

      {sessionQuestions?.length ? (
        <div className="stack" style={{ marginTop: 22 }}>
          <h3 className="result-section__title">Детали по вопросам</h3>
          {sessionQuestions.map((question, idx) => {
            const score = getScore(question);
            return (
              <div key={question.id} className="result-row">
                <div className="result-row__head">
                  <span>Вопрос {idx + 1}</span>
                  <span className="result-row__score">{score != null ? `${score}/10` : '—'}</span>
                </div>
                <div className="result-row__text">{question.question.question_text}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="result-actions" style={{ marginTop: 8 }}>
        <Link to="/session/results" className="btn btn--primary">
          Открыть подробный отчёт
        </Link>
      </div>
    </div>
  );
}