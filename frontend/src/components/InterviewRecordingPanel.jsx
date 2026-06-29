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
  message,
  currentStatus,
  error,
  isBusy,
  handleUploadSubmit,
  mediaStream,
  translateStatus,
}) {
  return (
    <div className="rec-panel card">
      <RecordingOrb stream={mediaStream} isRecording={recording} />
      <div className="rec-controls">
        <AccessibleButton type="button" className="secondary-button" onClick={recording ? stopRecording : startRecording}>
          {recording ? 'Остановить запись' : 'Начать запись'}
        </AccessibleButton>
        {audioFile ? (
          <AccessibleButton type="button" className="secondary-button" onClick={clearRecording}>
            Очистить запись
          </AccessibleButton>
        ) : null}
      </div>
      {recordingError ? <div className="error" style={{ marginTop: '10px' }}>{recordingError}</div> : null}
      {audioUrl ? (
        <div style={{ marginTop: '12px' }}>
          <audio controls src={audioUrl} />
        </div>
      ) : null}

      <div style={{ marginTop: 12 }}>
        {message ? <div className="success">{message}</div> : null}
        {currentStatus ? (
          <div className="message">Статус проверки: <strong>{translateStatus(currentStatus)}</strong></div>
        ) : null}
        {error ? <div className="error">{error}</div> : null}
      </div>

      <div style={{ marginTop: 14 }}>
        <AccessibleButton type="button" onClick={handleUploadSubmit} disabled={isBusy || !audioFile}>
          {isBusy ? 'Ожидание...' : 'Отправить ответ'}
        </AccessibleButton>
      </div>
    </div>
  );
}
