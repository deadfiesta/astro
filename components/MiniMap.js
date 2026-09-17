'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SYSTEMS } from '@/lib/bodies';

/* Fly-mode radar: a top-down (x/z) view centred on the shuttle. The range
   zooms itself — close to a star it shows that system's planets in their
   live positions; out in the dark between stars it widens until the
   neighbouring systems come into view as emoji. North is up, the shuttle
   is the arrow in the middle. `getMap()` returns the scene's snapshot
   ({ ship, nearest, nearestD, bodies }) or null when not flying. */

const CANVAS_PX = 150; // CSS size on desktop; drawn at device pixel ratio
const RING_PAD = 6;
// radar pulse: a ring sweeps from the centre to the rim, then the dish
// rests before the next one (long gap so it reads as a ping, not a strobe)
const PULSE_SWEEP = 1.6; // seconds the ring takes to cross the dish
const PULSE_PERIOD = 4.8; // seconds from one ping to the next

// how far (world units) the map radius reaches, from distance to nearest star
function rangeFor(nearestD) {
  return Math.max(95, Math.min(1700, nearestD * 1.5 + 45));
}

// a system's star colour (first body at orbit 0), for the far-scale dots
const STAR_COLOR = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, (s.bodies.find((b) => b.orbit === 0) ?? s.bodies[0]).color]),
);

export default function MiniMap({ visible, getMap }) {
  const canvasRef = useRef(null);
  const [caption, setCaption] = useState({ name: '', dist: '' });
  const range = useRef(160);
  const lastCaption = useRef('');

  useEffect(() => {
    if (!visible) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let size = 0;
    let dpr = 1;

    const fit = () => {
      const css = canvas.clientWidth || CANVAS_PX;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = css;
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
    };
    fit();
    window.addEventListener('resize', fit);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let prev = performance.now();
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const snap = getMap();
      if (!snap) return;

      // ease the zoom so the map breathes instead of snapping
      const target = rangeFor(snap.nearestD);
      range.current += (target - range.current) * Math.min(1, dt * 2.2);
      const R = size / 2 - RING_PAD; // px radius of the live area
      const k = R / range.current; // world units -> px
      const cx = size / 2, cy = size / 2;
      const sx = snap.ship.x, sz = snap.ship.z;
      const far = range.current > 320; // galaxy scale: stars as emoji

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // dish
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R + RING_PAD);
      bg.addColorStop(0, 'rgba(24, 32, 78, 0.95)');
      bg.addColorStop(1, 'rgba(9, 13, 38, 0.98)');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(cx, cy, R + RING_PAD, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(170, 180, 224, 0.28)';
      ctx.lineWidth = 1;
      for (const f of [1 / 3, 2 / 3, 1]) {
        ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

      // everything from here is clipped to the dish
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

      // the ping: an expanding ring with a soft glow trailing inside it,
      // fading as it nears the rim
      if (!reducedMotion) {
        const phase = ((now / 1000) % PULSE_PERIOD) / PULSE_SWEEP;
        if (phase < 1) {
          const pr = Math.max(1, phase * R);
          const fade = (1 - phase) * (1 - phase);
          const glow = ctx.createRadialGradient(cx, cy, Math.max(0, pr - R * 0.22), cx, cy, pr);
          glow.addColorStop(0, 'rgba(120, 214, 255, 0)');
          glow.addColorStop(1, `rgba(120, 214, 255, ${0.28 * fade})`);
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(160, 230, 255, ${0.85 * fade})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // other stars (and, at close range, the current star's orbit rings)
      for (const sys of SYSTEMS) {
        const px = cx + (sys.center[0] - sx) * k;
        const py = cy + (sys.center[2] - sz) * k;
        const isNear = sys === snap.nearest;
        if (Math.hypot(px - cx, py - cy) > R + 24) continue;
        if (far || !isNear) {
          // star dot with a soft glow, emoji + name at galaxy scale
          const col = STAR_COLOR[sys.id] ?? '#FFC93C';
          const g = ctx.createRadialGradient(px, py, 0, px, py, 9);
          g.addColorStop(0, col);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(px, py, isNear ? 4 : 3, 0, Math.PI * 2); ctx.fill();
          if (far) {
            ctx.font = '11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(sys.emoji, px, py - 5);
            ctx.font = '700 9px ui-rounded, system-ui, sans-serif';
            ctx.fillStyle = isNear ? '#FFC93C' : 'rgba(244, 246, 255, 0.85)';
            ctx.textBaseline = 'top';
            ctx.fillText(sys.short, px, py + 5);
          }
        } else {
          // faint orbit rings for the planets around the star we're at
          ctx.strokeStyle = 'rgba(170, 180, 224, 0.16)';
          for (const b of sys.bodies) {
            if (!b.orbit) continue;
            ctx.beginPath(); ctx.arc(px, py, b.orbit * k, 0, Math.PI * 2); ctx.stroke();
          }
        }
      }

      // live planets of the nearest system
      if (!far) {
        for (const b of snap.bodies) {
          const px = cx + (b.x - sx) * k;
          const py = cy + (b.z - sz) * k;
          const r = Math.max(b.star ? 4 : 2.2, b.r * k);
          if (b.star) {
            const g = ctx.createRadialGradient(px, py, 0, px, py, r * 2.4);
            g.addColorStop(0, b.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(px, py, r * 2.4, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = b.color;
          ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();

      // the shuttle: an arrow at the centre pointing along its heading.
      // forward in world x/z is (-sin h, -cos h); the map draws +z downward
      const h = snap.ship.heading;
      const ang = Math.atan2(-Math.cos(h), -Math.sin(h));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#FF7A3C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(9, 0); ctx.lineTo(-6, 5.5); ctx.lineTo(-3, 0); ctx.lineTo(-6, -5.5); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // caption: where we are (or heading), and how far — only on change
      if (snap.nearest) {
        const near = snap.nearestD < 110;
        const text = near
          ? `${snap.nearest.emoji} ${snap.nearest.short}`
          : `${snap.nearest.emoji} ${snap.nearest.short}|${Math.round(snap.nearestD / 10) * 10} away`;
        if (text !== lastCaption.current) {
          lastCaption.current = text;
          const [name, dist = ''] = text.split('|');
          setCaption({ name, dist });
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
    };
  }, [visible, getMap]);

  return (
    <motion.div
      id="minimap"
      className={visible ? '' : 'ui-off'}
      role="img"
      aria-label={caption.name ? `Map: near ${caption.name}${caption.dist ? `, ${caption.dist}` : ''}` : 'Map'}
      initial={false}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <canvas ref={canvasRef} width={CANVAS_PX} height={CANVAS_PX} />
      <div className="minimap-caption">
        {caption.name}
        {caption.dist && <span className="dist"> · {caption.dist}</span>}
      </div>
    </motion.div>
  );
}
