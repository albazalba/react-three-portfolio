import { H, W, clamp, type Machine } from "./types";

const PADDLE_W = 5;
const PADDLE_H = 36;
const MARGIN = 12;
const BALL = 3;
const GOAL = 7;
const SERVE = 150;
const TOP_SPEED = 330;

export function pong(): Machine {
  let you = H / 2;
  let cpu = H / 2;
  let yours = 0;
  let theirs = 0;
  let x = W / 2;
  let y = H / 2;
  let vx = 0;
  let vy = 0;
  let wait = 0;

  function serve(direction: number) {
    const angle = Math.random() * 0.9 - 0.45;
    x = W / 2;
    y = H / 2;
    vx = Math.cos(angle) * SERVE * direction;
    vy = Math.sin(angle) * SERVE;
    wait = 0.9;
  }

  /** Sends the ball back, a little faster, angled by where it met the paddle. */
  function strike(centre: number, direction: number) {
    const speed = Math.min(TOP_SPEED, Math.hypot(vx, vy) * 1.06);
    const angle = clamp((y - centre) / (PADDLE_H / 2), -1, 1) * 0.95;
    vx = Math.cos(angle) * speed * direction;
    vy = Math.sin(angle) * speed;
  }

  const done = () => yours >= GOAL || theirs >= GOAL;

  serve(1);

  return {
    step(dt, pad) {
      if (done()) return;
      const push = (pad.down ? 1 : 0) - (pad.up ? 1 : 0);
      you = clamp(you + push * 190 * dt, PADDLE_H / 2, H - PADDLE_H / 2);

      // The other side follows a ball coming its way, and not quite fast enough.
      const reach = 118 * dt;
      const target = vx > 0 ? y : H / 2;
      cpu = clamp(cpu + clamp(target - cpu, -reach, reach), PADDLE_H / 2, H - PADDLE_H / 2);

      if (wait > 0) {
        wait -= dt;
        return;
      }

      const hops = Math.max(1, Math.ceil((Math.hypot(vx, vy) * dt) / 3));
      for (let hop = 0; hop < hops; hop += 1) {
        x += (vx * dt) / hops;
        y += (vy * dt) / hops;
        if (y < BALL) {
          y = BALL;
          vy = Math.abs(vy);
        } else if (y > H - BALL) {
          y = H - BALL;
          vy = -Math.abs(vy);
        }

        const left = MARGIN + PADDLE_W;
        const right = W - MARGIN - PADDLE_W;
        if (vx < 0 && x - BALL <= left && x >= MARGIN && Math.abs(y - you) <= PADDLE_H / 2 + BALL) {
          x = left + BALL;
          strike(you, 1);
        } else if (vx > 0 && x + BALL >= right && x <= W - MARGIN && Math.abs(y - cpu) <= PADDLE_H / 2 + BALL) {
          x = right - BALL;
          strike(cpu, -1);
        }

        if (x < -BALL) {
          theirs += 1;
          serve(-1);
          return;
        }
        if (x > W + BALL) {
          yours += 1;
          serve(1);
          return;
        }
      }
    },
    draw(context) {
      context.fillStyle = "#04080f";
      context.fillRect(0, 0, W, H);
      context.fillStyle = "rgba(126,246,255,0.28)";
      for (let dash = 4; dash < H; dash += 14) context.fillRect(W / 2 - 1, dash, 2, 8);
      context.font = "bold 30px monospace";
      context.textAlign = "center";
      context.fillStyle = "rgba(126,246,255,0.5)";
      context.fillText(String(yours), W / 2 - 40, 40);
      context.fillText(String(theirs), W / 2 + 40, 40);
      context.textAlign = "left";
      context.fillStyle = "#7ef6ff";
      context.fillRect(MARGIN, you - PADDLE_H / 2, PADDLE_W, PADDLE_H);
      context.fillStyle = "#f4efe6";
      context.fillRect(W - MARGIN - PADDLE_W, cpu - PADDLE_H / 2, PADDLE_W, PADDLE_H);
      if (!done()) {
        context.fillStyle = "#ffffff";
        context.fillRect(x - BALL, y - BALL, BALL * 2, BALL * 2);
      }
    },
    score: () => yours,
    over: done,
    readout: () => `You ${yours} · CPU ${theirs} · first to ${GOAL}`,
    verdict: () => (yours > theirs ? "You win." : "The machine wins."),
  };
}
