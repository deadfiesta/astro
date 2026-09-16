import * as THREE from 'three';

/* A big, friendly space shuttle for fly mode (~9 units nose to tail, ~6
   across the wings — about nine Earths long, so it reads as a real vehicle
   next to the planets instead of a speck). Nose points down -Z, matching
   Three's camera-forward convention, so "forward" is simply the group's
   negative local Z. The `bank` child tilts into turns while the outer group
   carries heading and pitch. `setThrust(0..1)` scales the engine flames and
   their glow. */

const HULL = new THREE.MeshLambertMaterial({ color: '#F4F6FB' });
const BELLY = new THREE.MeshLambertMaterial({ color: '#2B2F45' }); // heat tiles
const TRIM = new THREE.MeshLambertMaterial({ color: '#FF7A3C' });
const GLASS = new THREE.MeshPhongMaterial({ color: '#173C7A', specular: '#BFD9FF', shininess: 90 });
const NOZZLE = new THREE.MeshLambertMaterial({ color: '#5F6883' });
const FLAME = new THREE.MeshBasicMaterial({ color: '#FFB347', transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
const FLAME_CORE = new THREE.MeshBasicMaterial({ color: '#FFF4D6', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });

function mesh(geo, matl, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, matl);
  m.position.set(x, y, z);
  return m;
}

// flat swept shape extruded a little — used for wings and the tail fin
function slab(points, depth, matl) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
  geo.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geo, matl);
}

export function buildShuttle() {
  const group = new THREE.Group();
  const bank = new THREE.Group();
  group.add(bank);

  // fuselage: a rounded tube with a soft nose and a flat-ish belly of tiles
  const body = mesh(new THREE.CapsuleGeometry(0.9, 5.2, 8, 20), HULL);
  body.rotation.x = Math.PI / 2;
  body.scale.set(1, 0.85, 1);
  bank.add(body);
  const belly = mesh(new THREE.CapsuleGeometry(0.92, 5.0, 8, 20), BELLY, 0, -0.12, 0.1);
  belly.rotation.x = Math.PI / 2;
  belly.scale.set(0.98, 0.7, 1);
  bank.add(belly);

  // cockpit windows: a ring of dark panes around the upper nose
  for (let i = -2; i <= 2; i++) {
    const w = mesh(new THREE.BoxGeometry(0.34, 0.28, 0.16), GLASS, i * 0.36, 0.42, -2.55 + Math.abs(i) * 0.18);
    w.rotation.y = -i * 0.32;
    w.rotation.x = -0.35;
    bank.add(w);
  }

  // cargo-bay hump and door seam
  const bay = mesh(new THREE.CapsuleGeometry(0.55, 3.0, 6, 16), HULL, 0, 0.55, 0.4);
  bay.rotation.x = Math.PI / 2;
  bay.scale.set(1.3, 0.6, 1);
  bank.add(bay);
  const seam = mesh(new THREE.BoxGeometry(0.06, 0.05, 3.2), TRIM, 0, 0.92, 0.4);
  bank.add(seam);

  // delta wings (top view: root along the fuselage, swept leading edge)
  const wing = slab([[0, 3.2], [3.2, 2.9], [3.2, 2.2], [0.6, -1.6], [0, -2.0]], 0.16, HULL);
  wing.rotation.x = Math.PI / 2;
  wing.position.set(0.5, -0.15, 0);
  bank.add(wing);
  const wing2 = wing.clone();
  wing2.scale.x = -1;
  wing2.position.x = -0.5;
  bank.add(wing2);
  // orange leading-edge stripes
  for (const s of [1, -1]) {
    const stripe = mesh(new THREE.BoxGeometry(2.4, 0.22, 0.12), TRIM, s * 2.0, -0.15, 1.35);
    stripe.rotation.y = s * 0.98;
    bank.add(stripe);
  }

  // tail fin
  const fin = slab([[0, 0], [2.2, 0], [2.2, 0.9], [1.0, 2.3], [0.4, 2.3]], 0.14, HULL);
  fin.rotation.y = Math.PI / 2;
  fin.position.set(0, 0.7, 3.4);
  bank.add(fin);
  const finTip = mesh(new THREE.BoxGeometry(0.16, 0.5, 0.75), TRIM, 0, 2.85, 2.1);
  bank.add(finTip);

  // OMS pods either side of the fin
  for (const s of [1, -1]) {
    const pod = mesh(new THREE.CapsuleGeometry(0.34, 1.0, 6, 12), HULL, s * 0.85, 0.55, 2.9);
    pod.rotation.x = Math.PI / 2;
    bank.add(pod);
  }

  // three main engines with flames that stretch with thrust
  const flames = [];
  const nozzlePositions = [[0, 0.25], [0.6, -0.35], [-0.6, -0.35]];
  for (const [x, y] of nozzlePositions) {
    const noz = mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.7, 14, 1, true), NOZZLE, x, y, 3.3);
    noz.material.side = THREE.DoubleSide;
    noz.rotation.x = Math.PI / 2;
    bank.add(noz);

    const flame = new THREE.Group();
    flame.position.set(x, y, 3.65);
    const outer = mesh(new THREE.ConeGeometry(0.36, 2.4, 12, 1, true), FLAME, 0, 0, 1.2);
    outer.rotation.x = -Math.PI / 2;
    const core = mesh(new THREE.ConeGeometry(0.2, 1.6, 10, 1, true), FLAME_CORE, 0, 0, 0.8);
    core.rotation.x = -Math.PI / 2;
    flame.add(outer, core);
    bank.add(flame);
    flames.push(flame);
  }

  // engine glow lights the tail and any nearby planet the pilot buzzes
  const glow = new THREE.PointLight('#FFA24A', 0, 40, 1.2);
  glow.position.set(0, 0, 4.5);
  bank.add(glow);

  let thrust = 0;
  return {
    group,
    bank,
    /* 0..1 propulsion; flames lengthen and flicker, glow brightens */
    setThrust(t, time = 0) {
      thrust = THREE.MathUtils.clamp(t, 0, 1);
      const len = 0.15 + thrust * 1.1;
      for (let i = 0; i < flames.length; i++) {
        const flick = 1 + Math.sin(time * 37 + i * 2.1) * 0.12 * thrust;
        flames[i].scale.set(0.6 + thrust * 0.5, 0.6 + thrust * 0.5, len * flick);
        flames[i].visible = thrust > 0.02;
      }
      glow.intensity = thrust * 26;
    },
    get thrust() { return thrust; },
  };
}
