import * as THREE from 'three';
import { softDotTexture } from './textures';

/* A friendly space shuttle for fly mode. It is modelled ~10 units nose to
   tail and then shrunk by SHUTTLE_SCALE to about 1 unit — half an Earth
   diameter. True scale (a 37 m orbiter against a 12,742 km planet) would be
   a fraction of a pixel, so this is "as small as it can be and still read
   as a ship", a touch bigger than the astronaut. Nose points down -Z, matching
   Three's camera-forward convention, so "forward" is simply the group's
   negative local Z. The `bank` child tilts into turns while the outer group
   carries heading and pitch.

   The engines burn as particles: `exhaust` is a pool of point sprites that
   lives in *world* space (add it to the scene next to `group`), so the
   plume is left hanging behind the moving ship instead of riding along
   glued to the nozzles. Each frame `updateExhaust(dt)` spawns new sparks at
   the three nozzle exits — more per second the harder the throttle is
   pushed — then ages every live particle through a combustion ramp:
   white-hot and tight as it leaves the bell, swelling and cooling through
   yellow and orange, then slowing into grey smoke that billows out and
   thins away. One material draws both phases with premultiplied alpha:
   the hot end adds light over the stars, the smoke end covers them. */

// glossy, reflective paintwork. SolarSystem feeds `setEnvMap` a live
// CubeCamera capture of the surroundings, so the hull mirrors the real
// planets, stars and engine glow around it. Deliberately Phong, not
// Standard/Physical: those route a cube envMap through a PMREM pre-filter
// that three.js reruns after every CubeCamera update — far too costly per
// frame. Phong samples the cube directly; MixOperation blends the paint
// colour with the mirror image by `reflectivity`, so white stays white
// with a lacquer sheen rather than turning into chrome
const glossy = (color, specular, shininess, reflectivity) => new THREE.MeshPhongMaterial({
  color, specular, shininess, reflectivity, combine: THREE.MixOperation,
});
const HULL = glossy('#F4F6FB', '#FFFFFF', 160, 0.42);
const BELLY = glossy('#2B2F45', '#9CA6C8', 70, 0.3); // heat tiles: satin, darker mirror
const TRIM = glossy('#FF7A3C', '#FFE0C8', 120, 0.34);
const GLASS = glossy('#173C7A', '#DFEBFF', 220, 0.8);
const NOZZLE = glossy('#5F6883', '#E6ECFF', 90, 0.6); // brushed metal bells
const REFLECTIVE = [HULL, BELLY, TRIM, GLASS, NOZZLE];
const THROAT = new THREE.MeshBasicMaterial({ color: '#FFD9A3', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });

// the model is built at a comfortable ~10-unit size, then the whole `bank`
// is scaled by this. Exhaust sizes/speeds below are in *model* units and
// get the same factor at spawn time, so the plume shrinks with the ship
export const SHUTTLE_SCALE = 0.1;

// exhaust particle pool and feel (model units)
const MAX_PARTICLES = 1400;
const NOZZLE_EXIT_Z = 3.7; // local z of the bell mouths (ship tail is +Z)
const SPAWN_PER_NOZZLE = 260; // particles / second / engine at full throttle — a dense, bright core
const EXHAUST_SPEED = 26; // units/s the gas leaves the bell at, relative to the ship
const LIFE_MIN = 0.3, LIFE_MAX = 0.75; // seconds a puff lasts — short, so the burn stays punchy at the bell

