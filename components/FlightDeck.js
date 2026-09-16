'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

/* The shuttle's controls. Steering is a big D-pad (hold to turn: left/right
   swing the nose, up/down pitch it) plus keyboard arrows or WASD. Propulsion
   is a vertical throttle slider, also nudged with Shift/E (faster) and
   Ctrl/Q (slower). The scene reads the live values every frame through
   `input` (a ref: { yaw, pitch, throttle }) so no React re-render sits in
   the control loop. Escape or the Land button ends the flight. */

const STEER_KEYS = {
  ArrowLeft: ['yaw', -1], a: ['yaw', -1], A: ['yaw', -1],
  ArrowRight: ['yaw', 1], d: ['yaw', 1], D: ['yaw', 1],
  ArrowUp: ['pitch', 1], w: ['pitch', 1], W: ['pitch', 1],
  ArrowDown: ['pitch', -1], s: ['pitch', -1], S: ['pitch', -1],
};
const FASTER_KEYS = new Set(['Shift', 'e', 'E', '=', '+']);
const SLOWER_KEYS = new Set(['Control', 'q', 'Q', '-', '_']);

export default function FlightDeck({ visible, input, onLand }) {
  const [throttle, setThrottle] = useState(input.current.throttle);
  const [held, setHeld] = useState({ yaw: 0, pitch: 0 });
  // which sources are pushing each axis, so a key and a button never fight
  const keys = useRef(new Set());
  const pads = useRef({ yaw: 0, pitch: 0 });
  const nudge = useRef(0); // -1 / 0 / +1 while a throttle key is held

  const recompute = useCallback(() => {
    let yaw = 0, pitch = 0;
    for (const k of keys.current) {
      const [axis, v] = STEER_KEYS[k];
      if (axis === 'yaw') yaw += v; else pitch += v;
    }
    yaw = Math.max(-1, Math.min(1, yaw + pads.current.yaw));
    pitch = Math.max(-1, Math.min(1, pitch + pads.current.pitch));
    input.current.yaw = yaw;
    input.current.pitch = pitch;
    setHeld({ yaw, pitch });
  }, [input]);

  const setThrottleBoth = useCallback((v) => {
    const t = Math.max(0, Math.min(1, v));
    input.current.throttle = t;
    setThrottle(t);
  }, [input]);

  // keyboard
  useEffect(() => {
    if (!visible) return undefined;
    const down = (e) => {
      if (e.key === 'Escape') { onLand(); return; }
      if (STEER_KEYS[e.key]) {
        e.preventDefault();
        keys.current.add(e.key);
        recompute();
      } else if (FASTER_KEYS.has(e.key)) {
        e.preventDefault();
        nudge.current = 1;
      } else if (SLOWER_KEYS.has(e.key)) {
        e.preventDefault();
        nudge.current = -1;
      }
    };
    const up = (e) => {
      if (STEER_KEYS[e.key]) {
        keys.current.delete(e.key);
        recompute();
      } else if (FASTER_KEYS.has(e.key) || SLOWER_KEYS.has(e.key)) {
        nudge.current = 0;
      }
    };
    const blur = () => {
      keys.current.clear();
      nudge.current = 0;
      recompute();
    };
    // held throttle keys ramp the slider smoothly
    const tick = setInterval(() => {
      if (nudge.current) setThrottleBoth(input.current.throttle + nudge.current * 0.03);
    }, 40);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      clearInterval(tick);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      blur();
    };
  }, [visible, input, onLand, recompute, setThrottleBoth]);

  // D-pad: hold to steer, release (or lose the pointer) to centre
  const pad = (axis, v) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      pads.current[axis] = v;
      recompute();
    },
    onPointerUp: () => { pads.current[axis] = 0; recompute(); },
    onPointerCancel: () => { pads.current[axis] = 0; recompute(); },
    onLostPointerCapture: () => { pads.current[axis] = 0; recompute(); },
    onContextMenu: (e) => e.preventDefault(),
  });

  const pct = Math.round(throttle * 100);
  const cls = (axis, v) => `pad-btn pad-${axis}${v > 0 ? '-pos' : '-neg'}${Math.sign(held[axis]) === v ? ' held' : ''}`;

  return (
    <motion.div
      id="flight-deck"
      className={visible ? '' : 'ui-off'}
      aria-label="Shuttle controls"
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="throttle" role="group" aria-label="Propulsion">
        <span className="throttle-icon" aria-hidden="true">🔥</span>
        <input
          type="range"
          className="throttle-slider"
          min="0"
          max="1"
          step="0.01"
          value={throttle}
          aria-label="Propulsion power"
          aria-valuetext={`${pct} percent power`}
          onChange={(e) => setThrottleBoth(parseFloat(e.target.value))}
        />
        <span className="throttle-readout">{pct}%</span>
      </div>

      <div className="deck-mid">
        <button className="land-btn" onClick={onLand} aria-label="Land the shuttle and go back to exploring">
          🛬 Land
        </button>
        <div className="deck-hint" aria-hidden="true">Arrows steer · Shift = faster</div>
      </div>

      <div className="dpad" role="group" aria-label="Steering">
        <button className={cls('pitch', 1)} aria-label="Nose up" {...pad('pitch', 1)}>▲</button>
        <button className={cls('yaw', -1)} aria-label="Turn left" {...pad('yaw', -1)}>◀</button>
        <span className="pad-center" aria-hidden="true">🚀</span>
        <button className={cls('yaw', 1)} aria-label="Turn right" {...pad('yaw', 1)}>▶</button>
        <button className={cls('pitch', -1)} aria-label="Nose down" {...pad('pitch', -1)}>▼</button>
      </div>
    </motion.div>
  );
}
