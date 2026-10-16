import { store } from './hooks';

// What the sidekick says. Plain, true statements about this site; no emoji, no invented facts.

export const pick = (arr, last) => {
  const pool = arr.length > 1 ? arr.filter((l) => l !== last) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
};

// Per section: a couple of lines, so coming back to a section does not repeat the same sentence.
export const SECTION_LINES = {
  story: ['That is the short version.', 'Nice to meet you.'],
  work: ['Pick a card, any card.', 'The filter dims the rest.'],
  brand: ['Need a site? Ask me.', 'I build these for clients too.'],
  profiley: ['Yes, I built this one too.', 'The preview is live, try it.'],
  stack: ['Go on, unwrap it.', 'Each tool says what I use it for.'],
  process: ['Small steps, then ship.', 'One slice at a time.'],
  life: ['Go on, move things around.', 'Everything on the desk moves.'],
  notes: ['Leave a note before you go.', 'Say hi on the wall.'],
  hello: ['Say hi, I reply fast.', 'Email or WhatsApp, either works.'],
};

export const lineFor = (id, last) => pick(SECTION_LINES[id] || ['Hi again.'], last);

// First line of the visit: by the visitor's own clock, and different for someone who has been here before.
export function greeting() {
  const seen = store.get('lp-sk-seen');
  store.set('lp-sk-seen', '1');
  if (seen) return 'Welcome back.';
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning. I will tag along.';
  if (h >= 12 && h < 17) return 'Good afternoon. I will tag along.';
  if (h >= 17 && h < 22) return 'Good evening. I will tag along.';
  return 'Up late? Same. I will tag along.';
}

export const IDLE_QUIPS = [
  'Click me, I know the way around.',
  'The wall at the bottom takes notes.',
  'Night mode is up in the corner.',
  'The box in Work opens with a scroll.',
  'Try the desk, everything moves.',
];
export const WAKE_LINES = ['Oh, hi!', 'I was only resting my eyes.', 'Still here.'];
export const FIVE_LINES = ['High five!', 'Nice one.', 'Up top!'];
export const NIGHT_LINE = 'Lights out already?';
export const DAY_LINE = 'Back in daylight.';
export const JOKES = [
  'Why do programmers like dark mode? Light attracts bugs.',
  'There are 10 kinds of people: those who read binary and those who do not.',
  'It works on my machine. So I shipped my machine.',
  'A SQL query walks into a bar and asks two tables: can I join you?',
];
