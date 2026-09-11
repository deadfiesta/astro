'use client';

import { motion } from 'motion/react';
import { SYSTEMS } from '@/lib/bodies';

/* Galaxy navigation: fly between our solar system and its neighbors */
export default function SystemPicker({ visible, systemId, onPick }) {
  return (
    <motion.div
      id="systems"
      className={visible ? '' : 'ui-off'}
      aria-label="Travel to another star system"
      initial={{ opacity: 0, x: -18 }}
      animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: visible ? 0.15 : 0 }}
    >
      <div id="systems-title">🌌 Star systems</div>
      {SYSTEMS.map((s) => (
        <button
          key={s.id}
          className={`sys-btn${systemId === s.id ? ' active' : ''}`}
          onClick={() => onPick(s)}
        >
          <span className="sys-emoji">{s.emoji}</span>
          <span className="sys-name">{s.short}</span>
        </button>
      ))}
    </motion.div>
  );
}
