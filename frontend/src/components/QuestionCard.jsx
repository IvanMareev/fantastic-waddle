export default function QuestionCard({ question, order, selected, onClick }) {
  return (
    <div className={`question-card card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="question-top">
        <div className="question-order">Вопрос {order}</div>
      </div>
      <h4 className="question-text">{question.question_text}</h4>
      <p className="muted small">{question.expected_answer}</p>
    </div>
  );
}
