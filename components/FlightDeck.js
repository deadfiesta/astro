'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

/* The shuttle's controls. Steering is a virtual joystick — drag the knob
   anywhere off centre and the ship follows: left/right swing the nose,
   up/down pitch it, further from the middle turns harder — plus keyboard
   arrows or WASD (which also move the knob, so it doubles as a stick
   readout), and on phones and tablets an opt-in tilt mode: point the
   device where you want to go — tilt its top edge up to climb, down to
   dive, roll it left or right to turn. Propulsion is a vertical throttle
   slider, also nudged with Shift/E/+ (faster) and Space/Ctrl/Q/- (slower —
   hold Space to brake all the way down). The scene reads the live values
   every frame through `input` (a ref: { yaw, pitch, throttle }) so no React
   re-render sits in the control loop. Escape or the Land button ends the
   flight. */

const STEER_KEYS = {
  ArrowLeft: ['yaw', -1], a: ['yaw', -1], A: ['yaw', -1],
  ArrowRight: ['yaw', 1], d: ['yaw', 1], D: ['yaw', 1],
  ArrowUp: ['pitch', 1], w: ['pitch', 1], W: ['pitch', 1],
  ArrowDown: ['pitch', -1], s: ['pitch', -1], S: ['pitch', -1],
};
const FASTER_KEYS = new Set(['Shift', 'e', 'E', '=', '+']);
const SLOWER_KEYS = new Set([' ', 'Spacebar', 'Control', 'q', 'Q', '-', '_']); // Space = brake
// a key pressed with Shift down reports a different name than it does on
// release once Shift has gone (E/e, +/=, _/-), which would leave it stuck in
// the held set — so throttle keys are tracked under one canonical name
const THROTTLE_ALIAS = { '+': '=', _: '-', Spacebar: ' ' };
const throttleKey = (k) => THROTTLE_ALIAS[k] ?? (k.length === 1 ? k.toLowerCase() : k);

// tilt feel: degrees of tilt from the neutral hold for full stick, and a
// dead zone so a steady hand flies straight
const TILT_FULL_DEG = 24;
const TILT_DEAD_DEG = 3;

// joystick feel: the knob's travel as a fraction of the base radius (so
// its edge stays inside the ring), and a centre dead zone so a resting
// thumb doesn't drift the ship
const STICK_TRAVEL = 0.58;
const STICK_DEAD = 0.1;

const clamp1 = (v) => Math.max(-1, Math.min(1, v));

// how far the screen has been rotated from portrait (0/90/180/270). iOS
// Safari lacks screen.orientation, so fall back to the legacy angle
function screenAngle() {
  const a = window.screen?.orientation?.angle;
  if (typeof a === 'number') return a;
  const o = window.orientation;
  return typeof o === 'number' ? (o + 360) % 360 : 0;
}

// map device tilt to (right, up) in the *screen's* frame. gamma is the
// left/right roll of the device (right edge down = positive), beta the
// front/back tilt (top edge up = positive); in landscape the two swap
function tiltToScreen(beta, gamma) {
  switch (screenAngle()) {
    case 90: return { right: beta, up: -gamma }; // device top points left
    case 270: return { right: -beta, up: gamma }; // device top points right
    case 180: return { right: -gamma, up: -beta };
    default: return { right: gamma, up: beta };
  }
}

function deadzone(deg) {
  const mag = Math.abs(deg);
  if (mag < TILT_DEAD_DEG) return 0;
  return Math.sign(deg) * (mag - TILT_DEAD_DEG) / (TILT_FULL_DEG - TILT_DEAD_DEG);
}

