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

// soft round particle for point clouds — a feathered white dot so belts
// read as icy haze instead of hard square pixels
export function softDotTexture() {
  const [c, ctx] = makeCanvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
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

// equirectangular deep-space sky: a near-black base with a few thin streaks
// of coloured nebula and a faint milky-way band — mapped onto an inside-out
// sphere so space has hints of colour without being bright. No baked-in
// stars: every star on screen is a real, tappable body.
export function nebulaSkyTexture(seed = 77) {
  const W = 2048, H = 1024;
  const [c, ctx] = makeCanvas(W, H);
  const rnd = mulberry(seed);

  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#04061A');
  base.addColorStop(0.5, '#080A26');
  base.addColorStop(1, '#03051A');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const puff = (x, y, r, rgb, a) => {
    if (a <= 0.002) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(0.5, `rgba(${rgb},${a * 0.4})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  ctx.globalCompositeOperation = 'lighter';

  // nebula streaks: thin ribbons that follow a gentle curve, brightest in the
  // middle and fading out at both ends, each with a second accent colour
  const streaks = [
    { x: 0.08, y: 0.40, len: 520, ang: -0.35, bend: 0.0018, w: 34, rgb: '255, 80, 170', rgb2: '120, 70, 255' }, // magenta/violet
    { x: 0.30, y: 0.66, len: 420, ang: 0.25, bend: -0.0022, w: 28, rgb: '40, 200, 230', rgb2: '60, 230, 170' }, // teal/mint
    { x: 0.47, y: 0.32, len: 600, ang: -0.15, bend: 0.0012, w: 30, rgb: '120, 70, 255', rgb2: '255, 90, 130' }, // violet/rose
    { x: 0.66, y: 0.58, len: 380, ang: 0.45, bend: -0.0025, w: 24, rgb: '255, 150, 60', rgb2: '255, 200, 90' }, // gold/amber
    { x: 0.80, y: 0.36, len: 520, ang: 0.10, bend: 0.0016, w: 32, rgb: '90, 120, 255', rgb2: '200, 90, 255' }, // blue/orchid
    { x: 0.93, y: 0.68, len: 340, ang: -0.50, bend: 0.0020, w: 22, rgb: '255, 100, 200', rgb2: '70, 170, 255' }, // pink/sky
    { x: 0.20, y: 0.14, len: 300, ang: 0.30, bend: -0.0015, w: 20, rgb: '60, 210, 210', rgb2: '120, 70, 255' }, // cyan/violet, high
    { x: 0.58, y: 0.86, len: 320, ang: -0.20, bend: 0.0018, w: 22, rgb: '255, 120, 80', rgb2: '255, 80, 170' }, // coral/magenta, low
  ];
  for (const s of streaks) {
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const d = (u - 0.5) * s.len;
      const a = s.ang + d * s.bend; // slowly turning heading = a gentle arc
      const x = s.x * W + Math.cos(a) * d;
      const y = s.y * H + Math.sin(a) * d;
      const fade = Math.sin(u * Math.PI); // 0 at the ends, 1 in the middle
      const wob = 1 + 0.5 * Math.sin(u * 13 + s.len); // lumpy width
      const jx = (rnd() - 0.5) * s.w * 0.8, jy = (rnd() - 0.5) * s.w * 0.8;
      puff(x + jx, y + jy, s.w * wob, s.rgb, 0.045 * fade);
      if (i % 3 === 0) puff(x - jx, y - jy, s.w * 1.8 * wob, s.rgb2, 0.02 * fade);
    }
    // a couple of brighter knots along the ribbon
    for (let k = 0; k < 3; k++) {
      const u = 0.25 + rnd() * 0.5;
      const d = (u - 0.5) * s.len;
      const a = s.ang + d * s.bend;
      puff(s.x * W + Math.cos(a) * d, s.y * H + Math.sin(a) * d, s.w * 0.9, s.rgb, 0.10);
    }
  }

  // milky-way band: a faint sine of small warm/cool puffs
  for (let i = 0; i < 360; i++) {
    const u = rnd();
    const x = u * W;
    const y = H * (0.5 + 0.13 * Math.sin(u * Math.PI * 2 + 0.6)) + (rnd() - 0.5) * 120;
    const warm = rnd() < 0.5;
    puff(x, y, 26 + rnd() * 60, warm ? '255, 220, 190' : '190, 200, 255', 0.014 + rnd() * 0.02);
  }

  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}
