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

  const limbs = [
    makeArm(-0.22, 0.88, 0.35),   // left arm (swings with the jump)
    makeArm(0.22, 0.88, -0.35),   // right arm (waves)
    makeLeg(-0.09, 0.44, 0.12),   // left leg
    makeLeg(0.09, 0.44, -0.12),   // right leg
  ];
  for (const L of limbs) body.add(L.group);

  return { group, body, limbs, swingArm: limbs[0], waveArm: limbs[1] };
}
