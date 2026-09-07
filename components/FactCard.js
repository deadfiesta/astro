'use client';

export default function FactCard({ body, onClose }) {
  const speak = () => {
    if (!window.speechSynthesis || !body) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${body.name}. ${body.fact}`);
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
            {body.chips.map(([label, value]) => (
              <div className="chip" key={label}>
                <span className="chip-label">{label}</span>
                <span className="chip-value">{value}</span>
              </div>
            ))}
          </div>
          <button id="speak" onClick={speak}>🔊 Read it to me!</button>
        </>
      )}
    </div>
  );
}
