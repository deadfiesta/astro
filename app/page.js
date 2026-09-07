'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CARDS } from '@/lib/bodies';
import FactCard from '@/components/FactCard';
import PlanetPicker from '@/components/PlanetPicker';
import ControlBar from '@/components/ControlBar';

// Three.js needs the browser — skip server rendering entirely
const SolarSystem = dynamic(() => import('@/components/SolarSystem'), { ssr: false });

export default function Home() {
  const [selectedId, setSelectedId] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [everSelected, setEverSelected] = useState(false);
  const [hintSoft, setHintSoft] = useState(false);
  const sceneRef = useRef(null);

  // gentler default pace when the visitor prefers reduced motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setSpeed(0.3);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHintSoft(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const select = useCallback((id) => {
    window.speechSynthesis?.cancel();
    setSelectedId(id);
    setEverSelected(true);
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
      <div id="hint" className={`${everSelected ? 'hidden' : ''} ${hintSoft ? 'soft' : ''}`}>
        👆 Tap a planet to say hello!
      </div>
      <FactCard body={body} onClose={deselect} />
      <PlanetPicker selectedId={selectedId} onSelect={select} />
      <div id="credit">
        A little passion project by Wen Kiong, making space a little more fun to explore and learn.
      </div>
    </main>
  );
}
