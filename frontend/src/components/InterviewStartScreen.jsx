import InfoCard from './InfoCard.jsx';

export default function InterviewStartScreen({ totalQuestions, onStart }) {
  return (
    <InfoCard total={totalQuestions} avgSeconds={30} onStart={onStart} />
  );
}