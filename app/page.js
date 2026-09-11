'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
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
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [sysInfoVisible, setSysInfoVisible] = useState(true);
  const sceneRef = useRef(null);

  // introduce each system with its one-liner on arrival, then fade it out
  useEffect(() => {
    setSysInfoVisible(true);
    const t = setTimeout(() => setSysInfoVisible(false), 8000);
    return () => clearTimeout(t);
  }, [systemId]);

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
    setSystemId(sys.id);
    sceneRef.current?.goToSystem(sys);
  }, []);

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
    <main>
      <SolarSystem
        ref={sceneRef}
        selectedId={selectedId}
        speed={speed}
        paused={paused}
        onSelect={select}
      />
      <ControlBar
        speed={speed}
        paused={paused}
        onSpeed={setSpeed}
        onTogglePause={() => setPaused((p) => !p)}
        onReset={reset}
      />
      <SystemPicker systemId={systemId} onPick={goToSystem} />
      <div id="sys-banner" className={sysInfoVisible && !body ? 'show' : ''}>
        <span className="sys-banner-name">{system.emoji} {system.name}</span>
        <span className="sys-banner-desc">{system.description}</span>
      </div>
      <FactCard body={body} onClose={deselect} />
      <PlanetPicker system={system} selectedId={selectedId} onSelect={select} />
      <div id="credit">
        A little passion project by Wen Kiong, making space a little more fun to explore and learn.
      </div>
    </main>
  );
}
