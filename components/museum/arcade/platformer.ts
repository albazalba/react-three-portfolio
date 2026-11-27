import { H, W, clamp, type Machine, type Pad } from "./types";

// A side-scrolling platformer in the spirit of the classics, with its own hero, enemies and courses.
// The screen is 20 tiles across and 15 high; rows 13 and 14 are the ground unless a course cuts a pit.

export const T = 16;
export const ROWS = H / T;
const GROUND = 13;

const GRAVITY = 1300;
// Holding jump while rising floats the hero higher, up to about five tiles.
const FLOAT = 560;
const JUMP = 300;
const STOMP = 240;
const RUN = 105;
const ACCEL = 520;
const FRICTION = 640;
const FALL = 430;
const LIVES = 3;

export type Theme = "sky" | "cave" | "keep";

export type EnemyKind = "walker" | "shell" | "spiky" | "flyer";

const Tile = {
  Empty: 0,
  Ground: 1,
  Brick: 2,
  Coin: 3,
  Power: 4,
  Used: 5,
  Stone: 6,
  Pipe: 7,
  Lava: 8,
} as const;
type Tile = (typeof Tile)[keyof typeof Tile];

type LiftSpec = { x: number; y: number; axis: "x" | "y"; range: number; speed: number };
type BarSpec = { x: number; y: number; length: number; speed: number };
type EnemySpec = { x: number; y: number; kind: EnemyKind };

/** What a course draws with: tiles, coins, enemies and the moving parts. Coordinates are in tiles. */
export class Builder {
  grid: Uint8Array;
  coins: Array<{ x: number; y: number }> = [];
  enemies: EnemySpec[] = [];
  lifts: LiftSpec[] = [];
  bars: BarSpec[] = [];
  flag = 0;
  checkpoint = 0;

  constructor(public cols: number) {
    this.grid = new Uint8Array(cols * ROWS);
    for (let x = 0; x < cols; x += 1) {
      this.set(x, GROUND, Tile.Ground);
      this.set(x, GROUND + 1, Tile.Ground);
    }
  }

  set(x: number, y: number, tile: Tile) {
    if (x >= 0 && x < this.cols && y >= 0 && y < ROWS) this.grid[y * this.cols + x] = tile;
  }

  /** Takes the ground away from column `from` to `to`, inclusive. */
  pit(from: number, to: number) {
    for (let x = from; x <= to; x += 1) {
      this.set(x, GROUND, Tile.Empty);
      this.set(x, GROUND + 1, Tile.Empty);
    }
    return this;
  }

  /** A pit with lava at the bottom. */
  lava(from: number, to: number) {
    for (let x = from; x <= to; x += 1) {
      this.set(x, GROUND, Tile.Empty);
      this.set(x, GROUND + 1, Tile.Lava);
    }
    return this;
  }

  /** A stone roof over rows 0 and 1, for caves and keeps. */
  ceiling(from: number, to: number) {
    return this.fill(from, 0, to - from + 1, 2);
  }

  /** A two-wide pipe `height` tiles tall standing on the ground. */
  pipe(x: number, height: number) {
    for (let y = GROUND - height; y < GROUND; y += 1) {
      this.set(x, y, Tile.Pipe);
      this.set(x + 1, y, Tile.Pipe);
    }
    return this;
  }

  /** A staircase of stone blocks, `height` steps, climbing to the right (or falling, with `down`). */
  stairs(x: number, height: number, down = false) {
    for (let step = 0; step < height; step += 1) {
      const tall = down ? height - step : step + 1;
      for (let y = 0; y < tall; y += 1) this.set(x + step, GROUND - 1 - y, Tile.Stone);
    }
    return this;
  }

  /** A solid run of stone, for walls, ceilings and pillars. */
  fill(x: number, y: number, w: number, h: number, tile: Tile = Tile.Stone) {
    for (let dx = 0; dx < w; dx += 1) for (let dy = 0; dy < h; dy += 1) this.set(x + dx, y + dy, tile);
    return this;
  }

  /**
   * A row of blocks read from a pattern: B brick, ? coin box, M power box, S stone, C a loose coin,
   * and anything else leaves the tile empty.
   */
  row(x: number, y: number, pattern: string) {
    [...pattern].forEach((mark, index) => {
      if (mark === "B") this.set(x + index, y, Tile.Brick);
      else if (mark === "?") this.set(x + index, y, Tile.Coin);
      else if (mark === "M") this.set(x + index, y, Tile.Power);
      else if (mark === "S") this.set(x + index, y, Tile.Stone);
      else if (mark === "C") this.coins.push({ x: x + index, y });
    });
    return this;
  }

  /** Enemies stand on row `y`, the ground by default. */
  enemy(kind: EnemyKind, ...xs: number[]) {
    for (const x of xs) this.enemies.push({ x, y: GROUND - 1, kind });
    return this;
  }

  enemyAt(kind: EnemyKind, x: number, y: number) {
    this.enemies.push({ x, y, kind });
    return this;
  }

  /** A three-tile platform swinging `range` tiles either side of where it is placed. */
  lift(x: number, y: number, axis: "x" | "y", range: number, speed = 1) {
    this.lifts.push({ x, y, axis, range, speed });
    return this;
  }

  /** A chain of fireballs turning round a stone block. */
  firebar(x: number, y: number, length = 5, speed = 1.7) {
    this.set(x, y, Tile.Used);
    this.bars.push({ x, y, length, speed });
    return this;
  }
}

