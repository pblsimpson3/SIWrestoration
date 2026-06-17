import { Role, Quote } from './types';

export const ROLES: Record<string, Role> = {
  archaeologist: {
    id: 'archaeologist',
    name: 'Industrial Archaeologist',
    quadrant: 1,
    iconName: 'Pickaxe',
    shortTitle: 'The Excavator',
    description: 'Industrial Archaeologist - One who studies the material culture of the past, with a focus on the remains of industry, including the technology, transport and buildings associated with manufacture or raw material production. Industrial archaeology involves the painstaking analysis of physical remains, with emphasis on industrial processes.'
  },
  historian: {
    id: 'historian',
    name: '20th Century Historian',
    quadrant: 2,
    iconName: 'BookOpen',
    shortTitle: 'The Researcher',
    description: '20th Century Historian – One, living in the mid 1900s, who researches, analyzes and explains past events, people and their endeavors, and studies and preserves archival materials and artifacts.'
  },
  worker: {
    id: 'worker',
    name: '1950s Iron/Steel Worker',
    quadrant: 3,
    iconName: 'Hammer',
    shortTitle: 'The Builder',
    description: '1950s Iron/Steel Worker – One, who, in the 1950s, works in an ironworks, builds steel structures, or makes products of iron or steel while employed in the largest industrial labor union in North America. (The steel industry is often considered to be an indicator of economic progress)'
  },
  descendant: {
    id: 'descendant',
    name: '1630s Descendant',
    quadrant: 4,
    iconName: 'History',
    shortTitle: 'The Advocate',
    description: '1630s Descendant – One who lives in the 1950s and is the offspring (e.g. a child, a grandchild, a great grandchild, etc.) of someone from 1630s New England'
  }
};

