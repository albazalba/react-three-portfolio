import { experiences, techCategories } from "@/data/site";
import { FRAMES } from "./layout";
import { getSnapshot, setChannel } from "./store";
import { seeded } from "./textures";

// The living room television draws everything it shows: five channels, a burst of static between them.
const W = 960;
const H = 540;
const STATIC_SECONDS = 0.4;
const BANNER_SECONDS = 2.6;

type Draw = (context: CanvasRenderingContext2D, time: number) => void;

let canvas: HTMLCanvasElement | null = null;
let noise: HTMLCanvasElement | null = null;
let clock = 0;
let tunedAt = -10;

function font() {
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

function wrap(context: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* Showreel: the project screenshots, one after another, slowly drifting closer. */

const SLIDE_SECONDS = 6;
const shots = new Map<string, HTMLImageElement>();

function shot(url: string) {
  let image = shots.get(url);
  if (!image) {
    image = new Image();
    image.src = url;
    shots.set(url, image);
  }
  return image.complete && image.naturalWidth > 0 ? image : null;
}

const showreel: Draw = (context, time) => {
  const index = Math.floor(time / SLIDE_SECONDS) % FRAMES.length;
  const local = time % SLIDE_SECONDS;
  const frame = FRAMES[index];
  const image = frame.art ? shot(frame.art) : null;
  context.fillStyle = frame.color;
  context.fillRect(0, 0, W, H);
  if (image) {
    const zoom = 1.04 + (local / SLIDE_SECONDS) * 0.08;
    const cover = Math.max(W / image.naturalWidth, H / image.naturalHeight) * zoom;
    const w = image.naturalWidth * cover;
    const h = image.naturalHeight * cover;
    const drift = (local / SLIDE_SECONDS - 0.5) * (w - W) * (index % 2 ? -1 : 1);
    context.drawImage(image, (W - w) / 2 + drift, (H - h) / 2, w, h);
  }
  const shade = context.createLinearGradient(0, H * 0.5, 0, H);
  shade.addColorStop(0, "rgba(4,6,14,0)");
  shade.addColorStop(1, "rgba(4,6,14,0.92)");
  context.fillStyle = shade;
  context.fillRect(0, 0, W, H);

  context.textAlign = "left";
  context.fillStyle = "#7ef6ff";
  context.font = `600 20px ${font()}`;
  context.fillText(`PROJECT ${frame.number}  ·  ${frame.year}`, 56, H - 112);
  context.fillStyle = "#ffffff";
  context.font = `600 52px ${font()}`;
  context.fillText(frame.title, 56, H - 58);
  context.fillStyle = "rgba(255,255,255,0.25)";
  context.fillRect(56, H - 34, W - 112, 3);
  context.fillStyle = "#7ef6ff";
  context.fillRect(56, H - 34, (W - 112) * (local / SLIDE_SECONDS), 3);

  // A quick dip to black between slides.
  const edge = Math.min(local, SLIDE_SECONDS - local);
  if (edge < 0.35) {
    context.fillStyle = `rgba(0,0,0,${1 - edge / 0.35})`;
    context.fillRect(0, 0, W, H);
  }
};

/* Career news: each role as a headline, its highlights as quotes, the tech stack on the ticker. */

const STORY_SECONDS = 9;
const TICKER = techCategories.flatMap((category) => category.items).join("   •   ") + "   •   ";

const news: Draw = (context, time) => {
  const backdrop = context.createLinearGradient(0, 0, W, H);
  backdrop.addColorStop(0, "#0e2452");
  backdrop.addColorStop(1, "#050b1d");
  context.fillStyle = backdrop;
  context.fillRect(0, 0, W, H);

  // The studio globe on the right, its lines turning.
  context.save();
  context.translate(W - 190, 210);
  context.strokeStyle = "rgba(126,246,255,0.28)";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 0, 130, 0, Math.PI * 2);
  context.stroke();
  for (let meridian = 0; meridian < 6; meridian += 1) {
    const turn = ((time * 0.25 + meridian / 6) % 1) * Math.PI;
    context.beginPath();
    context.ellipse(0, 0, Math.abs(Math.cos(turn)) * 130, 130, 0, 0, Math.PI * 2);
    context.stroke();
  }
  for (const latitude of [-80, -40, 0, 40, 80]) {
    const reach = Math.sqrt(130 * 130 - latitude * latitude);
    context.beginPath();
    context.moveTo(-reach, latitude);
    context.lineTo(reach, latitude);
    context.stroke();
  }
  context.restore();

  const index = Math.floor(time / STORY_SECONDS) % experiences.length;
  const job = experiences[index];
  const local = time % STORY_SECONDS;
  const quote = job.highlights[Math.floor(local / 3) % job.highlights.length];

  context.textAlign = "left";
  context.fillStyle = "#e5484d";
  context.fillRect(56, 52, 84, 34);
  context.fillStyle = "#ffffff";
  context.font = `700 20px ${font()}`;
  context.fillText("LIVE", 74, 77);
  context.fillStyle = "rgba(255,255,255,0.8)";
  context.font = `600 20px ${font()}`;
  context.fillText(index === 0 ? "CAREER NEWS  ·  NOW" : "CAREER NEWS  ·  ARCHIVE", 158, 77);

  context.fillStyle = "#ffffff";
  context.font = `700 46px ${font()}`;
  wrap(context, `${job.position} at ${job.company}`, 600).forEach((text, row) => {
    context.fillText(text, 56, 160 + row * 54);
  });
  context.fillStyle = "#7ef6ff";
  context.font = `500 22px ${font()}`;
  context.fillText(`${job.period}  ·  ${job.location}`, 56, 290);

  context.fillStyle = "rgba(255,255,255,0.88)";
  context.font = `italic 400 26px ${font()}`;
  const fade = Math.min(1, (local % 3) / 0.4);
  context.globalAlpha = fade;
  wrap(context, `“${quote}”`, 820).forEach((text, row) => {
    context.fillText(text, 56, 360 + row * 36);
  });
  context.globalAlpha = 1;

  // The ticker along the foot of the screen.
  context.fillStyle = "#0a0f1e";
  context.fillRect(0, H - 64, W, 64);
  context.font = `600 24px ${font()}`;
  const span = context.measureText(TICKER).width;
  const offset = (time * 110) % span;
  context.fillStyle = "#ffffff";
  for (let x = 160 - offset; x < W; x += span) context.fillText(TICKER, x, H - 24);
  context.fillStyle = "#e5484d";
  context.fillRect(0, H - 64, 140, 64);
  context.fillStyle = "#ffffff";
  context.font = `700 22px ${font()}`;
  context.fillText("STACK", 34, H - 24);
};

/* Night city: a skyline with its windows coming and going, rain, and traffic below. */

type Tower = { x: number; w: number; h: number; far: boolean; windows: number[] };

const TOWERS: Tower[] = (() => {
  const random = seeded(41);
  const towers: Tower[] = [];
  for (const far of [true, false]) {
    let x = -20;
    while (x < W) {
      const w = (far ? 50 : 70) + random() * (far ? 60 : 90);
      const h = (far ? 220 : 140) + random() * (far ? 170 : 200);
      towers.push({ x, w, h, far, windows: Array.from({ length: 120 }, () => random()) });
      x += w + (far ? 4 : 10) + random() * 18;
    }
  }
  return towers;
})();

const RAIN = (() => {
  const random = seeded(7);
  return Array.from({ length: 140 }, () => ({ x: random() * W, y: random() * H, speed: 520 + random() * 380 }));
})();

const city: Draw = (context, time) => {
  const sky = context.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#0a0b22");
  sky.addColorStop(0.65, "#2a1d4f");
  sky.addColorStop(1, "#4b2a5e");
  context.fillStyle = sky;
  context.fillRect(0, 0, W, H);
  const moon = context.createRadialGradient(760, 110, 0, 760, 110, 120);
  moon.addColorStop(0, "rgba(255,244,230,0.95)");
  moon.addColorStop(0.3, "rgba(255,244,230,0.35)");
  moon.addColorStop(1, "rgba(255,244,230,0)");
  context.fillStyle = moon;
  context.fillRect(600, 0, 320, 260);

  const ground = H - 70;
  const beat = Math.floor(time * 1.5);
  for (const tower of TOWERS) {
    const top = ground - tower.h;
    context.fillStyle = tower.far ? "#1b1838" : "#0d0c1c";
    context.fillRect(tower.x, top, tower.w, tower.h);
    const columns = Math.floor((tower.w - 12) / 14);
    const rows = Math.floor((tower.h - 16) / 20);
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const seed = tower.windows[(row * columns + column) % tower.windows.length];
        // A few windows switch on and off as the night goes on.
        const flicker = seed > 0.9 && ((beat + Math.floor(seed * 97)) % 7 === 0);
        if ((seed < (tower.far ? 0.55 : 0.6)) === flicker) continue;
        context.fillStyle = seed < 0.2 ? "rgba(126,246,255,0.75)" : tower.far ? "rgba(255,214,150,0.45)" : "rgba(255,214,150,0.85)";
        context.fillRect(tower.x + 8 + column * 14, top + 10 + row * 20, 7, 10);
      }
    }
  }

  context.fillStyle = "#07060f";
  context.fillRect(0, ground, W, H - ground);
  for (let car = 0; car < 6; car += 1) {
    const east = car % 2 === 0;
    const x = ((time * (140 + car * 23) + car * 190) % (W + 200)) - 100;
    context.fillStyle = east ? "rgba(255,80,90,0.9)" : "rgba(255,248,220,0.95)";
    context.fillRect(east ? x : W - x, ground + 22 + (car % 2) * 18, 26, 4);
  }

  context.strokeStyle = "rgba(190,210,255,0.35)";
  context.lineWidth = 1.5;
  context.beginPath();
  for (const drop of RAIN) {
    const y = (drop.y + time * drop.speed) % H;
    const x = (drop.x - y * 0.12 + W) % W;
    context.moveTo(x, y);
    context.lineTo(x - 4, y + 22);
  }
  context.stroke();

  context.textAlign = "left";
  context.fillStyle = "rgba(255,255,255,0.8)";
  context.font = `600 20px ${font()}`;
  context.fillText("CITY CAM  ·  RAIN TONIGHT", 40, 48);
};

