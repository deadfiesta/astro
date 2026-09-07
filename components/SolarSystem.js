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
    if (!selectedId) {
      w.follow.id = null;
      return;
    }
    if (FEATURE_VIEWS[selectedId]) {
      w.follow.id = null;
      w.flyTo(FEATURE_VIEWS[selectedId].clone(), HOME_TARGET.clone());
      return;
    }
    const d = w.byId[selectedId]?.data;
    if (!d) {
      w.follow.id = null;
      return;
    }
    const dist = Math.max(d.radius * 4.2, 5.5);
    w.followOffset.set(dist * 0.55, dist * 0.5, dist);
    w.follow.id = selectedId;
    w.follow.approach = true;
    w.follow.timer = 0;
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
    // one finger rotates; two fingers pinch-zoom AND pan around the system
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 4;
    controls.maxDistance = 320;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

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
    // pos/vel are relative to the planet's center. normal is the surface
    // point the astronaut stands on (it jumps along that local "up").
    // mode: air/ground = jump cycle, drag = held by a finger,
    // fall = released — ballistic under gravity toward the planet's core
    const astroState = {
      id: null, G: 0, v0: 0, s: 1, sq: 0, sqV: 0,
      mode: 'air', groundT: 0, waveT: 0, h: 0, hv: 0, lean: 0,
      dW: 0.16, w1: 13, w2: 13, tAbs: 0.12, tPush: 0.12,
      pos: new THREE.Vector3(), vel: new THREE.Vector3(),
      prevVel: new THREE.Vector3(), dragTarget: new THREE.Vector3(),
      normal: new THREE.Vector3(0, 1, 0),
    };
    // generous invisible grab handle so fingers can catch the astronaut
    {
      const grab = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 8, 6),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      grab.position.y = 0.65;
      astro.add(grab);
    }
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
      astroState.normal.set(0, 1, 0);
      astroState.h = 0;
      astroState.hv = astroState.v0;
      astroState.pos.set(0, ent.data.radius * 0.98, 0);
      astroState.vel.set(0, astroState.v0, 0);
      astroState.prevVel.copy(astroState.vel);
      astroState.sq = 0;
      astroState.sqV = 0;
      astroState.lean = 0;
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
    // set up the ground phase as a harmonic absorb-and-push: the body keeps
    // moving down at the impact speed while the knees decelerate it (quarter
    // sine), then accelerates back up, leaving the ground at push velocity —
    // position and velocity stay continuous at touchdown AND take-off
    function landAstronaut(vIn) {
      const st = astroState;
      const vOut = st.v0;
      st.dW = THREE.MathUtils.clamp(Math.max(vIn, vOut) / 13, 0.04, 0.3);
      st.w1 = THREE.MathUtils.clamp(vIn / st.dW, 6, 20);
      st.w2 = THREE.MathUtils.clamp(vOut / st.dW, 6, 20);
      st.tAbs = Math.PI / (2 * st.w1);
      st.tPush = Math.PI / (2 * st.w2);
      st.groundT = 0;
      st.mode = 'ground';
      st.sqV -= vIn * 0.8; // squash as a velocity impulse, never a scale jump
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

    // follow: approach = camera flies into a nice framing; afterwards it only
    // rides along with the planet's motion so the user can orbit it freely
    const follow = { id: null, approach: false, timer: 0, prev: new THREE.Vector3() };
    const onControlStart = () => { follow.approach = false; }; // user takes over
    controls.addEventListener('start', onControlStart);

    world.current = { camera, controls, byId, flyTo, setAstronaut, follow, followOffset: new THREE.Vector3() };
    // re-apply the current selection now that the scene exists
    if (selectedRef.current) {
      setAstronaut(selectedRef.current);
      const d = byId[selectedRef.current]?.data;
      if (d) {
        const dist = Math.max(d.radius * 4.2, 5.5);
        world.current.followOffset.set(dist * 0.55, dist * 0.5, dist);
        follow.id = selectedRef.current;
        follow.approach = true;
        follow.timer = 0;
      }
    }

    // tap-to-pick and astronaut dragging (touch and mouse via pointer events)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const dragPoint = new THREE.Vector3();
    const dragNormal = new THREE.Vector3();
    let downAt = null;
    let dragPointerId = null;

    const setPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
    };

    const releaseAstro = () => {
      if (dragPointerId === null) return;
      dragPointerId = null;
      controls.enabled = true;
      if (astroState.id) {
        astroState.vel.clampLength(0, 9); // fling, but not into orbit
        astroState.mode = 'fall';
      }
    };

    const onDown = (e) => {
      // grab the astronaut first — dragging it beats camera gestures
      if (astro.visible && astroState.id && dragPointerId === null) {
        setPointer(e);
        if (raycaster.intersectObject(astro, true).length) {
          dragPointerId = e.pointerId;
          astroState.mode = 'drag';
          astroState.dragTarget.copy(astro.position);
          astroState.vel.set(0, 0, 0);
          controls.enabled = false;
          canvas.setPointerCapture?.(e.pointerId);
          dragPlane.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(dragNormal), astro.position
          );
          return;
        }
      }
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const onMove = (e) => {
      if (e.pointerId !== dragPointerId) return;
      setPointer(e);
      if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
        astroState.dragTarget.copy(dragPoint);
      }
    };
    const onUp = (e) => {
      if (e.pointerId === dragPointerId) {
        releaseAstro();
        return;
      }
      if (!downAt) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      const dt = performance.now() - downAt.t;
      downAt = null;
      if (moved > 12 || dt > 600) return; // it was a drag, not a tap

      setPointer(e);
      const hits = raycaster.intersectObjects(pickables, false);
      if (hits.length) onSelectRef.current?.(hits[0].object.userData.id);
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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
    // scratch objects for the astronaut's spherical-surface physics
    const vN = new THREE.Vector3(); // local up (surface normal)
    const vT = new THREE.Vector3(); // tangential velocity
    const vF = new THREE.Vector3(); // facing (toward camera)
    const vR = new THREE.Vector3(); // local right
    const vP = new THREE.Vector3();
    const m4 = new THREE.Matrix4();
    const qTmp = new THREE.Quaternion();
    const Z_AXIS = new THREE.Vector3(0, 0, 1);
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

      // astronaut: jump cycle, finger-drag, and a natural ballistic fall —
      // gravity points at the planet's core, landings happen wherever the
      // arc meets the sphere, and bounces reflect off the surface normal
      if (astroState.id) {
        const st = astroState;
        const aEnt = byId[st.id];
        aEnt.pivot.getWorldPosition(tmp3); // planet center (world)
        const surfR = aEnt.data.radius * 0.98;

        let crouch = 0;
        let bodyDip = 0; // world-units body drop while the knees absorb

        if (st.mode === 'drag') {
          // the finger leads; measured velocity feeds the ragdoll and the fling
          vP.set(st.dragTarget.x - tmp3.x, st.dragTarget.y - tmp3.y, st.dragTarget.z - tmp3.z);
          const maxR = surfR + 12;
          if (vP.length() > maxR) vP.setLength(maxR);
          if (vP.length() < surfR + 0.01) vP.setLength(surfR + 0.01); // not inside the planet
          if (dt > 0) {
            tmp2.subVectors(vP, st.pos).divideScalar(dt);
            st.vel.lerp(tmp2, 0.5);
          }
          st.pos.copy(vP);
        } else if (st.mode === 'fall') {
          // projectile motion: constant-magnitude gravity toward the core.
          // A hard sideways fling can exceed orbital speed (v = sqrt(G*r))
          // and circle forever, so the tangential component is capped below
          // orbit speed and gently decays — every throw ends on the ground.
          vN.copy(st.pos).normalize();
          st.vel.addScaledVector(vN, -st.G * spd * dt);
          const vRad = st.vel.dot(vN);
          vT.copy(st.vel).addScaledVector(vN, -vRad);
          vT.multiplyScalar(Math.max(0, 1 - 0.35 * spd * dt));
          const maxT = 0.6 * Math.sqrt(st.G * st.pos.length());
          if (vT.length() > maxT) vT.setLength(maxT);
          st.vel.copy(vT).addScaledVector(vN, vRad);
          st.pos.addScaledVector(st.vel, spd * dt);
          if (st.pos.length() <= surfR) {
            vN.copy(st.pos).normalize();
            st.pos.copy(vN).multiplyScalar(surfR);
            const vn = st.vel.dot(vN); // impact speed along the normal
            vT.copy(st.vel).addScaledVector(vN, -vn);
            if (-vn > Math.max(st.v0 * 1.05, 1.0)) {
              // bounce: restitution on the normal, friction on the tangent
              st.vel.copy(vT).multiplyScalar(0.7).addScaledVector(vN, -vn * 0.45);
              st.sqV -= -vn * 0.6;
            } else {
              // settled — stand right here and rejoin the jump cycle
              st.normal.copy(vN);
              st.vel.set(0, 0, 0);
              st.h = 0;
              st.hv = 0;
              landAstronaut(-vn);
            }
          }
        } else if (st.mode === 'ground') {
          st.groundT += spd * dt;
          const t = st.groundT;
          let b, bv;
          if (t < st.tAbs) {
            // absorb: body still falling at impact speed, knees decelerate it
            b = -st.dW * Math.sin(st.w1 * t);
            bv = -st.dW * st.w1 * Math.cos(st.w1 * t);
          } else if (t < st.tAbs + st.tPush) {
            // push: accelerate up out of the deepest point of the crouch
            const tau = t - st.tAbs;
            b = -st.dW * Math.cos(st.w2 * tau);
            bv = st.dW * st.w2 * Math.sin(st.w2 * tau);
          } else {
            b = 0;
            bv = st.dW * st.w2;
            st.mode = 'air';
            st.hv = bv; // take-off at exactly the push velocity — no snap
          }
          crouch = Math.min(1, -b / st.dW);
          bodyDip = b;
          st.pos.copy(st.normal).multiplyScalar(surfR);
          st.vel.copy(st.normal).multiplyScalar(bv); // ragdoll sees smooth motion
        } else {
          // jump cycle hops along the surface normal of the standing spot
          st.hv -= st.G * spd * dt;
          st.h += st.hv * spd * dt;
          if (st.h <= 0 && st.hv < 0) {
            const vIn = -st.hv;
            st.h = 0;
            st.hv = 0;
            landAstronaut(vIn);
          }
          st.pos.copy(st.normal).multiplyScalar(surfR + st.h);
          st.vel.copy(st.normal).multiplyScalar(st.hv);
        }

        const held = st.mode === 'drag' || st.mode === 'fall';
        vN.copy(st.pos).normalize(); // local up wherever the astronaut is

        // low-gravity worlds: near the apex the astronaut spreads out like
        // they're trying to fly. floatiness: 0 at >=0.6g, 1 as g approaches 0
        const floatiness = THREE.MathUtils.clamp(1 - st.G / 9 / 0.6, 0, 1);
        let spread = 0;
        if (!held && st.mode === 'air' && st.v0 > 0) {
          const apex = 1 - Math.min(1, Math.abs(st.hv) / st.v0);
          spread = floatiness * apex * apex; // eases in toward the top
        }

        if (held) {
          // held or falling: all posing stops — pure limp ragdoll dangling
          waveArm.rest = waveArm.baseRest;
          swingArm.rest = swingArm.baseRest;
          for (const L of astroLimbs) {
            if (L.knee) L.rest = L.baseRest;
          }
        } else {
          st.waveT += spd * dt;
          // both arms raised overhead in a mirrored "hooray" wave; they dip
          // during the crouch and flatten into wings when floating at an apex
          const wave = 0.35 * Math.sin(st.waveT * 7);
          waveArm.rest = THREE.MathUtils.lerp(2.35 + wave - 1.4 * crouch, 1.75, spread);
          swingArm.rest = THREE.MathUtils.lerp(-2.35 - wave + 1.4 * crouch, -1.75, spread);
          // legs: drift into a star shape at a floaty apex
          for (const L of astroLimbs) {
            if (L.knee) L.rest = THREE.MathUtils.lerp(L.baseRest, L.out * 0.55, spread);
          }
        }

        // ragdoll kicks from local-up AND view-plane horizontal acceleration
        tmp.subVectors(st.vel, st.prevVel).divideScalar(Math.max(dt, 1e-4));
        st.prevVel.copy(st.vel);
        const kickY = THREE.MathUtils.clamp(tmp.dot(vN), -60, 60);
        tmp2.set(1, 0, 0).applyQuaternion(camera.quaternion); // camera right
        const kickH = THREE.MathUtils.clamp(tmp.dot(tmp2), -60, 60);
        for (const L of astroLimbs) {
          const drive = (-kickY * 0.35 * L.out + kickH * 0.25) * L.gain;
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
            const wag = held ? 0 : Math.sin(st.waveT * 7) * 0.45 * (1 - spread);
            if (L === waveArm) bend += wag;
            if (L === swingArm) bend -= wag;
            L.elbow.rotation.z = bend;
          }
        }

        // crouch pose: hips drop by the real absorb distance (converted to
        // the astronaut's local scale), thighs swing forward, knees fold back
        astroBody.position.y = Math.max(bodyDip / st.s, -0.3);
        for (const L of astroLimbs) {
          if (!L.knee) continue;
          L.group.rotation.x = 1.0 * crouch;
          L.knee.rotation.x = -1.8 * crouch;
        }

        // cartoon squash-and-stretch spring on the whole body
        st.sqV += (-180 * st.sq - 14 * st.sqV) * dt;
        st.sq += st.sqV * dt;
        const s = st.s;
        astro.scale.set(s * (1 - st.sq * 0.6), s * (1 + st.sq), s * (1 - st.sq * 0.6));

        astro.position.set(tmp3.x + st.pos.x, tmp3.y + st.pos.y, tmp3.z + st.pos.z);

        // stand along the local up (surface normal), visor toward the camera
        vF.subVectors(camera.position, astro.position);
        vF.addScaledVector(vN, -vF.dot(vN)); // project into the tangent plane
        if (vF.lengthSq() < 1e-6) vF.set(vN.y, vN.z, vN.x).cross(vN); // degenerate view
        vF.normalize();
        vR.crossVectors(vN, vF); // right-handed basis: right, up, front
        m4.makeBasis(vR, vN, vF);
        astro.quaternion.setFromRotationMatrix(m4);
        // lean into sideways motion while held or flung, upright otherwise
        const leanTarget = held ? THREE.MathUtils.clamp(-st.vel.dot(vR) * 0.045, -0.5, 0.5) : 0;
        st.lean += (leanTarget - st.lean) * Math.min(1, dt * 8);
        astro.quaternion.multiply(qTmp.setFromAxisAngle(Z_AXIS, st.lean));
      }

      // camera follow: the approach flies into a framing that keeps the body
      // clear of the fact card; after that the camera only translates with
      // the planet, so rotating/zooming/panning around it stays free
      const ent = follow.id && !fly ? byId[follow.id] : null;
      if (ent) {
        ent.pivot.getWorldPosition(tmp2);
        if (follow.approach) {
          follow.timer += dt;
          tmp.copy(tmp2).add(world.current.followOffset);
          camera.position.lerp(tmp, reducedMotion ? 1 : 0.06);
          follow.prev.copy(tmp2);
          // aim past the body — to its right on wide screens (card docks
          // right), below it on phones (card is a bottom sheet)
          const camDist = camera.position.distanceTo(tmp2);
          const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camDist;
          if (view.side) {
            tmp3.subVectors(tmp2, camera.position).normalize().cross(camera.up).normalize();
            tmp2.addScaledVector(tmp3, halfH * camera.aspect * 0.30);
          } else {
            tmp2.addScaledVector(camera.up, -halfH * 0.30);
          }
          controls.target.lerp(tmp2, reducedMotion ? 1 : 0.12);
          if (reducedMotion || follow.timer > 2.5 || camera.position.distanceTo(tmp) < 0.3) {
            follow.approach = false; // arrived — rotation belongs to the user now
          }
        } else {
          tmp.subVectors(tmp2, follow.prev);
          camera.position.add(tmp);
          controls.target.add(tmp);
          follow.prev.copy(tmp2);
        }
      }

      if (fly) {
        fly.t += dt / 1.2;
        const k = fly.t >= 1 ? 1 : 1 - Math.pow(1 - fly.t, 3);
        camera.position.lerpVectors(fly.fromP, fly.toP, k);
        controls.target.lerpVectors(fly.fromT, fly.toT, k);
        if (fly.t >= 1) fly = null;
      }

      controls.update();
      // keep panning within the solar system so nobody gets lost in the dark
      if (controls.target.length() > 180) controls.target.setLength(180);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      controls.removeEventListener('start', onControlStart);
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
