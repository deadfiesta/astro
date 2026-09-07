'use client';

import { useEffect, useRef, useState } from 'react';

// gravity chip built from the same value that drives the astronaut physics
function chipsFor(body) {
  const chips = [...body.chips];
  if (body.gravity) {
    const rel = body.gravity;
    const relText = rel === 1 ? 'that’s Earth!' : `${parseFloat(rel.toFixed(2))}× of Earth’s`;
    chips.push(['🧲 Gravity', `${(rel * 9.81).toFixed(1)} m/s² (${relText})`]);
  }
  return chips;
}

export default function FactCard({ body, onClose }) {
  const facts = body?.funFacts ?? [];
  const [idx, setIdx] = useState(0);
  const touchX = useRef(null);

  // land on a random fun fact every time a body is opened
  useEffect(() => {
    if (body) setIdx(Math.floor(Math.random() * (body.funFacts?.length || 1)));
  }, [body]);

  const prev = () => setIdx((i) => (i - 1 + facts.length) % facts.length);
  const next = () => setIdx((i) => (i + 1) % facts.length);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (dx > 40) prev();
    else if (dx < -40) next();
  };

  const speak = () => {
    if (!window.speechSynthesis || !body) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      `${body.name}. ${body.fact} Did you know? ${facts[idx] ?? ''}`
    );
    u.rate = 0.92;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  };

  return (
    <div
      id="card"
      className={body ? 'open' : ''}
      role="dialog"
      aria-modal="false"
      aria-labelledby="card-name"
      style={body ? { '--planet-color': body.color } : undefined}
    >
      {body && (
        <>
          <div className="card-head">
            <span id="card-emoji">{body.emoji}</span>
            <h2 id="card-name" style={{ color: body.color }}>{body.name}</h2>
            <button id="card-close" aria-label="Close" onClick={onClose}>✕</button>
          </div>
          <p id="card-fact">{body.fact}</p>
          <div id="card-chips">
            {chipsFor(body).map(([label, value]) => (
              <div className="chip" key={label}>
                <span className="chip-label">{label}</span>
                <span className="chip-value">{value}</span>
              </div>
            ))}
          </div>
          {facts.length > 0 && (
            <div className="funfact" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div className="funfact-head">✨ Did you know?</div>
              <div className="funfact-row">
                <button className="fun-arrow" aria-label="Previous fun fact" onClick={prev}>◀</button>
                {/* key={idx} restarts the slide-in animation on every change */}
                <p className="funfact-text" key={idx} aria-live="polite">{facts[idx]}</p>
                <button className="fun-arrow" aria-label="Next fun fact" onClick={next}>▶</button>
              </div>
              <div className="fun-dots" aria-hidden="true">
                {facts.map((_, i) => (
                  <span className={`fun-dot${i === idx ? ' active' : ''}`} key={i} />
                ))}
              </div>
            </div>
          )}
          <button id="speak" onClick={speak}>🔊 Read it to me!</button>
        </>
      )}
    </div>
  );
}
