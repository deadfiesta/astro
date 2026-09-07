'use client';

import { BODIES, MOON } from '@/lib/bodies';

/* Sun, planets, and the Moon (tucked in after Earth) get picker buttons;
   the Kuiper Belt and Oort Cloud stay reachable via their in-scene labels. */
const PICKS = BODIES.flatMap((b) => (b.id === 'earth' ? [b, MOON] : [b]));

export default function PlanetPicker({ selectedId, onSelect }) {
  return (
    <div id="picker" aria-label="Pick a planet">
      {PICKS.map((b) => (
        <button
          key={b.id}
          className={`planet-btn${selectedId === b.id ? ' active' : ''}`}
          onClick={() => onSelect(b.id)}
        >
          <span className="dot" style={{ background: b.color, boxShadow: `0 0 14px ${b.glow}66` }} />
          <span className="pname">{b.short || b.name}</span>
        </button>
      ))}
    </div>
  );
}
