import * as THREE from 'three';

/* Procedural canvas textures — vibrant, no external assets.
   Browser-only (uses document); only call from client components. */

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

// deterministic pseudo-random so every visit looks the same
export function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rockyTexture(base, speckle, seed) {
  const [c, ctx] = makeCanvas(512, 256);
  const rnd = mulberry(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 420; i++) {
    const r = rnd() * 9 + 1.5;
    ctx.beginPath();
    ctx.arc(rnd() * 512, rnd() * 256, r, 0, Math.PI * 2);
    ctx.fillStyle = rnd() > 0.5 ? speckle : 'rgba(255,255,255,0.10)';
    ctx.globalAlpha = 0.25 + rnd() * 0.35;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return new THREE.CanvasTexture(c);
}

export function bandedTexture(bands, seed, spot) {
  const [c, ctx] = makeCanvas(512, 256);
  const rnd = mulberry(seed);
  let y = 0;
  let i = 0;
  while (y < 256) {
    const h = 12 + rnd() * 26;
    ctx.fillStyle = bands[i % bands.length];
    ctx.fillRect(0, y, 512, h + 2);
    y += h;
    i++;
  }
  // soften band edges with translucent streaks
  for (let s = 0; s < 60; s++) {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, rnd() * 256, 512, 1 + rnd() * 3);
  }
  if (spot) {
    const g = ctx.createRadialGradient(360, 170, 4, 360, 170, 26);
    g.addColorStop(0, '#E0533D');
    g.addColorStop(0.7, '#C43A26');
    g.addColorStop(1, 'rgba(196,58,38,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(360, 170, 34, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

export function venusTexture() {
  const [c, ctx] = makeCanvas(512, 256);
  const rnd = mulberry(77);
  ctx.fillStyle = '#EFC97E';
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = i % 2 ? 'rgba(217,161,68,0.35)' : 'rgba(255,240,200,0.30)';
    ctx.lineWidth = 3 + rnd() * 10;
    ctx.beginPath();
    const y = rnd() * 256;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + (rnd() - 0.5) * 60, 340, y + (rnd() - 0.5) * 60, 512, y);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}

export function earthTexture() {
  const [c, ctx] = makeCanvas(512, 256);
  const rnd = mulberry(4242);
  ctx.fillStyle = '#2E7CD6';
  ctx.fillRect(0, 0, 512, 256);
  // continents: clustered green blobs
  ctx.fillStyle = '#3DBE5B';
  for (let k = 0; k < 8; k++) {
    const cx = rnd() * 512, cy = 40 + rnd() * 176;
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.arc(cx + (rnd() - 0.5) * 90, cy + (rnd() - 0.5) * 55, 6 + rnd() * 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // ice caps
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fillRect(0, 0, 512, 16);
  ctx.fillRect(0, 240, 512, 16);
  // clouds
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 46; i++) {
    ctx.beginPath();
    ctx.ellipse(rnd() * 512, rnd() * 256, 10 + rnd() * 26, 4 + rnd() * 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

export function sunTexture(colors = ['#FFD54A', '#FFB627', '#FF9F1C']) {
  const [c, ctx] = makeCanvas(512, 256);
  const rnd = mulberry(9);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, colors[0]);
  g.addColorStop(0.5, colors[1]);
  g.addColorStop(1, colors[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 130; i++) {
    ctx.beginPath();
    ctx.arc(rnd() * 512, rnd() * 256, 4 + rnd() * 16, 0, Math.PI * 2);
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,236,150,0.35)' : 'rgba(255,140,20,0.30)';
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

export function ringTexture() {
  const [c, ctx] = makeCanvas(256, 32);
  const stripes = ['#EFCB8A', '#D9B26A', '#F6E3B4', '#C29A55', '#EFCB8A', '#E8D49E'];
  let x = 0;
  let i = 0;
  const rnd = mulberry(33);
  while (x < 256) {
    const w = 6 + rnd() * 22;
    ctx.globalAlpha = 0.55 + rnd() * 0.45;
    ctx.fillStyle = stripes[i % stripes.length];
    ctx.fillRect(x, 0, w, 32);
    x += w;
    i++;
  }
  ctx.globalAlpha = 1;
  return new THREE.CanvasTexture(c);
}

export function sunGlowTexture() {
  const [c, ctx] = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,201,60,0.9)');
  g.addColorStop(0.4, 'rgba(255,159,28,0.35)');
  g.addColorStop(1, 'rgba(255,159,28,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function labelSprite(text, color) {
  const [c, ctx] = makeCanvas(512, 128);
  ctx.font = '700 64px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(7,11,33,0.9)';
  ctx.strokeText(text, 256, 64);
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(5.5, 1.4, 1);
  return sprite;
}

export function textureFor(b) {
  switch (b.texture) {
    case 'rocky': return rockyTexture(b.base, b.speckle, b.orbit * 97 + 3);
    case 'venus': return venusTexture();
    case 'earth': return earthTexture();
    case 'jupiter': return bandedTexture(['#E8A45C', '#C9803B', '#F2D0A0', '#B96F33', '#EFBE84'], 12, true);
    case 'saturn': return bandedTexture(['#EFCB8A', '#E0B56E', '#F6E3B4', '#D5A75E'], 21, false);
    case 'ice': return rockyTexture(b.base, b.speckle, b.orbit * 31 + 7);
    default: return null;
  }
}
