import * as THREE from 'three';

/* A stylized vector astronaut (~1.3 units tall, origin at the feet).
   Shoulders and hips are ragdoll pivots (rotation.z, spring-driven from the
   render loop). Arms have elbow groups for secondary motion and waving;
   legs have knee groups that fold (rotation.x) during the jump crouch.
   The whole `body` group drops during a crouch. */

const SUIT = new THREE.MeshLambertMaterial({ color: '#F4F6FB' });
const JOINT = new THREE.MeshLambertMaterial({ color: '#B8C2D8' });
const ACCENT = new THREE.MeshLambertMaterial({ color: '#FF7A3C' });
const PACK = new THREE.MeshLambertMaterial({ color: '#9AA6C4' });
const VISOR = new THREE.MeshBasicMaterial({ color: '#20306B' });
const GOLD = new THREE.MeshLambertMaterial({ color: '#E8B84B' });

function capsule(r, len, mat) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat);
}
function ball(r, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
  m.position.set(x, y, z);
  return m;
}

function makeArm(x, y, rest) {
  const group = new THREE.Group();
  group.position.set(x, y, 0);

  const upper = capsule(0.05, 0.12, SUIT);
  upper.position.y = -0.11;
  group.add(upper);

  const elbow = new THREE.Group();
  elbow.position.y = -0.22;
  group.add(elbow);

  elbow.add(ball(0.05, JOINT));
  const forearm = capsule(0.045, 0.11, SUIT);
  forearm.position.y = -0.1;
  elbow.add(forearm);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.035, 12), ACCENT);
  cuff.position.y = -0.185;
  elbow.add(cuff);
  elbow.add(ball(0.062, SUIT, 0, -0.225));

  group.rotation.z = rest;
  return {
    group, elbow, knee: null,
    rest, baseRest: rest, theta: rest, omega: 0,
    out: Math.sign(x) || 1, gain: 1.0,
  };
}

function makeLeg(x, y, rest) {
  const group = new THREE.Group();
  group.position.set(x, y, 0);

  const thigh = capsule(0.062, 0.12, SUIT);
  thigh.position.y = -0.1;
  group.add(thigh);

  const knee = new THREE.Group();
  knee.position.y = -0.2;
  group.add(knee);

  knee.add(ball(0.058, JOINT));
  const shin = capsule(0.052, 0.11, SUIT);
  shin.position.y = -0.09;
  knee.add(shin);
  const boot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.15), ACCENT);
  boot.position.set(0, -0.185, 0.02); // toe pokes forward
  knee.add(boot);

  group.rotation.z = rest;
  return {
    group, elbow: null, knee,
    rest, baseRest: rest, theta: rest, omega: 0,
    out: Math.sign(x) || 1, gain: 0.6,
  };
}

/* ---------- outfit pieces (temperature-based dress-up per world) ---------- */

const DARK = new THREE.MeshBasicMaterial({ color: '#101426' });
function mat(c) {
  return new THREE.MeshLambertMaterial({ color: c });
}

function makeShades() {
  const g = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.02), DARK);
  left.position.set(-0.048, 1.16, 0.185);
  const right = left.clone();
  right.position.x = 0.048;
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.015), DARK);
  bridge.position.set(0, 1.165, 0.19);
  g.add(left, right, bridge);
  return g;
}

function makeScarf(color) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.038, 8, 18), mat(color));
  ring.position.y = 1.0;
  ring.rotation.x = Math.PI / 2;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.03), mat(color));
  tail.position.set(0.07, 0.87, 0.16);
  tail.rotation.z = -0.1;
  g.add(ring, tail);
  return g;
}

function makeBeanie(color, pomColor, pomR = 0.05) {
  const g = new THREE.Group();
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.162, 16, 10), mat(color));
  cap.position.y = 1.2;
  cap.scale.set(1, 0.75, 1);
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 8, 18), mat(color));
  brim.position.y = 1.17;
  brim.rotation.x = Math.PI / 2;
  const pom = new THREE.Mesh(new THREE.SphereGeometry(pomR, 10, 8), mat(pomColor));
  pom.position.y = 1.33 + pomR * 0.4;
  g.add(cap, brim, pom);
  return g;
}

