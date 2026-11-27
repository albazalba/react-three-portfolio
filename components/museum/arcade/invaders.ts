import { ALIEN_FRAMES, SHIP, stamp } from "./sprites";
import { H, W, clamp, type Machine } from "./types";

const COLS = 8;
const ROWS = 4;
const ALIEN_W = 11;
const ALIEN_H = 8;
const SPREAD_X = 26;
const SPREAD_Y = 18;
const EDGE = 6;
const SHIP_Y = 220;
const SHIP_HALF = 6;
const ROW_COLORS = ["#ff5fd2", "#9d7bff", "#7ef6ff", "#7dff8a"];
const STARS = Array.from({ length: 36 }, (_, index) => [(index * 97) % W, (index * 53) % (H - 30)]);

type Point = { x: number; y: number };

export function invaders(): Machine {
  let alive: boolean[] = [];
  let left = 0;
  let top = 0;
  let heading = 1;
  let beat = 0;
  let stride = 0;
  let wave = 1;
  let ship = W / 2;
  let lives = 3;
  let points = 0;
  let shot: Point | null = null;
  let reload = 0;
  let bombs: Point[] = [];
  let nextBomb = 1.2;
  // A hit ship flickers and cannot be hit again until it settles.
  let shaken = 0;
  let landed = false;

  function muster() {
    alive = Array.from({ length: COLS * ROWS }, () => true);
    left = 30;
    top = 30 + Math.min(wave - 1, 4) * 8;
    heading = 1;
    beat = 0;
    bombs = [];
    shot = null;
  }

  function columns() {
    const live: number[] = [];
    for (let col = 0; col < COLS; col += 1) {
      for (let row = 0; row < ROWS; row += 1) {
        if (alive[row * COLS + col]) {
          live.push(col);
          break;
        }
      }
    }
    return live;
  }

  function lowest(col: number) {
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (alive[row * COLS + col]) return row;
    }
    return -1;
  }

  function alienAt(point: Point) {
    const col = Math.floor((point.x - left) / SPREAD_X);
    const row = Math.floor((point.y - top) / SPREAD_Y);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1;
    if (point.x - left - col * SPREAD_X > ALIEN_W + 1) return -1;
    if (point.y - top - row * SPREAD_Y > ALIEN_H + 1) return -1;
    const index = row * COLS + col;
    return alive[index] ? index : -1;
  }

  function march() {
    const live = columns();
    const first = left + live[0] * SPREAD_X;
    const last = left + live[live.length - 1] * SPREAD_X + ALIEN_W;
    const next = heading * 4;
    if (first + next < EDGE || last + next > W - EDGE) {
      top += 8;
      heading = -heading;
    } else {
      left += next;
    }
    stride = 1 - stride;
    const floor = Math.max(...live.map(lowest));
    if (top + floor * SPREAD_Y + ALIEN_H >= SHIP_Y - 2) landed = true;
  }

  muster();

  return {
    step(dt, pad) {
      if (landed || lives <= 0) return;
      const push = (pad.right ? 1 : 0) - (pad.left ? 1 : 0);
      ship = clamp(ship + push * 150 * dt, EDGE + SHIP_HALF, W - EDGE - SHIP_HALF);
      shaken = Math.max(0, shaken - dt);
      reload = Math.max(0, reload - dt);

      if (pad.fire && !shot && reload <= 0) {
        shot = { x: ship, y: SHIP_Y - 4 };
        reload = 0.25;
      }

      const count = alive.filter(Boolean).length;
      // Fewer invaders march faster, and every wave starts quicker than the last.
      const interval = (0.07 + (0.45 * count) / alive.length) * 0.88 ** (wave - 1);
      beat += dt;
      while (beat >= interval && !landed) {
        beat -= interval;
        march();
      }

      if (shot) {
        const hops = Math.ceil((300 * dt) / 4);
        for (let hop = 0; hop < hops && shot; hop += 1) {
          shot.y -= (300 * dt) / hops;
          const hit = alienAt(shot);
          if (hit >= 0) {
            alive[hit] = false;
            points += (ROWS - Math.floor(hit / COLS)) * 10;
            shot = null;
          } else if (shot.y < 0) {
            shot = null;
          }
        }
      }

      if (!alive.some(Boolean)) {
        wave += 1;
        muster();
        return;
      }

      nextBomb -= dt;
      if (nextBomb <= 0 && bombs.length < 4) {
        const live = columns();
        const col = live[Math.floor(Math.random() * live.length)];
        bombs.push({
          x: left + col * SPREAD_X + ALIEN_W / 2,
          y: top + lowest(col) * SPREAD_Y + ALIEN_H,
        });
        nextBomb = (0.45 + Math.random() * 0.8) * 0.92 ** (wave - 1);
      }
      for (const bomb of bombs) bomb.y += (110 + wave * 10) * dt;
      const struck = bombs.some(
        (bomb) =>
          shaken <= 0 &&
          Math.abs(bomb.x - ship) <= SHIP_HALF + 1 &&
          bomb.y >= SHIP_Y &&
          bomb.y <= SHIP_Y + 8,
      );
      if (struck) {
        lives -= 1;
        shaken = 1.2;
        bombs = [];
      } else {
        bombs = bombs.filter((bomb) => bomb.y < H);
      }
    },
    draw(context) {
      context.fillStyle = "#07050f";
      context.fillRect(0, 0, W, H);
      context.fillStyle = "rgba(255,255,255,0.35)";
      for (const [sx, sy] of STARS) context.fillRect(sx, sy, 1, 1);

      alive.forEach((standing, index) => {
        if (!standing) return;
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        context.fillStyle = ROW_COLORS[row];
        stamp(context, ALIEN_FRAMES[stride], left + col * SPREAD_X, top + row * SPREAD_Y);
      });

      context.fillStyle = "#ffffff";
      if (shot) context.fillRect(shot.x - 0.5, shot.y - 5, 1, 5);
      context.fillStyle = "#ffb14a";
      for (const bomb of bombs) context.fillRect(bomb.x - 1, bomb.y - 4, 2, 5);

      const flicker = shaken > 0 && Math.floor(shaken * 10) % 2 === 0;
      if (lives > 0 && !flicker) {
        context.fillStyle = "#f4efe6";
        stamp(context, SHIP, Math.round(ship) - SHIP_HALF, SHIP_Y);
      }
      context.fillStyle = "rgba(255,95,210,0.5)";
      context.fillRect(0, H - 8, W, 1);
      context.fillStyle = "#f4efe6";
      for (let life = 1; life < lives; life += 1) {
        stamp(context, SHIP, 8 + (life - 1) * 18, 10);
      }
      context.fillStyle = "rgba(244,239,230,0.6)";
      context.font = "10px monospace";
      context.textAlign = "right";
      context.fillText(`WAVE ${wave}`, W - 8, 17);
      context.textAlign = "left";
    },
    score: () => points,
    over: () => landed || lives <= 0,
  };
}
