/* Secret postcards: real, documented small bodies hidden around the scene.
   They have no labels and never show on the radar — the pilot has to spot
   the twinkle. Belt and near-Earth asteroids ride circular orbits around
   the Sun (scene units match lib/bodies: Earth at 17.5, the Asteroid Belt at
   24.5–27, the Kuiper Belt at 52–62). Halley's Comet runs a proper ellipse.
   The three known interstellar visitors drift in the dark between stars.

   `place` is one of:
     { system, orbit, orbitSpeed, phase, tilt }     circular orbit
     { system, a, e, orbitSpeed, phase, tilt }      ellipse (a = semi-major)
     { from: [x,y,z], to: [x,y,z], period }         drifting back and forth
*/

export const SECRETS = [
  {
    id: 'ceres', name: 'Ceres', emoji: '🥔', color: '#B8AFA3', glow: '#D8D0C4', secret: true,
    kind: 'rock', radius: 0.55, gravity: 0.029, spinSpeed: 0.4,
    place: { system: 'sol', orbit: 25.4, orbitSpeed: 0.52, phase: 0.8, tilt: 0.05 },
    fact: 'Ceres is the biggest thing in the Asteroid Belt — so big and round it counts as a dwarf planet. NASA’s Dawn spacecraft circled it in 2015 and found shiny white spots that turned out to be salt!',
    chips: [
      ['📏 How big?', 'About 940 km across'],
      ['🧂 Bright spots', 'Salt left by old water'],
      ['🛰️ Visited by', 'Dawn, 2015–2018'],
    ],
    funFacts: [
      'Ceres was found in 1801 and was called a planet for about 50 years!',
      'There may be salty slush hiding under Ceres’ crust.',
      'Ceres holds about a third of all the stuff in the whole Asteroid Belt.',
      'Its brightest spot, in Occator crater, glows like a lighthouse on photos.',
    ],
  },
  {
    id: 'vesta', name: 'Vesta', emoji: '🪨', color: '#A89C8C', glow: '#CFC3B2', secret: true,
    kind: 'rock', radius: 0.42, gravity: 0.025, spinSpeed: 0.7,
    place: { system: 'sol', orbit: 26.3, orbitSpeed: 0.5, phase: 3.9, tilt: -0.08 },
    fact: 'Vesta is the second biggest asteroid. A giant crash knocked a huge crater into its bottom and left a mountain in the middle more than twice as tall as Mount Everest!',
    chips: [
      ['📏 How big?', 'About 525 km across'],
      ['⛰️ Tallest peak', 'Around 22 km high'],
      ['☄️ Fun bonus', 'Bits of Vesta fall to Earth as meteorites'],
    ],
    funFacts: [
      'Vesta is bright enough to spot from Earth without a telescope on a dark night.',
      'About 1 in 20 meteorites found on Earth is a chip off Vesta.',
      'The Dawn spacecraft orbited Vesta for a year before flying on to Ceres.',
    ],
  },
  {
    id: 'psyche', name: 'Psyche', emoji: '🔩', color: '#9FA6B2', glow: '#DDE3EE', secret: true,
    kind: 'metal', radius: 0.38, gravity: 0.015, spinSpeed: 0.9,
    place: { system: 'sol', orbit: 26.9, orbitSpeed: 0.47, phase: 5.6, tilt: 0.1 },
    fact: 'Psyche is a potato-shaped asteroid made mostly of metal — iron and nickel! It might be the leftover heart of a baby planet that lost its outside. A NASA spacecraft is on its way to see it.',
    chips: [
      ['📏 How big?', 'About 220 km across'],
      ['🔩 Made of', 'Mostly metal'],
      ['🚀 Visited by', 'Psyche spacecraft, arriving 2029'],
    ],
    funFacts: [
      'The Psyche spacecraft blasted off in October 2023 on a six-year trip.',
      'Psyche may look like a giant lumpy ball of shiny metal up close.',
      'It’s named after a Greek goddess whose name means “soul”.',
    ],
  },
  {
    id: 'bennu', name: 'Bennu', emoji: '💎', color: '#4B4B52', glow: '#A0A0B0', secret: true,
    kind: 'rock', radius: 0.28, spinSpeed: 1.6,
    place: { system: 'sol', orbit: 19.2, orbitSpeed: 0.92, phase: 2.2, tilt: 0.12 },
    fact: 'Bennu is a little asteroid shaped like a spinning top, made of loose rubble. A spacecraft called OSIRIS-REx tapped it, grabbed a handful of pebbles and flew them all the way back to Earth!',
    chips: [
      ['📏 How big?', 'About 500 m — small!'],
      ['🛰️ Sample home', 'September 2023'],
      ['🎯 Fun bonus', 'It sometimes spits out pebbles'],
    ],
    funFacts: [
      'Bennu’s rubble is so loose the spacecraft sank in like it was a ball pit.',
      'The sample landed in the Utah desert by parachute.',
      'Bennu is as tall as the Empire State Building.',
    ],
  },
  {
    id: 'ryugu', name: 'Ryugu', emoji: '🐢', color: '#3E3A38', glow: '#9A9088', secret: true,
    kind: 'rock', radius: 0.3, spinSpeed: 1.2,
    place: { system: 'sol', orbit: 20.6, orbitSpeed: 0.86, phase: 4.7, tilt: -0.1 },
    fact: 'Ryugu is a dark, diamond-shaped asteroid. Japan’s Hayabusa2 spacecraft dropped tiny hopping robots on it, shot it to make a crater, and brought a pinch of its dust home to Earth.',
    chips: [
      ['📏 How big?', 'About 900 m across'],
      ['🛰️ Sample home', 'December 2020'],
      ['🌑 Colour', 'Darker than charcoal'],
    ],
    funFacts: [
      'Ryugu means “Dragon Palace” — a magical castle under the sea in a Japanese story.',
      'Its dust turned out to be some of the oldest stuff in the solar system.',
      'The little hopping robots bounced because Ryugu’s pull is too weak for wheels.',
    ],
  },
  {
    id: 'apophis', name: 'Apophis', emoji: '🐍', color: '#6E6259', glow: '#B8A898', secret: true,
    kind: 'rock', radius: 0.26, spinSpeed: 1.0,
    place: { system: 'sol', orbit: 16.6, orbitSpeed: 1.05, phase: 1.4, tilt: 0.06 },
    fact: 'Apophis is a peanut-shaped asteroid that will zoom past Earth on Friday 13 April 2029 — closer than some satellites! Don’t worry, it will miss us, and people will be able to see it with their own eyes.',
    chips: [
      ['📏 How big?', 'About 340 m across'],
      ['📅 Close pass', '13 April 2029'],
      ['👀 Can we see it?', 'Yes — no telescope needed!'],
    ],
    funFacts: [
      'Apophis is named after an ancient Egyptian serpent of chaos.',
      'Scientists checked very carefully — it will safely miss Earth for at least 100 years.',
      'A spacecraft will ride along with Apophis during its 2029 visit to watch it wobble.',
    ],
  },
  {
    id: 'halley', name: 'Halley’s Comet', short: 'Halley', emoji: '☄️', color: '#CFE6F7', glow: '#9FD4FF', secret: true,
    kind: 'comet', radius: 0.32, spinSpeed: 0.6,
    place: { system: 'sol', a: 34, e: 0.76, orbitSpeed: 0.34, phase: 2.6, tilt: 0.28 },
    fact: 'Halley’s Comet is a dirty snowball the size of a city that swings past the Sun every 76 years or so, growing a huge glowing tail. Your grandparents may have seen it in 1986 — it comes back in 2061!',
    chips: [
      ['🔁 Comes back', 'About every 76 years'],
      ['📅 Next visit', '2061'],
      ['🧊 Made of', 'Ice, dust and rock'],
    ],
    funFacts: [
      'It was stitched into the Bayeux Tapestry after people saw it in the year 1066!',
      'Its tail always points away from the Sun, even when the comet is flying toward it.',
      'Edmond Halley worked out that it was the same comet returning again and again.',
      'Twice a year Earth flies through Halley’s dust and we get meteor showers.',
    ],
  },
  {
    id: 'arrokoth', name: 'Arrokoth', emoji: '⛄', color: '#C98A6B', glow: '#E8B090', secret: true,
    kind: 'snowman', radius: 0.34, spinSpeed: 0.5,
    place: { system: 'sol', orbit: 59, orbitSpeed: 0.11, phase: 0.3, tilt: 0.04 },
    fact: 'Arrokoth is a reddish snowman in the Kuiper Belt — two icy lumps stuck gently together. On New Year’s Day 2019 the New Horizons spacecraft flew past it, farther from Earth than anything ever explored.',
    chips: [
      ['📏 How big?', 'About 36 km long'],
      ['🛰️ Visited by', 'New Horizons, 1 Jan 2019'],
      ['🏆 Record', 'Farthest world ever explored up close'],
    ],
    funFacts: [
      'Arrokoth means “sky” in the Powhatan language.',
      'Its two lumps bumped together so softly they never squashed each other.',
      'Sunlight takes more than six hours to reach Arrokoth.',
    ],
  },
  {
    id: 'oumuamua', name: '‘Oumuamua', emoji: '🥖', color: '#8E6A4E', glow: '#D6A47A', secret: true,
    kind: 'cigar', radius: 0.3, spinSpeed: 0.8,
    place: { from: [180, 30, -110], to: [330, 45, -230], period: 240 },
    fact: '‘Oumuamua was the first visitor ever seen from another star! It zipped through our solar system in 2017, shaped like a long cigar or a flat pancake, then sped away into the dark forever.',
    chips: [
      ['🌌 From', 'Another star system'],
      ['📅 Spotted', 'October 2017'],
      ['📏 How big?', 'Maybe 100–400 m long'],
    ],
    funFacts: [
      '‘Oumuamua is Hawaiian for “a messenger from far away, arriving first”.',
      'It tumbles end over end as it flies.',
      'It sped up a tiny bit as it left, and scientists still argue about why.',
    ],
  },
  {
    id: 'borisov', name: 'Comet Borisov', short: 'Borisov', emoji: '🔭', color: '#BFE3F2', glow: '#8FD0F0', secret: true,
    kind: 'comet', radius: 0.28, spinSpeed: 0.7,
    place: { from: [60, 40, 300], to: [110, 70, 520], period: 300 },
    fact: 'Comet Borisov came from another star and was the first alien comet we ever saw with a tail. An amateur astronomer named Gennadiy Borisov spotted it in 2019 with a telescope he built himself!',
    chips: [
      ['🌌 From', 'Another star system'],
      ['📅 Spotted', 'August 2019'],
      ['🧑‍🔬 Found by', 'A hobby astronomer'],
    ],
    funFacts: [
      'Borisov looked a lot like the comets from our own solar system — so other stars have comets too.',
      'It was moving so fast the Sun could not catch it.',
      'The Hubble Space Telescope took its picture as it flew past.',
    ],
  },
  {
    id: 'atlas3i', name: '3I/ATLAS', emoji: '👴', color: '#D7CFE8', glow: '#B9A8E8', secret: true,
    kind: 'comet', radius: 0.3, spinSpeed: 0.5,
    place: { from: [-250, -5, -190], to: [-420, -20, -330], period: 280 },
    fact: '3I/ATLAS is the third visitor from another star, spotted in July 2025 by a sky survey called ATLAS. It might be the oldest comet anyone has ever seen — possibly older than the Sun itself!',
    chips: [
      ['🌌 From', 'Another star system'],
      ['📅 Spotted', '1 July 2025'],
      ['🎂 How old?', 'Maybe 7 billion years'],
    ],
    funFacts: [
      'It flew past Mars’s orbit in October 2025 while telescopes around the world watched.',
      '“3I” means it’s the third interstellar object ever found.',
      'It may have come from a thick, ancient part of our galaxy.',
    ],
  },
];

export const SECRET_IDS = SECRETS.map((s) => s.id);
