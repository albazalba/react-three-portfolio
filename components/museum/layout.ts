import { experiences, getAllProjects, type Project } from "@/data/site";

export type RoomId =
  | "foyer"
  | "atrium"
  | "experience"
  | "projects"
  | "play"
  | "hobbies"
  | "contact";

export type AABB = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type GameId = "snake" | "breakout" | "invaders" | "pong" | "signal";

export type Action =
  | { type: "intro" }
  | { type: "principles" }
  | { type: "stack" }
  | { type: "experience"; id: string }
  | { type: "project"; slug: string }
  | { type: "hobby"; id: string }
  | { type: "contact" }
  | { type: "game"; id: GameId }
  | { type: "pc" }
  | { type: "billiards" }
  | { type: "console" }
  | { type: "television" }
  | { type: "chase" }
  | { type: "index" }
  | { type: "chase-result"; found: number; total: number; seconds: number };

export type Wall = AABB & { room: RoomId };

export type Room = {
  id: RoomId;
  label: string;
  height: number;
  wall: string;
  floor: string;
  ceiling: string;
  /** Skirting and cornice light, where a room departs from the loft's cyan and gold. */
  led?: string;
  trim?: string;
  bounds: AABB;
};

export type Spot = {
  id: string;
  x: number;
  z: number;
  radius: number;
  prompt: string;
  action: Action;
};

export type Landmark = {
  id: string;
  label: string;
  detail: string;
  x: number;
  z: number;
  yaw: number;
};

const T = 0.16;
const HT = T / 2;

export const PLAYER_RADIUS = 0.34;
export const EYE_HEIGHT = 1.64;
export const GATE_POSE = { x: 0, z: 11.15, yaw: 0 };
export const ENTER_POSE = { x: -0.15, z: 5.35, yaw: 2.15 };

// The dressing room is closed for now. Set this to true and its walls, doorways,
// furniture, frames and directory entry all come back.
const DRESSING_ROOM: boolean = false;

export const ROOMS: Record<RoomId, Room> = {
  foyer: {
    id: "foyer",
    label: "Entry",
    height: 2.7,
    wall: "#2f3d5c",
    floor: "#131a2b",
    ceiling: "#1a2236",
    led: "#56dcff",
    trim: "#56dcff",
    bounds: { minX: -1.8, maxX: 1.8, minZ: 9.2, maxZ: 12.4 },
  },
  atrium: {
    id: "atrium",
    label: "Living room",
    height: 3.05,
    wall: "#2f3d5c",
    floor: "#131a2b",
    ceiling: "#1a2236",
    led: "#56dcff",
    trim: "#56dcff",
    bounds: { minX: -5.6, maxX: 5.6, minZ: 1.6, maxZ: 9.2 },
  },
  experience: {
    id: "experience",
    label: "Career gallery",
    height: 2.9,
    wall: "#2f3d5c",
    floor: "#131a2b",
    ceiling: "#1a2236",
    led: "#56dcff",
    trim: "#56dcff",
    bounds: { minX: -5.6, maxX: 5.6, minZ: -6.4, maxZ: 1.6 },
  },
  projects: {
    id: "projects",
    label: "Game room",
    height: 2.85,
    wall: "#2b3557",
    floor: "#11172a",
    ceiling: "#161d30",
    led: "#56dcff",
    trim: "#56dcff",
    bounds: { minX: -11.6, maxX: -5.6, minZ: 2.2, maxZ: 9.2 },
  },
  play: {
    id: "play",
    label: "Billiards room",
    height: 2.8,
    wall: "#2b3557",
    floor: "#11172a",
    ceiling: "#161d30",
    led: "#56dcff",
    trim: "#56dcff",
    bounds: { minX: 5.6, maxX: 11.4, minZ: 1.6, maxZ: 9.2 },
  },
  hobbies: {
    id: "hobbies",
    label: "Dressing room",
    height: 2.8,
    wall: "#48363e",
    floor: "#4a302a",
    ceiling: "#241d23",
    bounds: { minX: 5.6, maxX: 11.4, minZ: -2.2, maxZ: 1.6 },
  },
  contact: {
    id: "contact",
    label: "Desk",
    height: 2.9,
    wall: "#d9cbb8",
    floor: "#7a5232",
    ceiling: "#eadfcf",
    bounds: { minX: 2.9, maxX: 5.5, minZ: -6.3, maxZ: -3.5 },
  },
};

