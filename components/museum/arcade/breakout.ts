import { H, W, clamp, type Machine } from "./types";

const COLS = 10;
const ROWS = 6;
const BRICK_W = 29;
const BRICK_H = 10;
const GAP = 2;
const LEFT = 6;
const TOP = 34;
const PADDLE_W = 46;
const PADDLE_H = 6;
const PADDLE_Y = 224;
const BALL = 3;
const ROW_COLORS = ["#ff5f6d", "#ff9a4a", "#ffd84a", "#7dff8a", "#7ef6ff", "#9d7bff"];

export function breakout(): Machine {
  let bricks = wall();
  let paddle = W / 2;
  let lives = 3;
  let points = 0;
  let level = 1;
  let x = paddle;
  let y = PADDLE_Y - BALL - 1;
  let vx = 0;
  let vy = 0;
  // The ball rides the paddle for a moment before each serve.
  let held = 0.8;

  function wall() {
    return Array.from({ length: COLS * ROWS }, () => true);
  }

  function pace() {
    return 150 + (level - 1) * 18;
  }

  function aim(angle: number) {
    vx = Math.sin(angle) * pace();
    vy = -Math.cos(angle) * pace();
  }

  function brickAt(px: number, py: number) {
    const col = Math.floor((px - LEFT) / (BRICK_W + GAP));
    const row = Math.floor((py - TOP) / (BRICK_H + GAP));
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1;
    if (px - LEFT - col * (BRICK_W + GAP) > BRICK_W) return -1;
    if (py - TOP - row * (BRICK_H + GAP) > BRICK_H) return -1;
    const index = row * COLS + col;
    return bricks[index] ? index : -1;
  }

  function smash(index: number) {
    bricks[index] = false;
    points += (ROWS - Math.floor(index / COLS)) * 10;
  }

  return {
    step(dt, pad) {
      if (lives <= 0) return;
      const push = (pad.right ? 1 : 0) - (pad.left ? 1 : 0);
      paddle = clamp(paddle + push * 230 * dt, PADDLE_W / 2, W - PADDLE_W / 2);

      if (held > 0) {
        held -= dt;
        x = paddle;
        y = PADDLE_Y - BALL - 1;
        if (held <= 0 || pad.presses.includes("fire")) {
          held = 0;
          aim(Math.random() * 0.8 - 0.4);
        }
        return;
      }

      // Short hops, so a fast ball cannot pass through a brick or the paddle.
      const hops = Math.max(1, Math.ceil((Math.hypot(vx, vy) * dt) / 2));
      for (let hop = 0; hop < hops; hop += 1) {
        x += (vx * dt) / hops;
        if (x < BALL) {
          x = BALL;
          vx = Math.abs(vx);
        } else if (x > W - BALL) {
          x = W - BALL;
          vx = -Math.abs(vx);
        }
        let hit = brickAt(x + Math.sign(vx) * BALL, y);
        if (hit >= 0) {
          smash(hit);
          x -= (vx * dt) / hops;
          vx = -vx;
        }

        y += (vy * dt) / hops;
        if (y < BALL) {
          y = BALL;
          vy = Math.abs(vy);
        }
        hit = brickAt(x, y + Math.sign(vy) * BALL);
        if (hit >= 0) {
          smash(hit);
          y -= (vy * dt) / hops;
          vy = -vy;
        }

        const onPaddle =
          vy > 0 &&
          y + BALL >= PADDLE_Y &&
          y + BALL <= PADDLE_Y + PADDLE_H + 4 &&
          Math.abs(x - paddle) <= PADDLE_W / 2 + BALL;
        if (onPaddle) {
          // Where the ball lands on the paddle decides the angle it leaves at.
          aim(((x - paddle) / (PADDLE_W / 2)) * 1.05);
          y = PADDLE_Y - BALL;
        }

        if (y > H + BALL) {
          lives -= 1;
          held = 0.8;
          return;
        }
      }

      if (!bricks.some(Boolean)) {
        level += 1;
        bricks = wall();
        held = 0.8;
      }
    },
    draw(context) {
      context.fillStyle = "#0a0714";
      context.fillRect(0, 0, W, H);
      bricks.forEach((standing, index) => {
        if (!standing) return;
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const bx = LEFT + col * (BRICK_W + GAP);
        const by = TOP + row * (BRICK_H + GAP);
        context.fillStyle = ROW_COLORS[row];
        context.fillRect(bx, by, BRICK_W, BRICK_H);
        context.fillStyle = "rgba(255,255,255,0.28)";
        context.fillRect(bx, by, BRICK_W, 2);
      });
      context.fillStyle = "#f4efe6";
      context.fillRect(paddle - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H);
      context.fillStyle = "#ffb14a";
      context.fillRect(paddle - PADDLE_W / 2, PADDLE_Y, 5, PADDLE_H);
      context.fillRect(paddle + PADDLE_W / 2 - 5, PADDLE_Y, 5, PADDLE_H);
      if (lives > 0) {
        context.fillStyle = "#ffffff";
        context.fillRect(x - BALL, y - BALL, BALL * 2, BALL * 2);
      }
      for (let life = 0; life < lives; life += 1) {
        context.fillStyle = "#ffb14a";
        context.fillRect(8 + life * 12, 12, 8, 4);
      }
      context.fillStyle = "rgba(244,239,230,0.6)";
      context.font = "10px monospace";
      context.textAlign = "right";
      context.fillText(`LEVEL ${level}`, W - 8, 17);
      context.textAlign = "left";
    },
    score: () => points,
    over: () => lives <= 0,
  };
}
