'use client';

import { useEffect, useRef } from 'react';
import { SYSTEMS } from '@/lib/bodies';

/* Fly-mode overhead/underfoot marker: while flying over or under the
   nearest star system, if it has slipped off the top or bottom of the
   screen a small chip with its emoji, name and an arrow sits on that edge
   and slides along it as you turn. Only the nearest system, only when it
   is close, and only when it is above or below — systems beside or far
   away stay quiet so the view doesn't fill with chips.
   Positions come from the scene each frame (NDC x/y per system) and are
   written straight to the DOM — no React re-render in the loop. */

const SHOW_WITHIN = 420; // world units — "flying over" range; farther systems stay quiet
const VERTICAL_BIAS = 1.15; // the direction must be clearly more up/down than sideways
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
      // the chip sits right on the edge: just under the top bar, or just
      // above the speed readout between the throttle and the joystick
      const padTop = 82, padBottom = 104;
      const narrow = W < 480;
      // at the bottom, keep clear of the throttle (left) and joystick (right)
      const bottomMinX = narrow ? 110 : 150, bottomMaxX = W - (narrow ? 165 : 210);
      let nearest = -1;
      for (let i = 0; i < rows.length; i++) {
        if (nearest < 0 || rows[i].dist < rows[nearest].dist) nearest = i;
      }
      for (let i = 0; i < rows.length; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const m = rows[i];
        const onScreen = !m.behind && Math.abs(m.x) < 0.92 && Math.abs(m.y) < 0.85;
        const vertical = Math.abs(m.y) > Math.abs(m.x) * VERTICAL_BIAS;
        if (i !== nearest || onScreen || !vertical || m.dist > SHOW_WITHIN) { el.style.opacity = '0'; continue; }
        // pin to the top or bottom edge by which side the system is on,
        // and slide along it to the system's horizontal direction
        const above = m.y > 0;
        const nx = m.x / Math.max(Math.abs(m.y), 1e-6);
        let px = ((nx + 1) / 2) * W;
        const py = above ? padTop : H - padBottom;
        px = above
          ? Math.min(W - PAD_X, Math.max(PAD_X, px))
          : Math.min(bottomMaxX, Math.max(bottomMinX, px));
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