/** Rooms that are part of the walk. Everything drawn or mapped goes through this. */
export const OPEN_ROOMS = (Object.keys(ROOMS) as RoomId[]).filter(
  (id) => DRESSING_ROOM || id !== "hobbies",
);

function alongX(z: number, x0: number, x1: number, room: RoomId): Wall {
  return {
    room,
    minX: Math.min(x0, x1),
    maxX: Math.max(x0, x1),
    minZ: z - HT,
    maxZ: z + HT,
  };
}

function alongZ(x: number, z0: number, z1: number, room: RoomId): Wall {
  return {
    room,
    minX: x - HT,
    maxX: x + HT,
    minZ: Math.min(z0, z1),
    maxZ: Math.max(z0, z1),
  };
}

function block(x: number, z: number, hx: number, hz: number, room: RoomId): Wall {
  return { room, minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz };
}

export const WALLS: Wall[] = [
  alongX(12.4, -1.8, 1.8, "foyer"),
  alongZ(-1.8, 9.2, 12.4, "foyer"),
  alongZ(1.8, 9.2, 12.4, "foyer"),

  alongX(9.2, -5.6, -1.8, "atrium"),
  alongX(9.2, 1.8, 5.6, "atrium"),
  alongZ(-5.6, 1.6, 4.0, "atrium"),
  alongZ(-5.6, 6.6, 9.2, "atrium"),
  alongX(1.6, -5.6, -1.5, "atrium"),
  alongX(1.6, 1.5, 5.6, "atrium"),

  alongZ(-5.6, -6.4, 1.6, "experience"),
  alongZ(5.6, -6.4, 1.6, "experience"),
  alongX(-6.4, -5.6, 5.6, "experience"),

  alongZ(-11.6, 2.2, 9.2, "projects"),
  alongX(2.2, -11.6, -5.6, "projects"),
  alongX(9.2, -11.6, -5.6, "projects"),

  alongZ(11.4, 1.6, 9.2, "play"),
  alongX(9.2, 5.6, 11.4, "play"),

  // The dressing room opens off the living room, or the living room is walled where it was.
  ...(DRESSING_ROOM
    ? [
        alongX(1.6, 5.6, 7.2, "play"),
        alongX(1.6, 9.0, 11.4, "play"),
        alongZ(11.4, -2.2, 1.6, "hobbies"),
        alongX(-2.2, 5.6, 11.4, "hobbies"),
      ]
    : [alongX(1.6, 5.52, 11.4, "play")]),
];

/** The billiards table runs east to west across the south half of its room. */
export const POOL_TABLE = { x: 8.5, z: 6.6 };

/** The television on the billiards room's north wall, and the sofa that faces it. */
export const TV_SCREEN = { x: POOL_TABLE.x + 0.2, y: 1.52, z: ROOMS.play.bounds.minZ + 0.15 };
export const LOUNGE = { x: TV_SCREEN.x, z: 4.25 };

/** The big television on the living room's north wall, facing the sofa. Its picture is 16:9. */
export const LIVING_TV = { x: -3.25, y: 1.6, z: ROOMS.atrium.bounds.minZ + 0.15, w: 2.9, h: 1.63 };

// The career timeline reads left to right along the west wall, so the newest role is furthest north.
const CAREER_Z = [-4.7, -2.6, -0.5];

