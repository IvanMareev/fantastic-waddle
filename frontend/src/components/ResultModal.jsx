import { useEffect, useMemo } from 'react';

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function scoreText(score) {
  if (score == null) return 'Нет оценки';
  const s = Number(score);
  if (s >= 8) return 'Отличный ответ';
  if (s >= 6) return 'Хороший ответ';
  if (s >= 4) return 'Средний ответ';
  return 'Требует доработки';
}

function colorFor(value) {
  if (value >= 7) return '#16a34a';
  if (value >= 4) return '#f59e0b';
  return '#ef4444';
}

function parseExplanation(ai_explanation) {
  if (!ai_explanation) return null;
  try { return JSON.parse(ai_explanation); } catch { return null; }
}

export default function ResultModal({ open, onClose, result }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !result) return null;

  const data = result.data || result;
  const parsed = parseExplanation(data.ai_explanation) || {};
  const summary = parsed.summary_score ?? data.summary_score ?? parsed.summary_score ?? null;
  const overallPercent = clamp(Number(summary || 0), 0, 10) * 10; // 0-100

  const criteria = parsed.criteria || {};

  return (
    <div className="result-screen" role="dialog" aria-modal="true">
      <div className="result-screen-card">
        <button className="result-screen-close" onClick={onClose}>✕</button>
        <div className="result-screen-content analysis-modal">
          <div className="analysis-top">
            <div className="circular-wrap">
              <svg className="circular" viewBox="0 0 36 36">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray={`${overallPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: colorFor(summary) }} />
              </svg>
              <div className="circular-below">
                <div className="score-num">{summary != null ? `${summary}/10` : '—'}</div>
                <div className="score-text">{scoreText(summary)}</div>
                <div className="answer-status">{data.is_correct ? '✅ Ответ верный' : '❌ Ответ неверный'}</div>
              </div>
            </div>

            <div className="transcript-card card">
              <h4>Ваш ответ</h4>
              <div className="transcript-text">{data.transcript || 'Ответ не распознан.'}</div>
            </div>
          </div>

          <div className="criteria-section">
            <h4>Детальная оценка по критериям</h4>
            <div className="criteria-grid">
              {Object.entries(criteria).map(([k, v]) => (
                <div key={k} className="criteria-card">
                  <div className="criteria-key">{k}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <div style={{ fontWeight:700 }}>{v.score}/10</div>
                    <div style={{ flex: 1 }}>
                      <div className="criteria-bar-outer">
                        <div className="criteria-bar-inner" style={{ width: `${clamp(v.score,0,10) * 10}%`, background: colorFor(v.score) }} />
                      </div>
                    </div>
                  </div>
                  <div className="criteria-comment muted" style={{ marginTop: 8 }}>{v.comment}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="strengths-weaknesses">
            <div className="strengths card">
              <h4>Что получилось хорошо</h4>
              {parsed.strengths?.length ? (
                <ul>
                  {parsed.strengths.map((s, i) => <li key={i}>✓ {s}</li>)}
                </ul>
              ) : <div className="muted">Сильные стороны не обнаружены.</div>}
            </div>

            <div className="weaknesses card highlight">
              <h4>Что нужно улучшить</h4>
              {parsed.weaknesses?.length ? (
                <ul>
                  {parsed.weaknesses.map((s, i) => <li key={i}>✗ {s}</li>)}
                </ul>
              ) : <div className="muted">Пока не обнаружено.</div>}
            </div>
          </div>

          <div className="final-comment card">
            <h4>Заключение AI</h4>
            <div className="muted">{parsed.final_comment || 'Заключение отсутствует.'}</div>
          </div>

          <div className="result-actions">
            <button className="primary-button" onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  );
}
