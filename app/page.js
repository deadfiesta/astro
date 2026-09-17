'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MotionConfig, motion } from 'motion/react';
import { CARDS, SYSTEMS } from '@/lib/bodies';
import FactCard from '@/components/FactCard';
import PlanetPicker from '@/components/PlanetPicker';
import ControlBar from '@/components/ControlBar';
import SystemPicker from '@/components/SystemPicker';
import FlightDeck from '@/components/FlightDeck';
import MiniMap from '@/components/MiniMap';
import SpeedReadout from '@/components/SpeedReadout';
import StickerBook from '@/components/StickerBook';
import { TOTAL, loadCollected, saveCollected, systemComplete, systemOf } from '@/lib/postcards';

// every flight starts at a gentle 5% — the pilot pushes the throttle up
const START_THROTTLE = 0.05;

// a two-note chime when a postcard lands in the book (after a tap, so the
// audio context is allowed); the completion fanfare adds a third note
let audio = null;
function chime(fanfare) {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const notes = fanfare ? [523, 659, 784, 1047] : [660, 990];
    notes.forEach((f, i) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t0 = audio.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
      o.connect(g).connect(audio.destination);
      o.start(t0);
      o.stop(t0 + 0.5);
    });
  } catch { /* no audio — the burst and toast still show */ }
}

// Three.js needs the browser — skip server rendering entirely
const SolarSystem = dynamic(() => import('@/components/SolarSystem'), { ssr: false });

export default function Home() {
  const [selectedId, setSelectedId] = useState(null);
  const [systemId, setSystemId] = useState('sol');
  const [speed, setSpeed] = useState(1); // 0 = paused, 3 = rocket speed
  const [sysInfoVisible, setSysInfoVisible] = useState(false);
  const sceneRef = useRef(null);
  const infoTimer = useRef(null);
  // fly mode: the shuttle's live stick/throttle, read by the scene each frame
  const [flying, setFlying] = useState(false);
  const flightInput = useRef({ yaw: 0, pitch: 0, throttle: START_THROTTLE });

  // postcard collecting: ids of bodies flown past, mirrored into a ref the
  // scene reads each frame, saved to the browser between visits
  const [collected, setCollected] = useState(() => new Set());
  const collectedRef = useRef(collected);
  const [bookOpen, setBookOpen] = useState(false);
  const [toast, setToast] = useState(null); // { body, star } shown briefly
  const toastTimer = useRef(null);
  useEffect(() => {
    const saved = loadCollected();
    collectedRef.current = saved;
    setCollected(saved);
  }, []);
  const onPostcard = useCallback((id) => {
    const body = CARDS.find((b) => b.id === id);
    if (!body || collectedRef.current.has(id)) return;
    const next = new Set(collectedRef.current);
    next.add(id);
    collectedRef.current = next;
    setCollected(next);
    saveCollected(next);
    const sys = systemOf(id);
    const star = !!sys && systemComplete(sys.id, next);
    chime(star);
    setToast({ body, star, system: sys });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), star ? 4500 : 3000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const resetPostcards = useCallback(() => {
    const empty = new Set();
    collectedRef.current = empty;
    setCollected(empty);
    saveCollected(empty);
    setToast(null);
  }, []);

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
    setFlying(false); // picking a planet lands the shuttle
    setSelectedId(id);
    // keep the planet row in sync with whichever system the body lives in
    const sys = SYSTEMS.find((s) => s.bodies.some((b) => b.id === id));
    if (sys) setSystemId(sys.id);
  }, []);

  const goToSystem = useCallback((sys) => {
    window.speechSynthesis?.cancel();
    setFlying(false);
    setSelectedId(null);
    if (sys.id === systemId) {
      // already here — zoom back out to the system's default overview
      // (the description banner returns via onArrive when the camera stops)
      sceneRef.current?.goToSystem(sys);
      return;
    }
    setSystemId(sys.id);
    sceneRef.current?.goToSystem(sys);
  }, [systemId]);

  const deselect = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSelectedId(null);
  }, []);

  const toggleFly = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSelectedId(null);
    setSysInfoVisible(false);
    setFlying((f) => !f);
  }, []);
  const land = useCallback(() => setFlying(false), []);

  // hotkeys: F flies / lands, L lands, P opens the sticker book, Escape
  // closes it. Ignored while typing in a text field (there are none today,
  // but cheap insurance).
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' && e.target.type !== 'range') return;
      if (tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === 'f') { e.preventDefault(); toggleFly(); }
      else if (k === 'p') { e.preventDefault(); setBookOpen((o) => !o); }
      else if (k === 'l') { if (flying) { e.preventDefault(); land(); } }
      else if (k === 'escape' && bookOpen) { setBookOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFly, land, flying, bookOpen]);
  // the scene reports which star system the shuttle came down at
  const onFlightLand = useCallback((sys) => setSystemId(sys.id), []);
  const getMap = useCallback(() => sceneRef.current?.mapSnapshot() ?? null, []);

  const pickFromBook = useCallback((id) => {
    setBookOpen(false);
    select(id);
  }, [select]);

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
          flying={flying}
          flightInput={flightInput}
          onSelect={select}
          onArrive={showSysInfo}
          onReady={onSceneReady}
          onFlightLand={onFlightLand}
          onPostcard={onPostcard}
          collectedRef={collectedRef}
        />
        <ControlBar
          visible={uiVisible}
          speed={speed}
          onSpeed={setSpeed}
          flying={flying}
          onFly={toggleFly}
          postcards={collected.size}
          total={TOTAL}
          bookOpen={bookOpen}
          onBook={() => setBookOpen((o) => !o)}
        />
        <StickerBook open={bookOpen} collected={collected} onClose={() => setBookOpen(false)} onPick={pickFromBook} onReset={resetPostcards} />
        <motion.div
          id="postcard-toast"
          className={toast?.star ? 'star' : ''}
          initial={false}
          style={{ x: '-50%' }}
          animate={toast ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          aria-live="polite"
        >
          {toast && (
            <>
              <span className="toast-emoji" aria-hidden="true">{toast.star ? '⭐' : toast.body.emoji}</span>
              <span className="toast-text">
                {toast.star
                  ? (toast.system.id === 'secrets'
                    ? 'You found every secret in the galaxy!'
                    : `You found every world in ${toast.system.name}!`)
                  : toast.body.secret
                    ? `Secret postcard: ${toast.body.name}! 🤫`
                    : `Postcard from ${toast.body.name}!`}
              </span>
            </>
          )}
        </motion.div>
        <SystemPicker visible={uiVisible && !flying} systemId={systemId} onPick={goToSystem} />
        <PlanetPicker visible={uiVisible && !flying} system={system} selectedId={selectedId} onSelect={select} />
        <FlightDeck visible={uiVisible && flying} input={flightInput} onLand={land} />
        <MiniMap visible={uiVisible && flying} getMap={getMap} />
        <SpeedReadout visible={uiVisible && flying} getMap={getMap} />
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
