import InfoCard from './InfoCard.jsx';

export default function InterviewStartScreen({ totalQuestions, onStart }) {
  return (
    <div style={{ marginTop: 18 }}>
      <InfoCard total={totalQuestions} avgSeconds={30} onStart={onStart} />
    </div>
  );
}
