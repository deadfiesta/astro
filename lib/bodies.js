/* Planet data — sizes/distances are compressed for legibility,
   speeds keep the real relative ordering (Mercury fastest, etc.) */
export const BODIES = [
  {
    id: 'sun', name: 'The Sun', short: 'Sun', emoji: '☀️', color: '#FFC93C', glow: '#FF9F1C',
    radius: 5.2, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05, gravity: 27.9,
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
    radius: 0.62, orbit: 10, orbitSpeed: 1.6, spinSpeed: 0.15, texture: 'rocky', gravity: 0.38,
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
    radius: 0.95, orbit: 13.5, orbitSpeed: 1.17, spinSpeed: -0.04, texture: 'venus', gravity: 0.9,
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
    radius: 1.0, orbit: 17.5, orbitSpeed: 1.0, spinSpeed: 0.5, texture: 'earth', gravity: 1.0,
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
    radius: 0.75, orbit: 22, orbitSpeed: 0.8, spinSpeed: 0.48, texture: 'rocky', gravity: 0.38,
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
    radius: 2.9, orbit: 29, orbitSpeed: 0.44, spinSpeed: 0.9, texture: 'jupiter', gravity: 2.53, gas: true,
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
    radius: 2.5, orbit: 36, orbitSpeed: 0.33, spinSpeed: 0.85, texture: 'saturn', gravity: 1.07, gas: true,
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
    radius: 1.7, orbit: 42, orbitSpeed: 0.23, spinSpeed: 0.6, texture: 'ice', gravity: 0.89, gas: true,
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
    radius: 1.65, orbit: 47.5, orbitSpeed: 0.18, spinSpeed: 0.62, texture: 'ice', gravity: 1.14, gas: true,
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
    radius: 0.45, orbit: 56, orbitSpeed: 0.12, spinSpeed: 0.3, texture: 'rocky', gravity: 0.06,
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

/* Earth's Moon — built inside Earth's system in the scene, but selectable
   and documented just like a planet. */
export const MOON = {
  id: 'moon', name: 'The Moon', short: 'Moon', emoji: '🌙', color: '#C9C4BC', glow: '#C9C4BC',
  radius: 0.27, gravity: 0.17,
  fact: 'The Moon is Earth’s best friend in space! It circles our planet and seems to change shape in our sky — from a thin smile to a big bright circle.',
  chips: [
    ['🚶 Visitors', '12 astronauts walked on it'],
    ['🎂 One lap', 'Circles Earth every 27 days'],
    ['🦘 Jumping', 'You could jump 6 times higher!'],
  ],
  funFacts: [
    'The Moon makes the ocean tides go up and down!',
    'Astronaut footprints on the Moon will last millions of years — there is no wind to blow them away!',
    'The Moon is slowly drifting away from Earth — about 4 cm every year.',
    'The same side of the Moon always faces Earth — we never see its back from home!',
    'The Moon has “seas” with beautiful names, but they are made of old lava, not water.',
  ],
};

/* Non-planet wonders: shown in the scene and the picker, each with its own card.
   'kuiper' and 'oort' fly the camera to a viewpoint instead of following a body. */
export const FEATURES = [
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

/* ============ Neighboring star systems ============ */

export const PROXIMA_BODIES = [
  {
    id: 'proxima', name: 'Proxima Centauri', short: 'Proxima', emoji: '🔴', color: '#FF6B4A', glow: '#FF6B4A',
    radius: 2.0, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05, gravity: 143,
    starColors: ['#FF8A5C', '#F25430', '#C93A18'], glowTint: '#FF6B4A',
    fact: 'Proxima Centauri is the Sun’s nearest neighbor star! It is a small red dwarf that glows soft red and will keep shining for trillions of years.',
    chips: [
      ['📍 How far?', '4.2 light-years away'],
      ['🔴 What is it?', 'A small red dwarf star'],
      ['⏳ Lifespan', 'Trillions of years'],
    ],
    funFacts: [
      'Light from Proxima takes more than 4 years to reach us!',
      'It is only about an eighth as wide as our Sun.',
      'Sometimes it burps out huge flares and suddenly gets brighter!',
      'Even in our fastest rocket, the trip there would take thousands of years.',
    ],
  },
  {
    id: 'prox-d', name: 'Proxima d', emoji: '🪨', color: '#C9A886', glow: '#C9A886',
    radius: 0.5, orbit: 6.5, orbitSpeed: 1.8, spinSpeed: 0.3, texture: 'rocky',
    base: '#B99873', speckle: '#8A6D50', gravity: 0.45,
    fact: 'Proxima d is a tiny planet, lighter than Earth, zipping super close around its red star — one of the smallest planets ever found!',
    chips: [
      ['🎂 One year', 'Only 5 Earth days'],
      ['🐜 Size', 'One of the tiniest exoplanets'],
      ['🏎️ Speedy', 'Zips around its star super fast'],
    ],
    funFacts: [
      'A year there is shorter than a school week!',
      'It weighs only about a quarter of what Earth weighs.',
      'It was found by watching its star wobble ever so slightly.',
    ],
  },
  {
    id: 'prox-b', name: 'Proxima b', emoji: '🌏', color: '#5FA8D3', glow: '#5FA8D3',
    radius: 1.05, orbit: 10, orbitSpeed: 1.2, spinSpeed: 0.4, texture: 'rocky',
    base: '#6FA3C8', speckle: '#3E6B8C', gravity: 1.1,
    fact: 'Proxima b is the closest planet outside our solar system! It is rocky like Earth and sits in the “just right” zone where water could be liquid.',
    chips: [
      ['🎂 One year', 'Just 11 Earth days'],
      ['🌍 Size', 'A little bigger than Earth'],
      ['🔒 Fun spin', 'One side may always face its star'],
    ],
    funFacts: [
      'If you lived there, you would have a birthday every 11 days!',
      'One side might be always day, and the other always night.',
      'Scientists dream of sending tiny light-sail spaceships to visit it.',
      'Its red star would look three times bigger in the sky than our Sun does.',
    ],
  },
];

const TRAPPIST_PLANETS = [
  ['tr-b', 'TRAPPIST-1b', '#E0764A', 6.0, 1.9, 0.95, 1.1, '1.5 Earth days', 'Closest and warmest of the seven',
    'TRAPPIST-1b is the closest of the seven sisters — a warm rocky world hugging its little red star.',
    ['A year here lasts just a day and a half!', 'It probably glows warm like a fresh cookie.', 'It may have no air at all.']],
  ['tr-c', 'TRAPPIST-1c', '#E8A45C', 7.6, 1.6, 1.0, 1.1, '2.4 Earth days', 'Might have volcanoes',
    'TRAPPIST-1c is a warm rocky world that might rumble with volcanoes.',
    ['A year lasts less than two and a half days!', 'It is almost exactly Earth-sized.', 'Its sky might glow orange from its red star.']],
  ['tr-d', 'TRAPPIST-1d', '#EBC97E', 9.2, 1.35, 0.8, 0.62, '4 Earth days', 'Small and light',
    'TRAPPIST-1d is a small, light world — maybe with a sliver of ocean at the edge between its day and night sides.',
    ['It weighs less than half of Earth.', 'Its best weather might be at sunrise — forever!', 'A year is only 4 days long.']],
  ['tr-e', 'TRAPPIST-1e', '#5FBF8F', 10.8, 1.15, 0.92, 0.82, '6 Earth days', 'Best bet for oceans!',
    'TRAPPIST-1e is the star of the family! Of all seven, it is the most likely to have oceans and gentle weather — a real water-world candidate.',
    ['Scientists made travel posters for this planet!', 'It could have oceans like Earth.', 'The other six planets would look huge in its sky.']],
  ['tr-f', 'TRAPPIST-1f', '#5FA8D3', 12.4, 1.0, 1.04, 0.95, '9 Earth days', 'A cool ocean candidate',
    'TRAPPIST-1f is a cool world that might be wrapped in a deep, deep ocean under cloudy skies.',
    ['It might be an ocean hundreds of kilometres deep!', 'It gets about as much light as chilly Mars.', 'A year lasts 9 days.']],
  ['tr-g', 'TRAPPIST-1g', '#6F86D6', 14.0, 0.85, 1.1, 1.03, '12 Earth days', 'Biggest of the seven',
    'TRAPPIST-1g is the big sibling — the largest of the seven, possibly with a thick cozy atmosphere.',
    ['It is the biggest of the TRAPPIST-1 family.', 'It might have a blanket-thick atmosphere.', 'From here the star looks dim and red, like a campfire.']],
  ['tr-h', 'TRAPPIST-1h', '#9FB8D8', 15.6, 0.72, 0.76, 0.57, '19 Earth days', 'Smallest and coldest',
    'TRAPPIST-1h is the little one at the edge — the smallest and coldest of the seven, probably wrapped in ice.',
    ['It is probably covered in sparkling ice.', 'It gets the least starlight of the whole family.', 'It is smaller than Earth but bigger than the Moon.']],
];

export const TRAPPIST_BODIES = [
  {
    id: 'trappist', name: 'TRAPPIST-1', short: 'TRAPPIST-1', emoji: '🌟', color: '#FF5F45', glow: '#FF5F45',
    radius: 2.2, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05, gravity: 175,
    starColors: ['#FF7A50', '#E8452A', '#B22C12'], glowTint: '#FF5F45',
    fact: 'TRAPPIST-1 is a tiny, cool red star with SEVEN Earth-sized planets — the biggest family of Earth-sized worlds ever found!',
    chips: [
      ['👨‍👩‍👧‍👦 Family', '7 Earth-sized planets'],
      ['📏 Size', 'Barely bigger than Jupiter'],
      ['📍 How far?', '40 light-years away'],
    ],
    funFacts: [
      'All 7 planets would fit inside Mercury’s orbit with room to spare!',
      'From one planet you could see the others as big as our Moon in the sky.',
      'It is named after a telescope in Chile called TRAPPIST.',
      'Three of its planets might have oceans!',
    ],
  },
  ...TRAPPIST_PLANETS.map(([id, name, color, orbit, orbitSpeed, radius, gravity, year, quirk, fact, funFacts]) => ({
    id, name, emoji: '🪐', color, glow: color,
    radius, orbit, orbitSpeed, spinSpeed: 0.4, texture: 'rocky',
    base: color, speckle: '#5A4638', gravity,
    fact,
    chips: [
      ['🎂 One year', year],
      ['🌍 Size', 'About Earth-sized'],
      ['✨ Special', quirk],
    ],
    funFacts,
  })),
];

export const CANCRI_BODIES = [
  {
    id: 'cancri', name: '55 Cancri', short: '55 Cancri', emoji: '💛', color: '#FFC93C', glow: '#FF9F1C',
    radius: 4.5, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05, gravity: 27,
    fact: 'The star 55 Cancri, also called Copernicus, is a sun-like star with five planets — including a world that might sparkle with diamonds!',
    chips: [
      ['📍 How far?', '41 light-years away'],
      ['🌞 Sun twin?', 'A lot like our Sun'],
      ['🪐 Planets', 'Five of them!'],
    ],
    funFacts: [
      'On a dark night you can see this star without a telescope!',
      'Its planets were among the first ever found around another star.',
      'It has a buddy — a small red star circles far away with it.',
    ],
  },
  {
    id: 'cnc-e', name: 'Janssen', emoji: '💎', color: '#FF5A2D', glow: '#FF5A2D',
    radius: 1.25, orbit: 7, orbitSpeed: 1.9, spinSpeed: 0.5, texture: 'rocky',
    base: '#FF5A2D', speckle: '#8A1E00', gravity: 2.2,
    fact: 'Janssen is a super-Earth SO hot that its surface is an ocean of glowing lava! Deep inside, it might even be packed with sparkling diamond.',
    chips: [
      ['🌋 Surface', 'A sea of glowing lava'],
      ['🎂 One year', 'Only 18 HOURS'],
      ['💎 Maybe...', 'A diamond heart inside'],
    ],
    funFacts: [
      'A whole year passes there in less than one Earth day!',
      'It is about twice as wide as Earth and eight times heavier.',
      'Its lava seas might glow like a giant birthday candle.',
    ],
  },
  {
    id: 'cnc-b', name: 'Galileo', emoji: '🟠', color: '#E8A45C', glow: '#E8A45C',
    radius: 2.5, orbit: 13, orbitSpeed: 1.0, spinSpeed: 0.8, texture: 'jupiter', gravity: 2.0, gas: true,
    fact: 'Galileo is a big gas planet snuggled close to its star — a “hot Jupiter” that races around in just two weeks.',
    chips: [
      ['🎂 One year', 'About 15 Earth days'],
      ['🎈 What is it?', 'A hot gas giant'],
      ['🚫 Careful', 'No ground to stand on!'],
    ],
    funFacts: [
      'It races around its star in just two weeks.',
      'Its air is puffed up by the heat like a toasted marshmallow.',
      'It is named after the famous astronomer Galileo.',
    ],
  },
  {
    id: 'cnc-f', name: 'Harriot', emoji: '🩵', color: '#7ED4DC', glow: '#7ED4DC',
    radius: 2.0, orbit: 20, orbitSpeed: 0.5, spinSpeed: 0.6, texture: 'ice',
    base: '#7ED4DC', speckle: '#4FA8B8', gravity: 1.0, gas: true,
    fact: 'Harriot is a cool gas planet in the “just right” zone of its star — if it has big moons, they could have lakes and rain!',
    chips: [
      ['🎂 One year', 'About 260 Earth days'],
      ['🎯 Location', 'In the “just right” zone'],
      ['🌙 Maybe...', 'Moons with lakes!'],
    ],
    funFacts: [
      'A year there is about 260 days — not so different from ours!',
      'Its moons might have splashy rainy weather.',
      'It is named after Thomas Harriot, who drew the Moon before almost anyone.',
    ],
  },
];

export const KEPLER16_BODIES = [
  {
    id: 'kep16a', name: 'Kepler-16A', short: 'Kepler-16A', emoji: '🌅', color: '#FFB05C', glow: '#FFAB4D',
    radius: 3.4, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05, gravity: 25,
    starColors: ['#FFC978', '#FF9F3C', '#E07818'], glowTint: '#FFAB4D',
    fact: 'Kepler-16A is the bigger of TWO suns that share this system — planets here get double sunrises and double sunsets!',
    chips: [
      ['🌞 Sun buddy', 'It has a partner star!'],
      ['📏 Size', 'A bit smaller than our Sun'],
      ['📍 How far?', '200 light-years away'],
    ],
    funFacts: [
      'It dances in circles with its partner star, forever!',
      'Standing here you would cast TWO shadows.',
      'Astronomers call two-sun families “binary stars”.',
    ],
  },
  {
    id: 'kep16b-star', name: 'Kepler-16B', short: 'Kepler-16B', emoji: '🔴', color: '#FF6B4A', glow: '#FF6B4A',
    radius: 1.4, orbit: 6, orbitSpeed: 0.9, spinSpeed: 0.05, gravity: 106, star: true,
    starColors: ['#FF8A5C', '#F25430', '#C93A18'], glowTint: '#FF6B4A',
    fact: 'Kepler-16B is the little red partner sun — it circles its big orange friend, and together they light up the whole system.',
    chips: [
      ['🔴 What is it?', 'A small red dwarf star'],
      ['🤝 Team', 'It orbits its partner star'],
      ['🎨 Color', 'Glows a soft red'],
    ],
    funFacts: [
      'It is the smaller of the two suns — but still a real star!',
      'The two suns circle each other every 41 days.',
      'From the planet it looks like a little red eye beside the big sun.',
    ],
  },
  {
    id: 'kep16b', name: 'Kepler-16b', emoji: '🌅', color: '#D9B26A', glow: '#D9B26A',
    radius: 1.9, orbit: 14, orbitSpeed: 0.5, spinSpeed: 0.6, texture: 'saturn', gas: true, gravity: 1.0,
    fact: 'Kepler-16b is the famous “Tatooine” planet — it circles TWO suns at once! Every evening it gets a double sunset.',
    chips: [
      ['🌞🌞 Suns', 'TWO of them!'],
      ['🎬 Just like', 'Tatooine from Star Wars'],
      ['🎈 What is it?', 'A chilly gas planet'],
    ],
    funFacts: [
      'Scientists nicknamed it Tatooine after the Star Wars planet!',
      'If you visited, you would watch two sunsets every evening.',
      'It was the first planet ever confirmed circling two stars.',
    ],
  },
];

export const HD189_BODIES = [
  {
    id: 'hd189', name: 'HD 189733', short: 'HD 189733', emoji: '🌧️', color: '#FFB27A', glow: '#FFA85C',
    radius: 3.8, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05, gravity: 30,
    starColors: ['#FFCE8C', '#FFA050', '#E67828'], glowTint: '#FFA85C',
    fact: 'HD 189733 is an orange star famous for one wild planet — a beautiful blue world with the scariest weather ever found.',
    chips: [
      ['📍 How far?', '64 light-years away'],
      ['🎨 Color', 'A warm orange star'],
      ['🌟 Famous for', 'The glass-rain planet'],
    ],
    funFacts: [
      'In our sky it sits right beside the famous Dumbbell Nebula.',
      'It is a little smaller and cooler than our Sun.',
      'It has a tiny red buddy star circling far away.',
    ],
  },
  {
    id: 'hd189b', name: 'HD 189733 b', emoji: '🌧️', color: '#2E5BFF', glow: '#2E5BFF',
    radius: 2.6, orbit: 9, orbitSpeed: 1.4, spinSpeed: 0.8, texture: 'ice',
    base: '#2E5BFF', speckle: '#1A3ACC', gas: true, gravity: 2.2,
    fact: 'HD 189733 b looks like a gorgeous blue marble — but don’t visit! Its wind blows faster than sound, and its rain is made of GLASS, falling sideways!',
    chips: [
      ['🌧️ Weather', 'Sideways GLASS rain!'],
      ['💨 Wind', '7x faster than sound'],
      ['💙 Color', 'Deep cobalt blue'],
    ],
    funFacts: [
      'Its lovely blue color comes from tiny glass droplets in the clouds.',
      'The wind blows 8,700 km every hour!',
      'It is so close to its star that a year lasts just 2 days.',
    ],
  },
];

export const PEG51_BODIES = [
  {
    id: 'peg51', name: '51 Pegasi', short: '51 Pegasi', emoji: '🏆', color: '#FFD54A', glow: '#FF9F1C',
    radius: 4.6, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05, gravity: 25,
    fact: '51 Pegasi is a golden star a lot like our Sun — and it made history: the first sun-like star ever found to have its own planet!',
    chips: [
      ['🏆 Famous!', 'First exoplanet found here (1995)'],
      ['📍 How far?', '50 light-years away'],
      ['🥇 Prize', 'The discovery won a Nobel Prize'],
    ],
    funFacts: [
      'The astronomers who found its planet won the Nobel Prize!',
      'Before 1995, nobody knew if other suns had planets at all.',
      'You can spot this star with just a pair of binoculars.',
    ],
  },
  {
    id: 'peg51b', name: 'Dimidium', emoji: '🏆', color: '#E8A45C', glow: '#E8A45C',
    radius: 2.7, orbit: 8, orbitSpeed: 1.5, spinSpeed: 0.8, texture: 'jupiter', gas: true, gravity: 1.6,
    fact: 'Dimidium was the FIRST planet ever discovered around another sun-like star! It is a hot gas giant hugging its star super closely.',
    chips: [
      ['🥇 History', 'The first exoplanet ever found'],
      ['🎂 One year', 'Only 4 Earth days'],
      ['🔥 What is it?', 'A “hot Jupiter”'],
    ],
    funFacts: [
      'Its discovery proved our solar system is not alone!',
      'Its name means “half” — it weighs about half of Jupiter.',
      'It is so hot that its air could melt aluminium.',
    ],
  },
];

export const KEPLER452_BODIES = [
  {
    id: 'kep452', name: 'Kepler-452', short: 'Kepler-452', emoji: '🌱', color: '#FFD54A', glow: '#FF9F1C',
    radius: 4.8, orbit: 0, orbitSpeed: 0, spinSpeed: 0.05, gravity: 27,
    fact: 'Kepler-452 is almost a twin of our Sun — just a little older and brighter. Looking at it is like peeking at our Sun’s future!',
    chips: [
      ['👴 Age', '1.5 billion years older than our Sun'],
      ['🌞 Type', 'A sun-like star'],
      ['📍 How far?', '1,800 light-years away'],
    ],
    funFacts: [
      'It shows us what our Sun might look like one day.',
      'It is one of the most Sun-like stars with a known planet.',
      'Its light left the star before castles were built on Earth!',
    ],
  },
  {
    id: 'kep452b', name: 'Kepler-452b', emoji: '🌱', color: '#5FBF8F', glow: '#5FBF8F',
    radius: 1.5, orbit: 16, orbitSpeed: 0.9, spinSpeed: 0.45, texture: 'rocky',
    base: '#5FBF8F', speckle: '#3A8A62', gravity: 1.9,
    fact: 'Kepler-452b is nicknamed “Earth’s cousin” — a bigger Earth in the just-right zone where water could flow. Its year is almost like ours: 385 days!',
    chips: [
      ['👨‍👩‍👧 Nickname', 'Earth’s cousin'],
      ['🎂 One year', '385 days — almost like ours!'],
      ['📏 Size', '1.5x wider than Earth'],
    ],
    funFacts: [
      'Its year is only 20 days longer than Earth’s!',
      'You would weigh nearly twice as much there.',
      'If plants grew there, they would enjoy sunshine a lot like ours.',
    ],
  },
];

/* The galaxy map: each system is an island in the same 3D scene */
export const SYSTEMS = [
  {
    id: 'sol', name: 'Our Solar System', short: 'Our Sun', emoji: '☀️', center: [0, 0, 0], bodies: BODIES, ly: 0,
    description: 'Our home! One golden star, eight planets, a lovely Moon, dwarf friends, and belts of icy rubble.',
  },
  {
    id: 'proxima', name: 'Proxima Centauri', short: 'Proxima', emoji: '🔴', center: [620, 30, -420], bodies: PROXIMA_BODIES, ly: 4.2,
    description: 'The Sun’s closest neighbor — a little red star just 4 light-years away, with the nearest planets outside our solar system.',
  },
  {
    id: 'trappist', name: 'TRAPPIST-1', short: 'TRAPPIST-1', emoji: '🌟', center: [-680, -40, -520], bodies: TRAPPIST_BODIES, ly: 40,
    description: 'A tiny, cool red star hugged by SEVEN Earth-sized planets — the biggest family of little worlds we know.',
  },
  {
    id: 'cancri', name: '55 Cancri', short: '55 Cancri', emoji: '💎', center: [150, 80, 800], bodies: CANCRI_BODIES, ly: 41,
    description: 'A sun-like star with five planets — including a lava world that might sparkle with diamonds.',
  },
  {
    id: 'kepler16', name: 'Kepler-16', short: 'Two Suns', emoji: '🌅', center: [-150, -60, -950], bodies: KEPLER16_BODIES, ly: 200,
    description: 'The two-sun system! A big orange sun and a little red one dance together, and their planet gets double sunsets.',
  },
  {
    id: 'hd189733', name: 'HD 189733', short: 'Glass Rain', emoji: '🌧️', center: [900, -30, 300], bodies: HD189_BODIES, ly: 64,
    description: 'Home of a beautiful deep-blue planet with the wildest weather ever found — glass rain blowing sideways!',
  },
  {
    id: 'peg51', name: '51 Pegasi', short: '51 Pegasi', emoji: '🏆', center: [-950, 50, 200], bodies: PEG51_BODIES, ly: 50,
    description: 'A golden star that made history — the first planet around another sun was discovered right here in 1995.',
  },
  {
    id: 'kepler452', name: 'Kepler-452', short: "Earth's Cousin", emoji: '🌱', center: [450, 100, -900], bodies: KEPLER452_BODIES, ly: 1800,
    description: 'An older twin of our Sun, home to Earth’s cousin — a bigger Earth with a year almost like ours.',
  },
];

/* Everything that can be selected and shown on a card */
export const CARDS = [
  ...BODIES, MOON, ...FEATURES,
  ...PROXIMA_BODIES, ...TRAPPIST_BODIES, ...CANCRI_BODIES,
  ...KEPLER16_BODIES, ...HD189_BODIES, ...PEG51_BODIES, ...KEPLER452_BODIES,
];
