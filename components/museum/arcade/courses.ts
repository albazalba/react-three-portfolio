import { platformer, type Course } from "./platformer";

// Three courses for the console, each its own game. Columns are tiles from the left; rows count down from the top,
// with the ground on row 13. Gaps stay within four tiles and walls within four high, the most one jump clears.

export const sunny: Course = {
  title: "Sunny Run",
  theme: "sky",
  cols: 190,
  time: 300,
  build(level) {
    level.row(12, 9, "?").row(16, 9, "B?BMB").row(18, 5, "?");
    level.pipe(26, 2).enemy("walker", 24);
    level.pipe(34, 3).enemy("walker", 38, 40);
    level.pit(44, 46).row(44, 8, "CCC");
    level.row(50, 9, "BBMBB").row(49, 5, "C.C.C").enemy("shell", 56);
    level.pipe(60, 4).enemy("walker", 64, 66);
    level.stairs(70, 4).pit(74, 76).stairs(77, 4, true);
    level.checkpoint = 84;
    level.row(86, 9, "?B?B?").row(87, 5, "BBMB").enemy("walker", 88, 90);
    level.pit(98, 107).lift(102, 9, "x", 3, 1.2).row(100, 6, "CCCCCC");
    level.enemyAt("flyer", 114, 8).enemyAt("flyer", 120, 9);
    level.pipe(124, 2).pipe(132, 3).enemy("shell", 128).enemy("walker", 136, 138, 140);
    level.row(144, 9, "BB?BB?BB").row(146, 5, "?..?");
    level.pit(154, 156).enemy("walker", 160, 162);
    level.stairs(166, 8);
    level.flag = 178;
  },
};

export const caves: Course = {
  title: "Crystal Caves",
  theme: "cave",
  cols: 196,
  time: 300,
  build(level) {
    level.ceiling(0, 195);
    level.row(10, 9, "M").row(14, 9, "BBBB?BBB").enemy("walker", 18, 20);
    level.fill(26, 10, 2, 3).enemy("spiky", 29).fill(32, 9, 2, 4);
    level.pit(39, 41).row(39, 8, "CCC");
    level.row(44, 9, "BBBBBBBB").row(44, 5, "B?BB?BBM");
    level.enemyAt("walker", 46, 8).enemyAt("walker", 49, 8).enemy("spiky", 52, 55);
    level.pit(60, 69).lift(62, 10, "y", 2.5, 1.1).lift(66, 8, "y", 2.5, 1.1);
    level.checkpoint = 74;
    level.row(76, 9, "?B?B?B").enemy("shell", 80).enemy("walker", 84, 86);
    // A low tunnel: the roof comes down to row 6, with coins and spiked crawlers inside.
    level.fill(90, 2, 20, 5).row(92, 10, "CCCCCCCCCC").enemy("spiky", 95, 99, 103);
    level.pit(112, 114).pipe(118, 3).enemy("walker", 122, 124);
    level.row(128, 9, "BBMBB").enemyAt("flyer", 132, 8).enemyAt("flyer", 138, 7);
    level.pit(142, 145).lift(143, 10, "x", 1, 1.4);
    level.enemy("spiky", 150).enemy("shell", 154);
    level.stairs(160, 6).pit(166, 167).fill(168, 7, 4, 6).stairs(172, 6, true);
    level.flag = 184;
  },
};

export const keep: Course = {
  title: "Lava Keep",
  theme: "keep",
  cols: 188,
  time: 260,
  build(level) {
    level.ceiling(0, 187);
    level.row(8, 9, "M");
    level.lava(14, 16).fill(17, 10, 3, 3).lava(20, 22);
    level.firebar(28, 9).enemy("spiky", 32, 35);
    level.lava(38, 47).lift(40, 9, "x", 1.5, 1.3).lift(44, 9, "x", 1.5, 1.3);
    level.firebar(52, 12, 4, 2);
    level.checkpoint = 58;
    level.row(60, 9, "BB?BB").enemy("walker", 62).enemyAt("flyer", 66, 8);
    level.lava(70, 72).fill(73, 11, 3, 2).lava(76, 78);
    level.firebar(84, 9, 5, 1.8).firebar(90, 9, 5, -1.8).enemy("shell", 87).enemy("spiky", 94);
    level.lava(98, 109).lift(100, 10, "y", 2, 1.2).lift(105, 9, "y", 2, 1.6);
    level.row(112, 9, "?M?").enemy("walker", 115, 117, 119);
    level.firebar(124, 12, 5, 1.6);
    level.lava(128, 130).enemyAt("flyer", 134, 9).enemyAt("flyer", 138, 8);
    level.stairs(142, 4).lava(146, 149).stairs(150, 4, true);
    level.enemy("spiky", 158).enemy("shell", 162).row(166, 9, "CCCCC");
    level.flag = 176;
  },
};

export const sunnyRun = platformer(sunny);
export const crystalCaves = platformer(caves);
export const lavaKeep = platformer(keep);
