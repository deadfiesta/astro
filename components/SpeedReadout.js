'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

/* Fly-mode speedometer: a pill at the bottom centre that slides in whenever
   the shuttle's speed is changing and slips away ~1.6 s after it settles.
   Speed comes from the scene's map snapshot (the eased flight speed, world
   units/s). Earth is 2 units across, so it reads as "Earths a second" —
   a size kids already know from the planet cards. */

const HOLD = 1.6; // seconds the readout lingers after the speed stops changing
const STEP = 0.08; // per-frame change (world units/s) that counts as "changing"

function label(speed) {
  const earths = speed / 2;
  if (earths < 0.05) return 'Drifting…';
  if (earths < 10) return `${earths.toFixed(1)} Earths a second`;
  return `${Math.round(earths)} Earths a second`;
}

function mood(speed) {
  if (speed < 6) return '🐢';
  if (speed < 25) return '🚀';
  if (speed < 55) return '☄️';
  return '⚡';
}

export default function SpeedReadout({ visible, getMap }) {
  const [text, setText] = useState('');
  const [icon, setIcon] = useState('🐢');
  const [shown, setShown] = useState(false);
  const last = useRef({ speed: 0, changedAt: 0, text: '', shown: false });

  useEffect(() => {
    if (!visible) { setShown(false); last.current.shown = false; return undefined; }
    let raf;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const snap = getMap();
      if (!snap) return;
      const s = snap.ship.speed;
      const L = last.current;
      if (Math.abs(s - L.speed) > STEP) L.changedAt = now;
      L.speed = s;
      const t = label(s);
      if (t !== L.text) { L.text = t; setText(t); setIcon(mood(s)); }
      const show = now - L.changedAt < HOLD * 1000;
      if (show !== L.shown) { L.shown = show; setShown(show); }
    };
    // show once right after take-off so the pilot learns where it lives
    last.current.changedAt = performance.now();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, getMap]);

  return (
    <motion.div
      id="speedo"
      className={visible ? '' : 'ui-off'}
      aria-live="off"
      initial={false}
      style={{ x: '-50%' }}
      animate={visible && shown ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.94 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <span className="speedo-icon" aria-hidden="true">{icon}</span>
      <span className="speedo-text">{text}</span>
    </motion.div>
  );
}