export default function FlightDeck({ visible, input, onLand }) {
  const [throttle, setThrottle] = useState(input.current.throttle);
  // 'hidden' = no sensor here, otherwise the tilt toggle's state
  const [tilt, setTilt] = useState('hidden'); // hidden | off | on | denied | silent
  const [gripping, setGripping] = useState(false); // joystick knob held
  // which sources are pushing each axis, so a key, the stick and the
  // sensor never fight — they simply add up (clamped)
  const keys = useRef(new Set());
  const stick = useRef({ yaw: 0, pitch: 0 }); // joystick, analog
  const tiltIn = useRef({ yaw: 0, pitch: 0 });
  const tiltRest = useRef(null); // neutral (right, up) captured on enable
  const thrKeys = useRef(new Set()); // throttle keys currently held (faster and slower)
  const baseRef = useRef(null); // joystick base element
  const knobRef = useRef(null);
  const stickPointer = useRef(null); // pointer id currently dragging the knob

  // write the combined stick to the ref the scene reads (cheap, any rate),
  // and park the knob where the combined stick points so keys show too
  const apply = useCallback(() => {
    let yaw = 0, pitch = 0;
    for (const k of keys.current) {
      const [axis, v] = STEER_KEYS[k];
      if (axis === 'yaw') yaw += v; else pitch += v;
    }
    yaw = clamp1(yaw + stick.current.yaw + tiltIn.current.yaw);
    pitch = clamp1(pitch + stick.current.pitch + tiltIn.current.pitch);
    input.current.yaw = yaw;
    input.current.pitch = pitch;
    const base = baseRef.current, knob = knobRef.current;
    if (base && knob) {
      const travel = (base.clientWidth / 2) * STICK_TRAVEL;
      knob.style.transform = `translate(${yaw * travel}px, ${-pitch * travel}px)`;
    }
  }, [input]);

  const setThrottleBoth = useCallback((v) => {
    const t = Math.max(0, Math.min(1, v));
    input.current.throttle = t;
    setThrottle(t);
  }, [input]);

  // offer tilt only where a motion sensor is plausible: touch devices that
  // expose the orientation event
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (touch && 'DeviceOrientationEvent' in window) setTilt('off');
  }, []);

  // tilt sensor: the first reading after enabling becomes "level", and the
  // pilot flies by leaning away from it. Listener lives while visible+on
  useEffect(() => {
    if (!visible || tilt !== 'on') {
      tiltIn.current.yaw = 0;
      tiltIn.current.pitch = 0;
      tiltRest.current = null;
      apply();
      return undefined;
    }
    let got = false;
    const onTilt = (e) => {
      if (e.beta == null || e.gamma == null) return;
      got = true;
      const s = tiltToScreen(e.beta, e.gamma);
      if (!tiltRest.current) tiltRest.current = s;
      tiltIn.current.yaw = clamp1(deadzone(s.right - tiltRest.current.right));
      tiltIn.current.pitch = clamp1(deadzone(s.up - tiltRest.current.up));
      apply();
    };
    // a change of screen orientation invalidates the captured neutral
    const recentre = () => { tiltRest.current = null; };
    // some browsers expose the event but never fire it (sensors off,
    // in-app webviews): say so instead of leaving a dead toggle
    const probe = setTimeout(() => { if (!got) setTilt('silent'); }, 2000);
    window.addEventListener('deviceorientation', onTilt);
    window.addEventListener('orientationchange', recentre);
    return () => {
      clearTimeout(probe);
      window.removeEventListener('deviceorientation', onTilt);
      window.removeEventListener('orientationchange', recentre);
    };
  }, [visible, tilt, apply]);

  const toggleTilt = () => {
    if (tilt === 'on') { setTilt('off'); return; }
    // iOS needs an explicit permission request from inside a tap
    const req = typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission;
    if (typeof req === 'function') {
      req.call(DeviceOrientationEvent)
        .then((state) => setTilt(state === 'granted' ? 'on' : 'denied'))
        .catch(() => setTilt('denied'));
    } else {
      setTilt('on');
    }
  };

  // keyboard
  useEffect(() => {
    if (!visible) return undefined;
    const down = (e) => {
      if (e.key === 'Escape') { onLand(); return; }
      if (STEER_KEYS[e.key]) {
        e.preventDefault();
        keys.current.add(e.key);
        apply();
      } else if (FASTER_KEYS.has(e.key) || SLOWER_KEYS.has(e.key)) {
        e.preventDefault(); // Space must not press a focused button or scroll
        thrKeys.current.add(throttleKey(e.key));
      }
    };
    const up = (e) => {
      if (STEER_KEYS[e.key]) {
        keys.current.delete(e.key);
        apply();
      } else if (FASTER_KEYS.has(e.key) || SLOWER_KEYS.has(e.key)) {
        e.preventDefault();
        thrKeys.current.delete(throttleKey(e.key));
      }
    };
    const blur = () => {
      keys.current.clear();
      thrKeys.current.clear();
      apply();
    };
    // held throttle keys ramp the slider smoothly; faster and slower held
    // together cancel out, and releasing one leaves the other in charge
    const tick = setInterval(() => {
      let n = 0;
      for (const k of thrKeys.current) n += FASTER_KEYS.has(k) ? 1 : -1;
      if (n) setThrottleBoth(input.current.throttle + Math.sign(n) * 0.03);
    }, 40);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      clearInterval(tick);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      blur();
    };
  }, [visible, input, onLand, apply, setThrottleBoth]);

  // joystick: the knob follows the finger (clamped to the ring), the stick
  // value is the knob's offset over its travel with a small dead zone, and
  // letting go springs everything back to centre
  const moveStick = (e) => {
    const base = baseRef.current;
    if (!base) return;
    const r = base.getBoundingClientRect();
    const travel = (r.width / 2) * STICK_TRAVEL;
    let x = (e.clientX - (r.left + r.width / 2)) / travel;
    let y = ((r.top + r.height / 2) - e.clientY) / travel;
    const mag = Math.hypot(x, y);
    if (mag > 1) { x /= mag; y /= mag; }
    const m = Math.min(mag, 1);
    const k = m < STICK_DEAD ? 0 : (m - STICK_DEAD) / (1 - STICK_DEAD) / m;
    stick.current.yaw = x * k;
    stick.current.pitch = y * k;
    apply();
  };
  const releaseStick = () => {
    stickPointer.current = null;
    stick.current.yaw = 0;
    stick.current.pitch = 0;
    setGripping(false);
    apply();
  };
  const stickHandlers = {
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      stickPointer.current = e.pointerId;
      setGripping(true);
      moveStick(e);
    },
    onPointerMove: (e) => { if (stickPointer.current === e.pointerId) moveStick(e); },
    onPointerUp: releaseStick,
    onPointerCancel: releaseStick,
    onLostPointerCapture: releaseStick,
    onContextMenu: (e) => e.preventDefault(),
  };

  const pct = Math.round(throttle * 100);

  const tiltHint = {
    on: 'Tilt to steer · hold level to fly straight',
    denied: 'Tilt needs motion permission',
    silent: 'No tilt sensor found',
  }[tilt];

  return (
    <motion.div
      id="flight-deck"
      className={visible ? '' : 'ui-off'}
      aria-label="Shuttle controls"
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="throttle" role="group" aria-label="Propulsion">
        <span className="throttle-icon" aria-hidden="true">🔥</span>
        <input
          type="range"
          className="throttle-slider"
          min="0"
          max="1"
          step="0.01"
          value={throttle}
          aria-label="Propulsion power"
          aria-valuetext={`${pct} percent power`}
          onChange={(e) => setThrottleBoth(parseFloat(e.target.value))}
        />
        <span className="throttle-readout">{pct}%</span>
      </div>

      <div className="deck-mid">
        {tilt !== 'hidden' && (
          <button
            className={`tilt-btn${tilt === 'on' ? ' active' : ''}`}
            aria-pressed={tilt === 'on'}
            aria-label={tilt === 'on' ? 'Turn off tilt steering' : 'Steer by tilting the device'}
            onClick={toggleTilt}
          >
            📱 Tilt
          </button>
        )}
        <button className="land-btn" onClick={onLand} aria-label="Land the shuttle and go back to exploring">
          🛬 Land
        </button>
        <div className={`deck-hint${tilt === 'denied' || tilt === 'silent' ? ' deck-hint-warn' : ''}`} aria-live="polite">
          {tiltHint ?? <span className="deck-hint-keys">Arrows steer · Shift faster · Space slower</span>}
        </div>
      </div>

      <div
        ref={baseRef}
        className={`joystick${gripping ? ' gripping' : ''}`}
        role="img"
        aria-label="Steering joystick: drag the knob to steer, or use the arrow keys"
        {...stickHandlers}
      >
        <span className="joy-mark joy-up" aria-hidden="true">▲</span>
        <span className="joy-mark joy-left" aria-hidden="true">◀</span>
        <span className="joy-mark joy-right" aria-hidden="true">▶</span>
        <span className="joy-mark joy-down" aria-hidden="true">▼</span>
        <div ref={knobRef} className="joy-knob" aria-hidden="true">🚀</div>
      </div>
    </motion.div>
  );
}
