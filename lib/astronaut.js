import * as THREE from 'three';

/* A brick-minifigure-style spaceman (homage to the classic 1978 look):
   red suit, white helmet with an open face window, yellow smiley head and
   C-clamp hands, boxy legs, grey air tank. ~1.3 units tall, origin at the
   feet. Shoulders and hips are ragdoll pivots (rotation.z, spring-driven
   from the render loop); arms have "elbow" groups for secondary motion and
   waving; legs have knee groups that fold (rotation.x) during the jump
   crouch. The whole `body` group drops during a crouch. */

const RED = new THREE.MeshLambertMaterial({ color: '#E03C2E' });
const WHITE = new THREE.MeshLambertMaterial({ color: '#F4F6FB' });
const YELLOW = new THREE.MeshLambertMaterial({ color: '#FFD23C' });
const GREY = new THREE.MeshLambertMaterial({ color: '#9AA6C4' });
const INKM = new THREE.MeshBasicMaterial({ color: '#20242E' });

function box(w, h, d, matl, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matl);
  m.position.set(x, y, z);
  return m;
}
function cyl(r, h, matl, x = 0, y = 0, z = 0, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), matl);
  m.position.set(x, y, z);
  return m;
}
function ball(r, matl, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), matl);
  m.position.set(x, y, z);
  return m;
}

// minifig arm: rigid upper piece, "elbow" carries the forearm + C-clamp hand
function makeArm(x, y, rest) {
  const group = new THREE.Group();
  group.position.set(x, y, 0);

  const upper = cyl(0.055, 0.14, RED, 0, -0.08);
  group.add(upper);

  const elbow = new THREE.Group();
  elbow.position.y = -0.16;
  group.add(elbow);

  const forearm = cyl(0.05, 0.12, RED, 0, -0.06);
  elbow.add(forearm);
  const wrist = cyl(0.035, 0.05, YELLOW, 0, -0.14);
  elbow.add(wrist);
  // the classic C-clamp hand
  const hand = new THREE.Mesh(
    new THREE.TorusGeometry(0.05, 0.024, 10, 16, Math.PI * 1.45),
    YELLOW
  );
  hand.position.set(0, -0.2, 0);
  hand.rotation.y = Math.PI / 2;
  hand.rotation.z = Math.PI * 0.3;
  elbow.add(hand);

  group.rotation.z = rest;
  return {
    group, elbow, knee: null,
    rest, baseRest: rest, theta: rest, omega: 0,
    out: Math.sign(x) || 1, gain: 1.0,
  };
}

// minifig leg: square column split by a knee joint, flat foot at the end
function makeLeg(x, y, rest) {
  const group = new THREE.Group();
  group.position.set(x, y, 0);

  const thigh = box(0.16, 0.2, 0.19, RED, 0, -0.11);
  group.add(thigh);

  const knee = new THREE.Group();
  knee.position.y = -0.22;
  group.add(knee);

  const shin = box(0.16, 0.22, 0.19, RED, 0, -0.11);
  knee.add(shin);
  const foot = box(0.16, 0.08, 0.25, RED, 0, -0.26, 0.03);
  knee.add(foot);

  group.rotation.z = rest;
  return {
    group, elbow: null, knee,
    rest, baseRest: rest, theta: rest, omega: 0,
    out: Math.sign(x) || 1, gain: 0.6,
  };
}

