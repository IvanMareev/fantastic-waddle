export default function QuestionCard({ question, order, selected, onClick, onShowAnswer }) {
  return (
    <div className={`question-card card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="question-top">
        <div className="question-order">Вопрос {order}</div>
      </div>
      <div>
        <h4 className="question-text">{question.question_text}</h4>
      </div>
      <div className="question-actions">
        <button
          type="button"
          className="secondary-button show-answer-button"
          onClick={(event) => {
            event.stopPropagation();
            onShowAnswer?.(question);
          }}
        >
          Показать ответ
        </button>
      </div>
    </div>
  );
}
