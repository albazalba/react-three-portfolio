/** Every cabinet draws to the same low-resolution screen. */
export const W = 320;
export const H = 240;

export type Press = "left" | "right" | "up" | "down" | "fire";

/** What is held right now, plus the presses that landed since the last step. */
export type Pad = Record<Press, boolean> & { presses: Press[] };

export type Machine = {
  step(dt: number, pad: Pad): void;
  draw(context: CanvasRenderingContext2D): void;
  score(): number;
  over(): boolean;
  /** Replaces the plain score line, for games that are not about points. */
  readout?(): string;
  verdict?(): string;
};

export type GameDef = {
  title: string;
  keys: string;
  buttons: Press[];
  /** Whether a best score is worth keeping. */
  ranked: boolean;
  start(): Machine;
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}
