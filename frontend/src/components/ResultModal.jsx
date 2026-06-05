import { useEffect } from 'react';

function scoreLabel(score) {
  if (score == null) return 'Нет оценки';
  const s = Number(score);
  if (isNaN(s)) return String(score);
  if (s >= 9) return 'Отлично';
  if (s >= 7) return 'Хорошо';
  if (s >= 5) return 'Удовлетворительно';
  return 'Требует улучшения';
}

function progressColor(v) {
  if (v >= 9) return '#16a34a';
  if (v >= 7) return '#65a30d';
  if (v >= 5) return '#f59e0b';
  return '#ef4444';
}

export default function ResultModal({ open, onClose, result }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !result) return null;

  const score = result.summary_score ?? result.score ?? null;
  const label = scoreLabel(score);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" role="dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <div className="score-badge">{label}</div>
              <div className="score-number">{score != null ? `${score}/10` : '—'}</div>
            </div>
            <div style={{ flex: 1, marginLeft: 18 }}>
              <div style={{ marginBottom: 8, color: '#475569' }}>Индикатор качества ответа</div>
              <div className="progress-outer">
                <div className="progress-inner" style={{ width: `${Math.min(100, (score || 0) * 10)}%`, background: `linear-gradient(90deg, ${progressColor(score || 0)}, #60a5fa)` }} />
              </div>
            </div>
          </div>
          <div className="modal-body">
            {result.final_comment || result.ai_explanation ? (
              <div className="analysis">
                <h4>Анализ ответа</h4>
                <div className="analysis-text">
                  {result.final_comment || result.ai_explanation}
                </div>
              </div>
            ) : null}

            {result.criteria ? (
              <div className="criteria-grid">
                {Object.entries(result.criteria).map(([k, v]) => (
                  <div key={k} className="criteria-card">
                    <div className="criteria-title">{k}</div>
                    <div className="criteria-score">{v.score}/10</div>
                    <div className="criteria-bar-outer">
                      <div className="criteria-bar-inner" style={{ width: `${(v.score || 0) * 10}%`, background: progressColor(v.score) }} />
                    </div>
                    <div className="criteria-comment muted">{v.comment}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {(result.strengths?.length || result.weaknesses?.length) ? (
              <div className="analysis-columns">
                {result.strengths?.length ? (
                  <div className="analysis-block">
                    <h5>Что получилось хорошо</h5>
                    <ul>
                      {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                ) : null}

                {result.weaknesses?.length ? (
                  <div className="analysis-block">
                    <h5>Что можно улучшить</h5>
                    <ul>
                      {result.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="modal-actions">
            <button className="primary-button" onClick={onClose}>Продолжить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