function makeVest(color, r = 0.19) {
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.06, 0.22, 14), mat(color));
  vest.position.y = 0.77;
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

  // Sun: shades + a big parasol against 5,500°C
  {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), mat('#B98A55'));
    stick.position.set(0.3, 1.05, 0);
    stick.rotation.z = -0.15;
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.14, 12), mat('#FFC93C'));
    canopy.position.set(0.34, 1.36, 0);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), mat('#FF9F1C'));
    tip.position.set(0.34, 1.45, 0);
    make('sun', makeShades(), stick, canopy, tip);
  }

  // Mercury: shades + swim shorts
  {
    const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.165, 0.15, 14), mat('#FF8A3C'));
    shorts.position.y = 0.5;
    make('mercury', makeShades(), shorts);
  }

  // Venus: shades + wide straw sun hat + flower lei
  {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 18), mat('#EBC97E'));
    brim.position.y = 1.235;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.09, 14), mat('#EBC97E'));
    crown.position.y = 1.29;
    const lei = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.032, 8, 18), mat('#F26D9C'));
    lei.position.y = 0.95;
    lei.rotation.x = Math.PI / 2;
    make('venus', makeShades(), brim, crown, lei);
  }

  // Moon: cozy ice-blue scarf
  make('moon', makeScarf('#8FD1FF'));

  // Mars: red pompom beanie + rust scarf
  make('mars', makeBeanie('#D9503C', '#FFFFFF'), makeScarf('#E0764A'));

  // Jupiter: fluffy earmuffs + tan puffer vest
  {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.013, 8, 20), mat('#8892AC'));
    band.position.y = 1.14;
    const muffL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), mat('#C98A4B'));
    muffL.position.set(-0.16, 1.14, 0);
    const muffR = muffL.clone();
    muffR.position.x = 0.16;
    make('jupiter', band, muffL, muffR, makeVest('#B9793F'));
  }

  // Saturn: double golden striped scarf
  {
    const scarf = makeScarf('#E8B84B');
    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.17, 0.03), mat('#F6E3B4'));
    tail2.position.set(-0.06, 0.88, 0.16);
    tail2.rotation.z = 0.12;
    make('saturn', scarf, tail2);
  }

  // Uranus: fur-lined parka hood + icy vest (coldest planet!)
  {
    const hood = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.05, 10, 20), mat('#EAF2F8'));
    hood.position.set(0, 1.14, 0.04);
    make('uranus', hood, makeVest('#7ED4DC'));
  }

  // Neptune: bundled to the eyeballs — oversized puffer jacket and a scarf
  // wrapped three times up over the chin, plus goggles and a beanie
  {
    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.24, 0.32, 14), mat('#27408F'));
    jacket.position.y = 0.74;
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 10, 18), mat('#3A57B8'));
    collar.position.y = 0.94;
    collar.rotation.x = Math.PI / 2;
    const wraps = [];
    for (let i = 0; i < 3; i++) {
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.15 - i * 0.006, 0.045, 8, 18), mat(i % 2 ? '#59E0FF' : '#3A57B8'));
      wrap.position.y = 1.0 + i * 0.06; // climbs up over the chin
      wrap.rotation.x = Math.PI / 2;
      wraps.push(wrap);
    }
    const tailA = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.035), mat('#3A57B8'));
    tailA.position.set(0.07, 0.8, 0.2);
    tailA.rotation.z = -0.12;
    const tailB = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.2, 0.035), mat('#59E0FF'));
    tailB.position.set(-0.05, 0.84, 0.21);
    tailB.rotation.z = 0.15;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.163, 0.015, 8, 20), mat('#27408F'));
    band.position.y = 1.18;
    band.rotation.x = Math.PI / 2;
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.06, 0.03), new THREE.MeshBasicMaterial({ color: '#59E0FF' }));
    lens.position.set(0, 1.18, 0.185);
    make('neptune', jacket, collar, ...wraps, tailA, tailB, band, lens, makeBeanie('#27408F', '#59E0FF'));
  }

  // Pluto: full marshmallow puff + giant pink pompom hat + scarf
  make('pluto',
    makeVest('#F7ECF4', 0.2),
    makeBeanie('#F2A7C3', '#FFFFFF', 0.075),
    makeScarf('#F2A7C3'));

  return outfits;
}

