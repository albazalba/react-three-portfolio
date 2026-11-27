import { getSnapshot, setTv } from "../store";
import { GAMES, KEYS, type ArcadeId } from "./games";
import { H, W, type Machine, type Pad, type Press } from "./types";

// The television is wider than the cabinets' screens, so the game sits in the middle with black either side.
const SCALE = 2;
const SCREEN_W = 854;
const SCREEN_H = H * SCALE;
const INSET = (SCREEN_W - W * SCALE) / 2;

let canvas: HTMLCanvasElement | null = null;
let machine: Machine | null = null;
let endedAt = 0;
const pad: Pad = { left: false, right: false, up: false, down: false, fire: false, presses: [] };

function current() {
  return getSnapshot().tv.game as ArcadeId;
}

function line(game: Machine) {
  return game.readout?.() ?? `Score ${game.score()}`;
}

function storedBest(id: ArcadeId) {
  try {
    return Number(window.localStorage.getItem(`loft-arcade-${id}`)) || 0;
  } catch {
    return 0;
  }
}

function caption(context: CanvasRenderingContext2D, text: string, y: number, size: number, color: string) {
  context.font = `bold ${size}px monospace`;
  context.fillStyle = color;
  context.fillText(text, SCREEN_W / 2, y);
}

function render() {
  const context = canvas?.getContext("2d");
  if (!context || !machine) return;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = "#000000";
  context.fillRect(0, 0, SCREEN_W, SCREEN_H);
  context.setTransform(SCALE, 0, 0, SCALE, INSET, 0);
  context.imageSmoothingEnabled = false;
  // Scrolling games draw scenery past their edges; the black bars either side stay black.
  context.save();
  context.beginPath();
  context.rect(0, 0, W, H);
  context.clip();
  machine.draw(context);
  context.restore();
  context.setTransform(1, 0, 0, 1, 0, 0);
  const { stage, verdict } = getSnapshot().tv;
  if (stage === "playing") return;
  context.fillStyle = "rgba(0,0,0,0.62)";
  context.fillRect(0, 0, SCREEN_W, SCREEN_H);
  context.textAlign = "center";
  const title = GAMES[current()].title;
  caption(context, stage === "over" ? verdict.toUpperCase() : title.toUpperCase(), 220, 40, "#ffffff");
  caption(context, stage === "over" ? "PRESS SPACE TO PLAY AGAIN" : "PRESS SPACE", 280, 24, "#7ef6ff");
  context.textAlign = "left";
}

/** The canvas the television shows while someone is on the sofa. */
export function tvCanvas() {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    machine = GAMES[current()].start();
    render();
  }
  return canvas;
}

/** Reads the saved best for the loaded game when the visitor sits down. */
export function tvWake() {
  const best = storedBest(current());
  if (best !== getSnapshot().tv.best) setTv({ best });
  render();
}

export function tvPick(id: ArcadeId) {
  machine = GAMES[id].start();
  setTv({ game: id, stage: "ready", readout: "", verdict: "", best: storedBest(id) });
  tvRelease();
  render();
}

export function tvBegin() {
  // A beat after losing, so the key that was being mashed does not start the next game.
  if (getSnapshot().tv.stage === "playing" || performance.now() - endedAt < 500) return;
  machine = GAMES[current()].start();
  tvRelease();
  setTv({ stage: "playing", readout: line(machine), verdict: "" });
}

export function tvHold(press: Press, down: boolean) {
  if (down && !pad[press]) pad.presses.push(press);
  pad[press] = down;
}

export function tvRelease() {
  pad.left = pad.right = pad.up = pad.down = pad.fire = false;
  pad.presses.length = 0;
}

/** Feeds one key event to the console. Returns true when the key belongs to the game. */
export function tvKey(code: string, down: boolean, repeat: boolean) {
  const press = KEYS[code];
  if (!press) return false;
  if (!down) {
    pad[press] = false;
    return true;
  }
  if (getSnapshot().tv.stage !== "playing") {
    if (press === "fire" && !repeat) tvBegin();
    return true;
  }
  if (!repeat) pad.presses.push(press);
  pad[press] = true;
  return true;
}

/** Runs the loaded game on by one frame and redraws the screen. */
export function tvStep(dt: number) {
  const tv = getSnapshot().tv;
  if (!machine || tv.stage !== "playing") return;
  machine.step(dt, pad);
  pad.presses.length = 0;
  const readout = line(machine);
  if (readout !== tv.readout) setTv({ readout });
  if (machine.over()) {
    const id = current();
    const score = machine.score();
    endedAt = performance.now();
    let best = tv.best;
    if (GAMES[id].ranked && score > best) {
      best = score;
      try {
        window.localStorage.setItem(`loft-arcade-${id}`, String(score));
      } catch {
        /* The score still shows for this visit. */
      }
    }
    setTv({ stage: "over", verdict: machine.verdict?.() ?? "Game over.", best });
  }
  render();
}