const EXHAUST_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aSmoke;
  attribute vec3 aColor;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSmoke;
  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vSmoke = aSmoke;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / max(0.1, -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const EXHAUST_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSmoke;
  void main() {
    float tex = texture2D(uMap, gl_PointCoord).a;
    float a = tex * vAlpha;
    if (a < 0.003) discard;
    // premultiplied: rgb adds light, alpha (smoke only) covers what's behind
    gl_FragColor = vec4(vColor * a, a * vSmoke);
  }
`;

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
  bank.scale.setScalar(SHUTTLE_SCALE);
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

  // three main engines; a faint disc in each bell mouth glows with thrust
  const throats = [];
  const nozzlePositions = [[0, 0.25], [0.6, -0.35], [-0.6, -0.35]];
  for (const [x, y] of nozzlePositions) {
    const noz = mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.7, 14, 1, true), NOZZLE, x, y, 3.3);
    noz.material.side = THREE.DoubleSide;
    noz.rotation.x = Math.PI / 2;
    bank.add(noz);
    const throat = mesh(new THREE.CircleGeometry(0.38, 16), THROAT.clone(), x, y, 3.62);
    bank.add(throat);
    throats.push(throat);
  }

  // engine glow lights the tail and any nearby planet the pilot buzzes
  const glow = new THREE.PointLight('#FFA24A', 0, 40 * SHUTTLE_SCALE, 1.2); // reach is in world units
  glow.position.set(0, 0, 4.5);
  bank.add(glow);

  // the exhaust particle pool: fixed-size buffers, dead particles parked
  // at alpha 0 (discarded in the shader) so nothing is ever reallocated
  const count = MAX_PARTICLES;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const alpha = new Float32Array(count);
  const smoke = new Float32Array(count);
  const parts = Array.from({ length: count }, () => ({
    age: 0, life: 0, vx: 0, vy: 0, vz: 0, seed: Math.random() * Math.PI * 2, drift: 1,
  }));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
  geo.setAttribute('aSmoke', new THREE.BufferAttribute(smoke, 1));
  geo.setDrawRange(0, 0);
  const exhaustMat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: softDotTexture() }, uScale: { value: 600 } },
    vertexShader: EXHAUST_VERT,
    fragmentShader: EXHAUST_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquation: THREE.AddEquation,
  });
  const exhaust = new THREE.Points(geo, exhaustMat);
  exhaust.frustumCulled = false;
  exhaust.renderOrder = 5;
  exhaust.matrixAutoUpdate = false; // world space; identity matrix
  let alive = 0; // highest live index + 1 (draw range)
  let spawnDebt = 0;
  let prevPos = null; // ship position last frame, for its velocity
  const shipVel = new THREE.Vector3();
  const back = new THREE.Vector3();
  const tmpV = new THREE.Vector3();
  const bankQuat = new THREE.Quaternion();
  const nozzleWorld = new THREE.Vector3();

  let thrust = 0;

  // one particle's look at a point in its life (t = 0 fresh .. 1 gone):
  // white-hot -> yellow -> orange -> grey smoke, growing all the while
  function shade(i, t, flick) {
    let r, g, b, sm;
    if (t < 0.12) {
      const k = t / 0.12;
      r = 1; g = 0.97 - 0.12 * k; b = 0.9 - 0.45 * k; sm = 0;
    } else if (t < 0.42) {
      const k = (t - 0.12) / 0.3;
      r = 1; g = 0.85 - 0.4 * k; b = 0.45 - 0.35 * k; sm = 0;
    } else {
      // cool into smoke: colour dims to ash grey, coverage rises then fades
      const k = (t - 0.42) / 0.58;
      const ash = 0.36 - 0.2 * k;
      r = 1 - (1 - ash) * k; g = 0.45 - (0.45 - ash) * k; b = 0.1 + (ash - 0.1) * k;
      sm = Math.sin(k * Math.PI) * 0.75;
    }
    // hot phase overdrives past 1 (additive blending saturates to white-hot)
    const fade = t < 0.42 ? 1.5 - t * 1.7 : Math.pow(1 - (t - 0.42) / 0.58, 1.3) * 0.79;
    col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b;
    alpha[i] = fade * flick;
    smoke[i] = sm;
    size[i] = (t < 0.42 ? 0.6 + t * 1.85 : 1.37 + (t - 0.42) * 3.6) * SHUTTLE_SCALE;
  }

  return {
    group,
    bank,
    exhaust,
    /* 0..1 propulsion; the bell mouths and the tail light brighten */
    setThrust(t, time = 0) {
      thrust = THREE.MathUtils.clamp(t, 0, 1);
      for (let i = 0; i < throats.length; i++) {
        throats[i].material.opacity = thrust * (0.85 + Math.sin(time * 41 + i * 2.1) * 0.15);
      }
      glow.intensity = thrust * 40;
    },
    get thrust() { return thrust; },
    /* a cube texture of the surroundings for the paint to mirror */
    setEnvMap(tex) {
      for (const m of REFLECTIVE) {
        m.envMap = tex;
        m.needsUpdate = true;
      }
    },
    /* pixel scale for the sprites: pass the drawing buffer height in px */
    setViewport(heightPx) {
      exhaustMat.uniforms.uScale.value = heightPx * 0.9;
    },
    /* forget the plume (call when the ship teleports, e.g. on take-off) */
    resetExhaust() {
      for (let i = 0; i < alive; i++) { parts[i].life = 0; alpha[i] = 0; }
      alive = 0;
      spawnDebt = 0;
      prevPos = null;
      geo.setDrawRange(0, 0);
      geo.attributes.aAlpha.needsUpdate = true;
    },
    /* advance the plume by dt seconds; call after the ship has moved.
       Returns true while anything is still glowing (keep calling) */
    updateExhaust(dt) {
      if (dt <= 0) return alive > 0;
      if (alive === 0 && thrust <= 0.02) { prevPos = null; return false; } // idle: nothing to do
      // ship velocity from its motion, so puffs inherit it and trail true
      group.updateMatrixWorld();
      if (prevPos) {
        shipVel.copy(group.position).sub(prevPos).divideScalar(dt);
      } else {
        prevPos = new THREE.Vector3();
        shipVel.set(0, 0, 0);
      }
      prevPos.copy(group.position);
      bank.getWorldDirection(back); // bank's +Z: straight out the nozzles
      bank.getWorldQuaternion(bankQuat);

      // spawn — accumulate fractional debt so low throttle still sputters
      const wantRate = thrust > 0.02 ? thrust * SPAWN_PER_NOZZLE * throats.length : 0;
      spawnDebt += wantRate * dt;
      let toSpawn = Math.min(Math.floor(spawnDebt), 200);
      spawnDebt -= toSpawn;
      let scan = 0;
      while (toSpawn > 0 && scan < count) {
        const i = scan++;
        const p = parts[i];
        if (p.life > 0) continue;
        toSpawn--;
        const th = throats[i % throats.length];
        // a little scatter across the bell mouth
        nozzleWorld.set(
          th.position.x + (Math.random() - 0.5) * 0.4,
          th.position.y + (Math.random() - 0.5) * 0.4,
          NOZZLE_EXIT_Z,
        );
        bank.localToWorld(nozzleWorld);
        pos[i * 3] = nozzleWorld.x; pos[i * 3 + 1] = nozzleWorld.y; pos[i * 3 + 2] = nozzleWorld.z;
        // out the back at exhaust speed (plus the ship's own motion) with a
        // narrow cone of spread that the throttle tightens
        const spread = 0.28 - thrust * 0.12;
        const v = EXHAUST_SPEED * SHUTTLE_SCALE * (0.7 + thrust * 0.6) * (0.85 + Math.random() * 0.3);
        tmpV.set((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, 1).applyQuaternion(bankQuat);
        p.vx = shipVel.x + tmpV.x * v;
        p.vy = shipVel.y + tmpV.y * v;
        p.vz = shipVel.z + tmpV.z * v;
        p.life = LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN);
        p.age = 0;
        p.drift = 0.6 + Math.random() * 0.8;
        if (i >= alive) alive = i + 1;
      }

      // age, slow down, billow
      let top = 0;
      const now = performance.now() * 0.001;
      for (let i = 0; i < alive; i++) {
        const p = parts[i];
        if (p.life <= 0) continue;
        p.age += dt;
        if (p.age >= p.life) { p.life = 0; alpha[i] = 0; continue; }
        top = i + 1;
        const t = p.age / p.life;
        // the jet slows as it cools (kids' physics: smoke lingers in space)
        // and wobbles more the older it gets
        const drag = 1 - Math.min(0.9, (0.9 + t * 2.4) * dt);
        p.vx *= drag; p.vy *= drag; p.vz *= drag;
        const wob = t * t * 1.6 * SHUTTLE_SCALE * p.drift;
        pos[i * 3] += (p.vx + Math.sin(now * 7 + p.seed) * wob) * dt;
        pos[i * 3 + 1] += (p.vy + Math.cos(now * 6 + p.seed * 1.3) * wob) * dt;
        pos[i * 3 + 2] += (p.vz + Math.sin(now * 5 + p.seed * 0.7) * wob) * dt;
        const flick = t < 0.42 ? 0.8 + 0.2 * Math.sin(now * 40 + p.seed * 3) : 1;
        shade(i, t, flick);
      }
      alive = top;
      geo.setDrawRange(0, alive);
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aColor.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
      geo.attributes.aSmoke.needsUpdate = true;
      return alive > 0;
    },
  };
}
