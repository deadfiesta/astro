import * as THREE from 'three';
import { SYSTEMS } from './bodies';
import { SECRETS } from './secrets';
import { mulberry, softDotTexture, sunGlowTexture } from './textures';

/* Meshes and motion for the secret postcards in lib/secrets.js: lumpy
   rocks, a metal potato, a snowman, a cigar and comets with a coma and a
   tail that always points away from the star. Each gets a faint twinkle
   sprite so a sharp-eyed pilot can spot it in the dark. */

const TWINKLE = softDotTexture();
const COMA = sunGlowTexture();

// a lumpy rock: an icosahedron with its vertices nudged in and out
function lumpy(r, seed, detail = 1, squash = [1, 1, 1]) {
  const geo = new THREE.IcosahedronGeometry(r, detail);
  const rnd = mulberry(seed);
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.multiplyScalar(0.82 + rnd() * 0.36);
    v.x *= squash[0]; v.y *= squash[1]; v.z *= squash[2];
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function rockMaterial(s) {
  if (s.kind === 'metal') {
    return new THREE.MeshPhongMaterial({ color: s.color, specular: '#FFFFFF', shininess: 90 });
  }
  if (s.kind === 'comet') {
    return new THREE.MeshPhongMaterial({ color: '#E8F3FA', specular: '#FFFFFF', shininess: 40 });
  }
  return new THREE.MeshLambertMaterial({ color: s.color });
}

function buildMesh(s, seed) {
  const mat = rockMaterial(s);
  const r = s.radius;
  if (s.kind === 'snowman') {
    // two lumps gently touching, the smaller one on top
    const g = new THREE.Group();
    const a = new THREE.Mesh(lumpy(r * 0.78, seed), mat);
    const b = new THREE.Mesh(lumpy(r * 0.55, seed + 1), mat);
    a.position.y = -r * 0.35;
    b.position.y = r * 0.6;
    g.add(a, b);
    return g;
  }
  if (s.kind === 'cigar') {
    return new THREE.Mesh(lumpy(r, seed, 1, [0.35, 0.35, 2.4]), mat);
  }
  return new THREE.Mesh(lumpy(r, seed), mat);
}

export function buildSecrets(scene) {
  const out = [];
  SECRETS.forEach((s, i) => {
    const pivot = new THREE.Group(); // world-space position holder
    const mesh = buildMesh(s, 900 + i * 7);
    mesh.userData.id = s.id;
    mesh.traverse((o) => { o.userData.id = s.id; });
    pivot.add(mesh);

    // a faint twinkle so the rock is findable against black space
    const twinkle = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TWINKLE, color: s.glow, transparent: true, opacity: 0.4,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    twinkle.scale.setScalar(s.radius * 4.5);
    pivot.add(twinkle);

    let coma = null, tail = null;
    if (s.kind === 'comet') {
      coma = new THREE.Sprite(new THREE.SpriteMaterial({
        map: COMA, color: s.glow, transparent: true, opacity: 0.7,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      coma.scale.setScalar(s.radius * 7);
      pivot.add(coma);
      // the tail: a string of puffs trailing anti-sunward, placed each frame
      tail = [];
      for (let k = 0; k < 7; k++) {
        const puff = new THREE.Sprite(new THREE.SpriteMaterial({
          map: TWINKLE, color: s.glow, transparent: true, opacity: 0.45 * (1 - k / 7),
          depthWrite: false, blending: THREE.AdditiveBlending,
        }));
        puff.scale.setScalar(s.radius * (3 + k * 1.6));
        pivot.add(puff);
        tail.push(puff);
      }
    }

    const sys = s.place.system ? SYSTEMS.find((x) => x.id === s.place.system) : null;
    const center = sys ? new THREE.Vector3(...sys.center) : null;
    scene.add(pivot);
    out.push({
      data: s, pivot, mesh, twinkle, coma, tail, center,
      angle: s.place.phase ?? 0, seed: i * 1.7,
      pickable: s.kind === 'snowman' ? mesh.children : [mesh],
    });
  });
  return out;
}

const tmp = new THREE.Vector3();
const away = new THREE.Vector3();
const X_AXIS = new THREE.Vector3(1, 0, 0);

/* advance orbits, drifts and tumbles; `spd` is the app clock rate, `t` the
   running time in seconds (for the twinkle). Orbit rates use the same
   0.22 factor as the planets in SolarSystem so belts stay in step. */
export function updateSecrets(secrets, dt, spd, t) {
  for (const r of secrets) {
    const P = r.data.place;
    if (P.from) {
      // interstellar drifters: glide from A to B and back, forever
      const k = 0.5 - 0.5 * Math.cos((t / P.period) * Math.PI * 2);
      r.pivot.position.set(
        P.from[0] + (P.to[0] - P.from[0]) * k,
        P.from[1] + (P.to[1] - P.from[1]) * k,
        P.from[2] + (P.to[2] - P.from[2]) * k,
      );
    } else if (P.a) {
      // ellipse with the star at one focus; sweeps faster near the star
      const e = P.e;
      const rad = (P.a * (1 - e * e)) / (1 + e * Math.cos(r.angle));
      const mean = P.a * (1 - e * e);
      r.angle += P.orbitSpeed * 0.22 * spd * dt * (mean * mean) / (rad * rad);
      tmp.set(Math.cos(r.angle) * rad, 0, Math.sin(r.angle) * rad);
      tmp.applyAxisAngle(X_AXIS, P.tilt ?? 0);
      r.pivot.position.copy(r.center).add(tmp);
    } else {
      r.angle += P.orbitSpeed * 0.22 * spd * dt;
      tmp.set(Math.cos(r.angle) * P.orbit, 0, Math.sin(r.angle) * P.orbit);
      tmp.applyAxisAngle(X_AXIS, P.tilt ?? 0);
      r.pivot.position.copy(r.center).add(tmp);
    }

    r.mesh.rotation.x += r.data.spinSpeed * 0.7 * spd * dt;
    r.mesh.rotation.y += r.data.spinSpeed * spd * dt;
    r.twinkle.material.opacity = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * 3.1 + r.seed * 4));

    if (r.tail) {
      // tail points away from the star (or the way it came, for drifters),
      // longer when the comet is close in
      if (r.center) {
        away.copy(r.pivot.position).sub(r.center);
      } else {
        away.set(P.to[0] - P.from[0], P.to[1] - P.from[1], P.to[2] - P.from[2]).negate();
      }
      const dist = away.length() || 1;
      away.normalize();
      const len = r.center ? THREE.MathUtils.clamp(60 / dist, 0.6, 3) : 1;
      r.tail.forEach((puff, k) => {
        puff.position.copy(away).multiplyScalar(r.data.radius * (2 + k * 2.2) * len);
      });
      r.coma.material.opacity = 0.45 + 0.35 * Math.min(1, len / 3);
    }
  }
}
