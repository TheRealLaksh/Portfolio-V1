// The sidekick's move library. Each move poses named body parts (roles) over time, on top of whatever the idle clip is
// doing, so he keeps breathing while an arm waves. Rotations are in degrees, in BODY space: +x is his left, +y is up,
// +z is the way he faces. For a hanging arm (pointing down): +z swings it out to his left, -z to his right, and -x
// swings it forward and up; for his RIGHT arm +z also moves the hand in towards the middle of his body. Moves name
// roles ('rArm', 'head'), not this robot's bones, so they carry over to any humanoid rig with Mixamo-style bone names
// (see ROLES in avatarStage.js). applyMove adds a small constant wobble to every posed part so a held pose is never
// frozen.
//
// To keep them from looking mechanical: poses arrive with a little overshoot (a settle), many start with a tiny
// move the other way (anticipation), the head trails the arms by a beat, and the body sways a little with the move.

const ez = (t) => t * t * (3 - 2 * t);
const back = (t, c = 1.15) => { const k = t - 1; return 1 + (c + 1) * k * k * k + c * k * k; };
const mag = (a) => Math.abs(a[0]) + Math.abs(a[1]) + Math.abs(a[2]);

// keyframes by progress u (0..1): [[u, [x, y, z]], ...]. Quick segments that arrive at a bigger pose overshoot and
// settle; a pose that starts from rest gets a small anticipation first.
export const K = (keys, { ant = true, c = 1.15 } = {}) => {
  let ks = keys;
  if (ant && keys.length > 1 && mag(keys[0][1]) === 0 && keys[1][0] - keys[0][0] > 0.1) {
    const [u0] = keys[0];
    const [u1, b] = keys[1];
    ks = [keys[0], [u0 + (u1 - u0) * 0.3, b.map((v) => -v * 0.09)], ...keys.slice(1)];
  }
  return (t, u) => {
    if (u <= ks[0][0]) return ks[0][1];
    for (let i = 0; i < ks.length - 1; i++) {
      if (u <= ks[i + 1][0]) {
        const [u0, a] = ks[i];
        const [u1, b] = ks[i + 1];
        const p = (u - u0) / (u1 - u0);
        const arrive = u1 - u0 <= 0.34 && mag(b) >= mag(a);
        const k = arrive ? back(p, c) : ez(p);
        return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
      }
    }
    return ks[ks.length - 1][1];
  };
};

// 0 -> 1 over the first `a` of the move, 1 until `b`, back to 0 by the end
const env = (u, a, b) => (u < a ? ez(u / a) : u > b ? ez((1 - u) / (1 - b)) : 1);
// the same key shape, shifted later by `lag` so one part trails another
const lag = (keys, d) => keys.map(([u, v]) => [Math.min(1, u + d), v]);