const FURNITURE_SOLIDS: AABB[] = [
  // The living room seating: a sofa against the wall, a loveseat either side, the table between.
  block(-3.0, 8.35, 1.26, 0.5, "atrium"),
  block(-4.7, 7.0, 0.5, 0.82, "atrium"),
  block(-1.3, 7.0, 0.5, 0.82, "atrium"),
  block(-3.0, 6.9, 0.62, 0.34, "atrium"),
  block(POOL_TABLE.x, POOL_TABLE.z, 1.31, 0.71, "play"),
  // The consoles under the living room's slat wall and its television.
  block(3.55, 1.91, 1.42, 0.23, "atrium"),
  block(LIVING_TV.x, 1.91, 1.52, 0.23, "atrium"),
  // The media console under the billiards room television.
  block(TV_SCREEN.x, ROOMS.play.bounds.minZ + 0.31, 1.76, 0.23, "play"),
  block(LOUNGE.x, LOUNGE.z, 1.26, 0.5, "play"),
  block(-8.6, 2.95, 0.94, 0.42, "projects"),
  block(-8.6, 3.55, 0.28, 0.22, "projects"),
  block(-7.25, 3.6, 0.28, 0.22, "projects"),
  block(3.85, -4.85, 0.42, 0.88, "experience"),
  ...(DRESSING_ROOM ? [block(10.15, 0.4, 0.42, 1.15, "hobbies")] : []),
];

export const LINTELS: Array<AABB & { y0: number; y1: number; color: string }> = [];
export const COLUMNS: Array<{ x: number; z: number }> = [];
export const ARCHES: Array<{
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  width: number;
}> = [];

const FRAME_COLORS = [
  "#1d4a43",
  "#3d3422",
  "#2a3548",
  "#4a2c3a",
  "#3c341e",
  "#2a3832",
  "#403024",
  "#243248",
  "#3a3228",
  "#4a322c",
];

export type FrameExhibit = {
  kind: "frame";
  slug: string;
  title: string;
  year: string;
  number: string;
  motif: Project["mockup"];
  art: string | null;
  color: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  w: number;
  h: number;
};

export type CareerExhibit = {
  kind: "career";
  id: string;
  /** The year the role began, for the timeline under the card. */
  year: string;
  title: string;
  x: number;
  z: number;
  rotY: number;
};

const projects = getAllProjects();

// The gallery's back wall carries the lead projects as large panels; earlier work runs down the east wall.
const LEAD_PANEL = { w: 1.28, h: 0.8, y: 1.6 };
const SIDE_PANEL = { w: 0.96, h: 0.6, y: 1.56 };
const leadSlots: Array<[number, number, number]> = [-3.65, -2.2, -0.75, 0.7, 2.15].map((x) => [x, -6.3, 0]);
const sideSlots: Array<[number, number, number]> = [-3.45, -2.4, -1.35, -0.3, 0.75].map((z) => [
  5.5,
  z,
  -Math.PI / 2,
]);
const frameSlots = [...leadSlots, ...sideSlots];

export const FRAMES: FrameExhibit[] = projects.map((project, index) => {
  const slot = frameSlots[index] ?? frameSlots[frameSlots.length - 1];
  const panel = index < leadSlots.length ? LEAD_PANEL : SIDE_PANEL;
  return {
    kind: "frame",
    slug: project.slug,
    title: project.title,
    year: project.year,
    number: project.number,
    motif: project.mockup,
    art: project.image ? `/museum/projects${project.image.replace(/\.png$/, ".jpg")}` : null,
    color: FRAME_COLORS[index % FRAME_COLORS.length],
    x: slot[0],
    y: panel.y,
    z: slot[1],
    rotY: slot[2],
    w: panel.w,
    h: panel.h,
  };
});

export const CAREER_CARD = { w: 1.8, h: 1.2, y: 1.6 };

export const CAREER: CareerExhibit[] = experiences.map((job, index) => ({
  kind: "career",
  id: job.id,
  year: job.period.match(/\d{4}/)?.[0] ?? "",
  title: job.position,
  x: -5.5,
  z: CAREER_Z[index] ?? CAREER_Z[0],
  rotY: Math.PI / 2,
}));

/** The tech stack board, on the gallery's south wall beside the start of the timeline. */
export const STACK_BOARD = { x: -3.6, z: 1.5, w: 2.6, h: 1.56, y: 1.5 };

/** The principles board, matching the stack board on the other side of the door. */
export const PRINCIPLES_BOARD = { ...STACK_BOARD, x: 3.6 };

