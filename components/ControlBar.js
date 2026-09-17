'use client';

import { motion } from 'motion/react';

/* One slider rules the clock: far left is paused, far right is the old
   rocket speed (3x), with turtle/normal pace living along the way. */
export default function ControlBar({ visible, speed, onSpeed, flying, onFly, postcards, total, bookOpen, onBook }) {
  return (
    <motion.div
      className={`topbar${visible ? '' : ' ui-off'}`}
      initial={{ opacity: 0, y: -16 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="app-title">Little Orbit</div>
      <div className="controls">
        <div className="speed-ctl">
          <span className="speed-icon" aria-hidden="true">⏸️</span>
          <input
            type="range"
            className="speed-slider"
            min="0"
            max="3"
            step="0.05"
            value={speed}
            aria-label="Playback speed, from paused to rocket speed"
            onChange={(e) => onSpeed(parseFloat(e.target.value))}
          />
          <span className="speed-icon" aria-hidden="true">🚀</span>
        </div>
        <button
          className={`ctl${flying ? ' active' : ''}`}
          aria-label={flying ? 'Land the shuttle' : 'Fly a space shuttle'}
          aria-pressed={flying}
          onClick={onFly}
        >
          <span aria-hidden="true">🛸</span>
          <kbd className="key-hint" aria-hidden="true">F</kbd>
        </button>
        <button
          className={`ctl book-btn${bookOpen ? ' active' : ''}`}
          aria-label={`Open my postcards, ${postcards} of ${total} collected`}
          aria-pressed={bookOpen}
          onClick={onBook}
        >
          <span aria-hidden="true">📮</span>
          <kbd className="key-hint" aria-hidden="true">P</kbd>
          <span className="book-badge" aria-hidden="true">{postcards}</span>
        </button>
      </div>
    </motion.div>
  );
}
