'use client';

import { motion } from 'motion/react';

const SPEEDS = [
  { value: 0.3, label: '🐢', aria: 'Turtle speed (slow)' },
  { value: 1, label: '🚶', aria: 'Normal speed' },
  { value: 3, label: '🚀', aria: 'Rocket speed (fast)' },
];

export default function ControlBar({ visible, speed, paused, onSpeed, onTogglePause, onReset }) {
  return (
    <motion.div
      className={`topbar${visible ? '' : ' ui-off'}`}
      initial={{ opacity: 0, y: -16 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="app-title">🚀 Little Orbit</div>
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
    </motion.div>
  );
}
