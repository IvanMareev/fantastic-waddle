import { useMemo } from 'react';

function mapToFive(v) {
  if (v == null) return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  // assume incoming scale 0-10 or 1-10, map to 1-5
  const scaled = Math.round(Math.max(1, Math.min(10, n)) / 2);
  return Math.max(1, Math.min(5, scaled));
}

function barColor(score) {
  if (score >= 5) return '#22a06b';
  if (score >= 4) return '#65a30d';
  if (score >= 3) return '#d9971f';
  return '#d8454c';
}

export default function ResultsPage({ session }) {
  const entries = session?.session_questions || [];

  const summary = useMemo(() => {
    const scores = entries.map((q) => {
      const a = q.user_answers?.[0];
      const parsed = a?.ai_explanation ? (() => { try { return JSON.parse(a.ai_explanation); } catch { return null } })() : null;
      return mapToFive(parsed?.summary_score ?? a?.score ?? null);
    }).filter((s) => s != null);

    if (!scores.length) return { avg: null };
    const avg = (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2);
    return { avg };
  }, [entries]);

  const answered = entries.filter((q) => q.user_answers?.length).length;

  return (
    <main className="page">
      <div className="page-header__row">
        <div className="page-header">
          <h1 className="page-title">Результаты сессии #{session?.id}</h1>
          <p className="page-subtitle">
            Средняя оценка по всем отвеченным вопросам сессии.
          </p>
        </div>
      </div>

      <div className="results-summary">
        <div className="result-stat card">
          <span className="result-stat__label">Средняя оценка (1–5)</span>
          <span className="result-stat__value">{summary.avg ? `${summary.avg}/5` : '—'}</span>
        </div>
        <div className="result-stat card">
          <span className="result-stat__label">Отвечено вопросов</span>
          <span className="result-stat__value">{answered} из {entries.length}</span>
        </div>
      </div>

      <div className="stack">
        {entries.map((q, idx) => {
          const a = q.user_answers?.[0];
          const parsed = a?.ai_explanation ? (() => { try { return JSON.parse(a.ai_explanation); } catch { return null } })() : null;
          const overall = mapToFive(parsed?.summary_score ?? a?.score ?? null);
          return (
            <article key={q.id} className="card">
              <div className="result-top" style={{ gap: 16 }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
                    Вопрос {idx + 1}
                  </h3>
                  <p style={{ margin: '6px 0 0', fontWeight: 600, lineHeight: 1.6 }}>{q.question.question_text}</p>
                  {q.question.expected_answer ? (
                    <p className="muted" style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.6 }}>
                      Ожидалось: {q.question.expected_answer}
                    </p>
                  ) : null}
                </div>
                <div className="result-stat card card--muted" style={{ flex: '0 0 120px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <span className="result-stat__label">Оценка</span>
                  <span className="result-stat__value" style={{ fontSize: 26 }}>{overall ? `${overall}/5` : '—'}</span>
                </div>
              </div>

              {parsed?.criteria ? (
                <div className="stack" style={{ marginTop: 18 }}>
                  {Object.entries(parsed.criteria).map(([k, v]) => {
                    const score = mapToFive(v.score);
                    return (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 140, fontSize: 14, fontWeight: 500, flexShrink: 0 }}>{k}</div>
                        <div style={{ flex: 1 }}>
                          <div className="criteria-bar-outer" style={{ height: 10 }}>
                            <div className="criteria-bar-inner" style={{ width: `${(score || 0) * 20}%`, background: barColor(score) }} />
                          </div>
                        </div>
                        <div style={{ width: 48, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{score}/5</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {parsed?.final_comment ? (
                <div style={{ marginTop: 18 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Итог:</span>
                  <p className="final-comment" style={{ marginTop: 6 }}>{parsed.final_comment}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </main>
  );
}