export function buildAstronaut() {
  const group = new THREE.Group();
  // everything hangs off `body` so a crouch can drop the whole figure
  const body = new THREE.Group();
  group.add(body);

  // hips and boxy torso (slightly wider at the shoulders, like the real one)
  body.add(box(0.36, 0.12, 0.2, RED, 0, 0.55));
  const torso = box(0.44, 0.34, 0.24, RED, 0, 0.78);
  torso.scale.set(1, 1, 1);
  body.add(torso);
  body.add(box(0.48, 0.05, 0.26, RED, 0, 0.93)); // shoulder ridge

  // chest print: a little planet-and-orbit badge
  const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.01, 8, 18), WHITE);
  orbitRing.position.set(0, 0.8, 0.13);
  orbitRing.rotation.z = 0.5;
  body.add(orbitRing);
  body.add(ball(0.022, WHITE, 0, 0.8, 0.135));

  // neck stud + yellow head with the timeless smiley
  body.add(cyl(0.07, 0.05, YELLOW, 0, 0.97));
  const head = cyl(0.13, 0.17, YELLOW, 0, 1.07, 0, 20);
  body.add(head);
  body.add(ball(0.016, INKM, -0.05, 1.1, 0.122));
  body.add(ball(0.016, INKM, 0.05, 1.1, 0.122));
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.045, 0.009, 8, 16, 2.0),
    INKM
  );
  smile.position.set(0, 1.05, 0.124);
  smile.rotation.z = Math.PI * 1.5 - 1.0; // arc centered at the bottom
  smile.scale.set(1, 1, 0.4);
  body.add(smile);

  // white helmet: a partial sphere leaving the square face window open
  const helmet = new THREE.Mesh(
    // gap of ~1.5 rad centered on +z (the face)
    new THREE.SphereGeometry(0.185, 24, 16, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5, 0, 2.35),
    WHITE
  );
  helmet.position.y = 1.07;
  body.add(helmet);
  body.add(box(0.2, 0.045, 0.03, WHITE, 0, 0.955, 0.16)); // chin guard

  // grey air tank with twin bottles — the classic space backpack
  body.add(box(0.3, 0.3, 0.1, GREY, 0, 0.8, -0.18));
  body.add(cyl(0.05, 0.28, GREY, -0.08, 0.8, -0.26));
  body.add(cyl(0.05, 0.28, GREY, 0.08, 0.8, -0.26));

  const limbs = [
    makeArm(-0.27, 0.88, -0.35), // arm on -x (swings with the jump)
    makeArm(0.27, 0.88, 0.35),   // arm on +x (waves)
    makeLeg(-0.1, 0.52, -0.12),  // leg on -x
    makeLeg(0.1, 0.52, 0.12),    // leg on +x
  ];
  for (const L of limbs) body.add(L.group);

  const outfits = buildOutfits(body);

  return { group, body, limbs, swingArm: limbs[0], waveArm: limbs[1], outfits };
}

/* ---------- outfit pieces (temperature-based dress-up per world) ---------- */

const DARK = new THREE.MeshBasicMaterial({ color: '#101426' });
function mat(c) {
  return new THREE.MeshLambertMaterial({ color: c });
}

function makeShades() {
  const g = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.055, 0.02), DARK);
  left.position.set(-0.052, 1.1, 0.13);
  const right = left.clone();
  right.position.x = 0.052;
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.014, 0.015), DARK);
  bridge.position.set(0, 1.105, 0.135);
  g.add(left, right, bridge);
  return g;
}

function makeScarf(color) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 18), mat(color));
  ring.position.y = 0.96;
  ring.rotation.x = Math.PI / 2;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.035), mat(color));
  tail.position.set(0.09, 0.82, 0.16);
  tail.rotation.z = -0.1;
  g.add(ring, tail);
  return g;
}

function makeBeanie(color, pomColor, pomR = 0.055) {
  const g = new THREE.Group();
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), mat(color));
  cap.position.y = 1.14;
  cap.scale.set(1, 0.72, 1);
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.026, 8, 18), mat(color));
  brim.position.y = 1.13;
  brim.rotation.x = Math.PI / 2;
  const pom = new THREE.Mesh(new THREE.SphereGeometry(pomR, 10, 8), mat(pomColor));
  pom.position.y = 1.3 + pomR * 0.4;
  g.add(cap, brim, pom);
  return g;
}

function makeVest(color, r = 0.32) {
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.06, 0.3, 14), mat(color));
  vest.position.y = 0.78;
  return vest;
}

