import { H, W, type Machine, type Press } from "./types";

const CELL = 16;
const COLS = W / CELL;
const ROWS = H / CELL;

type Turn = [number, number];

const TURNS: Partial<Record<Press, Turn>> = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
};

export function snake(): Machine {
  const body = [
    { x: 9, y: 7 },
    { x: 8, y: 7 },
    { x: 7, y: 7 },
  ];
  // Two turns can be banked, so a quick corner is not lost between moves.
  const queue: Turn[] = [];
  let heading: Turn = [1, 0];
  let food = place();
  let clock = 0;
  let eaten = 0;
  let dead = false;

  function place() {
    for (;;) {
      const spot = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
      if (!body.some((part) => part.x === spot.x && part.y === spot.y)) return spot;
    }
  }

  function advance() {
    heading = queue.shift() ?? heading;
    const head = { x: body[0].x + heading[0], y: body[0].y + heading[1] };
    const grows = head.x === food.x && head.y === food.y;
    const reach = grows ? body : body.slice(0, -1);
    if (
      head.x < 0 ||
      head.x >= COLS ||
      head.y < 0 ||
      head.y >= ROWS ||
      reach.some((part) => part.x === head.x && part.y === head.y)
    ) {
      dead = true;
      return;
    }
    body.unshift(head);
    if (!grows) {
      body.pop();
      return;
    }
    eaten += 1;
    if (body.length === COLS * ROWS) dead = true;
    else food = place();
  }

  return {
    step(dt, pad) {
      if (dead) return;
      for (const press of pad.presses) {
        const turn = TURNS[press];
        if (!turn || queue.length >= 2) continue;
        const last = queue[queue.length - 1] ?? heading;
        // Neither straight on nor straight back is a turn.
        if (turn[0] === last[0] || turn[1] === last[1]) continue;
        queue.push(turn);
      }
      clock += dt;
      const pace = Math.max(0.065, 0.13 - eaten * 0.0025);
      while (clock >= pace && !dead) {
        clock -= pace;
        advance();
      }
    },
    draw(context) {
      context.fillStyle = "#04120a";
      context.fillRect(0, 0, W, H);
      context.fillStyle = "rgba(125,255,138,0.045)";
      for (let y = 0; y < ROWS; y += 1) {
        for (let x = y % 2; x < COLS; x += 2) {
          context.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }
      context.fillStyle = "#ff5fd2";
      context.fillRect(food.x * CELL + 4, food.y * CELL + 2, 8, 12);
      context.fillRect(food.x * CELL + 2, food.y * CELL + 4, 12, 8);
      body.forEach((part, index) => {
        context.fillStyle = index === 0 ? "#d9ffd0" : dead ? "#3f7a48" : "#7dff8a";
        context.fillRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2);
      });
    },
    score: () => eaten * 10,
    over: () => dead,
  };
}
