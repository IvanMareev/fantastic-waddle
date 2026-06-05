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

    let prevLevel = 0;
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // compute volume (rms)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / bufferLength);
      const rawLevel = Math.min(1, rms * 6);
      // smooth level (exponential smoothing)
      const smooth = prevLevel + (rawLevel - prevLevel) * 0.12;
      prevLevel = smooth;

      // background glow
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.min(cx, cy) - 6;
      const r = 28 + smooth * maxR;

      // outer halo
      const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.1);
      halo.addColorStop(0, 'rgba(88, 99, 246, 0.16)');
      halo.addColorStop(1, 'rgba(99,102,241,0.02)');
      ctx.beginPath();
      ctx.fillStyle = halo;
      ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // multi-layered rings
      for (let i = 0; i < 3; i++) {
        const rr = r * (0.6 + i * 0.25);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(99,102,241,${0.18 - i * 0.05})`;
        ctx.lineWidth = 2 + i;
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
      }

      // inner core with glow
      const coreR = Math.max(10, r * 0.22 + smooth * 6);
      const grad = ctx.createRadialGradient(cx, cy, coreR * 0.1, cx, cy, coreR);
      grad.addColorStop(0, 'rgba(255,255,255,0.98)');
      grad.addColorStop(0.4, 'rgba(147,197,253,0.9)');
      grad.addColorStop(1, 'rgba(99,102,241,0.18)');
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
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