export function buildAstronaut() {
  const group = new THREE.Group();
  // everything hangs off `body` so a crouch can drop the whole figure
  const body = new THREE.Group();
  group.add(body);

  // torso: chest, pelvis, waist belt
  const chest = capsule(0.165, 0.2, SUIT);
  chest.position.y = 0.76;
  body.add(chest);
  const pelvis = ball(0.13, SUIT, 0, 0.48);
  pelvis.scale.set(1.2, 0.8, 1);
  body.add(pelvis);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 8, 20), JOINT);
  belt.position.y = 0.55;
  belt.rotation.x = Math.PI / 2;
  body.add(belt);

  // chest control panel with tiny colored buttons
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.045), PACK);
  panel.position.set(0, 0.8, 0.165);
  body.add(panel);
  body.add(ball(0.016, new THREE.MeshBasicMaterial({ color: '#E85D4A' }), -0.04, 0.81, 0.19));
  body.add(ball(0.016, new THREE.MeshBasicMaterial({ color: '#FFC93C' }), 0, 0.81, 0.19));
  body.add(ball(0.016, new THREE.MeshBasicMaterial({ color: '#6FD8E6' }), 0.04, 0.81, 0.19));

  // backpack with twin tanks
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.15), PACK);
  pack.position.set(0, 0.82, -0.2);
  body.add(pack);
  for (const tx of [-0.07, 0.07]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 12), JOINT);
    tank.position.set(tx, 0.84, -0.3);
    body.add(tank);
  }

  // helmet: collar ring, dome, navy visor with gold rim and a glint, antenna
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.05, 16), JOINT);
  collar.position.y = 1.0;
  body.add(collar);
  body.add(ball(0.155, SUIT, 0, 1.14));
  const visor = ball(0.115, VISOR, 0, 1.14, 0.08);
  visor.scale.set(1, 0.85, 0.6);
  body.add(visor);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 20), GOLD);
  rim.position.set(0, 1.14, 0.105);
  body.add(rim);
  body.add(ball(0.025, new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), 0.045, 1.19, 0.16));
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), JOINT);
  antenna.position.set(-0.15, 1.24, 0);
  antenna.rotation.z = 0.3;
  body.add(antenna);
  body.add(ball(0.018, ACCENT, -0.17, 1.3, 0));

  // fixed joint covers so shoulders/hips stay smooth while limbs swing
  body.add(ball(0.075, SUIT, -0.2, 0.88), ball(0.075, SUIT, 0.2, 0.88));
  body.add(ball(0.07, SUIT, -0.09, 0.46), ball(0.07, SUIT, 0.09, 0.46));

  // rest angles flare each limb outward on its own side (+x limb → +z rotation)
  const limbs = [
    makeArm(-0.22, 0.88, -0.35),  // arm on -x (swings with the jump)
    makeArm(0.22, 0.88, 0.35),    // arm on +x (waves)
    makeLeg(-0.09, 0.44, -0.12),  // leg on -x
    makeLeg(0.09, 0.44, 0.12),    // leg on +x
  ];
  for (const L of limbs) body.add(L.group);

  const outfits = buildOutfits(body);

  return { group, body, limbs, swingArm: limbs[0], waveArm: limbs[1], outfits };
}
