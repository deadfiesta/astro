'use client';

import { BODIES } from '@/lib/bodies';

export default function PlanetPicker({ selectedId, onSelect }) {
  return (
    <div id="picker" aria-label="Pick a planet">
      {BODIES.map((b) => (
        <button
          key={b.id}
          className={`planet-btn${selectedId === b.id ? ' active' : ''}`}
          onClick={() => onSelect(b.id)}
        >
          <span className="dot" style={{ background: b.color, boxShadow: `0 0 14px ${b.glow}66` }} />
          <span className="pname">{b.id === 'sun' ? 'Sun' : b.name}</span>
        </button>
      ))}
    </div>
  );
}