export const MOVES = {
  wave: {
    dur: 2.6,
    bones: {
      rArm: K([[0, [0, 0, 0]], [0.2, [-12, 0, -122]], [0.82, [-12, 0, -122]], [1, [0, 0, 0]]]),
      rFore: (t, u) => [0, 0, -(70 + 24 * Math.sin(t * 13)) * env(u, 0.2, 0.82)],
      head: K(lag([[0, [0, 0, 0]], [0.2, [0, -8, -7]], [0.8, [0, -8, -7]], [1, [0, 0, 0]]], 0.05)),
      spine1: K([[0, [0, 0, 0]], [0.2, [0, -6, -2]], [0.8, [0, -6, -2]], [1, [0, 0, 0]]]),
      hips: (t, u) => [0, 2 * Math.sin(t * 2.4) * env(u, 0.2, 0.82), 0],
    },
  },
  point: { // at something on his left (screen right)
    dur: 2.4,
    bones: {
      lArm: K([[0, [0, 0, 0]], [0.2, [-26, 0, 84]], [0.8, [-26, 0, 84]], [1, [0, 0, 0]]]),
      lFore: K([[0, [0, 0, 0]], [0.2, [-6, 0, 4]], [0.8, [-6, 0, 4]], [1, [0, 0, 0]]]),
      head: K(lag([[0, [0, 0, 0]], [0.2, [0, 26, 4]], [0.8, [0, 26, 4]], [1, [0, 0, 0]]], 0.05)),
      spine1: K([[0, [0, 0, 0]], [0.2, [0, 12, 0]], [0.8, [0, 12, 0]], [1, [0, 0, 0]]]),
    },
  },
  think: {
    dur: 3.2,
    bones: {
      rArm: K([[0, [0, 0, 0]], [0.22, [-44, -6, 16]], [0.85, [-44, -6, 16]], [1, [0, 0, 0]]]),
      rFore: K([[0, [0, 0, 0]], [0.22, [-136, 0, 8]], [0.85, [-136, 0, 8]], [1, [0, 0, 0]]]),
      lArm: K([[0, [0, 0, 0]], [0.22, [-14, 0, 0]], [0.85, [-14, 0, 0]], [1, [0, 0, 0]]]),
      lFore: K([[0, [0, 0, 0]], [0.22, [-84, 0, -6]], [0.85, [-84, 0, -6]], [1, [0, 0, 0]]]),
      head: (t, u) => { const e = env(u, 0.25, 0.85); return [(12 + 2 * Math.sin(t * 1.1)) * e, 9 * Math.sin(t * 1.4) * e, 8 * e]; },
      spine1: (t, u) => [3 * env(u, 0.22, 0.85), 3 * Math.sin(t * 0.9) * env(u, 0.22, 0.85), 0],
    },
  },
  shrug: {
    dur: 2.0,
    bones: {
      lSh: (t, u) => [0, 0, (14 + 3 * Math.sin(t * 9)) * env(u, 0.2, 0.72)],
      rSh: (t, u) => [0, 0, -(14 + 3 * Math.sin(t * 9)) * env(u, 0.2, 0.72)],
      lArm: K([[0, [0, 0, 0]], [0.2, [-8, 0, 26]], [0.72, [-8, 0, 26]], [1, [0, 0, 0]]]),
      rArm: K([[0, [0, 0, 0]], [0.2, [-8, 0, -26]], [0.72, [-8, 0, -26]], [1, [0, 0, 0]]]),
      lFore: K([[0, [0, 0, 0]], [0.2, [-70, 0, 14]], [0.72, [-70, 0, 14]], [1, [0, 0, 0]]]),
      rFore: K([[0, [0, 0, 0]], [0.2, [-70, 0, -14]], [0.72, [-70, 0, -14]], [1, [0, 0, 0]]]),
      head: K(lag([[0, [0, 0, 0]], [0.2, [4, 0, 9]], [0.72, [4, 0, 9]], [1, [0, 0, 0]]], 0.05)),
      spine1: K([[0, [0, 0, 0]], [0.2, [-4, 0, 0]], [0.72, [-4, 0, 0]], [1, [0, 0, 0]]]),
    },
  },
  facepalm: {
    dur: 2.6,
    bones: {
      rArm: K([[0, [0, 0, 0]], [0.22, [-74, 0, 32]], [0.82, [-74, 0, 32]], [1, [0, 0, 0]]]),
      rFore: K([[0, [0, 0, 0]], [0.22, [-144, 0, 10]], [0.82, [-144, 0, 10]], [1, [0, 0, 0]]]),
      head: (t, u) => { const e = env(u, 0.25, 0.82); return [24 * e, 0, (-4 + 3 * Math.sin(t * 7)) * e]; },
      spine1: K([[0, [0, 0, 0]], [0.22, [9, 0, 0]], [0.82, [9, 0, 0]], [1, [0, 0, 0]]]),
      lArm: K([[0, [0, 0, 0]], [0.22, [0, 0, 8]], [0.82, [0, 0, 8]], [1, [0, 0, 0]]]),
    },
  },
  clap: {
    dur: 2.4,
    bones: {
      lArm: (t, u) => { const e = env(u, 0.15, 0.85); const c = (Math.sin(t * 16) + 1) / 2; return [-48 * e, 0, (8 - 26 * c) * e]; },
      rArm: (t, u) => { const e = env(u, 0.15, 0.85); const c = (Math.sin(t * 16) + 1) / 2; return [-48 * e, 0, (-8 + 26 * c) * e]; },
      lFore: K([[0, [0, 0, 0]], [0.15, [-88, 0, -8]], [0.85, [-88, 0, -8]], [1, [0, 0, 0]]]),
      rFore: K([[0, [0, 0, 0]], [0.15, [-88, 0, 8]], [0.85, [-88, 0, 8]], [1, [0, 0, 0]]]),
      head: (t, u) => { const e = env(u, 0.15, 0.85); return [-3 * e + 2 * Math.sin(t * 16), 0, 3 * Math.sin(t * 8) * e]; },
      spine1: (t, u) => [2 * Math.sin(t * 16) * env(u, 0.15, 0.85), 3 * Math.sin(t * 8) * env(u, 0.15, 0.85), 0],
    },
  },
  cheer: {
    dur: 2.0,
    stunt: { at: 0.3, vy: 470 },
    bones: {
      lArm: (t, u) => [-12, 0, (152 + 9 * Math.sin(t * 15)) * env(u, 0.25, 0.8)],
      rArm: (t, u) => [-12, 0, -(152 + 9 * Math.sin(t * 15 + 1)) * env(u, 0.25, 0.8)],
      lFore: (t, u) => [0, 0, (14 + 14 * Math.sin(t * 15 + 0.5)) * env(u, 0.25, 0.8)],
      rFore: (t, u) => [0, 0, -(14 + 14 * Math.sin(t * 15 + 1.5)) * env(u, 0.25, 0.8)],
      lSh: K([[0, [0, 0, 0]], [0.25, [0, 0, 12]], [0.8, [0, 0, 12]], [1, [0, 0, 0]]]),
      rSh: K([[0, [0, 0, 0]], [0.25, [0, 0, -12]], [0.8, [0, 0, -12]], [1, [0, 0, 0]]]),
      head: K(lag([[0, [0, 0, 0]], [0.25, [-16, 0, 0]], [0.8, [-16, 0, 0]], [1, [0, 0, 0]]], 0.05)),
      spine1: K([[0, [0, 0, 0]], [0.25, [-8, 0, 0]], [0.8, [-8, 0, 0]], [1, [0, 0, 0]]]),
    },
  },
  stretch: {
    dur: 3.2,
    bones: {
      lArm: (t, u) => { const e = env(u, 0.3, 0.72); return [-168 * e, 0, 7 * e]; },
      rArm: (t, u) => { const e = env(u, 0.3, 0.72); return [-168 * e, 0, -7 * e]; },
      lFore: K([[0, [0, 0, 0]], [0.3, [-8, 0, 6]], [0.72, [-8, 0, 6]], [1, [0, 0, 0]]]),
      rFore: K([[0, [0, 0, 0]], [0.3, [-8, 0, -6]], [0.72, [-8, 0, -6]], [1, [0, 0, 0]]]),
      spine: K([[0, [0, 0, 0]], [0.3, [-6, 0, 0]], [0.72, [-6, 0, 0]], [1, [4, 0, 0]], ], { ant: false }),
      spine1: (t, u) => [-9 * env(u, 0.3, 0.72), 0, 3 * Math.sin(t * 4) * env(u, 0.3, 0.72)],
      head: K(lag([[0, [0, 0, 0]], [0.3, [-18, 0, 0]], [0.72, [-18, 0, 0]], [1, [6, 0, 0]]], 0.06)),
      lSh: (t, u) => [0, 0, 6 * env(u, 0.3, 0.72)],
      rSh: (t, u) => [0, 0, -6 * env(u, 0.3, 0.72)],
    },
  },
  yawn: {
    dur: 2.6,
    bones: {
      rArm: K([[0, [0, 0, 0]], [0.26, [-66, 0, 24]], [0.76, [-66, 0, 24]], [1, [0, 0, 0]]]),
      rFore: K([[0, [0, 0, 0]], [0.26, [-124, 0, 8]], [0.76, [-124, 0, 8]], [1, [0, 0, 0]]]),
      head: K([[0, [0, 0, 0]], [0.3, [-22, 0, 0]], [0.62, [-22, 0, 0]], [0.86, [12, 0, 0]], [1, [0, 0, 0]]]),
      spine1: K([[0, [0, 0, 0]], [0.3, [-6, 0, 0]], [0.62, [-6, 0, 0]], [0.86, [5, 0, 0]], [1, [0, 0, 0]]]),
      lArm: K([[0, [0, 0, 0]], [0.3, [-8, 0, 12]], [0.62, [-8, 0, 12]], [1, [0, 0, 0]]]),
      lSh: K([[0, [0, 0, 0]], [0.3, [0, 0, 5]], [0.62, [0, 0, 5]], [1, [0, 0, 0]]]),
      rSh: K([[0, [0, 0, 0]], [0.3, [0, 0, -5]], [0.62, [0, 0, -5]], [1, [0, 0, 0]]]),
    },
  },
  flex: {
    dur: 2.6,
    bones: {
      lArm: (t, u) => [0, 0, (92 + 3 * Math.sin(t * 22)) * env(u, 0.22, 0.8)],
      rArm: (t, u) => [0, 0, -(92 + 3 * Math.sin(t * 22)) * env(u, 0.22, 0.8)],
      lFore: K([[0, [0, 0, 0]], [0.22, [0, 0, 102]], [0.8, [0, 0, 102]], [1, [0, 0, 0]]]),
      rFore: K([[0, [0, 0, 0]], [0.22, [0, 0, -102]], [0.8, [0, 0, -102]], [1, [0, 0, 0]]]),
      lSh: K([[0, [0, 0, 0]], [0.22, [0, 0, 9]], [0.8, [0, 0, 9]], [1, [0, 0, 0]]]),
      rSh: K([[0, [0, 0, 0]], [0.22, [0, 0, -9]], [0.8, [0, 0, -9]], [1, [0, 0, 0]]]),
      head: K(lag([[0, [0, 0, 0]], [0.22, [-8, 0, 0]], [0.8, [-8, 0, 0]], [1, [0, 0, 0]]], 0.05)),
      spine1: (t, u) => [-5 * env(u, 0.22, 0.8) + 1.5 * Math.sin(t * 11) * env(u, 0.22, 0.8), 0, 0],
      spine2: (t, u) => [-3 * env(u, 0.22, 0.8), 0, 0],
    },
  },
  lookAround: {
    dur: 3.4,
    bones: {
      head: K([[0, [0, 0, 0]], [0.14, [0, -46, 0]], [0.4, [0, -46, 0]], [0.55, [0, 42, 0]], [0.8, [0, 42, 0]], [1, [0, 0, 0]]], { ant: false }),
      neck: K([[0, [0, 0, 0]], [0.14, [0, -10, 0]], [0.4, [0, -10, 0]], [0.55, [0, 10, 0]], [0.8, [0, 10, 0]], [1, [0, 0, 0]]], { ant: false }),
      spine1: K(lag([[0, [0, 0, 0]], [0.14, [0, -12, 0]], [0.4, [0, -12, 0]], [0.55, [0, 12, 0]], [0.8, [0, 12, 0]], [1, [0, 0, 0]]], 0.05), { ant: false }),
    },
  },
  // stunts: the body does the rest (see the brain); the arms tuck or spread
  flip: {
    dur: 1.35,
    stunt: { at: 0.28, vy: 640, flip: -1 },
    bones: {
      lArm: K([[0, [0, 0, 0]], [0.2, [-70, 0, 12]], [0.8, [-70, 0, 12]], [1, [0, 0, 0]]]),
      rArm: K([[0, [0, 0, 0]], [0.2, [-70, 0, -12]], [0.8, [-70, 0, -12]], [1, [0, 0, 0]]]),
      lFore: K([[0, [0, 0, 0]], [0.2, [-120, 0, 0]], [0.8, [-120, 0, 0]], [1, [0, 0, 0]]]),
      rFore: K([[0, [0, 0, 0]], [0.2, [-120, 0, 0]], [0.8, [-120, 0, 0]], [1, [0, 0, 0]]]),
    },
  },
  spin: {
    dur: 1.2,
    stunt: { at: 0.2, vy: 430, spin: 1 },
    bones: {
      lArm: K([[0, [0, 0, 0]], [0.2, [0, 0, 78]], [0.8, [0, 0, 78]], [1, [0, 0, 0]]]),
      rArm: K([[0, [0, 0, 0]], [0.2, [0, 0, -78]], [0.8, [0, 0, -78]], [1, [0, 0, 0]]]),
    },
  },
};

// the one a section triggers the first time you settle in it
export const SECTION_MOVE = {
  story: 'wave', work: 'point', brand: 'flex', profiley: 'clap', stack: 'stretch', process: 'think', life: 'shrug', notes: 'lookAround', hello: 'cheer',
};
// "do something" picks from these
export const SURPRISE = ['cheer', 'flex', 'stretch', 'spin', 'flip', 'clap', 'shrug', 'facepalm', 'think'];