export const HOBBY_FRAMES: Array<{
  id: string;
  title: string;
  x: number;
  z: number;
  rotY: number;
  color: string;
}> = DRESSING_ROOM
  ? [
      { id: "photography", title: "Photography", x: 7.1, z: -2.09, rotY: 0, color: "#3a2a22" },
      { id: "travel", title: "Travel", x: 8.15, z: -2.09, rotY: 0, color: "#2c3338" },
      { id: "markets", title: "Markets", x: 9.2, z: -2.09, rotY: 0, color: "#343024" },
      { id: "design", title: "Product design", x: 10.25, z: -2.09, rotY: 0, color: "#3a2830" },
      { id: "technology", title: "Technology", x: 11.29, z: 2.55, rotY: -Math.PI / 2, color: "#243038" },
    ]
  : [];

export type Cabinet = {
  id: GameId;
  title: string;
  color: string;
  x: number;
  z: number;
  rotY: number;
};

const cabinetGames: Array<[GameId, string, string]> = [
  ["snake", "Snake", "#7dff8a"],
  ["breakout", "Breakout", "#ffb14a"],
  ["invaders", "Invaders", "#ff5fd2"],
  ["pong", "Pong", "#7ef6ff"],
  ["signal", "Signal Match", "#e1b74f"],
];

/** The arcade row, backs to the game room's north wall. */
export const CABINETS: Cabinet[] = cabinetGames.map(([id, title, color], index) => ({
  id,
  title,
  color,
  x: -10.6 + index,
  z: 8.72,
  rotY: Math.PI,
}));

/** A point `distance` out from something mounted at x, z and facing rotY. */
function inFront(x: number, z: number, rotY: number, distance: number) {
  return { x: x + Math.sin(rotY) * distance, z: z + Math.cos(rotY) * distance };
}

export const CHASE_PAD = { x: -8.4, z: 6.1 };
export const CHASE_SECONDS = 42;

// The vacuum's dock sits against the living room's south wall. The pet waits by the sofa,
// and `via` is its first step round the coffee table.
export const ROBOTS = {
  dock: { x: 2.6, z: 9.02 },
  pet: { x: -3.9, z: 6.0, yaw: 1.75, via: { x: -3.6, z: 3.9 } },
};

export const SPOTS: Spot[] = [
  { id: "intro", x: -4.15, z: 7.7, radius: 1.35, prompt: "Read the introduction", action: { type: "intro" } },
  { id: "television", x: -3.0, z: 6.0, radius: 1.2, prompt: "Sit down and watch TV", action: { type: "television" } },
  ...CAREER.map((card) => ({
    id: `exp-${card.id}`,
    x: card.x + 1.3,
    z: card.z,
    radius: 1.15,
    prompt: card.title,
    action: { type: "experience" as const, id: card.id },
  })),
  {
    id: "principles",
    x: PRINCIPLES_BOARD.x,
    z: PRINCIPLES_BOARD.z - 1.3,
    radius: 1.2,
    prompt: "Read the principles",
    action: { type: "principles" },
  },
  { id: "stack", x: STACK_BOARD.x, z: STACK_BOARD.z - 1.3, radius: 1.2, prompt: "Read the tech stack", action: { type: "stack" } },
  ...FRAMES.map((frame) => ({
    id: `project-${frame.slug}`,
    ...inFront(frame.x, frame.z, frame.rotY, 1.3),
    radius: 1.1,
    prompt: frame.title,
    action: { type: "project" as const, slug: frame.slug },
  })),
  ...HOBBY_FRAMES.map((frame) => ({
    id: `hobby-${frame.id}`,
    ...inFront(frame.x, frame.z, frame.rotY, 1.25),
    radius: 1.05,
    prompt: frame.title,
    action: { type: "hobby" as const, id: frame.id },
  })),
  ...CABINETS.map((cabinet) => ({
    id: `game-${cabinet.id}`,
    ...inFront(cabinet.x, cabinet.z, cabinet.rotY, 0.97),
    radius: 0.8,
    prompt: `Play ${cabinet.title}`,
    action: { type: "game" as const, id: cabinet.id },
  })),
  { id: "pc", x: -8.6, z: 4.0, radius: 1.15, prompt: "Use the computer", action: { type: "pc" } },
  { id: "billiards", x: POOL_TABLE.x, z: POOL_TABLE.z, radius: 2.7, prompt: "Play billiards", action: { type: "billiards" } },
  { id: "console", x: LOUNGE.x, z: LOUNGE.z - 0.75, radius: 1.15, prompt: "Sit down and play", action: { type: "console" } },
  { id: "chase", x: CHASE_PAD.x, z: CHASE_PAD.z, radius: 0.9, prompt: "Start Light Chase", action: { type: "chase" } },
  { id: "contact", x: 3.0, z: -4.85, radius: 1.0, prompt: "Get in touch", action: { type: "contact" } },
];

