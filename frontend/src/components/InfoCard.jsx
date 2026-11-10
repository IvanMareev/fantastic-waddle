import AccessibleButton from './AccessibleButton.jsx';

export default function InfoCard({ total, avgSeconds = 30, onStart }) {
  return (
    <div className="card start-card">
      <div className="start-card__icon" aria-hidden>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </div>
      <h2 className="start-card__title">Подготовка к интервью</h2>
      <p className="start-card__text">
        Интервью состоит из {total} вопросов. Отвечайте так, как ответили бы на реальном
        собеседовании. Вы сможете послушать запись и отправить её на проверку.
      </p>
      <div className="start-card__facts">
        <span className="badge badge--accent">{total} вопросов</span>
        <span className="badge">~{avgSeconds} сек на ответ</span>
      </div>
      <div className="start-card__actions">
        <AccessibleButton variant="primary" size="lg" onPress={onStart}>
          Начать интервью
        </AccessibleButton>
      </div>
    </div>
  );
}