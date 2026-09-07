'use client';

import { BODIES, MOON } from '@/lib/bodies';

/* Shows the current system's star and planets. In our solar system the Moon
   is tucked in after Earth; the Kuiper Belt and Oort Cloud stay reachable
   via their in-scene labels. */
const SOL_PICKS = BODIES.flatMap((b) => (b.id === 'earth' ? [b, MOON] : [b]));

export default function PlanetPicker({ system, selectedId, onSelect }) {
  const picks = system.id === 'sol' ? SOL_PICKS : system.bodies;
  return (
    <div id="picker" aria-label="Pick a planet">
      {picks.map((b) => (
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
