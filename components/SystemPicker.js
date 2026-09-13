'use client';

import { motion } from 'motion/react';
import { SYSTEMS } from '@/lib/bodies';

/* Galaxy navigation: a left-side stack listing our solar system and its
   neighbors — a badge and one row per star (icon, name, a short tag).
   Tapping a row flies the camera to that system. */
export default function SystemPicker({ visible, systemId, onPick }) {
  return (
    <motion.nav
      id="systems"
      className={visible ? '' : 'ui-off'}
      aria-label="Travel to another star system"
      initial={{ opacity: 0, x: -18 }}
      animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: visible ? 0.15 : 0 }}
    >
      <div className="sys-head">
        <span className="sys-badge">Star Systems</span>
      </div>
      <div className="sys-list" role="list">
        {SYSTEMS.map((s) => {
          const active = systemId === s.id;
          return (
            <button
              key={s.id}
              role="listitem"
              className={`sys-btn${active ? ' active' : ''}`}
              aria-current={active ? 'true' : undefined}
              onClick={() => onPick(s)}
            >
              <span className="sys-icon" aria-hidden="true" />
              <span className="sys-name">{s.short}</span>
              <span className="sys-tag">{s.tag}</span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
