/* Planet data — sizes/distances are compressed for legibility,
   speeds keep the real relative ordering (Mercury fastest, etc.) */
export const BODIES = [
  {
    id: 'sun', name: 'The Sun', short: 'Sun', emoji: '☀️', color: '#FFC93C', glow: '#FF9F1C',
    radius: 5.2, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05,
    fact: 'The Sun is a giant ball of super-hot glowing gas. It gives every planet light and warmth. One million Earths could fit inside it!',
    chips: [
      ['🌡️ How hot?', 'SO hot — 5,500°C outside!'],
      ['📏 How big?', '109 Earths across'],
      ['⭐ What is it?', 'A star, not a planet'],
    ],
    funFacts: [
      'If the Sun were a beach ball, Earth would be a tiny pea next to it!',
      'Sunlight takes about 8 minutes to zoom all the way to Earth.',
      'The Sun is 4.6 billion years old — the oldest thing you have ever seen!',
      'Without the Sun, Earth would be a dark, frozen ball of ice.',
      'The Sun is only a middle-sized star — some stars are WAY bigger!',
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
    funFacts: [
      'One day on Mercury lasts longer than its whole year — how silly is that?',
      'Mercury is boiling hot in the daytime and freezing cold at night.',
      'Mercury is covered in craters, just like our Moon.',
      'You could jump almost three times higher on Mercury than on Earth!',
      'Mercury has no air, so its sky is black — even in the daytime!',
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
    funFacts: [
      'Venus is named after the Roman goddess of love and beauty.',
      'One day on Venus lasts longer than a whole year on Venus!',
      'Thick clouds wrap Venus like a big cozy blanket — that traps the heat in.',
      'Venus and Earth are almost the same size — like planet twins!',
      'It rains acid on Venus, but it is so hot the rain never reaches the ground!',
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
    funFacts: [
      'Earth is the only planet not named after a god or goddess.',
      'Earth spins super fast — about 1,600 km every hour — but you cannot feel it!',
      'More than 7 out of every 10 pieces of Earth are covered by ocean.',
      'Earth has a giant magnet inside that makes compasses point north.',
      'Earth is the only planet where water can be ice, puddles AND steam!',
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
    funFacts: [
      'Sunsets on Mars are BLUE!',
      'Mars has two little moons named Phobos and Deimos.',
      'Dust storms on Mars can cover the whole planet for weeks.',
      'Olympus Mons on Mars is three times taller than Mount Everest!',
      'Mars is red because its dirt has rust in it, like an old nail.',
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
    funFacts: [
      'Jupiter spins so fast that one day lasts only 10 hours!',
      'The Great Red Spot storm has been swirling for hundreds of years.',
      'Jupiter is like a big shield — it catches space rocks before they reach us.',
      'Jupiter’s moon Ganymede is bigger than the planet Mercury!',
      'Jupiter has rings too — but they are very faint and hard to see.',
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
    funFacts: [
      'Saturn’s rings are huge but super thin — like a giant space pancake!',
      'Some ring pieces are tiny like sand, others are as big as a bus!',
      'Saturn’s moon Titan has lakes and rivers — but not made of water!',
      'Winds on Saturn blow four times faster than the strongest hurricanes on Earth.',
      'Saturn is mostly made of gas — you could never stand on it!',
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
    funFacts: [
      'Uranus was the first planet ever found with a telescope.',
      'Each season on Uranus lasts 21 years — imagine 21 years of winter!',
      'Scientists think Uranus smells like rotten eggs. Pee-yew!',
      'Sunlight takes more than 2.5 hours to reach faraway Uranus.',
      'Uranus’s moons are named after characters from famous plays and poems.',
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
    funFacts: [
      'Neptune was found using math before anyone ever saw it in a telescope!',
      'Neptune’s big moon Triton flies around it backwards!',
      'Deep inside Neptune, it might rain sparkling diamonds!',
      'Neptune is 30 times farther from the Sun than Earth is.',
      'Neptune looks blue because of a gas in its air called methane.',
    ],
  },
  {
    id: 'pluto', name: 'Pluto', emoji: '🤍', color: '#E7CDB4', glow: '#E7CDB4',
    radius: 0.45, orbit: 56, orbitSpeed: 0.12, spinSpeed: 0.3, texture: 'rocky',
    base: '#D8B99B', speckle: '#A98868', inclination: 0.3,
    fact: 'Pluto is a dwarf planet — a small round world living in the icy Kuiper Belt. It even has a giant heart shape on its front!',
    chips: [
      ['🧊 What is it?', 'A dwarf planet'],
      ['❤️ Cute fact', 'It wears a giant heart'],
      ['🌙 Moons', 'Five! Charon is the biggest'],
    ],
    funFacts: [
      'Pluto is smaller than our Moon!',
      'One year on Pluto lasts 248 Earth years.',
      'Pluto has a huge heart-shaped glacier on its front.',
      'Sunlight takes more than 5 hours to reach Pluto.',
      'Pluto’s orbit is tilted and squished — sometimes it sneaks closer to the Sun than Neptune!',
    ],
  },
];

/* Non-planet wonders: shown in the scene and the picker, each with its own card.
   'comet' is a moving body; 'kuiper' and 'oort' fly the camera to a viewpoint. */
export const FEATURES = [
  {
    id: 'comet', name: 'The Comet', short: 'Comet', emoji: '☄️', color: '#BFEFFF', glow: '#BFEFFF',
    radius: 0.5,
    fact: 'Comets are giant snowballs of ice and dust. When one flies near the Sun, it warms up and grows a long, sparkly tail!',
    chips: [
      ['❄️ Made of', 'Ice, dust and rock'],
      ['💨 The tail', 'Always points away from the Sun'],
      ['🏠 Home', 'The Kuiper Belt and Oort Cloud'],
    ],
    funFacts: [
      'A comet’s tail can be millions of kilometres long!',
      'Comets grow two tails — one made of dust and one of glowing gas.',
      'Halley’s Comet visits Earth every 76 years — ask a grown-up if they saw it!',
      'Long ago, people thought comets brought good or bad luck.',
      'The word “comet” means long-haired star!',
    ],
  },
  {
    id: 'kuiper', name: 'Kuiper Belt', emoji: '🍩', color: '#A9D6F5', glow: '#A9D6F5',
    fact: 'Past Neptune lies the Kuiper Belt — a giant icy doughnut made of frozen chunks, sleeping comets and dwarf planets like Pluto.',
    chips: [
      ['🍩 Shape', 'A big doughnut ring'],
      ['🧊 Made of', 'Icy chunks and dwarf planets'],
      ['📍 Where?', 'Just past Neptune'],
    ],
    funFacts: [
      'The Kuiper Belt is where Pluto lives!',
      'A spaceship needs about 10 years to fly all the way there.',
      'Scientists think millions of icy chunks float out there.',
      'Comets that visit us often come zooming in from the Kuiper Belt.',
      'The New Horizons spacecraft flew through it and took amazing photos!',
    ],
  },
  {
    id: 'oort', name: 'Oort Cloud', emoji: '🫧', color: '#9FB8D8', glow: '#9FB8D8',
    fact: 'Wrapped around our WHOLE solar system is the Oort Cloud — a gigantic bubble of billions of sleepy icy snowballs, where comets are born.',
    chips: [
      ['🫧 Shape', 'A huge bubble around everything'],
      ['❄️ Made of', 'Billions of icy snowballs'],
      ['📍 Where?', 'The very edge of our solar system'],
    ],
    funFacts: [
      'The Oort Cloud is SO far away that no spacecraft has ever reached it.',
      'Some comets from the Oort Cloud visit us only once in thousands of years.',
      'It is named after an astronomer called Jan Oort.',
      'Sunlight out there is thousands of times dimmer than on Earth.',
      'It might hold TRILLIONS of icy chunks!',
    ],
  },
];

/* Everything that can be selected and shown on a card */
export const CARDS = [...BODIES, ...FEATURES];