export const LANDMARKS: Landmark[] = [
  { id: "foyer", label: "Entry", detail: "The front door", x: 0, z: 11.1, yaw: 0 },
  { id: "intro", label: "Living room", detail: "Sofa, big TV, the city outside", x: -0.15, z: 5.35, yaw: 2.15 },
  { id: "experience", label: "Career gallery", detail: "Experience, principles and tech stack", x: 0, z: -0.2, yaw: 0 },
  { id: "wall", label: "Project wall", detail: "Lead projects, and earlier work", x: -0.75, z: -2.5, yaw: 0 },
  { id: "projects", label: "Game room", detail: "Arcade machines you can play", x: -6.6, z: 5.3, yaw: 2.2 },
  { id: "play", label: "Billiards room", detail: "A table and a console you can play", x: 6.0, z: POOL_TABLE.z, yaw: -Math.PI / 2 },
  ...(DRESSING_ROOM
    ? [{ id: "hobbies", label: "Dressing room", detail: "Shelves and collections", x: 7.3, z: 1.4, yaw: -1.07 }]
    : []),
  { id: "contact", label: "Desk", detail: "If you want to write", x: 2.95, z: -4.75, yaw: -Math.PI / 2 },
];

export const ORB_SPOTS: Array<[number, number, number]> = [
  [-9.6, 1.15, 5.0],
  [-7.5, 1.4, 5.2],
  [-9.1, 1.2, 6.6],
  [-7.6, 1.45, 7.1],
  [-8.6, 1.3, 6.0],
  [-10.1, 1.15, 6.9],
  [-7.3, 1.4, 6.3],
];

export type Furnishing = {
  kind:
    | "bench"
    | "plant"
    | "plinth"
    | "stool"
    | "chair"
    | "shelf"
    | "panel"
    | "rug"
    | "tripod"
    | "globe"
    | "neon"
    | "sofa"
    | "table"
    | "wardrobe"
    | "gaming"
    | "lamp"
    | "cars"
    | "bucket";
  x: number;
  z: number;
  y?: number;
  rotY?: number;
  color?: string;
  text?: string;
  w?: number;
  h?: number;
  hx?: number;
  hz?: number;
};

const DRESSING_FURNITURE: Furnishing[] = [
  { kind: "wardrobe", x: 10.15, z: 0.4, rotY: -Math.PI / 2 },
  { kind: "shelf", x: 10.85, z: -1.15, rotY: -Math.PI / 2, hx: 0.22, hz: 0.9 },
  { kind: "globe", x: 8.6, z: -1.15, hx: 0.28, hz: 0.28 },
  { kind: "tripod", x: 7.4, z: -1.05, hx: 0.28, hz: 0.28 },
];