/* One accessory set per world, keyed by body id; Earth keeps the bare suit */
function buildOutfits(body) {
  const outfits = {};
  const make = (id, ...parts) => {
    const g = new THREE.Group();
    g.visible = false;
    for (const p of parts) g.add(p);
    body.add(g);
    outfits[id] = g;
  };

  // Sun: just the shades — the burning feet do the rest of the talking
  make('sun', makeShades());

  // Mercury: shades + swim shorts
  {
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.24), mat('#FF8A3C'));
    shorts.position.y = 0.52;
    make('mercury', makeShades(), shorts);
  }

  // Venus: shades + wide straw sun hat + flower lei
  {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 18), mat('#EBC97E'));
    brim.position.y = 1.22;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.1, 14), mat('#EBC97E'));
    crown.position.y = 1.27;
    const lei = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 18), mat('#F26D9C'));
    lei.position.y = 0.92;
    lei.rotation.x = Math.PI / 2;
    make('venus', makeShades(), brim, crown, lei);
  }

  // Moon: cozy ice-blue scarf
  make('moon', makeScarf('#8FD1FF'));

  // Mars: red pompom beanie + rust scarf
  make('mars', makeBeanie('#D9503C', '#FFFFFF'), makeScarf('#E0764A'));

  // Jupiter: fluffy earmuffs + tan puffer vest
  {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.015, 8, 20), mat('#8892AC'));
    band.position.y = 1.07;
    const muffL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mat('#C98A4B'));
    muffL.position.set(-0.19, 1.07, 0);
    const muffR = muffL.clone();
    muffR.position.x = 0.19;
    make('jupiter', band, muffL, muffR, makeVest('#B9793F'));
  }

  // Saturn: double golden striped scarf
  {
    const scarf = makeScarf('#E8B84B');
    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.035), mat('#F6E3B4'));
    tail2.position.set(-0.07, 0.84, 0.16);
    tail2.rotation.z = 0.12;
    make('saturn', scarf, tail2);
  }

  // Uranus: fur-lined parka hood + icy vest (coldest planet!)
  {
    const hood = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.055, 10, 20), mat('#EAF2F8'));
    hood.position.set(0, 1.07, 0.05);
    make('uranus', hood, makeVest('#7ED4DC'));
  }

  // Neptune: bundled to the eyeballs — oversized puffer jacket and a scarf
  // wrapped three times up over the chin, plus goggles and a beanie
  {
    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.36, 0.36, 14), mat('#27408F'));
    jacket.position.y = 0.76;
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.055, 10, 18), mat('#3A57B8'));
    collar.position.y = 0.95;
    collar.rotation.x = Math.PI / 2;
    const wraps = [];
    for (let i = 0; i < 3; i++) {
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.185 - i * 0.006, 0.05, 8, 18), mat(i % 2 ? '#59E0FF' : '#3A57B8'));
      wrap.position.y = 0.98 + i * 0.06; // climbs up over the chin
      wrap.rotation.x = Math.PI / 2;
      wraps.push(wrap);
    }
    const tailA = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.04), mat('#3A57B8'));
    tailA.position.set(0.08, 0.76, 0.21);
    tailA.rotation.z = -0.12;
    const tailB = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.04), mat('#59E0FF'));
    tailB.position.set(-0.06, 0.8, 0.22);
    tailB.rotation.z = 0.15;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.195, 0.016, 8, 20), mat('#27408F'));
    band.position.y = 1.1;
    band.rotation.x = Math.PI / 2;
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.07, 0.03), new THREE.MeshBasicMaterial({ color: '#59E0FF' }));
    lens.position.set(0, 1.1, 0.185);
    make('neptune', jacket, collar, ...wraps, tailA, tailB, band, lens, makeBeanie('#27408F', '#59E0FF'));
  }

  // Pluto: full marshmallow puff + giant pink pompom hat + scarf
  make('pluto',
    makeVest('#F7ECF4', 0.34),
    makeBeanie('#F2A7C3', '#FFFFFF', 0.08),
    makeScarf('#F2A7C3'));

  return outfits;
}
