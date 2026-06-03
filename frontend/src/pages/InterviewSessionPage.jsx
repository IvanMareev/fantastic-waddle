import { useEffect, useRef, useState } from 'react';
import AccessibleButton from '../components/AccessibleButton.jsx';
import { uploadAnswer, fetchSessionAnswer } from '../api.js';

export default function InterviewSessionPage({ session }) {
  const [sessionQuestions, setSessionQuestions] = useState(session?.session_questions || []);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [backendMessage, setBackendMessage] = useState('');
  const [answerResult, setAnswerResult] = useState(null);
  const [pollingQuestionId, setPollingQuestionId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    setSessionQuestions(session?.session_questions || []);
  }, [session]);

  useEffect(() => {
    if (!pollingQuestionId || !session?.id) {
      return undefined;
    }

    let isCancelled = false;
    let intervalId = null;

    const pollAnswerStatus = async () => {
      try {
        const result = await fetchSessionAnswer(session.id, Number(pollingQuestionId));
        const status = result.status || result.data?.processing_step || '';
        const backendMsg = result.message || '';

        if (isCancelled) {
          return;
        }

        setCurrentStatus(status);
        setBackendMessage(backendMsg);

        if (result.data) {
          setAnswerResult(result.data);
          setSessionQuestions((prev) =>
            prev.map((item) =>
              item.id === result.data.session_question_id
                ? { ...item, user_answers: [result.data] }
                : item
            )
          );
        }

        if (status === 'completed' || status === 'failed') {
          setPolling(false);
          setPollingQuestionId(null);
          setMessage(status === 'completed' ? 'Ответ обработан.' : 'Обработка ответа завершилась с ошибкой.');
        }
      } catch (err) {
        if (isCancelled) {
          return;
        }

        setError(err.payload?.message || 'Не удалось получить статус ответа.');
        setPolling(false);
        setPollingQuestionId(null);
      }
    };

    setPolling(true);
    setMessage('Ожидание результата проверки ответа...');
    setError('');
    pollAnswerStatus();
    intervalId = setInterval(pollAnswerStatus, 500);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [pollingQuestionId, session?.id]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setRecordingError('Ваш браузер не поддерживает запись аудио.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedType = MediaRecorder.isTypeSupported('audio/ogg')
        ? 'audio/ogg'
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : '';

      if (!supportedType) {
        setRecordingError('Ваш браузер не поддерживает запись в нужном формате.');
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { type: supportedType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const extension = mediaRecorder.mimeType.includes('ogg') ? 'ogg' : 'webm';
        const audioFile = new File([audioBlob], `recorded-answer.${extension}`, { type: audioBlob.type });
        setAudioFile(audioFile);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingError('');
      setMessage('Запись началась, говорите...');
    } catch (err) {
      setRecordingError('Не удалось включить микрофон. Проверьте права доступа.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl('');
    setRecordingError('');
    setMessage('Запись очищена.');
  };

  if (!session) {
    return (
      <div className="card form-block">
        <h2 className="section-title">Сессия интервью</h2>
        <p className="message">Сначала создайте новую сессию на странице «Темы и вопросы».</p>
      </div>
    );
  }

  const questionOptions = sessionQuestions || [];
  const isBusy = loading || polling;

  const parseAiExplanation = (explanation) => {
    if (!explanation) {
      return null;
    }

    try {
      return JSON.parse(explanation);
    } catch {
      return null;
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedQuestionId || !audioFile) {
      setError('Выберите вопрос и загрузите аудиофайл.');
      return;
    }

    setLoading(true);

    try {
      const result = await uploadAnswer(session.id, Number(selectedQuestionId), audioFile);
      const feedback = result.message || 'Аудио отправлено, проверка запущена.';

      if (result.success) {
        setMessage(feedback);
        setAnswerResult(null);
        setCurrentStatus('uploaded');
        setPollingQuestionId(selectedQuestionId);
        setAudioFile(null);
        setSelectedQuestionId('');
      } else if (result.status) {
        setMessage(feedback);
        setCurrentStatus(result.status);
        setPollingQuestionId(selectedQuestionId);
      } else {
        setError(feedback);
      }
    } catch (err) {
      setError(err.payload?.message || 'Не удалось загрузить аудиофайл.');
    } finally {
      setLoading(false);
    }
  };

  const parsedExplanation = parseAiExplanation(answerResult?.ai_explanation);

  return (
    <div className="card form-block">
      <h2 className="section-title">Сессия интервью #{session.id}</h2>
      <div className="message">
        Статус: <span className="badge">{session.status}</span>
      </div>

      <div className="card-grid" style={{ marginTop: '20px' }}>
        {questionOptions.map((item) => (
          <div key={item.id} className="card" style={{ padding: '18px' }}>
            <h4>{item.question.question_text}</h4>
            <p>{item.question.expected_answer}</p>
            <div className="badge">Вопрос #{item.question_order}</div>
            {item.user_answers?.[0]?.processing_step ? (
              <div className="badge secondary" style={{ marginTop: '8px' }}>
                Статус: {item.user_answers[0].processing_step}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={handleUpload} className="field-group" style={{ marginTop: '22px' }}>
        <div>
          <label className="block text-sm font-medium text-slate-800">Выберите вопрос</label>
          <select
            className="input-field"
            value={selectedQuestionId}
            onChange={(event) => setSelectedQuestionId(event.target.value)}
          >
            <option value="">-- Вопрос для ответа --</option>
            {questionOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.question.question_text}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800">Запись ответа</label>
          <div className="field-group" style={{ gap: '10px', marginTop: '10px' }}>
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
          {!audioUrl && !recording ? (
            <p className="message" style={{ marginTop: '10px' }}>
              Нажмите «Начать запись», говорите и затем остановите запись для отправки.
            </p>
          ) : null}
        </div>

        {message ? <div className="success">{message}</div> : null}
        {currentStatus ? (
          <div className="message">
            Статус проверки: <strong>{currentStatus}</strong>
          </div>
        ) : null}
        {error ? <div className="error">{error}</div> : null}

        <AccessibleButton type="submit" disabled={isBusy}>
          {isBusy ? 'Ожидание...' : 'Загрузить аудио ответа'}
        </AccessibleButton>
      </form>

      {answerResult ? (
        <div className="card" style={{ marginTop: '22px', padding: '18px' }}>
          <h3>Результат проверки</h3>
          {backendMessage ? (
            <p>
              <strong>Сообщение от сервера:</strong> {backendMessage}
            </p>
          ) : null}
          <p>
            <strong>Статус:</strong> {answerResult.processing_step}
          </p>
          <p>
            <strong>ID ответа:</strong> {answerResult.id}
          </p>
          <p>
            <strong>session_question_id:</strong> {answerResult.session_question_id}
          </p>
          {answerResult.audio_file_url ? (
            <p>
              <strong>Аудиофайл:</strong>{' '}
              <a href={`/${answerResult.audio_file_url}`} target="_blank" rel="noreferrer">
                {answerResult.audio_file_url}
              </a>
            </p>
          ) : null}
          {answerResult.ai_audio_url ? (
            <p>
              <strong>AI аудио:</strong>{' '}
              <a href={`/${answerResult.ai_audio_url}`} target="_blank" rel="noreferrer">
                {answerResult.ai_audio_url}
              </a>
            </p>
          ) : null}
          {answerResult.transcript ? (
            <p>
              <strong>Транскрипт:</strong> {answerResult.transcript}
            </p>
          ) : null}
          {answerResult.is_correct !== null ? (
            <p>
              <strong>Правильность:</strong> {answerResult.is_correct ? 'Да' : 'Нет'}
            </p>
          ) : null}
          {answerResult.created_at ? (
            <p>
              <strong>Создано:</strong> {answerResult.created_at}
            </p>
          ) : null}
          {answerResult.is_answered !== undefined ? (
            <p>
              <strong>is_answered:</strong> {String(answerResult.is_answered)}
            </p>
          ) : null}
          {parsedExplanation ? (
            <div>
              <p>
                <strong>Итог:</strong> {parsedExplanation.final_comment}
              </p>
              <p>
                <strong>Общий балл:</strong> {parsedExplanation.summary_score}
              </p>
              {parsedExplanation.criteria ? (
                <div style={{ marginTop: '12px' }}>
                  <strong>Критерии:</strong>
                  <div style={{ marginLeft: '18px', marginTop: '6px' }}>
                    {Object.entries(parsedExplanation.criteria).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '10px' }}>
                        <p>
                          <strong>{key}:</strong> оценка {value.score}
                        </p>
                        <p>{value.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {parsedExplanation.strengths?.length ? (
                <div>
                  <strong>Сильные стороны:</strong>
                  <ul>
                    {parsedExplanation.strengths.map((item, index) => (
                      <li key={`strength-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {parsedExplanation.weaknesses?.length ? (
                <div>
                  <strong>Слабые стороны:</strong>
                  <ul>
                    {parsedExplanation.weaknesses.map((item, index) => (
                      <li key={`weakness-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : answerResult.ai_explanation ? (
            <div>
              <strong>AI объяснение:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{answerResult.ai_explanation}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
