/* Planet data — sizes/distances are compressed for legibility,
   speeds keep the real relative ordering (Mercury fastest, etc.) */
export const BODIES = [
  {
    id: 'sun', name: 'The Sun', emoji: '☀️', color: '#FFC93C', glow: '#FF9F1C',
    radius: 5.2, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05,
    fact: 'The Sun is a giant ball of super-hot glowing gas. It gives every planet light and warmth. One million Earths could fit inside it!',
    chips: [
      ['🌡️ How hot?', 'SO hot — 5,500°C outside!'],
      ['📏 How big?', '109 Earths across'],
      ['⭐ What is it?', 'A star, not a planet'],
    ],
  },
  {
    id: 'mercury', name: 'Mercury', emoji: '🪨', color: '#C9A886', glow: '#C9A886',
    radius: 0.62, orbit: 10, orbitSpeed: 1.6, spinSpeed: 0.15, texture: 'rocky',
    base: '#B99873', speckle: '#8A6D50',
    fact: 'Mercury is the smallest planet and the closest to the Sun. It zooms around the Sun faster than any other planet — like a race car!',
    chips: [
      ['🎂 One year', 'Just 88 Earth days'],
      ['📏 How big?', 'A bit bigger than our Moon'],
      ['🌙 Moons', 'None at all'],
    ],
  },
  {
    id: 'venus', name: 'Venus', emoji: '🌕', color: '#F0C066', glow: '#F0C066',
    radius: 0.95, orbit: 13.5, orbitSpeed: 1.17, spinSpeed: -0.04, texture: 'venus',
    base: '#EFC97E', speckle: '#D9A144',
    fact: 'Venus is the hottest planet of all — even hotter than an oven! It spins backwards, so the Sun rises in the west there.',
    chips: [
      ['🌡️ How hot?', 'Hottest planet: 465°C!'],
      ['🔄 Fun spin', 'It spins backwards'],
      ['✨ At night', 'Brightest “star” in our sky'],
    ],
  },
  {
    id: 'earth', name: 'Earth', emoji: '🌍', color: '#4DA6FF', glow: '#4DA6FF',
    radius: 1.0, orbit: 17.5, orbitSpeed: 1.0, spinSpeed: 0.5, texture: 'earth',
    hasMoon: true,
    fact: 'Earth is our home! It is the only planet we know with animals, plants and people. It looks like a beautiful blue marble from space.',
    chips: [
      ['🏡 Home sweet home', 'The only planet with life'],
      ['💧 Water world', 'Mostly covered in oceans'],
      ['🌙 Moons', 'One lovely Moon'],
    ],
  },
  {
    id: 'mars', name: 'Mars', emoji: '🔴', color: '#E0533D', glow: '#E0533D',
    radius: 0.75, orbit: 22, orbitSpeed: 0.8, spinSpeed: 0.48, texture: 'rocky',
    base: '#D95B3C', speckle: '#A33A22',
    fact: 'Mars is the red planet — its dusty ground is rusty, like an old bicycle! It has the tallest volcano in the whole solar system.',
    chips: [
      ['🤖 Visitors', 'Robot rovers drive on it'],
      ['🌋 Wow!', 'Tallest volcano anywhere'],
      ['🌙 Moons', 'Two tiny potato-shaped moons'],
    ],
  },
  {
    id: 'jupiter', name: 'Jupiter', emoji: '🟠', color: '#E8A45C', glow: '#E8A45C',
    radius: 2.9, orbit: 29, orbitSpeed: 0.44, spinSpeed: 0.9, texture: 'jupiter',
    fact: 'Jupiter is the BIGGEST planet — more than 1,300 Earths could fit inside! Its Great Red Spot is a storm bigger than our whole planet.',
    chips: [
      ['👑 King size', 'Biggest planet of all'],
      ['🌀 Red Spot', 'A giant swirling storm'],
      ['🌙 Moons', '95 moons and counting!'],
    ],
  },
  {
    id: 'saturn', name: 'Saturn', emoji: '🪐', color: '#EFCB8A', glow: '#EFCB8A',
    radius: 2.5, orbit: 36, orbitSpeed: 0.33, spinSpeed: 0.85, texture: 'saturn',
    hasRings: true,
    fact: 'Saturn wears beautiful rings made of billions of pieces of sparkling ice and rock. It is so light it could float in a giant bathtub!',
    chips: [
      ['💍 Famous rings', 'Made of ice and rock'],
      ['🛁 Silly fact', 'It could float on water'],
      ['🌙 Moons', 'Nearly 150 moons!'],
    ],
  },
  {
    id: 'uranus', name: 'Uranus', emoji: '🩵', color: '#7EE0E6', glow: '#7EE0E6',
    radius: 1.7, orbit: 42, orbitSpeed: 0.23, spinSpeed: 0.6, texture: 'ice',
    base: '#8FE3E8', speckle: '#5FC9D4', tilted: true,
    fact: 'Uranus rolls around the Sun on its side, like a rolling ball! It is an ice giant and it looks lovely and blue-green.',
    chips: [
      ['🎳 Fun spin', 'It rolls on its side'],
      ['🥶 Brrr!', 'Coldest planet: −224°C'],
      ['💍 Surprise', 'It has faint rings too'],
    ],
  },
  {
    id: 'neptune', name: 'Neptune', emoji: '🔵', color: '#4A6CF7', glow: '#4A6CF7',
    radius: 1.65, orbit: 47.5, orbitSpeed: 0.18, spinSpeed: 0.62, texture: 'ice',
    base: '#4A6CF7', speckle: '#2E4BD8',
    fact: 'Neptune is the farthest planet from the Sun, deep blue and very cold. Its winds are the fastest anywhere — faster than a jet plane!',
    chips: [
      ['💨 Windy!', 'Fastest winds of any planet'],
      ['🎂 One year', '165 Earth years long'],
      ['🔭 Far away', 'You need a telescope to see it'],
    ],
  },
];
