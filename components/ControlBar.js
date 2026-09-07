'use client';

const SPEEDS = [
  { value: 0.3, label: '🐢', aria: 'Turtle speed (slow)' },
  { value: 1, label: '🚶', aria: 'Normal speed' },
  { value: 3, label: '🚀', aria: 'Rocket speed (fast)' },
];

export default function ControlBar({ speed, paused, onSpeed, onTogglePause, onReset }) {
  return (
    <div className="topbar">
      <div className="app-title">🚀 Planet Playground</div>
      <div className="controls">
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            className={`ctl${speed === s.value ? ' active' : ''}`}
            aria-label={s.aria}
            onClick={() => onSpeed(s.value)}
          >
            {s.label}
          </button>
        ))}
        <button className="ctl" aria-label={paused ? 'Play' : 'Pause'} onClick={onTogglePause}>
          {paused ? '▶️' : '⏸️'}
        </button>
        <button className="ctl" aria-label="See the whole solar system" onClick={onReset}>🌌</button>
      </div>
    </div>
  );
}
