import * as THREE from 'three';
import { makeCanvas, softDotTexture } from './textures';

/* A stylised black hole in the spirit of the classic movie depiction: a
   pitch-black event horizon wrapped in a thin white-hot photon ring, a
   swirling accretion disk whose streaks orbit faster near the hole and
   glow brighter on the side sweeping toward the viewer (Doppler beaming),
   a lensed image of that disk bent up and over the horizon as a
   camera-facing ring, sparks spiralling in, and two faint polar jets.

   Everything lives in additive materials so it blooms over the stars.
   `buildBlackHole(b, spinGroup, pivot)` adds the pieces under the body's
   existing groups (the disk, sparks and jets share `spinGroup`'s tilt; the
   lensed ring and photon halo sit in `pivot` so they can face the camera)
   and returns an `update(dt, spd, camera, still)` to call every frame. */

const DISK_VERT = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
// r-and-angle streaks with differential rotation; colour cools outward
const DISK_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uInner;
  uniform float uOuter;
  uniform float uGain;
  uniform float uLip;
  varying vec2 vP;
  void main() {
    float r = length(vP);
    float rn = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
    float a = atan(vP.y, vP.x);
    // Keplerian-ish: the inner disk laps the outer many times over
    float w = 1.0 / pow(0.3 + rn * 1.3, 1.5);
    float ph = a - uTime * 1.4 * w;
    float s = 0.5 + 0.5 * sin(ph * 7.0 + rn * 19.0);
    s *= 0.55 + 0.45 * sin(ph * 3.0 - rn * 9.0 + 1.7);
    s *= 0.7 + 0.3 * sin(ph * 17.0 + rn * 40.0 + uTime * 0.7);
    s = 0.3 + 0.7 * s;
    // white-hot at the lip, orange through the middle, ember red outside
    vec3 hot = vec3(1.0, 0.97, 0.88);
    vec3 mid = vec3(1.0, 0.62, 0.24);
    vec3 cool = vec3(0.7, 0.16, 0.05);
    vec3 c = rn < 0.35 ? mix(hot, mid, rn / 0.35) : mix(mid, cool, (rn - 0.35) / 0.65);
    // a crisp bright inner lip, a soft outer fade
    float inner = smoothstep(0.0, 0.03, rn);
    float lip = 1.0 + uLip * exp(-rn * 18.0);
    float fade = 1.0 - smoothstep(0.5, 1.0, rn);
    // Doppler beaming: the side coming toward us is brighter and whiter
    float toward = max(0.0, sin(a));
    float dop = 0.75 + 0.7 * toward;
    c = mix(c, vec3(1.0), 0.35 * toward);
    float I = s * lip * fade * inner * dop * uGain;
    gl_FragColor = vec4(c * I, I);
  }
