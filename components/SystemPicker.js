'use client';

import { SYSTEMS } from '@/lib/bodies';

/* Galaxy navigation: fly between our solar system and its neighbors */
export default function SystemPicker({ systemId, onPick }) {
  return (
    <div id="systems" aria-label="Travel to another star system">
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
    </div>
  );
}
