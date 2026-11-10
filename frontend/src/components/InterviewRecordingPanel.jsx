import AccessibleButton from './AccessibleButton.jsx';
import RecordingOrb from './RecordingOrb.jsx';

export default function InterviewRecordingPanel({
  recording,
  startRecording,
  stopRecording,
  clearRecording,
  audioFile,
  audioUrl,
  recordingError,
  currentStatus,
  handleUploadSubmit,
  mediaStream,
  translateStatus,
}) {
  return (
    <div className="rec-panel card">
      <div className="rec-order">
        {recording ? 'Идёт запись…' : audioFile ? 'Запись готова к отправке' : 'Нажмите «Начать запись», чтобы ответить'}
      </div>

      <div className="rec-orbit">
        <RecordingOrb stream={mediaStream} isRecording={recording} />
      </div>

      <div className="rec-controls">
        <AccessibleButton
          variant={recording ? 'danger' : 'primary'}
          size="lg"
          type="button"
          onPress={recording ? stopRecording : startRecording}
        >
          {recording ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              Остановить запись
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="12" cy="12" r="7" /></svg>
              Начать запись
            </>
          )}
        </AccessibleButton>
        {audioFile ? (
          <AccessibleButton variant="secondary" size="lg" type="button" onPress={clearRecording}>
            Удалить запись
          </AccessibleButton>
        ) : null}
        {audioFile ? (
          <AccessibleButton variant="primary" size="lg" type="button" onPress={handleUploadSubmit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Отправить ответ
          </AccessibleButton>
        ) : null}
      </div>

      <div className="rec-panel__status">
        {recordingError ? <span style={{ color: 'var(--danger)' }}>{recordingError}</span> : null}
        {currentStatus ? (
          <span className="muted">Статус проверки: <strong>{translateStatus(currentStatus)}</strong></span>
        ) : null}
      </div>

      {audioUrl ? (
        <div className="audio-player">
          <audio controls src={audioUrl} />
        </div>
      ) : null}
    </div>
  );
}