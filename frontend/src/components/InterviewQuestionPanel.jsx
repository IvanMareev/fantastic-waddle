export default function InterviewQuestionPanel({ currentQuestion, currentIndex, questionCount, elapsed }) {
  return (
    <div className="question-panel card">
      <span className="question-meta">Вопрос {currentIndex + 1} из {questionCount}</span>
      <h2 className="question-title">{currentQuestion.question.question_text}</h2>
      {currentQuestion.question.expected_answer ? (
        <p className="question-expected">{currentQuestion.question.expected_answer}</p>
      ) : null}
      <span className="timer-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Осталось&nbsp;<span className="timer-value">{Math.max(0, 30 - elapsed)}</span>&nbsp;сек
      </span>
    </div>
  );
}