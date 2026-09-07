'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BODIES, MOON } from '@/lib/bodies';
import {
  makeCanvas, mulberry, rockyTexture, ringTexture, sunTexture, sunGlowTexture,
  labelSprite, textureFor,
} from '@/lib/textures';
import { buildAstronaut } from '@/lib/astronaut';

const HOME_POS = new THREE.Vector3(0, 42, 70);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

// belt/cloud selections fly to a fixed viewpoint instead of following a body
const FEATURE_VIEWS = {
  kuiper: new THREE.Vector3(0, 45, 98),
  oort: new THREE.Vector3(0, 140, 265),
};

/* The whole Three.js scene lives here. React state stays outside;
   the animation loop reads live values through refs. */
const SolarSystem = forwardRef(function SolarSystem({ selectedId, speed, paused, onSelect }, ref) {
  const canvasRef = useRef(null);
  const world = useRef(null); // { camera, controls, byId, flyTo, followOffset }

  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  // when the selection changes, size the camera offset to the body,
  // or fly to a fixed viewpoint for belt/cloud features
  useEffect(() => {
    selectedRef.current = selectedId;
    const w = world.current;
    if (!w) return;
    w.setAstronaut(selectedId);
    if (!selectedId) return;
    if (FEATURE_VIEWS[selectedId]) {
      w.flyTo(FEATURE_VIEWS[selectedId].clone(), HOME_TARGET.clone());
      return;
    }
    const d = w.byId[selectedId]?.data;
    if (!d) return;
    const dist = Math.max(d.radius * 4.2, 5.5);
    w.followOffset.set(dist * 0.55, dist * 0.5, dist);
  }, [selectedId]);

  useImperativeHandle(ref, () => ({
    resetView() {
      world.current?.flyTo(HOME_POS.clone(), HOME_TARGET.clone());
    },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070B21');

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 600);
    camera.position.copy(HOME_POS);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 320;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

    scene.add(new THREE.AmbientLight('#8fa3ff', 0.55));
    // decay 0 = no distance falloff, so outer planets stay as vibrant as inner ones
    scene.add(new THREE.PointLight('#FFE9B8', 3.0, 0, 0));

    // starfield
    {
      const rnd = mulberry(2026);
      const N = 1600;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 180 + rnd() * 220;
        const t = rnd() * Math.PI * 2;
        const p = Math.acos(2 * rnd() - 1);
        pos[i * 3] = r * Math.sin(p) * Math.cos(t);
        pos[i * 3 + 1] = r * Math.cos(p);
        pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#DDE6FF', size: 1.4, sizeAttenuation: false })));
    }

    // asteroid belt between Mars and Jupiter
    {
      const rnd = mulberry(555);
      const N = 500;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 24.5 + rnd() * 2.6;
        const t = rnd() * Math.PI * 2;
        pos[i * 3] = r * Math.cos(t);
        pos[i * 3 + 1] = (rnd() - 0.5) * 0.9;
        pos[i * 3 + 2] = r * Math.sin(t);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#9C8E7E', size: 1.6, sizeAttenuation: false })));
    }

    const bodies = [];
    const pickables = [];
    let moonMesh = null;

    // Kuiper Belt: an icy doughnut of frozen chunks past Neptune
    {
      const rnd = mulberry(777);
      const N = 1400;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 52 + rnd() * 10;
        const t = rnd() * Math.PI * 2;
        pos[i * 3] = r * Math.cos(t);
        pos[i * 3 + 1] = (rnd() - 0.5) * 3.2;
        pos[i * 3 + 2] = r * Math.sin(t);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
        color: '#A9D6F5', size: 1.5, sizeAttenuation: false, transparent: true, opacity: 0.85,
      })));

      const label = labelSprite('Kuiper Belt', '#A9D6F5');
      label.scale.set(12, 3, 1);
      label.position.set(0, 5, 57);
      label.userData.id = 'kuiper';
      pickables.push(label);
      scene.add(label);
    }

    // Oort Cloud: a faint spherical bubble wrapping the whole solar system
    {
      const rnd = mulberry(31415);
      const N = 3000;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 120 + rnd() * 40;
        const t = rnd() * Math.PI * 2;
        const p = Math.acos(2 * rnd() - 1);
        pos[i * 3] = r * Math.sin(p) * Math.cos(t);
        pos[i * 3 + 1] = r * Math.cos(p);
        pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
        color: '#9FB8D8', size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.55,
      })));

      const label = labelSprite('Oort Cloud', '#9FB8D8');
      label.scale.set(18, 4.5, 1);
      label.position.set(0, 50, 128);
      label.userData.id = 'oort';
      pickables.push(label);
      scene.add(label);
    }

    for (const b of BODIES) {
      const isSun = b.id === 'sun';
      const geo = new THREE.SphereGeometry(b.radius, 48, 32);
      const mat = isSun
        ? new THREE.MeshBasicMaterial({ map: sunTexture() })
        : new THREE.MeshLambertMaterial({ map: textureFor(b), color: '#ffffff' });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.id = b.id;
      pickables.push(mesh);

      const spinGroup = new THREE.Group(); // holds mesh + rings, gets axial tilt
      spinGroup.add(mesh);
      if (b.tilted) spinGroup.rotation.z = Math.PI / 2 * 0.98;
      else if (b.id === 'earth') spinGroup.rotation.z = 0.41;
      else if (b.id === 'saturn') spinGroup.rotation.z = 0.47;

      if (b.hasRings) {
        const ringGeo = new THREE.RingGeometry(b.radius * 1.35, b.radius * 2.25, 96);
        // remap UVs so the stripe texture runs radially
        const posAttr = ringGeo.attributes.position;
        const uv = ringGeo.attributes.uv;
        const v = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
          v.fromBufferAttribute(posAttr, i);
          const t = (v.length() - b.radius * 1.35) / (b.radius * 0.9);
          uv.setXY(i, t, 0.5);
        }
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
          map: ringTexture(), side: THREE.DoubleSide, transparent: true, opacity: 0.95,
        }));
        ring.rotation.x = Math.PI / 2;
        ring.userData.id = b.id;
        pickables.push(ring);
        spinGroup.add(ring);
      }

      // tilted orbit plane (Pluto) — orbit line and pivot live inside the tilt
      let orbitParent = scene;
      if (b.inclination) {
        orbitParent = new THREE.Group();
        orbitParent.rotation.x = b.inclination;
        scene.add(orbitParent);
      }

      const pivot = new THREE.Group(); // positioned on the orbit
      pivot.add(spinGroup);

      const label = labelSprite(b.name, b.color);
      label.position.y = b.radius + (b.hasRings ? 2.6 : 1.8);
      label.userData.id = b.id;
      pivot.add(label);
      pickables.push(label);

      if (isSun) {
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
          map: sunGlowTexture(), transparent: true, depthWrite: false,
        }));
        glow.scale.set(b.radius * 5.2, b.radius * 5.2, 1);
        pivot.add(glow);
      } else {
        // orbit line in the planet's color
        const pts = [];
        for (let i = 0; i <= 128; i++) {
          const t = (i / 128) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(t) * b.orbit, 0, Math.sin(t) * b.orbit));
        }
        orbitParent.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: b.color, transparent: true, opacity: 0.35 })
        ));
      }

      let moon = null;
      if (b.hasMoon) {
        moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(MOON.radius, 24, 16),
          new THREE.MeshLambertMaterial({ map: rockyTexture('#C9C4BC', '#8F8A82', 5) })
        );
        moonMesh.userData.id = 'moon';
        pickables.push(moonMesh);

        const moonLabel = labelSprite('Moon', MOON.color);
        moonLabel.scale.set(2.4, 0.6, 1);
        moonLabel.position.y = 0.7;
        moonLabel.userData.id = 'moon';
        pickables.push(moonLabel);
        moonMesh.add(moonLabel);

        // generous invisible tap target — the Moon itself is tiny and moving
        const moonHit = new THREE.Mesh(
          new THREE.SphereGeometry(0.6, 8, 6),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        moonHit.userData.id = 'moon';
        pickables.push(moonHit);
        moonMesh.add(moonHit);

        moon = new THREE.Group();
        moon.add(moonMesh);
        moonMesh.position.x = 2.0;
        pivot.add(moon);
      }

      orbitParent.add(pivot);
      bodies.push({ data: b, pivot, mesh, moon, angle: Math.random() * Math.PI * 2 });
    }

    const byId = Object.fromEntries(bodies.map((x) => [x.data.id, x]));
    // the Moon is selectable like a planet; its "pivot" is the mesh itself,
    // so world-position tracking follows it around Earth
    if (moonMesh) byId.moon = { data: MOON, pivot: moonMesh };

    // Bouncing astronaut: same take-off effort everywhere, so jump height and
    // hang time follow the selected world's real surface gravity (v² = 2gh).
    // Take-off speed tuned to a real human jump: on Earth (G = 9) this gives
    // ~0.25 units of height (about a third of the astronaut's body) and a
    // realistic ~0.47 s of airtime. Every other world scales from the same
    // effort, so the Moon's leap is ~6x Earth's, Jupiter's a stubby hop.
    const JUMP_V = 2.12;
    const { group: astro, body: astroBody, limbs: astroLimbs, swingArm, waveArm } = buildAstronaut();
    astro.visible = false;
    scene.add(astro);
    const astroState = {
      id: null, G: 0, v0: 0, y: 0, vy: 0, prevVy: 0, s: 1, sq: 0, sqV: 0,
      mode: 'air', groundT: 0, waveT: 0,
    };
    function setAstronaut(id) {
      const ent = id ? byId[id] : null;
      const g = ent?.data.gravity;
      if (!ent || !g) {
        astro.visible = false;
        astroState.id = null;
        return;
      }
      const G = 9 * g; // scene-units gravity (Earth = 9)
      // cap the physical height so low-gravity leaps stay in frame
      const cap = ent.data.radius * 1.2 + 1.8;
      const h = Math.max(0.05, Math.min((JUMP_V * JUMP_V) / (2 * G), cap));
      astroState.id = id;
      astroState.G = G;
      astroState.v0 = Math.sqrt(2 * G * h);
      astroState.y = 0;
      astroState.vy = astroState.v0;
      astroState.prevVy = astroState.v0;
      astroState.sq = 0;
      astroState.sqV = 0;
      astroState.mode = 'air';
      astroState.groundT = 0;
      astroState.waveT = 0;
      astroState.s = THREE.MathUtils.clamp(ent.data.radius * 0.55, 0.5, 1.6);
      astro.scale.setScalar(astroState.s);
      // settle the ragdoll into its rest pose for the new world
      astroBody.position.y = 0;
      for (const L of astroLimbs) {
        L.rest = L.baseRest;
        L.theta = L.baseRest;
        L.omega = 0;
        L.group.rotation.set(0, 0, L.baseRest);
        if (L.knee) L.knee.rotation.x = 0;
        if (L.elbow) L.elbow.rotation.z = 0;
      }
      astro.visible = true;
    }

    // smooth camera fly (instant under reduced motion)
    let fly = null;
    function flyTo(pos, target) {
      if (reducedMotion) {
        camera.position.copy(pos);
        controls.target.copy(target);
        return;
      }
      fly = { fromP: camera.position.clone(), fromT: controls.target.clone(), toP: pos, toT: target, t: 0 };
    }

    world.current = { camera, controls, byId, flyTo, setAstronaut, followOffset: new THREE.Vector3() };
    // re-apply the current selection now that the scene exists
    if (selectedRef.current) {
      setAstronaut(selectedRef.current);
      const d = byId[selectedRef.current]?.data;
      if (d) {
        const dist = Math.max(d.radius * 4.2, 5.5);
        world.current.followOffset.set(dist * 0.55, dist * 0.5, dist);
      }
    }

    // tap-to-pick (touch and mouse via pointer events)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downAt = null;
    const onDown = (e) => {
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const onUp = (e) => {
      if (!downAt) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      const dt = performance.now() - downAt.t;
      downAt = null;
      if (moved > 12 || dt > 600) return; // it was a drag, not a tap

      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      if (hits.length) onSelectRef.current?.(hits[0].object.userData.id);
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);

    // sizing; also decides where the fact card docks (side vs bottom sheet)
    const view = { side: false };
    function fit() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      view.side = window.matchMedia('(min-width: 700px)').matches;
    }
    fit();
    window.addEventListener('resize', fit);

    // animation loop
    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    const tmp2 = new THREE.Vector3();
    const tmp3 = new THREE.Vector3();
    let raf;

    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const spd = pausedRef.current ? 0 : speedRef.current;

      for (const b of bodies) {
        const d = b.data;
        b.angle += d.orbitSpeed * 0.22 * spd * dt;
        b.pivot.position.set(Math.cos(b.angle) * d.orbit, 0, Math.sin(b.angle) * d.orbit);
        b.mesh.rotation.y += d.spinSpeed * spd * dt * 2.2;
        if (b.moon) b.moon.rotation.y += 1.6 * spd * dt;
      }

      // astronaut jump cycle: land -> crouch (knees bend) -> push off -> fly
      if (astroState.id) {
        const T_CROUCH = 0.24; // seconds spent squatting between bounces
        let crouch = 0;
        if (astroState.mode === 'ground') {
          astroState.groundT += spd * dt;
          const p = Math.min(astroState.groundT / T_CROUCH, 1);
          crouch = Math.sin(Math.PI * p); // dip down, then push up
          if (p >= 1) {
            astroState.mode = 'air';
            astroState.vy = astroState.v0; // take-off
          }
        } else {
          astroState.vy -= astroState.G * spd * dt;
          astroState.y += astroState.vy * spd * dt;
          if (astroState.y <= 0 && astroState.vy < 0) {
            astroState.y = 0;
            astroState.vy = 0;
            astroState.mode = 'ground';
            astroState.groundT = 0;
            astroState.sq = -0.22; // landing squash, springs back below
          }
        }

        // low-gravity worlds: near the apex the astronaut spreads out like
        // they're trying to fly. floatiness: 0 at >=0.6g, 1 as g approaches 0
        const floatiness = THREE.MathUtils.clamp(1 - astroState.G / 9 / 0.6, 0, 1);
        let spread = 0;
        if (astroState.mode === 'air' && astroState.v0 > 0) {
          const apex = 1 - Math.min(1, Math.abs(astroState.vy) / astroState.v0);
          spread = floatiness * apex * apex; // eases in toward the top
        }

        astroState.waveT += spd * dt;
        // waving arm: overhead wave, blending to a horizontal wing when floating
        const waveTarget = 2.35 + 0.35 * Math.sin(astroState.waveT * 7);
        waveArm.rest = THREE.MathUtils.lerp(waveTarget, 1.75, spread);
        // free arm: loads through the crouch, flings up and out when floating
        swingArm.rest = THREE.MathUtils.lerp(swingArm.baseRest - 1.1 * crouch, -1.75, spread);
        // legs: drift into a star shape at a floaty apex
        for (const L of astroLimbs) {
          if (L.knee) L.rest = THREE.MathUtils.lerp(L.baseRest, L.out * 0.55, spread);
        }

        // limbs lag behind the body's vertical acceleration and flail on impact
        const accel = dt > 0 ? (astroState.vy - astroState.prevVy) / dt : 0;
        astroState.prevVy = astroState.vy;
        const kick = THREE.MathUtils.clamp(accel, -60, 60);
        for (const L of astroLimbs) {
          const drive = -kick * 0.35 * L.out * L.gain;
          const alpha = -26 * (L.theta - L.rest) - 5 * L.omega + drive;
          L.omega += alpha * dt;
          L.theta += L.omega * dt;
          const lim = 1.3;
          if (L.theta > L.rest + lim) { L.theta = L.rest + lim; L.omega = 0; }
          if (L.theta < L.rest - lim) { L.theta = L.rest - lim; L.omega = 0; }
          L.group.rotation.z = L.theta;

          // elbows: passive trailing bend from the swing, plus the hello-wave
          if (L.elbow) {
            let bend = L.out * 0.18 + THREE.MathUtils.clamp(-L.omega * 0.35, -0.7, 0.7);
            if (L === waveArm) bend += Math.sin(astroState.waveT * 7) * 0.45 * (1 - spread);
            L.elbow.rotation.z = bend;
          }
        }

        // crouch pose: hips drop, thighs swing forward, knees fold back
        astroBody.position.y = -0.16 * crouch;
        for (const L of astroLimbs) {
          if (!L.knee) continue;
          L.group.rotation.x = 1.0 * crouch;
          L.knee.rotation.x = -1.8 * crouch;
        }

        // cartoon squash-and-stretch spring on the whole body
        astroState.sqV += (-180 * astroState.sq - 14 * astroState.sqV) * dt;
        astroState.sq += astroState.sqV * dt;
        const s = astroState.s;
        astro.scale.set(s * (1 - astroState.sq * 0.6), s * (1 + astroState.sq), s * (1 - astroState.sq * 0.6));

        const aEnt = byId[astroState.id];
        aEnt.pivot.getWorldPosition(tmp3);
        astro.position.set(
          tmp3.x,
          tmp3.y + aEnt.data.radius * 0.98 + astroState.y,
          tmp3.z
        );
        // billboard: keep the visor facing the camera
        astro.rotation.y = Math.atan2(
          camera.position.x - astro.position.x,
          camera.position.z - astro.position.z
        );
      }

      // camera follows the selected body (world position — Pluto orbits in a tilted plane)
      const sel = selectedRef.current;
      const ent = sel ? byId[sel] : null;
      if (ent && !fly) {
        ent.pivot.getWorldPosition(tmp2);
        tmp.copy(tmp2).add(world.current.followOffset);
        camera.position.lerp(tmp, reducedMotion ? 1 : 0.06);
        // frame the body off-center so the fact card never covers it:
        // aim past the body — to its right on wide screens (card docks right),
        // below it on phones (card is a bottom sheet)
        const camDist = camera.position.distanceTo(tmp2);
        const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camDist;
        if (view.side) {
          tmp3.subVectors(tmp2, camera.position).normalize().cross(camera.up).normalize();
          tmp2.addScaledVector(tmp3, halfH * camera.aspect * 0.30);
        } else {
          tmp2.addScaledVector(camera.up, -halfH * 0.30);
        }
        controls.target.lerp(tmp2, reducedMotion ? 1 : 0.12);
      }

      if (fly) {
        fly.t += dt / 1.2;
        const k = fly.t >= 1 ? 1 : 1 - Math.pow(1 - fly.t, 3);
        camera.position.lerpVectors(fly.fromP, fly.toP, k);
        controls.target.lerpVectors(fly.fromT, fly.toT, k);
        if (fly.t >= 1) fly = null;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      controls.dispose();
      scene.traverse((obj) => {
        obj.geometry?.dispose?.();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          if (!m) continue;
          m.map?.dispose?.();
          m.dispose?.();
        }
      });
      renderer.dispose();
      world.current = null;
    };
  }, []);

  return (
    <canvas
      id="space"
      ref={canvasRef}
      role="img"
      aria-label="Animated 3D solar system. Drag to look around, pinch to zoom, tap a planet to learn about it."
    />
  );
});

export default SolarSystem;
