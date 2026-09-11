import * as THREE from 'three';

/* A cartoony, chibi-proportioned astronaut (~1.3 units tall, origin at the
   feet): oversized helmet with a big glossy visor — shiny via a Phong
   specular hot-spot from the system's starlight PLUS painted cartoon
   glints — stubby rounded limbs, mitten gloves, chunky boots.
   Shoulders and hips are ragdoll pivots (rotation.z, spring-driven from the
   render loop); arms have elbow groups for secondary motion and waving;
   legs have knee groups that fold (rotation.x) during the jump crouch.
   The whole `body` group drops during a crouch. */

const SUIT = new THREE.MeshLambertMaterial({ color: '#F4F6FB' });
const ACCENT = new THREE.MeshLambertMaterial({ color: '#FF7A3C' });
const GREY = new THREE.MeshLambertMaterial({ color: '#9AA6C4' });
const GOLD = new THREE.MeshLambertMaterial({ color: '#E8B84B' });
// the very shiny visor: deep navy with a hard specular highlight
const VISOR = new THREE.MeshPhongMaterial({ color: '#16264E', specular: '#CFE4FF', shininess: 120 });
const GLINT = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.85 });

function capsule(r, len, matl) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), matl);
}
function ball(r, matl, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), matl);
  m.position.set(x, y, z);
  return m;
}

function makeArm(x, y, rest) {
  const group = new THREE.Group();
  group.position.set(x, y, 0);

  const upper = capsule(0.065, 0.1, SUIT);
  upper.position.y = -0.07;
  group.add(upper);

  const elbow = new THREE.Group();
  elbow.position.y = -0.16;
  group.add(elbow);

  const forearm = capsule(0.06, 0.08, SUIT);
  forearm.position.y = -0.05;
  elbow.add(forearm);
  elbow.add(ball(0.085, ACCENT, 0, -0.13)); // mitten glove

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

  const thigh = capsule(0.07, 0.1, SUIT);
  thigh.position.y = -0.08;
  group.add(thigh);

  const knee = new THREE.Group();
  knee.position.y = -0.18;
  group.add(knee);

  const shin = capsule(0.065, 0.1, SUIT);
  shin.position.y = -0.07;
  knee.add(shin);
  const boot = ball(0.1, ACCENT, 0, -0.17, 0.02); // chunky rounded boot
  boot.scale.set(1, 0.7, 1.3);
  knee.add(boot);

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

  // plump little torso with a belt and chest panel
  const torso = ball(0.24, SUIT, 0, 0.6);
  torso.scale.set(1, 0.95, 0.85);
  body.add(torso);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 8, 20), GREY);
  belt.position.y = 0.45;
  belt.rotation.x = Math.PI / 2;
  body.add(belt);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.05), GREY);
  panel.position.set(0, 0.62, 0.2);
  body.add(panel);
  body.add(ball(0.015, new THREE.MeshBasicMaterial({ color: '#E85D4A' }), -0.035, 0.63, 0.225));
  body.add(ball(0.015, new THREE.MeshBasicMaterial({ color: '#FFC93C' }), 0, 0.63, 0.225));
  body.add(ball(0.015, new THREE.MeshBasicMaterial({ color: '#6FD8E6' }), 0.035, 0.63, 0.225));

  // rounded backpack and twin tanks
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.14), GREY);
  pack.position.set(0, 0.68, -0.24);
  body.add(pack);
  for (const tx of [-0.08, 0.08]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.26, 12), SUIT);
    tank.position.set(tx, 0.7, -0.33);
    body.add(tank);
  }

  // neck ring, then the BIG helmet dome
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 10, 20), GOLD);
  collar.position.y = 0.78;
  collar.rotation.x = Math.PI / 2;
  body.add(collar);
  body.add(ball(0.3, SUIT, 0, 1.0));

  // the star of the show: a huge, very shiny visor
  const visor = ball(0.26, VISOR, 0, 1.0, 0.12);
  visor.scale.set(1, 0.85, 0.55);
  body.add(visor);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.022, 10, 24), GOLD);
  rim.position.set(0, 1.0, 0.2);
  body.add(rim);
  // painted cartoon glints: a big diagonal swoosh and a companion dot
  const swoosh = ball(0.08, GLINT, -0.09, 1.09, 0.29);
  swoosh.scale.set(1.5, 0.45, 0.18);
  swoosh.rotation.z = 0.55;
  body.add(swoosh);
  const dot = ball(0.028, GLINT, -0.155, 1.0, 0.285);
  dot.scale.set(1, 1, 0.3);
  body.add(dot);

  // helmet side pods + a bobbly antenna
  for (const px of [-0.29, 0.29]) {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), ACCENT);
    pod.position.set(px, 1.0, 0);
    pod.rotation.z = Math.PI / 2;
    body.add(pod);
  }
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 6), GREY);
  antenna.position.set(0.2, 1.32, 0);
  antenna.rotation.z = -0.25;
  body.add(antenna);
  body.add(ball(0.025, ACCENT, 0.235, 1.39, 0));

  const limbs = [
    makeArm(-0.24, 0.72, -0.35), // arm on -x (swings with the jump)
    makeArm(0.24, 0.72, 0.35),   // arm on +x (waves)
    makeLeg(-0.1, 0.42, -0.12),  // leg on -x
    makeLeg(0.1, 0.42, 0.12),    // leg on +x
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
  // sunglasses perched ON the visor — peak cartoon
  const g = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.02), DARK);
  left.position.set(-0.07, 1.06, 0.31);
  const right = left.clone();
  right.position.x = 0.07;
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.018, 0.015), DARK);
  bridge.position.set(0, 1.065, 0.315);
  g.add(left, right, bridge);
  return g;
}