export type Course = {
  title: string;
  theme: Theme;
  cols: number;
  time: number;
  build(level: Builder): void;
};

type Box = { x: number; y: number; w: number; h: number };
type Enemy = Box & {
  kind: EnemyKind;
  vx: number;
  vy: number;
  awake: boolean;
  dead: boolean;
  squashed: number;
  /** A walker's shell, lying still (0) or skating (±). */
  shell: boolean;
  home: number;
};
type Item = Box & { kind: "boost" | "flower"; vx: number; vy: number; rise: number };
type Bit = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Spark = Box & { vx: number; vy: number; life: number };
type Lift = LiftSpec & { px: number; py: number; dx: number; dy: number };

const PALETTES: Record<
  Theme,
  { sky: [string, string]; ground: string; top: string; edge: string; brick: string; mortar: string; stone: string }
> = {
  sky: { sky: ["#5fb8ff", "#bfe6ff"], ground: "#b8693a", top: "#5bcf4f", edge: "#6e3a1c", brick: "#c4562c", mortar: "#5c2410", stone: "#a3988d" },
  cave: { sky: ["#05070f", "#141c35"], ground: "#3a4b7d", top: "#6f86c9", edge: "#1d2647", brick: "#3f62b5", mortar: "#16213f", stone: "#56628a" },
  keep: { sky: ["#12060a", "#3a1016"], ground: "#5d5560", top: "#857c88", edge: "#2c272f", brick: "#6b6270", mortar: "#2a252c", stone: "#7a7380" },
};

