'use client';

import { motion } from 'motion/react';

/* One slider rules the clock: far left is paused, far right is the old
   rocket speed (3x), with turtle/normal pace living along the way. */
export default function ControlBar({ visible, speed, onSpeed, onReset }) {
  return (
    <motion.div
      className={`topbar${visible ? '' : ' ui-off'}`}
      initial={{ opacity: 0, y: -16 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="app-title">🚀 Little Orbit</div>
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
        <button className="ctl" aria-label="See the whole solar system" onClick={onReset}>🌌</button>
      </div>
    </motion.div>
  );
}
