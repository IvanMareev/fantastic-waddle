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
    : '—';

  return (
    <div className="card" style={{ marginTop: 18, padding: 18 }}>
      <h3>Интервью завершено</h3>
      <p>Вы прошли все вопросы сессии.</p>
      <div style={{ marginTop: 12 }}>
        <h4>Итоговая статистика</h4>
        {sessionQuestions?.length ? (
          <>
            <p>Всего вопросов: {sessionQuestions.length}</p>
            <p>Отвечено: {sessionQuestions.filter((question) => question.user_answers?.length).length}</p>
            <div style={{ marginTop: 8 }}>
              <strong>Средняя оценка:</strong>{' '}
              {averageScore}/10
            </div>
            <div style={{ marginTop: 12 }}>
              <h5>Детали по вопросам</h5>
              <div className="card-grid">
                {sessionQuestions.map((question, idx) => {
                  const score = getScore(question);
                  return (
                    <div key={question.id} className="card" style={{ padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>Вопрос {idx + 1}</div>
                      <div style={{ marginTop: 6 }}>{question.question.question_text}</div>
                      <div style={{ marginTop: 8 }}><strong>Оценка:</strong> {score != null ? `${score}/10` : '—'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
