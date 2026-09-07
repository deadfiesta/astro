import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata = {
  title: 'Little Orbit',
  description: 'An animated, touch-friendly 3D solar system explorer for kids — tap a planet to watch it orbit and hear a fun fact.',
  icons: {
    // emoji favicon via inline SVG — no asset files needed
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪐</text></svg>',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#070B21',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
