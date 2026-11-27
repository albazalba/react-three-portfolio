import type { GameId } from "../layout";
import { breakout } from "./breakout";
import { crystalCaves, lavaKeep, sunnyRun } from "./courses";
import { invaders } from "./invaders";
import { pong } from "./pong";
import { snake } from "./snake";
import type { GameDef, Press } from "./types";

// The cabinets' games, and the platform courses that only the console in the billiards room plays.
export type ArcadeId = Exclude<GameId, "signal"> | "sunny" | "caves" | "keep";

const PLATFORM_KEYS = "Left and right to run, Up or Space to jump (hold it to jump higher). Down throws sparks once you have the flower.";

export const GAMES: Record<ArcadeId, GameDef> = {
  sunny: {
    title: "Sunny Run",
    keys: PLATFORM_KEYS,
    buttons: ["left", "right", "down", "fire"],
    ranked: true,
    start: sunnyRun,
  },
  caves: {
    title: "Crystal Caves",
    keys: PLATFORM_KEYS,
    buttons: ["left", "right", "down", "fire"],
    ranked: true,
    start: crystalCaves,
  },
  keep: {
    title: "Lava Keep",
    keys: PLATFORM_KEYS,
    buttons: ["left", "right", "down", "fire"],
    ranked: true,
    start: lavaKeep,
  },
  snake: {
    title: "Snake",
    keys: "Arrow keys or WASD to steer.",
    buttons: ["left", "up", "down", "right"],
    ranked: true,
    start: snake,
  },
  breakout: {
    title: "Breakout",
    keys: "Left and right to move the paddle. Space serves early.",
    buttons: ["left", "right", "fire"],
    ranked: true,
    start: breakout,
  },
  invaders: {
    title: "Invaders",
    keys: "Left and right to move. Space to fire.",
    buttons: ["left", "right", "fire"],
    ranked: true,
    start: invaders,
  },
  pong: {
    title: "Pong",
    keys: "Up and down to move the paddle on the left.",
    buttons: ["up", "down"],
    ranked: false,
    start: pong,
  },
};

export const KEYS: Record<string, Press> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  Space: "fire",
};
