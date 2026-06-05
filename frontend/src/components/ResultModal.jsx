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

export default function ResultModal({ open, onClose, result, soundEnabled }) {
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
            <div className="score-badge">{label}</div>
            <div className="score-number">{score != null ? `${score}/10` : '—'}</div>
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
              <div className="criteria">
                <h4>Критерии</h4>
                <ul>
                  {Object.entries(result.criteria).map(([k, v]) => (
                    <li key={k}><strong>{k}:</strong> {v.score} — {v.comment}</li>
                  ))}
                </ul>
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