`;

function diskMaterial(inner, outer, gain, lip) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uInner: { value: inner },
      uOuter: { value: outer },
      uGain: { value: gain },
      uLip: { value: lip },
    },
    vertexShader: DISK_VERT,
    fragmentShader: DISK_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

// thin sharp ring of light hugging the horizon, with a soft outer bloom
function photonRingTexture() {
  const [c, ctx] = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0.0, 'rgba(255,240,210,0)');
  g.addColorStop(0.43, 'rgba(255,240,210,0)');
  g.addColorStop(0.455, 'rgba(255,250,235,1)');
  g.addColorStop(0.475, 'rgba(255,210,140,0.75)');
  g.addColorStop(0.56, 'rgba(255,150,70,0.22)');
  g.addColorStop(0.8, 'rgba(255,120,50,0.05)');
  g.addColorStop(1.0, 'rgba(255,120,50,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// vertical gradient for the jets: bright at the base, gone at the tip
function jetTexture() {
  const [c, ctx] = makeCanvas(8, 128);
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, 'rgba(160,200,255,0)');
  g.addColorStop(0.55, 'rgba(160,200,255,0.25)');
  g.addColorStop(1, 'rgba(200,225,255,0.9)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 128);
  return new THREE.CanvasTexture(c);
}

const SPARKS = 240;

export function buildBlackHole(b, spinGroup, pivot) {
  const R = b.radius;
  const pickables = [];

  // the accretion disk, in the tilted spin group
  const disk = new THREE.Mesh(new THREE.RingGeometry(R * 1.12, R * 3.0, 96, 1), diskMaterial(R * 1.12, R * 3.0, 1.0, 1.8));
  disk.rotation.x = Math.PI / 2;
  disk.userData.id = b.id;
  pickables.push(disk);
  spinGroup.add(disk);

  // sparks spiralling in along the disk plane
  const sPos = new Float32Array(SPARKS * 3);
  const sparks = Array.from({ length: SPARKS }, () => ({
    ang: Math.random() * Math.PI * 2,
    r: R * (1.15 + Math.random() * 1.9),
    fall: 0.25 + Math.random() * 0.4,
    y: (Math.random() - 0.5) * R * 0.06,
  }));
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const sparkPts = new THREE.Points(sGeo, new THREE.PointsMaterial({
    map: softDotTexture(), color: '#FFC98A', size: R * 0.11, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  sparkPts.frustumCulled = false;
  spinGroup.add(sparkPts);

  // faint polar jets, one each way along the spin axis
  const jetTex = jetTexture();
  const jets = [];
  for (const dir of [1, -1]) {
    const jet = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 0.1, R * 0.5, R * 5.5, 20, 1, true),
      new THREE.MeshBasicMaterial({
        map: jetTex, color: '#8FC4FF', transparent: true, opacity: 0.32, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    jet.position.y = dir * (R * 0.7 + R * 2.75);
    if (dir < 0) jet.rotation.z = Math.PI;
    spinGroup.add(jet);
    jets.push(jet);
  }

  // camera-facing pieces: the lensed image of the far side of the disk
  // bent over and under the horizon, and the photon ring hugging it
  const facing = new THREE.Group();
  pivot.add(facing);
  const lens = new THREE.Mesh(new THREE.RingGeometry(R * 1.03, R * 1.75, 96, 1), diskMaterial(R * 1.03, R * 1.75, 0.75, 1.2));
  facing.add(lens);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: photonRingTexture(), transparent: true, depthWrite: false, opacity: 0.95,
    blending: THREE.AdditiveBlending, color: '#FFFFFF',
  }));
  const haloScale = R * 2.3; // ring radius 0.465 of the texture → ~1.07 R
  halo.scale.set(haloScale, haloScale, 1);
  facing.add(halo);

  let time = Math.random() * 100;

  return {
    pickables,
    /* dt seconds; spd = playback speed (0 paused); still = reduced motion */
    update(dt, spd, camera, still) {
      if (!still) {
        // the hole keeps a slow simmer even when the planets are paused
        time += dt * (0.3 + spd);
        disk.material.uniforms.uTime.value = time;
        lens.material.uniforms.uTime.value = time * 0.8;
        halo.material.opacity = 0.85 + 0.15 * Math.sin(time * 1.7);
        for (let i = 0; i < jets.length; i++) {
          jets[i].material.opacity = 0.28 + 0.07 * Math.sin(time * 2.3 + i * 1.9);
        }
        // sparks: faster laps closer in, drifting inward until swallowed
        const rate = 0.3 + spd;
        for (let i = 0; i < SPARKS; i++) {
          const p = sparks[i];
          const rn = p.r / R;
          p.ang += dt * rate * 2.4 / Math.pow(rn, 1.5);
          p.r -= dt * rate * p.fall * R * 0.35;
          if (p.r < R * 1.08) { p.r = R * (2.6 + Math.random() * 0.45); p.ang = Math.random() * Math.PI * 2; }
          sPos[i * 3] = Math.cos(p.ang) * p.r;
          sPos[i * 3 + 1] = p.y;
          sPos[i * 3 + 2] = Math.sin(p.ang) * p.r;
        }
        sGeo.attributes.position.needsUpdate = true;
      } else if (sPos[0] === 0 && sPos[2] === 0) {
        for (let i = 0; i < SPARKS; i++) {
          const p = sparks[i];
          sPos[i * 3] = Math.cos(p.ang) * p.r; sPos[i * 3 + 1] = p.y; sPos[i * 3 + 2] = Math.sin(p.ang) * p.r;
        }
        sGeo.attributes.position.needsUpdate = true;
      }
      // the lensed ring and photon halo always face the viewer
      facing.quaternion.copy(camera.quaternion);
    },
  };
}
