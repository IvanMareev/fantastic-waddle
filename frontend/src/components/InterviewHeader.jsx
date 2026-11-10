import SoundToggle from './SoundToggle.jsx';

export default function InterviewHeader({ session, soundEnabled, onSoundChange }) {
  return (
    <div className="interview-header">
      <h1 className="page-title" style={{ fontSize: 24 }}>Сессия интервью #{session.id}</h1>
      <SoundToggle value={soundEnabled} onChange={onSoundChange} />
    </div>
  );
}