import { getSnapshot, setPool } from "../store";
import { clamp } from "./types";

// The cloth between the cushions, in metres from the middle of the table.
export const HALF_X = 1.155;
export const HALF_Z = 0.555;
export const R = 0.03;
const TOP_SPEED = 3.5;
const BEST_KEY = "loft-billiards";
export const COLORS = [
  "#f2c230",
  "#2f6fe0",
  "#e0452f",
  "#7a4fd0",
  "#f08a2c",
  "#2fa66a",
  "#a8323c",
  "#1c1c22",
  "#e86fb0",
  "#37b8c9",
];
export const POCKETS: Array<[number, number, number]> = [
  [-HALF_X, -HALF_Z, 0.082],
  [HALF_X, -HALF_Z, 0.082],
  [-HALF_X, HALF_Z, 0.082],
  [HALF_X, HALF_Z, 0.082],
  [0, -HALF_Z - 0.012, 0.074],
  [0, HALF_Z + 0.012, 0.074],
];
const HEAD_SPOT = { x: -0.58, z: 0 };

export type Ball = { x: number; z: number; vx: number; vz: number; color: string; cue: boolean; live: boolean };

type Table = {
  balls: Ball[];
  angle: number;
  power: number;
  shots: number;
  rolling: boolean;
};

function rack(): Table {
  const balls: Ball[] = [{ ...HEAD_SPOT, vx: 0, vz: 0, color: "#f6f1e8", cue: true, live: true }];
  let color = 0;
  for (let row = 0; row < 4; row += 1) {
    for (let slot = 0; slot <= row; slot += 1) {
      balls.push({
        x: 0.46 + row * (R * 1.74 + 0.002),
        z: (slot - row / 2) * (R * 2 + 0.002),
        vx: 0,
        vz: 0,
        color: COLORS[color],
        cue: false,
        live: true,
      });
      color += 1;
    }
  }
  return { balls, angle: 0, power: 0.55, shots: 0, rolling: false };
}

/** The one table in the flat. It keeps its balls where they stopped when the visitor walks away. */
export const table: Table = rack();

export function left() {
  return table.balls.filter((ball) => !ball.cue && ball.live).length;
}

export function aiming() {
  return !table.rolling && table.balls[0].live && left() > 0;
}

/** Puts the cue ball back on the head spot, or as near to it as the other balls allow. */
function respot() {
  const cue = table.balls[0];
  for (let shift = 0; shift < 40; shift += 1) {
    const x = HEAD_SPOT.x + (shift % 2 ? -1 : 1) * Math.ceil(shift / 2) * 0.023;
    const free = table.balls.every(
      (ball) => ball.cue || !ball.live || Math.hypot(ball.x - x, ball.z - HEAD_SPOT.z) > R * 2 + 0.004,
    );
    if (free && x > -HALF_X + R && x < HALF_X - R) {
      cue.x = x;
      break;
    }
  }
  cue.z = HEAD_SPOT.z;
  cue.vx = 0;
  cue.vz = 0;
  cue.live = true;
}

/** One slice of time. Returns true when the cue ball went down a pocket. */
function advance(dt: number) {
  let scratched = false;
  for (const ball of table.balls) {
    if (!ball.live) continue;
    ball.x += ball.vx * dt;
    ball.z += ball.vz * dt;
    const speed = Math.hypot(ball.vx, ball.vz);
    if (speed > 0) {
      const slowed = Math.max(0, speed - (0.146 + speed * 0.42) * dt);
      const keep = slowed < 0.02 ? 0 : slowed / speed;
      ball.vx *= keep;
      ball.vz *= keep;
    }
    if (POCKETS.some(([x, z, reach]) => Math.hypot(ball.x - x, ball.z - z) < reach)) {
      ball.live = false;
      ball.vx = 0;
      ball.vz = 0;
      if (ball.cue) scratched = true;
      continue;
    }
    if (ball.x < -HALF_X + R) {
      ball.x = -HALF_X + R;
      ball.vx = Math.abs(ball.vx) * 0.86;
    } else if (ball.x > HALF_X - R) {
      ball.x = HALF_X - R;
      ball.vx = -Math.abs(ball.vx) * 0.86;
    }
    if (ball.z < -HALF_Z + R) {
      ball.z = -HALF_Z + R;
      ball.vz = Math.abs(ball.vz) * 0.86;
    } else if (ball.z > HALF_Z - R) {
      ball.z = HALF_Z - R;
      ball.vz = -Math.abs(ball.vz) * 0.86;
    }
  }
  for (let a = 0; a < table.balls.length; a += 1) {
    for (let b = a + 1; b < table.balls.length; b += 1) {
      const one = table.balls[a];
      const two = table.balls[b];
      if (!one.live || !two.live) continue;
      const dx = two.x - one.x;
      const dz = two.z - one.z;
      const gap = Math.hypot(dx, dz);
      if (gap >= R * 2 || gap === 0) continue;
      const nx = dx / gap;
      const nz = dz / gap;
      const overlap = (R * 2 - gap) / 2;
      one.x -= nx * overlap;
      one.z -= nz * overlap;
      two.x += nx * overlap;
      two.z += nz * overlap;
      // Equal weights, so the balls trade the speed they share along the line between them.
      const closing = (one.vx - two.vx) * nx + (one.vz - two.vz) * nz;
      if (closing <= 0) continue;
      const push = closing * 0.98;
      one.vx -= nx * push;
      one.vz -= nz * push;
      two.vx += nx * push;
      two.vz += nz * push;
    }
  }
  return scratched;
}

function storedBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Reads the saved best once the visitor first leans over the table. */
export function wake() {
  const best = storedBest();
  if (best !== getSnapshot().pool.best) setPool({ best });
}

export function shoot() {
  const cue = table.balls[0];
  if (!aiming()) return;
  const speed = (0.14 + table.power * 0.86) * TOP_SPEED;
  cue.vx = Math.cos(table.angle) * speed;
  cue.vz = Math.sin(table.angle) * speed;
  table.rolling = true;
  table.shots += 1;
  setPool({ shots: table.shots, note: "" });
}

export function rerack() {
  Object.assign(table, rack());
  setPool({ shots: 0, left: 10, done: false, note: "" });
}

/** Aims from the cue ball at a point on the cloth. Further away is a harder shot. */
export function aimAt(x: number, z: number) {
  const cue = table.balls[0];
  if (!aiming()) return;
  const reach = Math.hypot(x - cue.x, z - cue.z);
  if (reach < 0.015) return;
  table.angle = Math.atan2(z - cue.z, x - cue.x);
  table.power = clamp((reach - 0.1) / 0.85, 0, 1);
}

export function nudge(turn: number, push: number) {
  if (!aiming()) return;
  table.angle += turn;
  table.power = clamp(table.power + push, 0, 1);
}

/** How far the cue ball travels along the aim before it meets a ball or a cushion. */
export function sight() {
  const cue = table.balls[0];
  const dx = Math.cos(table.angle);
  const dz = Math.sin(table.angle);
  let reach = Infinity;
  if (dx > 0) reach = Math.min(reach, (HALF_X - R - cue.x) / dx);
  if (dx < 0) reach = Math.min(reach, (-HALF_X + R - cue.x) / dx);
  if (dz > 0) reach = Math.min(reach, (HALF_Z - R - cue.z) / dz);
  if (dz < 0) reach = Math.min(reach, (-HALF_Z + R - cue.z) / dz);
  let ball = false;
  for (const other of table.balls) {
    if (other.cue || !other.live) continue;
    const along = (other.x - cue.x) * dx + (other.z - cue.z) * dz;
    if (along <= 0) continue;
    const off = (other.x - cue.x) ** 2 + (other.z - cue.z) ** 2 - along * along;
    if (off >= R * R * 4) continue;
    const touch = along - Math.sqrt(R * R * 4 - off);
    if (touch < reach) {
      reach = touch;
      ball = true;
    }
  }
  return { reach: Math.max(0, reach), ball };
}

/** Moves the balls on by one frame and keeps the scoreboard in step. */
export function step(dt: number) {
  if (!table.rolling) return;
  let scratched = false;
  for (let slice = 0; slice < 6; slice += 1) {
    if (advance(dt / 6)) scratched = true;
  }
  if (scratched) {
    // The cue ball waits off the table until everything else stops.
    table.shots += 1;
    setPool({ shots: table.shots, note: "Scratch. The cue ball is back on its spot, and it cost a shot." });
  }
  const remaining = left();
  if (remaining !== getSnapshot().pool.left) setPool({ left: remaining });
  if (!table.balls.every((ball) => ball.vx === 0 && ball.vz === 0)) return;
  table.rolling = false;
  if (!table.balls[0].live) respot();
  if (remaining > 0) return;
  const before = getSnapshot().pool.best;
  const best = before && before <= table.shots ? before : table.shots;
  try {
    window.localStorage.setItem(BEST_KEY, String(best));
  } catch {
    /* The score still shows for this visit. */
  }
  setPool({ done: true, best });
}