export const QUOTES: Quote[] = [
  {
    id: 1,
    text: "“The centuries passed, the Iron Works became only a memory…until the proverbial New England conscience was awakened. (Who was the descendant of the 1630s settler?)\"",
    startTime: 54,
    endTime: 81,
    primarySpeaker: "Narrator referring to Louise Hawkes",
    associatedRoles: ['descendant', 'historian'],
    hint: "This quote directly mentions physical lineage to early settler families who saved the home from demolition."
  },
  {
    id: 2,
    text: "“Yet, here to the knowing eye, was the slag pile, and beneath the top soil, there must be other evidences of the past.”",
    startTime: 144,
    endTime: 152,
    primarySpeaker: "Narrator introducing excavation site",
    associatedRoles: ['archaeologist'],
    hint: "Focuses on identifying industrial waste (slag pile) on the surface, indicating hidden subterranean ruins."
  },
  {
    id: 3,
    text: "“Sensing the importance of the project the American Iron and Steel Institute agreed to underwrite…MIT professor E.L. Hartley was enlisted to search for facts and figures...”",
    startTime: 174,
    endTime: 192,
    primarySpeaker: "Narrator explaining research support",
    associatedRoles: ['historian'],
    hint: "Focuses on searching books, public registries, and old letters to find archival evidence."
  },
  {
    id: 4,
    text: "“Only a foot below the surface was found the 500lb iron hammerhead…”",
    startTime: 232,
    endTime: 237,
    primarySpeaker: "Narrator describing discovery",
    associatedRoles: ['archaeologist', 'worker'],
    hint: "The literal, painstaking unearthing of heavy machinery of the Saugus historic forge."
  },
  {
    id: 5,
    text: "“Here was the iron head used to beat out iron for the first American homes, iron to dig with, iron to saw with, iron hatchets, pliers, spikes, weights, cannonballs hammerheads and wedges”",
    startTime: 244,
    endTime: 271,
    primarySpeaker: "Narrator enumerating iron artifacts found",
    associatedRoles: ['archaeologist', 'worker', 'historian'],
    hint: "Cataloging the manufactured products of pure 17th century metal metallurgy."
  },
  {
    id: 6,
    text: "“Tradition and fact are often world’s apart. So, a spectroanalysis was made and both the iron in the pot and the iron found at the iron works… Tradition was fact!”",
    startTime: 287,
    endTime: 303,
    primarySpeaker: "Narrator describing spectrography test",
    associatedRoles: ['archaeologist', 'historian'],
    hint: "Using exact laboratory science to authenticate if colonial stories correlate to physical material composition."
  },
  {
    id: 7,
    text: "“Archaeology is an exacting science. Great care must be taken or the story of the earth has to tell may be forever lost.”",
    startTime: 305,
    endTime: 312,
    primarySpeaker: "Narrator detailing technique",
    associatedRoles: ['archaeologist'],
    hint: "Describes the methodical, slow precision required when unearthing fragile soil and timber remnants."
  },
  {
    id: 8,
    text: "“The wall of the test trench gives a cross section of history”",
    startTime: 338,
    endTime: 342,
    primarySpeaker: "Narrator detailing stratification layers",
    associatedRoles: ['archaeologist'],
    hint: "Deciphering layered dirt chronologies (stratigraphy) to date artifacts."
  },
  {
    id: 9,
    text: "“The age of each level is determined by a study of the artifacts which are found, like this shovel, a colonial shoe, a metal spoon, a piece of pottery, Indian relics.”",
    startTime: 362,
    endTime: 385,
    primarySpeaker: "Narrator on dating artifacts found on levels",
    associatedRoles: ['archaeologist', 'historian'],
    hint: "Typology and stylistic dating of domestic daily-use objects."
  },
  {
    id: 10,
    text: "“…. a dramatic tribute to American pioneers of the Iron and Steel Industry.”",
    startTime: 478,
    endTime: 483,
    primarySpeaker: "Narrator summarizing reconstruction",
    associatedRoles: ['worker', 'descendant'],
    hint: "Expressing professional pride in modern industrial roots starting from the 1600s."
  },
  {
    id: 11,
    text: "“Great oak beams were carefully hewn into shape in the time-honored manner. Modern craftsmen learned to use the tools of their forefathers.”",
    startTime: 488,
    endTime: 495,
    primarySpeaker: "Narrator describing timber frames construction",
    associatedRoles: ['worker'],
    hint: "The active manual craft of rebuilding authentic wooden machinery structures with broadaxes."
  },
  {
    id: 12,
    text: "“In the winter of 1952 this area was opened up. Neither snow nor sleet could keep them from …unlocking secrets of the past.”",
    startTime: 651,
    endTime: 662,
    primarySpeaker: "Narrator on excavation crews persistence",
    associatedRoles: ['archaeologist'],
    hint: "The physical struggle of diggers out in cold, mud, snow, and rain."
  },
  {
    id: 13,
    text: "“The great detective story of unearthing the facts regarding America’s first large industrial enterprise was nearing its end...”",
    startTime: 690,
    endTime: 697,
    primarySpeaker: "Narrator reflecting on site mapping",
    associatedRoles: ['archaeologist', 'historian'],
    hint: "Comparing meticulous cross-referencing and finding key clues with solving a detective mystery."
  },
  {
    id: 14,
    text: "“Facts fitted together like a jigsaw puzzle, one authenticating another.”",
    startTime: 698,
    endTime: 703,
    primarySpeaker: "Narrator summarizing engineering blueprints validation",
    associatedRoles: ['historian', 'archaeologist'],
    hint: "Resolves conflicting accounts by cross-authenticating books against physical structural timbers."
  },
  {
    id: 15,
    text: "“Here is the Saugus Iron Works of 1650, a prime example of the industrial pioneering that made America what it is today”",
    startTime: 763,
    endTime: 772,
    primarySpeaker: "Narrator summarizing historic significance",
    associatedRoles: ['worker', 'historian', 'descendant'],
    hint: "A high-level message linking historical colonial pioneering directly to 1950s prosperity."
  },
  {
    id: 16,
    text: "“From this original works, iron masters and skilled workmen went forth to establish works at Taunton…etc. along the Atlantic coast.”",
    startTime: 773,
    endTime: 786,
    primarySpeaker: "Narrator on geographic dispersion",
    associatedRoles: ['historian', 'worker'],
    hint: "Tracks the historical travel and legacy of industrial experts who migrated to start local operations."
  },
  {
    id: 17,
    text: "“The spirit of Saugus and the skills of Saugus men passed from father to son, from skilled workman to apprentice, and helped win the War of Independence.”",
    startTime: 786,
    endTime: 795,
    primarySpeaker: "Narrator on apprenticeship transmission",
    associatedRoles: ['worker', 'descendant'],
    hint: "Generational transmission of professional technical crafts and proud metal-manufacturing heritage."
  },
  {
    id: 18,
    text: "“Today Saugus is not only the birthplace of the American iron and steel industry, but a prototype of American heavy industry in general.”",
    startTime: 811,
    endTime: 819,
    primarySpeaker: "Narrator explaining heavy industrial economics",
    associatedRoles: ['worker', 'historian'],
    hint: "Connecting early watermill furnace operations to huge 20th century integrated steel plants."
  },
  {
    id: 19,
    text: "“The Iron Works at Saugus is no monument to a dead past. It is a reminder of the great advances which the iron and steel industry has made and will continue to make...”",
    startTime: 872,
    endTime: 883,
    primarySpeaker: "Narrator concluding the film",
    associatedRoles: ['worker'],
    hint: "Reveres metallurgical engineering as a living, breathing continuum that continues to power modern advancements."
  }
];

export function getQuoteForTime(time: number): Quote {
  // 1. If we are exactly inside a quote, return that quote
  const active = QUOTES.find(q => time >= q.startTime && time <= q.endTime);
  if (active) return active;

  // 2. Otherwise we are in a gap. Find the first quote that starts after 'time'
  const upcoming = QUOTES.find(q => q.startTime > time);
  if (upcoming) return upcoming;

  // 3. If there is no upcoming quote (we are past the last quote's endTime), return the last quote
  return QUOTES[QUOTES.length - 1];
}
