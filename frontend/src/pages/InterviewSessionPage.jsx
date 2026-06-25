import { useEffect, useRef, useState } from 'react';
import AccessibleButton from '../components/AccessibleButton.jsx';
import { uploadAnswer, fetchSessionAnswer } from '../api.js';
import RecordingOrb from '../components/RecordingOrb.jsx';
import ResultModal from '../components/ResultModal.jsx';
import InfoCard from '../components/InfoCard.jsx';
import SoundToggle from '../components/SoundToggle.jsx';

export default function InterviewSessionPage({ session }) {
    console.log('session_2',session)
  const [sessionQuestions, setSessionQuestions] = useState(session?.session_questions || []);
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
  const [mediaStream, setMediaStream] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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
          if (status === 'completed') {
            setModalOpen(true);
            playUiSound('result');
          }
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

  useEffect(() => {
    if (recording) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [recording]);

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

      setMediaStream(stream);

      playUiSound('start');

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
        // stop tracks but keep visualizer stream cleared
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
        setRecording(false);
        playUiSound('stop');
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

  const playUiSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g);
      g.connect(ac.destination);
      if (type === 'start') {
        o.frequency.value = 880;
        g.gain.value = 0.02;
        o.start();
        setTimeout(() => { o.stop(); ac.close(); }, 120);
      } else if (type === 'stop') {
        o.frequency.value = 660;
        g.gain.value = 0.02;
        o.start();
        setTimeout(() => { o.stop(); ac.close(); }, 160);
      } else if (type === 'result') {
        o.frequency.value = 1040;
        g.gain.value = 0.02;
        o.start();
        setTimeout(() => { o.stop(); ac.close(); }, 220);
      }
    } catch (e) {
      // ignore sound failures
    }
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
  const parsedExplanation = parseAiExplanation(answerResult?.ai_explanation);

  const translateStatus = (s) => {
    if (!s) return '';
    const map = {
      uploaded: 'Загружено',
      processing: 'Обработка',
      completed: 'Готово',
      failed: 'Ошибка',
    };
    return map[s] || s;
  };

    console.log('questionOptions', questionOptions)
  const currentQuestion = questionOptions[currentIndex];

  const handleStartInterview = () => {
    setStarted(true);
    setCurrentIndex(0);
  };

  const handleUploadSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setMessage('');

    if (!currentQuestion || !audioFile) {
      setError('Запишите ответ перед отправкой.');
      return;
    }

    setLoading(true);

    try {
      const result = await uploadAnswer(session.id, Number(currentQuestion.id), audioFile);
      const feedback = result.message || 'Аудио отправлено, проверка запущена.';

      if (result.success) {
        setMessage(feedback);
        setAnswerResult(null);
        setCurrentStatus('uploaded');
        setPollingQuestionId(currentQuestion.id);
        setAudioFile(null);
        setAudioUrl('');
        playUiSound('start');
      } else if (result.status) {
        setMessage(feedback);
        setCurrentStatus(result.status);
        setPollingQuestionId(currentQuestion.id);
      } else {
        setError(feedback);
      }
    } catch (err) {
      setError(err.payload?.message || 'Не удалось загрузить аудиофайл.');
    } finally {
      setLoading(false);
    }
  };

  const onModalClose = () => {
    setModalOpen(false);
    setAnswerResult(null);
    // advance to next question
    setCurrentIndex((i) => Math.min(i + 1, questionOptions.length));
  };

  function getNextCurrentIdx (currentIdx) {

      if (questionOptions[currentIndex].user_answers === null || questionOptions[currentIndex].user_answers === undefined) {
          return currentIdx + 1;
      } else {

      }
  }

  return (
    <div className="card form-block interview-page">
      <div className="header-row">
        <h2 className="section-title">Сессия интервью #{session.id}</h2>
        <div className="controls">
          <SoundToggle onChange={(v) => setSoundEnabled(v)} />
        </div>
      </div>

      <div className="message">
        Статус сессии: <span className="badge">{translateStatus(session.status)}</span>
      </div>

      {!started ? (
        <div style={{ marginTop: 18 }}>
          <InfoCard total={questionOptions.length} avgSeconds={30} onStart={handleStartInterview} />
        </div>
      ) : currentIndex >= questionOptions.length ? (
        <div className="card" style={{ marginTop: 18, padding: 18 }}>
          <h3>Интервью завершено</h3>
          <p>Вы прошли все вопросы сессии.</p>
          <div style={{ marginTop: 12 }}>
            <h4>Итоговая статистика</h4>
            {sessionQuestions?.length ? (
              <>
                <p>Всего вопросов: {sessionQuestions.length}</p>
                <p>Отвечено: {sessionQuestions.filter(q => q.user_answers?.length).length}</p>
                <div style={{ marginTop: 8 }}>
                  <strong>Средняя оценка:</strong>{' '}
                  {(() => {
                    const scores = sessionQuestions.map((q) => {
                      const a = q.user_answers?.[0];
                      const parsed = a?.ai_explanation ? (() => {
                        try { return JSON.parse(a.ai_explanation); } catch { return null }
                      })() : null;
                      return parsed?.summary_score ?? a?.score ?? null;
                    }).filter((s) => s != null).map(Number);
                    if (!scores.length) return '—';
                    const avg = (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1);
                    return `${avg}/10`;
                  })()}
                </div>
                <div style={{ marginTop: 12 }}>
                  <h5>Детали по вопросам</h5>
                  <div className="card-grid">
                    {sessionQuestions.map((q, idx) => {
                      const a = q.user_answers?.[0];
                      const parsed = a?.ai_explanation ? (() => {
                        try { return JSON.parse(a.ai_explanation); } catch { return null }
                      })() : null;
                      const score = parsed?.summary_score ?? a?.score ?? null;
                      return (
                        <div key={q.id} className="card" style={{ padding: 12 }}>
                          <div style={{ fontWeight:700 }}>Вопрос {idx+1}</div>
                          <div style={{ marginTop:6 }}>{q.question.question_text}</div>
                          <div style={{ marginTop:8 }}><strong>Оценка:</strong> {score != null ? `${score}/10` : '—'}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="interview-stage" style={{ marginTop: 18 }}>
          <div className="question-panel card">
            <div className="question-meta">Вопрос {currentIndex + 1} из {questionOptions.length}</div>
            <h3 className="question-title">{currentQuestion.question.question_text}</h3>
            <p className="muted">{currentQuestion.question.expected_answer}</p>
            <div className="timer">Осталось времени: {Math.max(0, 30 - elapsed)} секунд</div>
          </div>

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
        </div>
      )}

      <ResultModal open={modalOpen && answerResult} onClose={onModalClose} result={answerResult} soundEnabled={soundEnabled} />
    </div>
  );
}
