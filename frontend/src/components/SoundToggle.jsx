import { useState, useEffect } from 'react';

export default function SoundToggle({ value, onChange }) {
  const [enabled, setEnabled] = useState(value ?? true);

  useEffect(() => {
    const saved = localStorage.getItem('soundEnabled');
    if (saved !== null) setEnabled(saved === '1');
  }, []);

  useEffect(() => {
    localStorage.setItem('soundEnabled', enabled ? '1' : '0');
    onChange?.(enabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (value !== undefined && value !== enabled) setEnabled(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <button
      type="button"
      className={`sound-toggle ${enabled ? 'sound-toggle--on' : ''}`}
      aria-pressed={enabled}
      onClick={() => setEnabled((current) => !current)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
      {enabled ? 'Звуки вкл' : 'Звуки выкл'}
    </button>
  );
}