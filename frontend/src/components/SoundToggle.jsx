import { useState, useEffect } from 'react';

export default function SoundToggle({ onChange }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('soundEnabled');
    if (saved !== null) setEnabled(saved === '1');
  }, []);

  useEffect(() => {
    localStorage.setItem('soundEnabled', enabled ? '1' : '0');
    onChange?.(enabled);
  }, [enabled, onChange]);

  return (
    <button className={`sound-toggle ${enabled ? 'on' : 'off'}`} onClick={() => setEnabled((s) => !s)}>
      Звуки: {enabled ? 'вкл' : 'выкл'}
    </button>
  );
}
