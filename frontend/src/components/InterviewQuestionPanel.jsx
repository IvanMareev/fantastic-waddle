export default function InterviewQuestionPanel({ currentQuestion, currentIndex, questionCount, elapsed }) {
  return (
    <div className="question-panel card">
      <div className="question-meta">Вопрос {currentIndex + 1} из {questionCount}</div>
      <h3 className="question-title">{currentQuestion.question.question_text}</h3>
      <p className="muted">{currentQuestion.question.expected_answer}</p>
      <div className="timer">Осталось времени: {Math.max(0, 30 - elapsed)} секунд</div>
    </div>
  );
}
