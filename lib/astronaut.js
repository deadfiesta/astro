import * as THREE from 'three';

/* A little vector astronaut built from primitives, ~1.2 units tall with its
   origin at the feet. Arms and legs are pivot groups whose swing is driven
   by spring-damper ragdoll physics in the render loop (see SolarSystem). */

const SUIT = new THREE.MeshLambertMaterial({ color: '#F4F6FB' });
const ACCENT = new THREE.MeshLambertMaterial({ color: '#FF7A3C' });
const VISOR = new THREE.MeshBasicMaterial({ color: '#20306B' });
const PACK = new THREE.MeshLambertMaterial({ color: '#C9D2E8' });

function capsule(r, len, mat) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat);
}

// a limb hangs from its pivot; the mesh is offset so rotation.z swings it
function limb(x, y, r, len, rest, gain) {
  const group = new THREE.Group();
  group.position.set(x, y, 0);
  const mesh = capsule(r, len, SUIT);
  mesh.position.y = -(len / 2 + r);
  group.add(mesh);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(r * 1.25, 10, 8), ACCENT);
  tip.position.y = -(len + r * 1.6);
  group.add(tip);
  group.rotation.z = rest;
  return { group, rest, theta: rest, omega: 0, out: Math.sign(x) || 1, gain };
}

export function buildAstronaut() {
  const group = new THREE.Group();

  const torso = capsule(0.17, 0.3, SUIT);
  torso.position.y = 0.72;
  group.add(torso);

  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.04), ACCENT);
  panel.position.set(0, 0.72, 0.16);
  group.add(panel);

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.14), PACK);
  pack.position.set(0, 0.76, -0.18);
  group.add(pack);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 20, 14), SUIT);
  head.position.y = 1.06;
  group.add(head);

  // visor faces +z; the group is billboarded toward the camera each frame
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), VISOR);
  visor.position.set(0, 1.06, 0.075);
  visor.scale.set(1, 0.85, 0.6);
  group.add(visor);

  const glint = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 6),
    new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
  );
  glint.position.set(0.045, 1.11, 0.16);
  group.add(glint);

  const limbs = [
    limb(-0.22, 0.88, 0.055, 0.24, 0.35, 1.0),  // left arm
    limb(0.22, 0.88, 0.055, 0.24, -0.35, 1.0),  // right arm
    limb(-0.09, 0.44, 0.065, 0.26, 0.12, 0.6),  // left leg
    limb(0.09, 0.44, 0.065, 0.26, -0.12, 0.6),  // right leg
  ];
  for (const L of limbs) group.add(L.group);

  return { group, limbs };
}
