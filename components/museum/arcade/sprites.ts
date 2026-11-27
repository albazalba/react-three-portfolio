export const ALIEN_FRAMES = [
  [
    "..#.....#..",
    "...#...#...",
    "..#######..",
    ".##.###.##.",
    "###########",
    "#.#######.#",
    "#.#.....#.#",
    "...##.##...",
  ],
  [
    "..#.....#..",
    "#..#...#..#",
    "#.#######.#",
    "###.###.###",
    "###########",
    ".#########.",
    "..#.....#..",
    ".#.......#.",
  ],
];

export const SHIP = [
  "......#......",
  ".....###.....",
  ".....###.....",
  ".###########.",
  "#############",
  "#############",
];

/** Paints a bitmap in the current fill colour, one square per mark. */
export function stamp(
  context: CanvasRenderingContext2D,
  rows: string[],
  x: number,
  y: number,
  size = 1,
) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i += 1) {
      if (row[i] === "#") context.fillRect(x + i * size, y + j * size, size, size);
    }
  });
}