function makeScarf(color) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.05, 8, 18), mat(color));
  ring.position.y = 0.76;
  ring.rotation.x = Math.PI / 2;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.2, 0.04), mat(color));
  tail.position.set(0.1, 0.62, 0.18);
  tail.rotation.z = -0.1;
  g.add(ring, tail);
  return g;
}

function makeBeanie(color, pomColor, pomR = 0.06) {
  const g = new THREE.Group();
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.315, 16, 10), mat(color));
  cap.position.y = 1.08;
  cap.scale.set(1, 0.72, 1);
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.03, 8, 20), mat(color));
  brim.position.y = 1.12;
  brim.rotation.x = Math.PI / 2;
  const pom = new THREE.Mesh(new THREE.SphereGeometry(pomR, 10, 8), mat(pomColor));
  pom.position.y = 1.32 + pomR * 0.4;
  g.add(cap, brim, pom);
  return g;
}

function makeVest(color, r = 0.3) {
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, 0.32, 14), mat(color));
  vest.position.y = 0.58;
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
    const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.16, 14), mat('#FF8A3C'));
    shorts.position.y = 0.4;
    make('mercury', makeShades(), shorts);
  }

  // Venus: shades + wide straw sun hat + flower lei
  {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 18), mat('#EBC97E'));
    brim.position.y = 1.24;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 14), mat('#EBC97E'));
    crown.position.y = 1.3;
    const lei = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 18), mat('#F26D9C'));
    lei.position.y = 0.72;
    lei.rotation.x = Math.PI / 2;
    make('venus', makeShades(), brim, crown, lei);
  }

  // Moon: cozy ice-blue scarf
  make('moon', makeScarf('#8FD1FF'));

  // Mars: red pompom beanie + rust scarf
  make('mars', makeBeanie('#D9503C', '#FFFFFF'), makeScarf('#E0764A'));

  // Jupiter: fluffy earmuffs + tan puffer vest
  {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.018, 8, 22), mat('#8892AC'));
    band.position.y = 1.0;
    const muffL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mat('#C98A4B'));
    muffL.position.set(-0.3, 1.0, 0);
    const muffR = muffL.clone();
    muffR.position.x = 0.3;
    make('jupiter', band, muffL, muffR, makeVest('#B9793F'));
  }

  // Saturn: double golden striped scarf
  {
    const scarf = makeScarf('#E8B84B');
    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.04), mat('#F6E3B4'));
    tail2.position.set(-0.08, 0.64, 0.18);
    tail2.rotation.z = 0.12;
    make('saturn', scarf, tail2);
  }

  // Uranus: fur-lined parka hood + icy vest (coldest planet!)
  {
    const hood = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.06, 10, 22), mat('#EAF2F8'));
    hood.position.set(0, 1.0, 0.08);
    make('uranus', hood, makeVest('#7ED4DC'));
  }

  // Neptune: bundled to the eyeballs — oversized puffer jacket and a scarf
  // wrapped three times up toward the visor, plus goggles and a beanie
  {
    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.34, 0.38, 14), mat('#27408F'));
    jacket.position.y = 0.56;
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.06, 10, 18), mat('#3A57B8'));
    collar.position.y = 0.76;
    collar.rotation.x = Math.PI / 2;
    const wraps = [];
    for (let i = 0; i < 3; i++) {
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.215 + i * 0.012, 0.055, 8, 18), mat(i % 2 ? '#59E0FF' : '#3A57B8'));
      wrap.position.y = 0.78 + i * 0.065; // climbs up toward the visor
      wrap.rotation.x = Math.PI / 2;
      wraps.push(wrap);
    }
    const tailA = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.045), mat('#3A57B8'));
    tailA.position.set(0.09, 0.56, 0.24);
    tailA.rotation.z = -0.12;
    const tailB = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.045), mat('#59E0FF'));
    tailB.position.set(-0.07, 0.6, 0.25);
    tailB.rotation.z = 0.15;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 8, 22), mat('#27408F'));
    band.position.y = 1.06;
    band.rotation.x = Math.PI / 2;
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.03), new THREE.MeshBasicMaterial({ color: '#59E0FF' }));
    lens.position.set(0, 1.06, 0.3);
    make('neptune', jacket, collar, ...wraps, tailA, tailB, band, lens, makeBeanie('#27408F', '#59E0FF'));
  }

  // Pluto: full marshmallow puff + giant pink pompom hat + scarf
  make('pluto',
    makeVest('#F7ECF4', 0.33),
    makeBeanie('#F2A7C3', '#FFFFFF', 0.09),
    makeScarf('#F2A7C3'));

  return outfits;
}