function overlap(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Starts one course. Score, coins and lives carry through deaths; the course itself is rebuilt each life. */
export function platformer(course: Course): () => Machine {
  return () => {
    const palette = PALETTES[course.theme];
    const width = course.cols * T;
    let level = new Builder(course.cols);
    let grid = level.grid;

    const hero = { x: 2 * T, y: (GROUND - 1) * T, w: 12, h: 15, vx: 0, vy: 0, ground: false, face: 1, power: 0, hurt: 0, stride: 0 };
    let camera = 0;
    let clock = 0;
    let time = course.time;
    let lives = LIVES;
    let points = 0;
    let coinCount = 0;
    let checkpointReached = false;
    // "play", then "dying" or "flag"; "done" ends the machine.
    let phase: "play" | "dying" | "flag" | "done" = "play";
    let phaseClock = 0;
    let won = false;

    let enemies: Enemy[] = [];
    let items: Item[] = [];
    let coins: Array<{ x: number; y: number; taken: boolean }> = [];
    let lifts: Lift[] = [];
    let bars: BarSpec[] = [];
    let bits: Bit[] = [];
    let sparks: Spark[] = [];
    let pops: Array<{ x: number; y: number; life: number }> = [];
    let bumps: Array<{ x: number; y: number; life: number }> = [];
    let riding: Lift | null = null;

    function reset() {
      level = new Builder(course.cols);
      course.build(level);
      grid = level.grid;
      enemies = level.enemies.map((spec) => {
        const tall = spec.kind === "shell" ? 18 : 14;
        return {
          x: spec.x * T + 1,
          y: (spec.y + 1) * T - tall,
          w: 14,
          h: tall,
          kind: spec.kind,
          vx: spec.kind === "flyer" ? -26 : -32,
          vy: 0,
          awake: false,
          dead: false,
          squashed: 0,
          shell: false,
          home: (spec.y + 1) * T - tall,
        };
      });
      coins = level.coins.map((coin) => ({ ...coin, taken: false }));
      lifts = level.lifts.map((lift) => ({ ...lift, px: lift.x * T, py: lift.y * T, dx: 0, dy: 0 }));
      bars = level.bars;
      items = [];
      bits = [];
      sparks = [];
      pops = [];
      bumps = [];
      riding = null;
      const start = checkpointReached ? level.checkpoint : 2;
      hero.x = start * T;
      hero.y = (GROUND - 1) * T - (hero.h - 15);
      hero.vx = 0;
      hero.vy = 0;
      hero.hurt = 0;
      camera = clamp(hero.x - 120, 0, width - W);
      time = course.time;
      phase = "play";
      phaseClock = 0;
    }

    function tileAt(c: number, r: number) {
      if (c < 0 || c >= course.cols) return Tile.Stone;
      if (r < 0 || r >= ROWS) return Tile.Empty;
      return grid[r * course.cols + c] as Tile;
    }

    function solid(c: number, r: number) {
      const tile = tileAt(c, r);
      return tile !== Tile.Empty && tile !== Tile.Lava;
    }

    function hitsTiles(x: number, y: number, w: number, h: number) {
      for (let c = Math.floor(x / T); c <= Math.floor((x + w - 0.01) / T); c += 1) {
        for (let r = Math.floor(y / T); r <= Math.floor((y + h - 0.01) / T); r += 1) {
          if (solid(c, r)) return true;
        }
      }
      return false;
    }

    /** Moves a box through the tiles one axis at a time. Reports what it ran into. */
    function travel(box: Box & { vx: number; vy: number }, dt: number) {
      let wall = false;
      let floor = false;
      let ceiling = -1;
      let x = box.x + box.vx * dt;
      if (hitsTiles(x, box.y, box.w, box.h)) {
        x = box.vx > 0 ? Math.floor((x + box.w) / T) * T - box.w - 0.01 : (Math.floor(x / T) + 1) * T;
        wall = true;
        box.vx = 0;
      }
      box.x = x;
      let y = box.y + box.vy * dt;
      if (hitsTiles(box.x, y, box.w, box.h)) {
        if (box.vy > 0) {
          y = Math.floor((y + box.h) / T) * T - box.h;
          floor = true;
        } else {
          ceiling = Math.floor(y / T);
          y = (ceiling + 1) * T;
        }
        box.vy = 0;
      }
      box.y = y;
      return { wall, floor, ceiling };
    }

    function burst(x: number, y: number, color: string) {
      for (let piece = 0; piece < 4; piece += 1) {
        bits.push({ x, y, vx: (piece % 2 ? 1 : -1) * (40 + piece * 15), vy: -220 + (piece > 1 ? 80 : 0), life: 1.2, color });
      }
    }

    /** The hero's head meets a block from below. */
    function bump(c: number, r: number) {
      const tile = tileAt(c, r);
      if (tile === Tile.Brick) {
        if (hero.power > 0) {
          level.set(c, r, Tile.Empty);
          burst(c * T + 8, r * T + 8, palette.brick);
          points += 50;
        } else {
          bumps.push({ x: c, y: r, life: 0.15 });
        }
      } else if (tile === Tile.Coin) {
        level.set(c, r, Tile.Used);
        bumps.push({ x: c, y: r, life: 0.15 });
        pops.push({ x: c * T + 8, y: r * T, life: 0.5 });
        coinCount += 1;
        points += 200;
      } else if (tile === Tile.Power) {
        level.set(c, r, Tile.Used);
        bumps.push({ x: c, y: r, life: 0.15 });
        items.push({ x: c * T + 2, y: r * T, w: 12, h: 12, kind: hero.power === 0 ? "boost" : "flower", vx: 0, vy: 0, rise: T });
      } else {
        return;
      }
      // Anything standing on a bumped block is knocked off it.
      for (const enemy of enemies) {
        if (enemy.dead || !enemy.awake) continue;
        const onTop = Math.abs(enemy.y + enemy.h - r * T) < 2 && enemy.x + enemy.w > c * T && enemy.x < (c + 1) * T;
        if (onTop) defeat(enemy, 100);
      }
    }

    function defeat(enemy: Enemy, reward: number) {
      enemy.dead = true;
      enemy.vy = -200;
      points += reward;
    }

    function grow(next: number) {
      if (hero.power === 0 && next > 0) {
        hero.y -= 12;
        hero.h = 27;
      }
      hero.power = Math.max(hero.power, next);
      points += 1000;
    }

    function hurt() {
      if (hero.hurt > 0 || phase !== "play") return;
      if (hero.power > 0) {
        hero.power = 0;
        hero.y += 12;
        hero.h = 15;
        hero.hurt = 1.6;
        return;
      }
      die();
    }

    function die() {
      if (phase !== "play") return;
      phase = "dying";
      phaseClock = 0;
      hero.vy = -320;
      hero.vx = 0;
    }

    function stepHero(dt: number, pad: Pad) {
      const steer = (pad.right ? 1 : 0) - (pad.left ? 1 : 0);
      if (steer) {
        hero.vx = clamp(hero.vx + steer * ACCEL * dt, -RUN, RUN);
        hero.face = steer;
      } else {
        const slow = Math.min(Math.abs(hero.vx), FRICTION * dt);
        hero.vx -= Math.sign(hero.vx) * slow;
      }
      const jumped = pad.presses.includes("fire") || pad.presses.includes("up");
      const held = pad.fire || pad.up;
      if (jumped && (hero.ground || riding)) {
        hero.vy = -JUMP - Math.abs(hero.vx) * 0.25;
        hero.ground = false;
        riding = null;
      }
      if (pad.presses.includes("down") && hero.power === 2 && sparks.length < 2) {
        sparks.push({ x: hero.x + (hero.face > 0 ? hero.w : -6), y: hero.y + 6, w: 6, h: 6, vx: hero.face * 220, vy: 60, life: 2 });
      }
      hero.vy = Math.min(FALL, hero.vy + (held && hero.vy < 0 ? FLOAT : GRAVITY) * dt);

      if (riding) {
        hero.x += riding.dx;
        hero.y = riding.py - hero.h;
        hero.vy = Math.max(hero.vy, 0);
      }
      const before = hero.y + hero.h;
      const moved = travel(hero, dt);
      hero.ground = moved.floor;
      if (moved.ceiling >= 0) {
        const centre = Math.floor((hero.x + hero.w / 2) / T);
        const side = solid(centre, moved.ceiling) ? centre : Math.floor((hero.x + (hero.vx >= 0 ? hero.w : 0)) / T);
        bump(side, moved.ceiling);
      }

      // Lifts carry whoever lands on them from above.
      riding = null;
      for (const lift of lifts) {
        const top = lift.py;
        const across = hero.x + hero.w > lift.px && hero.x < lift.px + 3 * T;
        if (across && hero.vy >= 0 && before <= top + 4 && hero.y + hero.h >= top - 1) {
          hero.y = top - hero.h;
          hero.vy = 0;
          riding = lift;
          hero.ground = true;
        }
      }

      hero.x = Math.max(hero.x, camera);
      hero.stride += Math.abs(hero.vx) * dt;
      if (hero.hurt > 0) hero.hurt -= dt;
      if (hero.y > H + 20) die();

      // Lava kills, from the bottom row up.
      const foot = Math.floor((hero.y + hero.h - 2) / T);
      if (tileAt(Math.floor((hero.x + hero.w / 2) / T), foot) === Tile.Lava) die();
    }

    function stepEnemies(dt: number) {
      for (const enemy of enemies) {
        if (!enemy.awake) {
          if (enemy.x < camera + W + 40) enemy.awake = true;
          else continue;
        }
        if (enemy.dead) {
          enemy.vy += GRAVITY * dt;
          enemy.y += enemy.vy * dt;
          continue;
        }
        if (enemy.squashed > 0) {
          enemy.squashed -= dt;
          if (enemy.squashed <= 0) {
            enemy.dead = true;
            enemy.y = H + 100;
          }
          continue;
        }
        if (enemy.kind === "flyer") {
          enemy.x += enemy.vx * dt;
          enemy.y = enemy.home - 20 + Math.sin(clock * 2.2 + enemy.home) * 28;
        } else {
          enemy.vy = Math.min(FALL, enemy.vy + GRAVITY * dt);
          const facing = enemy.vx;
          const moved = travel(enemy, dt);
          if (moved.wall) enemy.vx = -facing;
          // A skating shell knocks out everything it meets.
          if (enemy.shell && enemy.vx !== 0) {
            for (const other of enemies) {
              if (other !== enemy && !other.dead && other.awake && overlap(enemy, other)) defeat(other, 200);
            }
          }
        }
        if (enemy.y > H + 40 || enemy.x < camera - 80) {
          enemy.dead = true;
          continue;
        }

        if (!overlap(hero, enemy) || phase !== "play") continue;
        const fromAbove = hero.vy > 0 && hero.y + hero.h - enemy.y < 10;
        if (enemy.kind === "spiky") {
          hurt();
        } else if (enemy.shell && enemy.vx === 0) {
          // Touching a still shell kicks it away from the hero.
          enemy.vx = hero.x + hero.w / 2 < enemy.x + enemy.w / 2 ? 230 : -230;
          enemy.x += Math.sign(enemy.vx) * 4;
          points += 100;
          if (fromAbove) hero.vy = -STOMP;
        } else if (fromAbove) {
          hero.vy = -STOMP;
          points += 100;
          if (enemy.kind === "shell" && !enemy.shell) {
            enemy.shell = true;
            enemy.vx = 0;
            enemy.y += enemy.h - 12;
            enemy.h = 12;
          } else if (enemy.shell) {
            enemy.vx = 0;
          } else if (enemy.kind === "flyer") {
            defeat(enemy, 0);
          } else {
            enemy.squashed = 0.4;
          }
        } else {
          hurt();
        }
      }
      enemies = enemies.filter((enemy) => !(enemy.dead && enemy.y > H + 40));
    }

    function stepItems(dt: number) {
      for (const item of items) {
        if (item.rise > 0) {
          const lift = Math.min(item.rise, 24 * dt);
          item.y -= lift;
          item.rise -= lift;
          if (item.rise <= 0 && item.kind === "boost") item.vx = 55;
          continue;
        }
        if (item.kind === "boost") {
          item.vy = Math.min(FALL, item.vy + GRAVITY * dt);
          const facing = item.vx;
          if (travel(item, dt).wall) item.vx = -facing;
        }
        if (overlap(hero, item)) {
          grow(item.kind === "flower" ? 2 : 1);
          item.y = H + 100;
        }
      }
      items = items.filter((item) => item.y < H + 40);

      for (const spark of sparks) {
        spark.vy = Math.min(FALL, spark.vy + GRAVITY * dt);
        const facing = spark.vx;
        const moved = travel(spark, dt);
        if (moved.floor) spark.vy = -170;
        if (moved.wall) spark.life = 0;
        spark.vx = facing;
        spark.life -= dt;
        for (const enemy of enemies) {
          if (!enemy.dead && enemy.awake && overlap(spark, enemy)) {
            defeat(enemy, 200);
            spark.life = 0;
          }
        }
      }
      sparks = sparks.filter((spark) => spark.life > 0 && spark.x > camera - 16 && spark.x < camera + W + 16);

      for (const coin of coins) {
        if (!coin.taken && overlap(hero, { x: coin.x * T + 3, y: coin.y * T + 2, w: 10, h: 12 })) {
          coin.taken = true;
          coinCount += 1;
          points += 200;
        }
      }
      if (coinCount >= 100) {
        coinCount -= 100;
        lives += 1;
      }

      for (const lift of lifts) {
        const swing = Math.sin(clock * lift.speed) * lift.range * T;
        const px = lift.x * T + (lift.axis === "x" ? swing : 0);
        const py = lift.y * T + (lift.axis === "y" ? swing : 0);
        lift.dx = px - lift.px;
        lift.dy = py - lift.py;
        lift.px = px;
        lift.py = py;
      }

      for (const bar of bars) {
        const angle = clock * bar.speed;
        for (let link = 1; link <= bar.length; link += 1) {
          const bx = bar.x * T + 8 + Math.cos(angle) * link * 8;
          const by = bar.y * T + 8 + Math.sin(angle) * link * 8;
          if (overlap(hero, { x: bx - 3, y: by - 3, w: 6, h: 6 })) hurt();
        }
      }

      for (const bit of bits) {
        bit.vy += GRAVITY * dt;
        bit.x += bit.vx * dt;
        bit.y += bit.vy * dt;
        bit.life -= dt;
      }
      bits = bits.filter((bit) => bit.life > 0);
      for (const pop of pops) pop.life -= dt;
      pops = pops.filter((pop) => pop.life > 0);
      for (const knock of bumps) knock.life -= dt;
      bumps = bumps.filter((knock) => knock.life > 0);
    }

    function stepFlag(dt: number) {
      phaseClock += dt;
      const pole = level.flag * T;
      const base = (GROUND - 1) * T - (hero.h - 15);
      if (hero.y < base) {
        hero.x = pole - hero.w + 4;
        hero.y = Math.min(base, hero.y + 140 * dt);
      } else {
        hero.x += 60 * dt;
        hero.y = base;
        hero.stride += 60 * dt;
        hero.face = 1;
      }
      // The clock left over turns into points.
      if (time > 0) {
        const tick = Math.min(time, dt * 90);
        time -= tick;
        points += Math.round(tick * 10);
      }
      if (hero.x > pole + 5 * T && time <= 0) phase = "done";
    }

    reset();
    return {
      step(dt, pad) {
        if (phase === "done") return;
        clock += dt;
        if (phase === "dying") {
          phaseClock += dt;
          hero.vy += GRAVITY * dt;
          hero.y += hero.vy * dt;
          if (phaseClock > 1.6) {
            lives -= 1;
            hero.power = 0;
            hero.h = 15;
            if (lives <= 0) phase = "done";
            else reset();
          }
          return;
        }
        if (phase === "flag") {
          stepFlag(dt);
          return;
        }
        time -= dt;
        if (time <= 0) {
          time = 0;
          die();
        }
        stepItems(dt);
        stepHero(dt, pad);
        stepEnemies(dt);
        if (level.checkpoint && hero.x > level.checkpoint * T) checkpointReached = true;
        if (hero.x + hero.w >= level.flag * T + 4) {
          phase = "flag";
          won = true;
          points += Math.max(100, Math.round((GROUND * T - hero.y) / T) * 400);
        }
        camera = Math.max(camera, clamp(hero.x - 130, 0, width - W));
      },

      draw(context) {
        drawWorld(context);
      },

      score: () => points,
      over: () => phase === "done",
      readout: () => `Score ${points} · Coins ${coinCount} · Lives ${Math.max(lives, 0)} · Time ${Math.ceil(time)}`,
      verdict: () => (won ? `Course clear! ${points} points` : `Game over. ${points} points`),
    };

    function drawWorld(context: CanvasRenderingContext2D) {
      const view = Math.round(camera);
      const backdrop = context.createLinearGradient(0, 0, 0, H);
      backdrop.addColorStop(0, palette.sky[0]);
      backdrop.addColorStop(1, palette.sky[1]);
      context.fillStyle = backdrop;
      context.fillRect(0, 0, W, H);
      drawScenery(context, view);

      context.save();
      context.translate(-view, 0);
      const first = Math.max(0, Math.floor(view / T) - 1);
      const last = Math.min(course.cols - 1, first + W / T + 2);
      for (let c = first; c <= last; c += 1) {
        for (let r = 0; r < ROWS; r += 1) {
          const tile = tileAt(c, r);
          if (tile === Tile.Empty) continue;
          const knock = bumps.find((b) => b.x === c && b.y === r);
          drawTile(context, tile, c, r, knock ? -4 : 0);
        }
      }
      drawFlag(context);
      for (const lift of lifts) {
        context.fillStyle = course.theme === "sky" ? "#f2f2ea" : "#c9a86a";
        context.fillRect(lift.px, lift.py, 3 * T, 6);
        context.fillStyle = "rgba(0,0,0,0.25)";
        context.fillRect(lift.px, lift.py + 4, 3 * T, 2);
      }
      for (const coin of coins) if (!coin.taken) drawCoin(context, coin.x * T + 8, coin.y * T + 8);
      for (const pop of pops) drawCoin(context, pop.x, pop.y - (0.5 - pop.life) * 60);
      for (const item of items) drawItem(context, item);
      for (const enemy of enemies) if (enemy.awake) drawEnemy(context, enemy);
      for (const bar of bars) {
        const angle = clock * bar.speed;
        for (let link = 0; link <= bar.length; link += 1) {
          context.fillStyle = link % 2 ? "#ffd23d" : "#ff6a1f";
          context.beginPath();
          context.arc(bar.x * T + 8 + Math.cos(angle) * link * 8, bar.y * T + 8 + Math.sin(angle) * link * 8, 3.5, 0, Math.PI * 2);
          context.fill();
        }
      }
      for (const spark of sparks) {
        context.fillStyle = Math.floor(clock * 20) % 2 ? "#ffd23d" : "#ff6a1f";
        context.fillRect(spark.x, spark.y, spark.w, spark.h);
      }
      for (const bit of bits) {
        context.fillStyle = bit.color;
        context.fillRect(bit.x - 3, bit.y - 3, 6, 6);
      }
      if (!(hero.hurt > 0 && Math.floor(clock * 16) % 2)) drawHero(context);
      context.restore();
      drawHud(context);
    }

    function drawScenery(context: CanvasRenderingContext2D, view: number) {
      if (course.theme === "sky") {
        context.fillStyle = "#ffffff";
        for (let cloud = 0; cloud < 12; cloud += 1) {
          const x = ((cloud * 173 - view * 0.4) % (W + 140)) + (cloud * 173 - view * 0.4 < 0 ? W + 140 : 0) - 70;
          const y = 26 + (cloud % 3) * 22;
          context.beginPath();
          context.ellipse(x, y, 22, 8, 0, 0, Math.PI * 2);
          context.ellipse(x + 14, y - 5, 14, 8, 0, 0, Math.PI * 2);
          context.ellipse(x - 12, y - 3, 12, 7, 0, 0, Math.PI * 2);
          context.fill();
        }
        context.fillStyle = "#7fd36c";
        for (let hill = 0; hill < 8; hill += 1) {
          const x = ((hill * 260 - view * 0.6) % (W + 260) + W + 260) % (W + 260) - 130;
          context.beginPath();
          context.ellipse(x, GROUND * T, 70 + (hill % 2) * 30, 34 + (hill % 3) * 12, 0, Math.PI, 0);
          context.fill();
        }
      } else if (course.theme === "cave") {
        for (let gem = 0; gem < 24; gem += 1) {
          const x = (((gem * 97 - view * 0.3) % (W + 40)) + W + 40) % (W + 40) - 20;
          const y = 30 + ((gem * 53) % 150);
          context.fillStyle = gem % 3 ? "rgba(126,246,255,0.5)" : "rgba(255,95,210,0.45)";
          context.beginPath();
          context.moveTo(x, y - 6);
          context.lineTo(x + 4, y);
          context.lineTo(x, y + 6);
          context.lineTo(x - 4, y);
          context.fill();
        }
      } else {
        // Keep windows with the lava glowing below.
        for (let arch = 0; arch < 8; arch += 1) {
          const x = (((arch * 150 - view * 0.5) % (W + 150)) + W + 150) % (W + 150) - 75;
          context.fillStyle = "rgba(255,120,60,0.18)";
          context.fillRect(x, 70, 26, 48);
          context.beginPath();
          context.arc(x + 13, 70, 13, Math.PI, 0);
          context.fill();
        }
        const glow = context.createLinearGradient(0, H - 70, 0, H);
        glow.addColorStop(0, "rgba(255,80,20,0)");
        glow.addColorStop(1, "rgba(255,80,20,0.35)");
        context.fillStyle = glow;
        context.fillRect(0, H - 70, W, 70);
      }
    }

    function drawTile(context: CanvasRenderingContext2D, tile: Tile, c: number, r: number, lift: number) {
      const x = c * T;
      const y = r * T + lift;
      switch (tile) {
        case Tile.Ground: {
          context.fillStyle = palette.ground;
          context.fillRect(x, y, T, T);
          context.fillStyle = palette.edge;
          context.fillRect(x + 3, y + 6, 2, 2);
          context.fillRect(x + 10, y + 11, 2, 2);
          if (tileAt(c, r - 1) === Tile.Empty || tileAt(c, r - 1) === Tile.Lava) {
            context.fillStyle = palette.top;
            context.fillRect(x, y, T, 4);
          }
          break;
        }
        case Tile.Brick: {
          context.fillStyle = palette.brick;
          context.fillRect(x, y, T, T);
          context.fillStyle = palette.mortar;
          context.fillRect(x, y + 7, T, 1);
          context.fillRect(x, y + 15, T, 1);
          context.fillRect(x + 7, y, 1, 7);
          context.fillRect(x + 3, y + 8, 1, 7);
          context.fillRect(x + 12, y + 8, 1, 7);
          break;
        }
        case Tile.Coin:
        case Tile.Power: {
          const flash = Math.floor(clock * 3) % 3 === 0;
          context.fillStyle = flash ? "#ffe27a" : "#f2b632";
          context.fillRect(x, y, T, T);
          context.fillStyle = "#8a5a12";
          context.fillRect(x, y + 15, T, 1);
          context.fillRect(x + 15, y, 1, T);
          context.fillStyle = "#ffffff";
          context.font = "bold 12px monospace";
          context.textAlign = "center";
          context.fillText(tile === Tile.Power ? "!" : "?", x + 8, y + 12);
          context.textAlign = "left";
          break;
        }
        case Tile.Used: {
          context.fillStyle = "#8a6a3a";
          context.fillRect(x, y, T, T);
          context.fillStyle = "#5c4422";
          context.fillRect(x + 2, y + 2, 2, 2);
          context.fillRect(x + 12, y + 2, 2, 2);
          context.fillRect(x + 2, y + 12, 2, 2);
          context.fillRect(x + 12, y + 12, 2, 2);
          break;
        }
        case Tile.Stone: {
          context.fillStyle = palette.stone;
          context.fillRect(x, y, T, T);
          context.fillStyle = "rgba(255,255,255,0.25)";
          context.fillRect(x, y, T, 2);
          context.fillRect(x, y, 2, T);
          context.fillStyle = "rgba(0,0,0,0.3)";
          context.fillRect(x, y + 14, T, 2);
          context.fillRect(x + 14, y, 2, T);
          break;
        }
        case Tile.Pipe: {
          const left = tileAt(c - 1, r) !== Tile.Pipe;
          const top = tileAt(c, r - 1) !== Tile.Pipe;
          context.fillStyle = "#2fa84f";
          context.fillRect(x, y, T, T);
          context.fillStyle = left ? "#8af0a0" : "#1d7a37";
          context.fillRect(left ? x + 3 : x + 11, y, 3, T);
          if (top) {
            context.fillStyle = "#3fc463";
            context.fillRect(left ? x - 2 : x, y, T + 2, 7);
            context.fillStyle = "#1d7a37";
            context.fillRect(left ? x - 2 : x, y + 6, T + 2, 1);
          }
          break;
        }
        case Tile.Lava: {
          const wave = Math.sin(clock * 4 + c) * 2;
          context.fillStyle = "#ff5a1f";
          context.fillRect(x, y + 3 + wave, T, T);
          context.fillStyle = "#ffd23d";
          context.fillRect(x, y + 3 + wave, T, 2);
          break;
        }
        default:
          break;
      }
    }

    function drawFlag(context: CanvasRenderingContext2D) {
      const x = level.flag * T + 7;
      context.fillStyle = "#e8e8e8";
      context.fillRect(x, 3 * T, 2, (GROUND - 3) * T);
      context.fillStyle = "#7dff8a";
      context.beginPath();
      context.arc(x + 1, 3 * T - 2, 4, 0, Math.PI * 2);
      context.fill();
      const drop = phase === "flag" ? Math.min(phaseClock * 140, (GROUND - 5) * T) : 0;
      context.fillStyle = "#38d6ff";
      context.beginPath();
      context.moveTo(x, 3 * T + 4 + drop);
      context.lineTo(x - 16, 3 * T + 10 + drop);
      context.lineTo(x, 3 * T + 16 + drop);
      context.fill();
      // A little gatehouse to walk into.
      const house = (level.flag + 4) * T;
      context.fillStyle = palette.brick;
      context.fillRect(house, (GROUND - 4) * T, 4 * T, 4 * T);
      context.fillStyle = palette.mortar;
      for (let band = 0; band < 4; band += 1) context.fillRect(house, (GROUND - 4 + band) * T + 7, 4 * T, 1);
      context.fillStyle = "#120a08";
      context.fillRect(house + 24, (GROUND - 2) * T, 16, 2 * T);
      context.beginPath();
      context.arc(house + 32, (GROUND - 2) * T, 8, Math.PI, 0);
      context.fill();
      for (let tooth = 0; tooth < 4; tooth += 1) {
        context.fillStyle = palette.brick;
        context.fillRect(house + tooth * 16 + 2, (GROUND - 5) * T + 6, 10, 10);
      }
    }

    function drawCoin(context: CanvasRenderingContext2D, x: number, y: number) {
      const turn = Math.abs(Math.sin(clock * 5 + x * 0.1));
      context.fillStyle = "#ffd23d";
      context.beginPath();
      context.ellipse(x, y, 1 + turn * 4, 6, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff4b0";
      context.fillRect(x - 0.5, y - 3, 1, 6);
    }

    function drawItem(context: CanvasRenderingContext2D, item: Item) {
      if (item.kind === "boost") {
        // A spinning star crystal.
        context.fillStyle = "#ff5fd2";
        context.beginPath();
        context.moveTo(item.x + 6, item.y);
        context.lineTo(item.x + 12, item.y + 6);
        context.lineTo(item.x + 6, item.y + 12);
        context.lineTo(item.x, item.y + 6);
        context.fill();
        context.fillStyle = "#ffffff";
        context.fillRect(item.x + 5, item.y + 3, 2, 4);
      } else {
        context.fillStyle = "#2fa84f";
        context.fillRect(item.x + 5, item.y + 6, 2, 6);
        context.fillStyle = Math.floor(clock * 8) % 2 ? "#ff6a1f" : "#ffd23d";
        context.beginPath();
        context.arc(item.x + 6, item.y + 4, 5, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#ffffff";
        context.fillRect(item.x + 5, item.y + 3, 2, 2);
      }
    }

    function drawEnemy(context: CanvasRenderingContext2D, enemy: Enemy) {
      const { x, y, w, h } = enemy;
      const step = Math.floor(clock * 8) % 2;
      context.save();
      if (enemy.dead) {
        context.translate(x + w / 2, y + h / 2);
        context.scale(1, -1);
        context.translate(-(x + w / 2), -(y + h / 2));
      }
      if (enemy.kind === "walker") {
        if (enemy.squashed > 0) {
          context.fillStyle = "#8a4bd6";
          context.fillRect(x, y + h - 5, w, 5);
        } else {
          context.fillStyle = "#8a4bd6";
          context.beginPath();
          context.ellipse(x + w / 2, y + 7, 7, 7, 0, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#ffffff";
          context.fillRect(x + 3, y + 4, 3, 4);
          context.fillRect(x + 8, y + 4, 3, 4);
          context.fillStyle = "#14101c";
          context.fillRect(x + (enemy.vx < 0 ? 3 : 4), y + 5, 2, 2);
          context.fillRect(x + (enemy.vx < 0 ? 8 : 9), y + 5, 2, 2);
          context.fillStyle = "#3a1d60";
          context.fillRect(x + (step ? 1 : 3), y + h - 3, 4, 3);
          context.fillRect(x + (step ? 9 : 7), y + h - 3, 4, 3);
        }
      } else if (enemy.kind === "shell") {
        context.fillStyle = "#2fbf8f";
        context.beginPath();
        context.ellipse(x + w / 2, y + (enemy.shell ? 7 : 9), 7, enemy.shell ? 6 : 7, 0, Math.PI, 0);
        context.fill();
        context.fillStyle = "#e9f7d0";
        context.fillRect(x + 1, y + (enemy.shell ? 7 : 9), w - 2, 3);
        if (!enemy.shell) {
          context.fillStyle = "#f2d27a";
          context.fillRect(enemy.vx < 0 ? x - 2 : x + w - 3, y + 2, 5, 6);
          context.fillStyle = "#14101c";
          context.fillRect(enemy.vx < 0 ? x - 1 : x + w, y + 4, 2, 2);
          context.fillStyle = "#f2d27a";
          context.fillRect(x + (step ? 2 : 4), y + h - 4, 3, 4);
          context.fillRect(x + (step ? 9 : 7), y + h - 4, 3, 4);
        }
      } else if (enemy.kind === "spiky") {
        context.fillStyle = "#e5484d";
        context.beginPath();
        context.ellipse(x + w / 2, y + 8, 7, 6, 0, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#ffffff";
        for (let spike = 0; spike < 4; spike += 1) {
          context.beginPath();
          context.moveTo(x + 1 + spike * 4, y + 4);
          context.lineTo(x + 3 + spike * 4, y - 1);
          context.lineTo(x + 5 + spike * 4, y + 4);
          context.fill();
        }
        context.fillStyle = "#14101c";
        context.fillRect(x + (enemy.vx < 0 ? 2 : 10), y + 7, 2, 2);
      } else {
        // A flyer: a bat in caves and keeps, a bird in the open.
        context.fillStyle = course.theme === "sky" ? "#ff9b3d" : "#6c4ad6";
        context.beginPath();
        context.ellipse(x + w / 2, y + 7, 5, 5, 0, 0, Math.PI * 2);
        context.fill();
        const flap = step ? -5 : 3;
        context.beginPath();
        context.moveTo(x + 3, y + 6);
        context.lineTo(x - 4, y + 6 + flap);
        context.lineTo(x + 3, y + 9);
        context.moveTo(x + w - 3, y + 6);
        context.lineTo(x + w + 4, y + 6 + flap);
        context.lineTo(x + w - 3, y + 9);
        context.fill();
        context.fillStyle = "#ffffff";
        context.fillRect(x + 5, y + 5, 2, 2);
      }
      context.restore();
    }

    /** The hero: a runner in a cap and jacket, cyan by default, gold when boosted, orange with sparks. */
    function drawHero(context: CanvasRenderingContext2D) {
      const { x, y, h, face } = hero;
      const jacket = hero.power === 2 ? "#ff8a3d" : hero.power === 1 ? "#ffd23d" : "#2fd3ff";
      const big = h > 20;
      const running = hero.ground && Math.abs(hero.vx) > 5;
      const leg = running ? Math.floor(hero.stride / 6) % 2 : 0;
      context.save();
      context.translate(x + 6, y);
      context.scale(face, 1);
      context.translate(-6, 0);
      const head = 0;
      // Cap and peak.
      context.fillStyle = jacket;
      context.fillRect(1, head, 10, 3);
      context.fillRect(8, head + 2, 5, 2);
      // Face.
      context.fillStyle = "#f1c27d";
      context.fillRect(2, head + 3, 9, 4);
      context.fillStyle = "#14101c";
      context.fillRect(8, head + 4, 2, 2);
      const body = head + 7;
      const bodyH = big ? 12 : 4;
      context.fillStyle = jacket;
      context.fillRect(1, body, 10, bodyH);
      context.fillStyle = "#ffffff";
      context.fillRect(5, body + 1, 2, bodyH - 1);
      // Arms swing opposite the legs.
      context.fillStyle = "#f1c27d";
      context.fillRect(leg ? 0 : 10, body + 2, 2, 2);
      const legs = body + bodyH;
      const legH = h - (legs - head) - 2;
      context.fillStyle = "#1d2a55";
      if (!hero.ground) {
        context.fillRect(1, legs, 4, legH);
        context.fillRect(7, legs - 1, 4, legH);
      } else {
        context.fillRect(leg ? 0 : 2, legs, 4, legH);
        context.fillRect(leg ? 8 : 6, legs, 4, legH);
      }
      context.fillStyle = "#ffffff";
      context.fillRect(leg && hero.ground ? -1 : 1, h - 2, 5, 2);
      context.fillRect(leg && hero.ground ? 8 : 7, h - 2, 5, 2);
      context.restore();
    }

    function drawHud(context: CanvasRenderingContext2D) {
      context.fillStyle = "rgba(0,0,0,0.35)";
      context.fillRect(0, 0, W, 14);
      context.font = "bold 9px monospace";
      context.fillStyle = "#ffffff";
      context.textAlign = "left";
      context.fillText(`SCORE ${String(points).padStart(6, "0")}`, 4, 10);
      context.fillStyle = "#ffd23d";
      context.fillText(`● ${String(coinCount).padStart(2, "0")}`, 92, 10);
      context.fillStyle = "#ffffff";
      context.textAlign = "center";
      context.fillText(course.title.toUpperCase(), 178, 10);
      context.textAlign = "right";
      context.fillText(`♥${Math.max(lives, 0)}  TIME ${String(Math.ceil(time)).padStart(3, "0")}`, W - 4, 10);
      context.textAlign = "left";
    }
  };
}
