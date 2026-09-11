'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MotionConfig, motion } from 'motion/react';
import { CARDS, SYSTEMS } from '@/lib/bodies';
import FactCard from '@/components/FactCard';
import PlanetPicker from '@/components/PlanetPicker';
import ControlBar from '@/components/ControlBar';
import SystemPicker from '@/components/SystemPicker';

// Three.js needs the browser — skip server rendering entirely
const SolarSystem = dynamic(() => import('@/components/SolarSystem'), { ssr: false });

export default function Home() {
  const [selectedId, setSelectedId] = useState(null);
  const [systemId, setSystemId] = useState('sol');
  const [speed, setSpeed] = useState(1); // 0 = paused, 3 = rocket speed
  const [sysInfoVisible, setSysInfoVisible] = useState(false);
  const sceneRef = useRef(null);
  const infoTimer = useRef(null);

  // shown once the camera has arrived and come to a stop (onArrive below)
  const showSysInfo = useCallback(() => {
    setSysInfoVisible(true);
    clearTimeout(infoTimer.current);
    infoTimer.current = setTimeout(() => setSysInfoVisible(false), 8000);
  }, []);

  // hide the old banner the moment travel to another system begins
  useEffect(() => {
    setSysInfoVisible(false);
  }, [systemId]);

  // fired by the scene when the formation intro completes: bring in the
  // HUD, then introduce Our Solar System (no camera flight on first load)
  const [uiVisible, setUiVisible] = useState(false);
  const onSceneReady = useCallback(() => {
    setUiVisible(true);
    setTimeout(showSysInfo, 500);
  }, [showSysInfo]);

  useEffect(() => () => clearTimeout(infoTimer.current), []);

  // gentler default pace when the visitor prefers reduced motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setSpeed(0.3);
  }, []);

  const select = useCallback((id) => {
    window.speechSynthesis?.cancel();
    setSelectedId(id);
    // keep the planet row in sync with whichever system the body lives in
    const sys = SYSTEMS.find((s) => s.bodies.some((b) => b.id === id));
    if (sys) setSystemId(sys.id);
  }, []);

  const goToSystem = useCallback((sys) => {
    window.speechSynthesis?.cancel();
    setSelectedId(null);
    if (sys.id === systemId) {
      showSysInfo(); // already here — just re-introduce the system
      return;
    }
    setSystemId(sys.id);
    sceneRef.current?.goToSystem(sys);
  }, [systemId, showSysInfo]);

  const deselect = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSelectedId(null);
  }, []);

  const reset = useCallback(() => {
    deselect();
    sceneRef.current?.resetView();
  }, [deselect]);

  const body = CARDS.find((b) => b.id === selectedId) ?? null;
  const system = SYSTEMS.find((s) => s.id === systemId) ?? SYSTEMS[0];

  return (
    <MotionConfig reducedMotion="user">
      <main>
        <SolarSystem
          ref={sceneRef}
          selectedId={selectedId}
          speed={speed}
          paused={speed === 0}
          onSelect={select}
          onArrive={showSysInfo}
          onReady={onSceneReady}
        />
        <ControlBar
          visible={uiVisible}
          speed={speed}
          onSpeed={setSpeed}
          onReset={reset}
        />
        <SystemPicker visible={uiVisible} systemId={systemId} onPick={goToSystem} />
        <PlanetPicker visible={uiVisible} system={system} selectedId={selectedId} onSelect={select} />
        <motion.div
          id="credit"
          initial={{ opacity: 0 }}
          animate={{ opacity: uiVisible ? 1 : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: uiVisible ? 0.55 : 0 }}
        >
          A little passion project by Wen Kiong, making space a little more fun to explore and learn.
        </motion.div>
        <motion.div
          id="sys-banner"
          initial={false}
          style={{ x: '-50%' }}
          animate={sysInfoVisible && !body ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="sys-banner-name">{system.emoji} {system.name}</span>
          <span className="sys-banner-desc">{system.description}</span>
        </motion.div>
        <FactCard body={body} onClose={deselect} />
      </main>
    </MotionConfig>
  );
}
