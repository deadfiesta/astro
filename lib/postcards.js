import { MOON, SYSTEMS } from './bodies';
import { SECRETS } from './secrets';

/* Postcard collecting: every star, planet and the Moon is a stamp. Flying
   the shuttle close to a body for a moment "takes a postcard", which lands
   in the sticker book. Collecting a whole system earns its star sticker.
   Progress lives in localStorage (best effort — private windows and
   blocked storage simply start fresh each visit). */

// one page per system: its bodies in orbit order, plus the Moon after Earth
export const PAGES = [
  ...SYSTEMS.map((sys) => {
    const bodies = [...sys.bodies];
    if (sys.id === 'sol') {
      const i = bodies.findIndex((b) => b.id === 'earth');
      bodies.splice(i + 1, 0, MOON);
    }
    return { system: sys, bodies };
  }),
  // the bonus page: real asteroids and comets hidden around the scene
  {
    system: { id: 'secrets', name: 'Secret Finds', emoji: '🔭' },
    bodies: SECRETS,
    secret: true,
  },
];

export const ALL_IDS = PAGES.flatMap((p) => p.bodies.map((b) => b.id));
export const TOTAL = ALL_IDS.length;

export function systemOf(bodyId) {
  return PAGES.find((p) => p.bodies.some((b) => b.id === bodyId))?.system ?? null;
}

export function systemComplete(systemId, collected) {
  const page = PAGES.find((p) => p.system.id === systemId);
  return !!page && page.bodies.every((b) => collected.has(b.id));
}

const KEY = 'little-orbit-postcards';

export function loadCollected() {
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter((id) => ALL_IDS.includes(id)) : []);
  } catch {
    return new Set();
  }
}

export function saveCollected(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* storage unavailable — progress lasts for this visit only */
  }
}

// how close (world units) the shuttle must fly to take the postcard: a
// couple of radii out, with a floor so tiny rocks and the Moon aren't
// needles (the scene adds more reach while the shuttle is moving fast)
export function collectRadius(body) {
  return Math.max(body.radius * 2.4, 3.2);
}
