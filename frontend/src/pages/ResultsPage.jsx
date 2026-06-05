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
  if (score >= 5) return '#16a34a';
  if (score >= 4) return '#65a30d';
  if (score >= 3) return '#f59e0b';
  return '#ef4444';
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

  return (
    <div className="card form-block">
      <h2 className="section-title">Результаты сессии #{session?.id}</h2>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 8 }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ color: '#6b7280' }}>Средняя оценка (1-5)</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.avg ? `${summary.avg}/5` : '—'}</div>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ marginTop: 16 }}>
        {entries.map((q, idx) => {
          const a = q.user_answers?.[0];
          const parsed = a?.ai_explanation ? (() => { try { return JSON.parse(a.ai_explanation); } catch { return null } })() : null;
          const overall = mapToFive(parsed?.summary_score ?? a?.score ?? null);
          return (
            <div key={q.id} className="card" style={{ padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>Вопрос {idx + 1}: {q.question.question_text}</div>
                  <div className="muted" style={{ marginTop: 6 }}>{q.question.expected_answer}</div>
                </div>
                <div style={{ width: 140, textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{overall ? `${overall}/5` : '—'}</div>
                </div>
              </div>

              {parsed?.criteria ? (
                <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                  {Object.entries(parsed.criteria).map(([k, v]) => {
                    const score = mapToFive(v.score);
                    return (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 140, color: '#374151' }}>{k}</div>
                        <div style={{ flex: 1 }}>
                          <div className="progress-outer" style={{ height: 10 }}>
                            <div className="progress-inner" style={{ width: `${(score || 0) * 20}%`, background: barColor(score) }} />
                          </div>
                        </div>
                        <div style={{ width: 48, textAlign: 'right', fontWeight:700 }}>{score}/5</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {parsed?.final_comment ? (
                <div style={{ marginTop: 12 }}>
                  <strong>Итог:</strong>
                  <div className="muted" style={{ marginTop: 6 }}>{parsed.final_comment}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