/* Deep space: flying through a field of stars. */

const STARS = (() => {
  const random = seeded(19);
  return Array.from({ length: 260 }, () => ({ x: random() * 2 - 1, y: random() * 2 - 1, z: random() }));
})();

const space: Draw = (context, time) => {
  context.fillStyle = "#03040c";
  context.fillRect(0, 0, W, H);
  for (const [x, y, reach, color] of [
    [W * 0.3, H * 0.4, 360, "rgba(110,60,255,0.32)"],
    [W * 0.72, H * 0.62, 300, "rgba(40,160,255,0.26)"],
  ] as Array<[number, number, number, string]>) {
    const cloud = context.createRadialGradient(x, y, 0, x, y, reach);
    cloud.addColorStop(0, color);
    cloud.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = cloud;
    context.fillRect(0, 0, W, H);
  }
  context.strokeStyle = "#ffffff";
  for (const star of STARS) {
    const depth = 1 - ((star.z + time * 0.12) % 1);
    const near = Math.max(depth, 0.02);
    const sx = W / 2 + (star.x / near) * 260;
    const sy = H / 2 + (star.y / near) * 260;
    const tail = Math.min(near + 0.04, 1);
    const tx = W / 2 + (star.x / tail) * 260;
    const ty = H / 2 + (star.y / tail) * 260;
    context.globalAlpha = Math.min(1, (1 - depth) * 1.6);
    context.lineWidth = 2.6 * (1 - depth) + 0.4;
    context.beginPath();
    context.moveTo(tx, ty);
    context.lineTo(sx, sy);
    context.stroke();
  }
  context.globalAlpha = 1;
};

