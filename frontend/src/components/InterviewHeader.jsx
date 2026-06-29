import SoundToggle from './SoundToggle.jsx';

export default function InterviewHeader({ session, soundEnabled, onSoundChange }) {
  return (
    <div className="header-row">
      <h2 className="section-title">Сессия интервью #{session.id}</h2>
      <div className="controls">
        <SoundToggle value={soundEnabled} onChange={onSoundChange} />
      </div>
    </div>
  );
}
