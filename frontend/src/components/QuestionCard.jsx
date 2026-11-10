export default function QuestionCard({ question, order, selected, onClick, onShowAnswer }) {
  return (
    <div className={`question-card ${selected ? 'is-selected' : ''}`} onClick={onClick}>
      <div className="question-card__top">
        <span className="question-card__order">Вопрос {order}</span>
        <span className="question-card__check" aria-hidden>
          <svg className="question-card__check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </div>
      <p className="question-card__text">{question.question_text}</p>
      <div className="question-card__actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={(event) => {
            event.stopPropagation();
            onShowAnswer?.(question);
          }}
        >
          Показать ожидаемый ответ
        </button>
      </div>
    </div>
  );
}