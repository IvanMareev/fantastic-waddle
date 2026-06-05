import { useEffect, useRef } from 'react';

export default function RecordingOrb({ stream, isRecording }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isRecording || !stream) {
      // cleanup
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // compute volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / bufferLength);
      const level = Math.min(1, rms * 6);

      // background glow
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.min(cx, cy) - 6;
      const r = 24 + level * maxR;

      // gradient
      const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
      grad.addColorStop(0, 'rgba(99,102,241,0.95)');
      grad.addColorStop(0.5, 'rgba(99,102,241,0.55)');
      grad.addColorStop(1, 'rgba(99,102,241,0.12)');

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // inner orb
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.arc(cx, cy, Math.max(8, r * 0.22), 0, Math.PI * 2);
      ctx.fill();
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [stream, isRecording]);

  return (
    <div className="recording-orb" aria-hidden>
      <canvas ref={canvasRef} width={220} height={220} />
    </div>
  );
}
