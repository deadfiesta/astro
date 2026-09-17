'use client';

import { AnimatePresence, motion } from 'motion/react';
import { PAGES, TOTAL, systemComplete } from '@/lib/postcards';

/* The sticker book: one page per star system, one stamp per world. Stamps
   you have flown past show the body's emoji and name and can be tapped to
   visit it; the rest sit greyed out with a question mark. Collect every
   world in a system and its page earns a gold star. */
export default function StickerBook({ open, collected, onClose, onPick }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="book-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            id="book"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-title"
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="book-head">
              <h2 id="book-title">📮 My Postcards</h2>
              <span className="book-count">{collected.size} / {TOTAL}</span>
              <button className="book-close" aria-label="Close the sticker book" onClick={onClose}>✕</button>
            </div>
            <p className="book-hint">
              {collected.size === 0
                ? 'Fly the shuttle 🛸 close to a planet or star to take a postcard!'
                : collected.size === TOTAL
                  ? 'You found every world in the galaxy! 🎉'
                  : 'Tap a postcard to visit that world again.'}
            </p>
            <div className="book-pages">
              {PAGES.map(({ system, bodies }) => {
                const have = bodies.filter((b) => collected.has(b.id)).length;
                const done = systemComplete(system.id, collected);
                return (
                  <section className={`book-page${done ? ' done' : ''}`} key={system.id}>
                    <div className="page-head">
                      <span className="page-emoji" aria-hidden="true">{system.emoji}</span>
                      <span className="page-name">{system.name}</span>
                      <span className="page-progress" aria-label={`${have} of ${bodies.length} collected`}>
                        {done ? '⭐ All found!' : `${have} / ${bodies.length}`}
                      </span>
                    </div>
                    <div className="stamps">
                      {bodies.map((b) => {
                        const got = collected.has(b.id);
                        return (
                          <button
                            key={b.id}
                            className={`stamp${got ? ' got' : ' missing'}`}
                            style={got ? { '--stamp-color': b.color } : undefined}
                            disabled={!got}
                            aria-label={got ? `Visit ${b.name}` : 'Not found yet'}
                            onClick={() => onPick(b.id)}
                          >
                            <span className="stamp-emoji" aria-hidden="true">{got ? b.emoji : '?'}</span>
                            <span className="stamp-name">{got ? (b.short ?? b.name) : '· · ·'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
