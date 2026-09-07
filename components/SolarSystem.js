'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BODIES } from '@/lib/bodies';
import {
  makeCanvas, mulberry, rockyTexture, ringTexture, sunTexture, sunGlowTexture,
  labelSprite, textureFor,
} from '@/lib/textures';

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
    if (!w || !selectedId) return;
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
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.27, 24, 16),
          new THREE.MeshLambertMaterial({ map: rockyTexture('#C9C4BC', '#8F8A82', 5) })
        );
        moonMesh.userData.id = b.id;
        pickables.push(moonMesh);
        moon = new THREE.Group();
        moon.add(moonMesh);
        moonMesh.position.x = 2.0;
        pivot.add(moon);
      }

      orbitParent.add(pivot);
      bodies.push({ data: b, pivot, mesh, moon, angle: Math.random() * Math.PI * 2 });
    }

    const byId = Object.fromEntries(bodies.map((x) => [x.data.id, x]));

    // Comet: eccentric tilted orbit from the Kuiper Belt to the inner system.
    // Ellipse with the Sun at one focus: perihelion a-c = 8, aphelion a+c = 68.
    const comet = { angle: 0.7, a: 38, c: 30, b: Math.sqrt(38 * 38 - 30 * 30) };
    const cometOrbit = new THREE.Group();
    cometOrbit.rotation.set(0.18, 0, 0.12);
    scene.add(cometOrbit);
    const cometPivot = new THREE.Group();
    cometOrbit.add(cometPivot);
    {
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 24, 16),
        new THREE.MeshBasicMaterial({ color: '#EAF8FF' })
      );
      head.userData.id = 'comet';
      pickables.push(head);
      cometPivot.add(head);

      const label = labelSprite('Comet', '#BFEFFF');
      label.scale.set(6, 1.5, 1);
      label.position.y = 1.6;
      label.userData.id = 'comet';
      pickables.push(label);
      cometPivot.add(label);
    }
    const cometTail = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 3, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: '#BFEFFF', transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      })
    );
    cometTail.userData.id = 'comet';
    pickables.push(cometTail);
    cometPivot.add(cometTail);
    byId.comet = { data: { id: 'comet', radius: 0.5 }, pivot: cometPivot };

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

    world.current = { camera, controls, byId, flyTo, followOffset: new THREE.Vector3() };
    // re-apply the current selection now that the scene exists
    if (selectedRef.current) {
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

    // sizing
    function fit() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    fit();
    window.addEventListener('resize', fit);

    // animation loop
    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    const tmp2 = new THREE.Vector3();
    const tmp3 = new THREE.Vector3();
    const UP = new THREE.Vector3(0, 1, 0);
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

      // comet sweeps faster near the Sun; tail always points away from it
      {
        const r = cometPivot.position.length() || 8;
        comet.angle += spd * dt * 0.3 * Math.min(2.5, 30 / r);
        cometPivot.position.set(
          comet.a * Math.cos(comet.angle) - comet.c, 0, comet.b * Math.sin(comet.angle)
        );
        const dir = tmp2.copy(cometPivot.position).normalize();
        const len = Math.min(2.4, Math.max(0.7, 30 / cometPivot.position.length()));
        cometTail.scale.set(len, len, len);
        // cone apex sits on the comet head, base streams away from the Sun
        cometTail.position.copy(dir).multiplyScalar((3 * len) / 2 + 0.3);
        cometTail.quaternion.setFromUnitVectors(UP, tmp3.copy(dir).negate());
      }

      // camera follows the selected body (world position — Pluto orbits in a tilted plane)
      const sel = selectedRef.current;
      const ent = sel ? byId[sel] : null;
      if (ent && !fly) {
        ent.pivot.getWorldPosition(tmp2);
        tmp.copy(tmp2).add(world.current.followOffset);
        camera.position.lerp(tmp, reducedMotion ? 1 : 0.06);
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