export const FURNITURE: Furnishing[] = [
  { kind: "sofa", x: -3.0, z: 8.35, rotY: 0 },
  { kind: "sofa", x: -4.7, z: 7.0, rotY: -Math.PI / 2, w: 2 },
  { kind: "sofa", x: -1.3, z: 7.0, rotY: Math.PI / 2, w: 2 },
  { kind: "table", x: -3.0, z: 6.9 },
  { kind: "rug", x: -3.0, z: 6.9, w: 4.6, h: 3.4 },
  { kind: "plant", x: -5.1, z: 8.75, hx: 0.32, hz: 0.32 },
  { kind: "plant", x: 3.55, z: 8.7, hx: 0.32, hz: 0.32 },
  { kind: "plant", x: 4.7, z: -5.5, hx: 0.3, hz: 0.3 },
  { kind: "chair", x: 4.62, z: -4.85, rotY: -Math.PI / 2, hx: 0.24, hz: 0.24 },
  { kind: "cars", x: -11.52, z: 5.7, rotY: Math.PI / 2, hx: 0.16, hz: 1.47 },
  { kind: "neon", x: -8.6, z: 9.09, y: 2.36, rotY: Math.PI, color: "#ff5fd2", text: "PRESS START" },
  { kind: "gaming", x: -8.6, z: 2.95 },
  { kind: "bucket", x: -8.6, z: 3.55, rotY: Math.PI },
  { kind: "bucket", x: -7.25, z: 3.6, rotY: Math.PI },
  { kind: "sofa", x: LOUNGE.x, z: LOUNGE.z, rotY: 0 },
  { kind: "rug", x: LOUNGE.x, z: LOUNGE.z - 0.75, w: 3.6, h: 2.6 },
  { kind: "plant", x: 10.85, z: 2.2, hx: 0.3, hz: 0.3 },
  { kind: "plant", x: 10.85, z: 8.6, hx: 0.3, hz: 0.3 },
  ...(DRESSING_ROOM ? DRESSING_FURNITURE : []),
];

export const BLOCKS: AABB[] = [
  ...FRAMES.map((frame) => exhibitBlock(frame.x, frame.z, frame.rotY, frame.w / 2, 0.1)),
  ...HOBBY_FRAMES.map((frame) => exhibitBlock(frame.x, frame.z, frame.rotY, 0.42, 0.1)),
  ...CABINETS.map((cabinet) => exhibitBlock(cabinet.x, cabinet.z, cabinet.rotY, 0.39, 0.44)),
  ...FURNITURE_SOLIDS,
  ...FURNITURE.filter((item) => item.hx && item.hz).map((item) => ({
    minX: item.x - (item.hx ?? 0),
    maxX: item.x + (item.hx ?? 0),
    minZ: item.z - (item.hz ?? 0),
    maxZ: item.z + (item.hz ?? 0),
  })),
];

function exhibitBlock(x: number, z: number, rotY: number, long: number, deep: number): AABB {
  const sideways = Math.abs(Math.sin(rotY)) > 0.5;
  const hx = sideways ? deep : long;
  const hz = sideways ? long : deep;
  return { minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz };
}

export function blocked(x: number, z: number, radius = PLAYER_RADIUS): boolean {
  for (const box of WALLS) {
    if (hits(box, x, z, radius)) return true;
  }
  for (const box of BLOCKS) {
    if (hits(box, x, z, radius)) return true;
  }
  return false;
}

function hits(box: AABB, x: number, z: number, radius: number) {
  const cx = Math.max(box.minX, Math.min(x, box.maxX));
  const cz = Math.max(box.minZ, Math.min(z, box.maxZ));
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < radius * radius;
}

export function moveWithCollision(x: number, z: number, dx: number, dz: number) {
  let nx = x + dx;
  if (blocked(nx, z)) nx = x;
  let nz = z + dz;
  if (blocked(nx, nz)) nz = z;
  return { x: nx, z: nz };
}

export function zoneAt(x: number, z: number): RoomId {
  const order: RoomId[] = [
    "contact",
    "play",
    "hobbies",
    "projects",
    "experience",
    "foyer",
    "atrium",
  ];
  for (const id of order) {
    if (!OPEN_ROOMS.includes(id)) continue;
    const bounds = ROOMS[id].bounds;
    if (x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ) {
      return id;
    }
  }
  return "atrium";
}

export function nearestSpot(x: number, z: number): Spot | null {
  let best: Spot | null = null;
  let bestDistance = Infinity;
  for (const spot of SPOTS) {
    const distance = Math.hypot(x - spot.x, z - spot.z);
    if (distance <= spot.radius && distance < bestDistance) {
      best = spot;
      bestDistance = distance;
    }
  }
  return best;
}

export const MAP_BOUNDS = { minX: -12.4, maxX: 12.2, minZ: -7.2, maxZ: 13.2 };
