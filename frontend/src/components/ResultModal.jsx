import { useEffect } from 'react';

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
  if (value >= 7) return '#22a06b';
  if (value >= 4) return '#d9971f';
  return '#d8454c';
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
  const summary = parsed.summary_score ?? data.summary_score ?? null;
  const overallPercent = clamp(Number(summary || 0), 0, 10) * 10;

  const criteria = parsed.criteria || {};

  return (
    <div className="result-overlay" role="dialog" aria-modal="true">
      <div className="result-card">
        <button className="modal-close" aria-label="Закрыть" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="result-top">
          <div className="circular-wrap">
            <svg className="circular" viewBox="0 0 36 36">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="circle" strokeDasharray={`${overallPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: colorFor(summary) }} />
            </svg>
            <div className="score-num" style={{ marginTop: 8 }}>{summary != null ? `${summary}/10` : '—'}</div>
            <div className="score-text">{scoreText(summary)}</div>
            <div className="answer-status" style={{ color: data.is_correct ? 'var(--success)' : 'var(--danger)' }}>
              {data.is_correct ? 'Ответ верный' : 'Ответ неверный'}
            </div>
          </div>

          <div className="transcript-card card">
            <span className="result-section__title">Транскрипт ответа</span>
            <div className="final-comment">{data.transcript || 'Ответ не распознан.'}</div>
          </div>
        </div>

        {Object.keys(criteria).length ? (
          <div className="result-section">
            <h3 className="result-section__title">Оценка по критериям</h3>
            <div className="criteria-grid criteria-grid--3">
              {Object.entries(criteria).map(([k, v]) => (
                <div key={k} className="criteria-card">
                  <div className="criteria-card__head">
                    <span className="criteria-card__key">{k}</span>
                    <span className="criteria-card__score" style={{ color: colorFor(v.score) }}>{v.score}/10</span>
                  </div>
                  <div className="criteria-bar-outer">
                    <div className="criteria-bar-inner" style={{ width: `${clamp(v.score, 0, 10) * 10}%`, background: colorFor(v.score) }} />
                  </div>
                  {v.comment ? <p className="criteria-card__comment">{v.comment}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="strengths-weaknesses">
          <div className="strengths card">
            <h4>Что получилось хорошо</h4>
            {parsed.strengths?.length ? (
              <ul>
                {parsed.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            ) : <span className="final-comment">Сильные стороны не обнаружены.</span>}
          </div>

          <div className="weaknesses card">
            <h4>Что нужно улучшить</h4>
            {parsed.weaknesses?.length ? (
              <ul>
                {parsed.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            ) : <span className="final-comment">Пока не обнаружено.</span>}
          </div>
        </div>

        {parsed.final_comment ? (
          <div className="result-section">
            <h3 className="result-section__title">Заключение AI</h3>
            <p className="final-comment">{parsed.final_comment}</p>
          </div>
        ) : null}

        <div className="result-actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}