/* Reef: an aquarium, fish crossing it both ways. */

const FISH = (() => {
  const random = seeded(63);
  const colors = ["#ff9b3d", "#ffd23d", "#7ef6ff", "#ff5fd2", "#9b8cff", "#ffffff"];
  return Array.from({ length: 11 }, (_, index) => ({
    y: 90 + random() * 330,
    size: 16 + random() * 26,
    speed: 40 + random() * 70,
    phase: random() * 1000,
    east: index % 2 === 0,
    color: colors[index % colors.length],
  }));
})();

const BUBBLES = (() => {
  const random = seeded(5);
  return Array.from({ length: 40 }, () => ({ x: random() * W, phase: random() * H, r: 2 + random() * 5 }));
})();

const reef: Draw = (context, time) => {
  const water = context.createLinearGradient(0, 0, 0, H);
  water.addColorStop(0, "#0d6c9c");
  water.addColorStop(1, "#04182f");
  context.fillStyle = water;
  context.fillRect(0, 0, W, H);

  context.fillStyle = "rgba(200,245,255,0.06)";
  for (let ray = 0; ray < 5; ray += 1) {
    const x = 120 + ray * 190 + Math.sin(time * 0.4 + ray) * 40;
    context.beginPath();
    context.moveTo(x - 30, 0);
    context.lineTo(x + 40, 0);
    context.lineTo(x + 160, H);
    context.lineTo(x + 40, H);
    context.fill();
  }

  context.fillStyle = "#c9a86a";
  context.beginPath();
  context.moveTo(0, H);
  for (let x = 0; x <= W; x += 40) context.lineTo(x, H - 46 - Math.sin(x * 0.012) * 14);
  context.lineTo(W, H);
  context.fill();

  context.lineWidth = 7;
  context.lineCap = "round";
  for (let weed = 0; weed < 9; weed += 1) {
    const base = 40 + weed * 108;
    context.strokeStyle = weed % 3 ? "#1f8a5b" : "#2fb87a";
    context.beginPath();
    context.moveTo(base, H - 40);
    for (let step = 1; step <= 8; step += 1) {
      context.lineTo(base + Math.sin(time * 1.3 + weed + step * 0.6) * step * 2.4, H - 40 - step * 18);
    }
    context.stroke();
  }

  for (const fish of FISH) {
    const travel = (fish.phase + time * fish.speed) % (W + 160);
    const x = fish.east ? travel - 80 : W + 80 - travel;
    const y = fish.y + Math.sin(time * 1.1 + fish.phase) * 10;
    const facing = fish.east ? 1 : -1;
    const wag = Math.sin(time * 9 + fish.phase) * 0.25;
    context.save();
    context.translate(x, y);
    context.scale(facing, 1);
    context.fillStyle = fish.color;
    context.beginPath();
    context.ellipse(0, 0, fish.size, fish.size * 0.45, 0, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(-fish.size * 0.8, 0);
    context.lineTo(-fish.size * 1.5, -fish.size * (0.45 + wag));
    context.lineTo(-fish.size * 1.5, fish.size * (0.45 - wag));
    context.fill();
    context.fillStyle = "#0a0a14";
    context.beginPath();
    context.arc(fish.size * 0.55, -fish.size * 0.1, fish.size * 0.09, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  context.strokeStyle = "rgba(220,250,255,0.55)";
  context.lineWidth = 1.5;
  for (const bubble of BUBBLES) {
    const y = H - ((bubble.phase + time * 60) % H);
    context.beginPath();
    context.arc(bubble.x + Math.sin(time * 2 + bubble.phase) * 6, y, bubble.r, 0, Math.PI * 2);
    context.stroke();
  }
};

export const CHANNELS: Array<{ name: string; draw: Draw }> = [
  { name: "Showreel", draw: showreel },
  { name: "Career News", draw: news },
  { name: "Night City", draw: city },
  { name: "Deep Space", draw: space },
  { name: "Reef", draw: reef },
];

function snow(context: CanvasRenderingContext2D) {
  if (!noise) {
    noise = document.createElement("canvas");
    noise.width = 240;
    noise.height = 135;
  }
  const small = noise.getContext("2d");
  if (!small) return;
  const image = small.createImageData(noise.width, noise.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const grey = Math.random() * 255;
    image.data[index] = image.data[index + 1] = image.data[index + 2] = grey;
    image.data[index + 3] = 255;
  }
  small.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = false;
  context.drawImage(noise, 0, 0, W, H);
  context.imageSmoothingEnabled = true;
}

function render() {
  const context = canvas?.getContext("2d");
  if (!context) return;
  const channel = getSnapshot().channel;
  const since = clock - tunedAt;
  context.save();
  if (since < STATIC_SECONDS) snow(context);
  else CHANNELS[channel].draw(context, clock);
  context.restore();
  if (since < BANNER_SECONDS) {
    context.textAlign = "right";
    context.font = `700 44px monospace`;
    context.fillStyle = "rgba(0,0,0,0.5)";
    context.fillText(`CH ${channel + 1}`, W - 38, 78);
    context.fillStyle = "#7dff8a";
    context.fillText(`CH ${channel + 1}`, W - 40, 76);
    context.font = `700 22px monospace`;
    context.fillText(CHANNELS[channel].name.toUpperCase(), W - 40, 108);
    context.textAlign = "left";
  }
}

/** The canvas the living room television shows. */
export function channelCanvas() {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    render();
  }
  return canvas;
}

/** Switches to a channel, wrapping round either end, with static and the channel number on screen. */
export function tune(channel: number) {
  const count = CHANNELS.length;
  setChannel(((channel % count) + count) % count);
  tunedAt = clock;
  render();
}

/** Feeds one key press to the remote. Returns true when the key changes the channel. */
export function channelKey(code: string) {
  const channel = getSnapshot().channel;
  if (code === "ArrowRight" || code === "ArrowUp" || code === "KeyD" || code === "KeyW") tune(channel + 1);
  else if (code === "ArrowLeft" || code === "ArrowDown" || code === "KeyA" || code === "KeyS") tune(channel - 1);
  else if (/^Digit[1-9]$/.test(code) && Number(code.slice(5)) <= CHANNELS.length) tune(Number(code.slice(5)) - 1);
  else return false;
  return true;
}

/** Moves the picture on by one frame. */
export function channelStep(dt: number) {
  clock += dt;
  render();
}
