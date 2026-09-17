'use client';

import { useEffect, useRef } from 'react';
import { SYSTEMS } from '@/lib/bodies';

/* Fly-mode waypoints: when a star system is off screen — above, below,
   beside or behind the shuttle — a small chip with its emoji, name and an
   arrow sits on the screen edge in its direction and slides along the
   edge as you turn. A system straight overhead shows at the top pointing
   up; one under you shows at the bottom. On-screen systems get no chip.
   Positions come from the scene each frame (NDC x/y per system) and are
   written straight to the DOM — no React re-render in the loop. */

const SHOW_WITHIN = 1400; // world units; farther systems stay quiet
const PAD_X = 14;

export default function EdgeMarkers({ visible, getMarkers }) {
  const refs = useRef([]);

  useEffect(() => {
    if (!visible) {
      for (const el of refs.current) if (el) el.style.opacity = '0';
      return undefined;
    }
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const rows = getMarkers();
      if (!rows) return;
      const W = window.innerWidth, H = window.innerHeight;
      // keep chips clear of the top bar and the flight deck
      const padTop = 92, padBottom = H < 700 ? 230 : 210;
      for (let i = 0; i < rows.length; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const m = rows[i];
        const onScreen = !m.behind && Math.abs(m.x) < 0.92 && Math.abs(m.y) < 0.85;
        if (onScreen || m.dist > SHOW_WITHIN) { el.style.opacity = '0'; continue; }
        // push the direction out to the NDC square's edge
        const k = 1 / Math.max(Math.abs(m.x), Math.abs(m.y), 1e-6);
        const nx = m.x * k, ny = m.y * k;
        let px = ((nx + 1) / 2) * W;
        let py = ((1 - ny) / 2) * H;
        px = Math.min(W - PAD_X, Math.max(PAD_X, px));
        py = Math.min(H - padBottom, Math.max(padTop, py));
        // the arrow points from the chip toward the system (screen y is down)
        const ang = Math.atan2(-m.y, m.x);
        el.style.opacity = '1';
        el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%)`;
        el.firstChild.style.transform = `rotate(${ang}rad)`;
        el.lastChild.textContent = `${Math.round(m.dist / 10) * 10} away`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, getMarkers]);

  return (
    <div id="edge-markers" aria-hidden="true">
      {SYSTEMS.map((s, i) => (
        <div className="edge-marker" key={s.id} ref={(el) => { refs.current[i] = el; }}>
          <span className="edge-arrow">➤</span>
          <span className="edge-name">{s.emoji} {s.short}</span>
          <span className="edge-dist" />
        </div>
      ))}
    </div>
  );
}
