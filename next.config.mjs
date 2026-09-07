/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `next build` emits a fully static site in out/,
  // deployable to Vercel, GitHub Pages, or any static host.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
