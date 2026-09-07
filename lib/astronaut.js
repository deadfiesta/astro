import * as THREE from 'three';

/* A little vector astronaut built from primitives, ~1.2 units tall with its
   origin at the feet. Arms and legs are pivot groups whose in-plane swing
   (rotation.z) is driven by spring-damper ragdoll physics; legs also have a
   knee joint (rotation.x) so they bend when the jump cycle crouches.
   The whole `body` group drops during a crouch. */

const SUIT = new THREE.MeshLambertMaterial({ color: '#F4F6FB' });
const ACCENT = new THREE.MeshLambertMaterial({ color: '#FF7A3C' });
const VISOR = new THREE.MeshBasicMaterial({ color: '#20306B' });
const PACK = new THREE.MeshLambertMaterial({ color: '#C9D2E8' });

function capsule(r, len, mat) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat);
}

// arm: single segment with a glove. leg: thigh + knee group with shin + boot.
function makeLimb({ x, y, r, len, rest, gain, knee = false }) {
  const group = new THREE.Group();
  group.position.set(x, y, 0);
  let kneeGroup = null;

  if (knee) {
    const seg = len * 0.55;
    const thigh = capsule(r, seg, SUIT);
    thigh.position.y = -(seg / 2 + r * 0.5);
    group.add(thigh);

    kneeGroup = new THREE.Group();
    kneeGroup.position.y = -(seg + r * 0.6);
    group.add(kneeGroup);

    const shin = capsule(r * 0.92, seg, SUIT);
    shin.position.y = -(seg / 2 + r * 0.4);
    kneeGroup.add(shin);

    const boot = new THREE.Mesh(new THREE.SphereGeometry(r * 1.3, 10, 8), ACCENT);
    boot.position.y = -(seg + r);
    boot.scale.set(1, 0.8, 1.3);
    kneeGroup.add(boot);
  } else {
    const mesh = capsule(r, len, SUIT);
    mesh.position.y = -(len / 2 + r);
    group.add(mesh);

    const glove = new THREE.Mesh(new THREE.SphereGeometry(r * 1.25, 10, 8), ACCENT);
    glove.position.y = -(len + r * 1.6);
    group.add(glove);
  }

  group.rotation.z = rest;
  return {
    group, knee: kneeGroup,
    rest, baseRest: rest, theta: rest, omega: 0,
    out: Math.sign(x) || 1, gain,
  };
}

export function buildAstronaut() {
  const group = new THREE.Group();
  // everything hangs off `body` so a crouch can drop the whole figure
  const body = new THREE.Group();
  group.add(body);

  const torso = capsule(0.17, 0.3, SUIT);
  torso.position.y = 0.72;
  body.add(torso);

  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.04), ACCENT);
  panel.position.set(0, 0.72, 0.16);
  body.add(panel);

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.14), PACK);
  pack.position.set(0, 0.76, -0.18);
  body.add(pack);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 20, 14), SUIT);
  head.position.y = 1.06;
  body.add(head);

  // visor faces +z; the group is billboarded toward the camera each frame
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), VISOR);
  visor.position.set(0, 1.06, 0.075);
  visor.scale.set(1, 0.85, 0.6);
  body.add(visor);

  const glint = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 6),
    new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
  );
  glint.position.set(0.045, 1.11, 0.16);
  body.add(glint);

  const limbs = [
    makeLimb({ x: -0.22, y: 0.88, r: 0.055, len: 0.24, rest: 0.35, gain: 1.0 }),       // left arm
    makeLimb({ x: 0.22, y: 0.88, r: 0.055, len: 0.24, rest: -0.35, gain: 1.0 }),       // right arm (waves)
    makeLimb({ x: -0.09, y: 0.44, r: 0.065, len: 0.26, rest: 0.12, gain: 0.6, knee: true }),  // left leg
    makeLimb({ x: 0.09, y: 0.44, r: 0.065, len: 0.26, rest: -0.12, gain: 0.6, knee: true }),  // right leg
  ];
  for (const L of limbs) body.add(L.group);

  return { group, body, limbs, waveArm: limbs[1] };
}
