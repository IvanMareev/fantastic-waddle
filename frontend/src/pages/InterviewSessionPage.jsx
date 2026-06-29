import { useEffect, useRef, useState } from 'react';
import { uploadAnswer, fetchSessionAnswer } from '../api.js';
import ResultModal from '../components/ResultModal.jsx';
import InterviewHeader from '../components/InterviewHeader.jsx';
import InterviewStartScreen from '../components/InterviewStartScreen.jsx';
import InterviewQuestionPanel from '../components/InterviewQuestionPanel.jsx';
import InterviewRecordingPanel from '../components/InterviewRecordingPanel.jsx';
import InterviewResultsView from '../components/InterviewResultsView.jsx';

export default function InterviewSessionPage({ session }) {
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

  return (
    <div className="card form-block interview-page">
      <InterviewHeader session={session} soundEnabled={soundEnabled} onSoundChange={setSoundEnabled} />

      <div className="message">
        Статус сессии: <span className="badge">{translateStatus(session.status)}</span>
      </div>

      {!started ? (
        <InterviewStartScreen totalQuestions={questionOptions.length} onStart={handleStartInterview} />
      ) : currentIndex >= questionOptions.length ? (
        <InterviewResultsView sessionQuestions={sessionQuestions} />
      ) : (
        <div className="interview-stage" style={{ marginTop: 18 }}>
          <InterviewQuestionPanel
            currentQuestion={currentQuestion}
            currentIndex={currentIndex}
            questionCount={questionOptions.length}
            elapsed={elapsed}
          />

          <InterviewRecordingPanel
            recording={recording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            clearRecording={clearRecording}
            audioFile={audioFile}
            audioUrl={audioUrl}
            recordingError={recordingError}
            message={message}
            currentStatus={currentStatus}
            error={error}
            isBusy={isBusy}
            handleUploadSubmit={handleUploadSubmit}
            mediaStream={mediaStream}
            translateStatus={translateStatus}
          />
        </div>
      )}

      <ResultModal open={modalOpen && answerResult} onClose={onModalClose} result={answerResult} soundEnabled={soundEnabled} />
    </div>
  );
}
