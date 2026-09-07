# 🪐 Little Orbit

An animated, touch-friendly 3D solar system explorer for kids aged 4+. Built with [Next.js](https://nextjs.org) and [Three.js](https://threejs.org).

- All 8 planets orbit the Sun and spin on their axes, with true-to-life quirks: Venus spins backwards, Uranus rolls on its side, Mercury races everyone.
- Tap any planet (or the picker row) to fly the camera to it and open a kid-friendly fact card with a **🔊 Read it to me!** speech button.
- Procedurally drawn planet textures — zero image assets, works offline once loaded.
- Touch-first: one-finger drag to orbit, pinch to zoom, 56px+ touch targets, turtle/normal/rocket speed controls, and `prefers-reduced-motion` support.

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

The site is a fully static export (`output: 'export'`) — the build lands in `out/` and needs no server.

## Deploy

**Vercel** (easiest): push this repo to GitHub, then [import it on Vercel](https://vercel.com/new). Zero config — Vercel detects Next.js and builds automatically. Or from the CLI: `npx vercel`.

**GitHub Pages**: the static `out/` folder can be served directly. If the site lives at `https://<user>.github.io/<repo>/` (a project page, not a user page), first set `basePath: '/<repo>'` in `next.config.mjs`, then publish `out/` (e.g. with an Actions workflow or `npx gh-pages -d out`).

## Project layout

```
app/            Next.js App Router: layout, page, global styles
components/     SolarSystem (Three.js scene), FactCard, PlanetPicker, ControlBar
lib/            bodies.js (planet data + facts), textures.js (procedural canvas textures)
```
