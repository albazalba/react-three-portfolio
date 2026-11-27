import * as THREE from "three";
import { STACK_ICONS } from "./stackIcons";
import { ALIEN_FRAMES, SHIP, stamp } from "./arcade/sprites";

const cache = new Map<string, THREE.CanvasTexture>();

type Painter = (context: CanvasRenderingContext2D, width: number, height: number) => void;

function paint(key: string, width: number, height: number, draw: Painter) {
  const cached = cache.get(key);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  cache.set(key, texture);
  return texture;
}

export function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function bodyFont() {
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

/** White at the bottom edge fading to black. Used additively for light grazing a wall. */
export function washTexture() {
  return paint("wash", 8, 128, (context, width, height) => {
    const gradient = context.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.18, "#8a8a8a");
    gradient.addColorStop(0.5, "#2a2a2a");
    gradient.addColorStop(1, "#000000");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });
}

/** Soft round falloff. Used additively for halos and pools of light. */
export function poolTexture() {
  return paint("pool", 128, 128, (context, width, height) => {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.25, "#8f8f8f");
    gradient.addColorStop(0.6, "#262626");
    gradient.addColorStop(1, "#000000");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });
}

export function skylineTexture() {
  return paint("skyline", 1024, 420, (context, width, height) => {
    const random = seeded(7);
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#070818");
    sky.addColorStop(0.5, "#1a1638");
    sky.addColorStop(0.8, "#4a2550");
    sky.addColorStop(1, "#8a3f5c");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < 90; i += 1) {
      context.fillStyle = `rgba(255,255,255,${0.2 + random() * 0.5})`;
      context.fillRect(random() * width, random() * height * 0.5, 1.4, 1.4);
    }

    const layers = [
      { base: 0.52, spread: 0.2, body: "#1b1736", lit: 0.2, glow: "rgba(190,170,255,0.5)" },
      { base: 0.36, spread: 0.26, body: "#0d0b1c", lit: 0.3, glow: "rgba(255,214,150,0.85)" },
    ];
    for (const layer of layers) {
      let x = -10;
      while (x < width) {
        const w = 34 + random() * 60;
        const h = height * (layer.base - layer.spread / 2 + random() * layer.spread);
        const top = height - h;
        context.fillStyle = layer.body;
        context.fillRect(x, top, w, h);
        for (let wy = top + 8; wy < height - 6; wy += 11) {
          for (let wx = x + 5; wx < x + w - 6; wx += 9) {
            if (random() > layer.lit) continue;
            context.fillStyle = random() > 0.85 ? "rgba(126,246,255,0.8)" : layer.glow;
            context.fillRect(wx, wy, 4, 5);
          }
        }
        x += w + random() * 6;
      }
    }
  });
}

export function rugTexture(base: string) {
  return paint(`rug-${base}`, 512, 384, (context, width, height) => {
    const random = seeded(3);
    context.fillStyle = base;
    context.fillRect(0, 0, width, height);
    for (let i = 0; i < 5000; i += 1) {
      context.fillStyle = random() > 0.5 ? "rgba(255,240,220,0.05)" : "rgba(0,0,0,0.07)";
      context.fillRect(random() * width, random() * height, 3, 1);
    }
    context.strokeStyle = "rgba(244,236,223,0.55)";
    context.lineWidth = 5;
    context.strokeRect(22, 22, width - 44, height - 44);
    context.strokeStyle = "rgba(225,183,79,0.5)";
    context.lineWidth = 2;
    context.strokeRect(36, 36, width - 72, height - 72);
  });
}

const GOLD = "#e1b74f";
const CREAM = "#f4efe6";

function backdrop(context: CanvasRenderingContext2D, width: number, height: number, color: string) {
  const tone = new THREE.Color(color);
  const light = tone.clone().lerp(new THREE.Color("#ffffff"), 0.22).getStyle();
  const dark = tone.clone().multiplyScalar(0.35).getStyle();
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, light);
  gradient.addColorStop(1, dark);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

export type Motif = "mind" | "ai-ops" | "risk" | "pulse" | "trading" | "default";

function drawMotif(context: CanvasRenderingContext2D, motif: Motif, width: number, height: number) {
  context.lineWidth = 3;
  context.strokeStyle = GOLD;
  context.fillStyle = GOLD;
  const cx = width * 0.62;
  const cy = height * 0.54;

  if (motif === "ai-ops") {
    const nodes = [
      [0.3, 0.3], [0.3, 0.55], [0.3, 0.8], [0.55, 0.42], [0.55, 0.68], [0.8, 0.55],
    ].map(([x, y]) => [x * width, y * height]);
    context.globalAlpha = 0.55;
    for (const [from, to] of [[0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]]) {
      context.beginPath();
      context.moveTo(nodes[from][0], nodes[from][1]);
      context.lineTo(nodes[to][0], nodes[to][1]);
      context.stroke();
    }
    context.globalAlpha = 1;
    for (const [x, y] of nodes) {
      context.beginPath();
      context.arc(x, y, 13, 0, Math.PI * 2);
      context.fill();
    }
    return;
  }

  if (motif === "risk" || motif === "pulse") {
    const points =
      motif === "risk"
        ? [0.62, 0.55, 0.6, 0.4, 0.47, 0.3, 0.36, 0.22, 0.27]
        : [0.5, 0.5, 0.5, 0.2, 0.82, 0.38, 0.5, 0.5, 0.5];
    const step = (width * 0.76) / (points.length - 1);
    context.lineWidth = 5;
    context.lineJoin = "round";
    context.beginPath();
    points.forEach((y, index) => {
      const px = width * 0.12 + index * step;
      if (index === 0) context.moveTo(px, y * height);
      else context.lineTo(px, y * height);
    });
    context.stroke();
    if (motif === "risk") {
      context.lineTo(width * 0.88, height * 0.86);
      context.lineTo(width * 0.12, height * 0.86);
      context.globalAlpha = 0.14;
      context.fill();
      context.globalAlpha = 1;
    }
    return;
  }

  if (motif === "trading") {
    const candles = [0.6, 0.52, 0.58, 0.44, 0.48, 0.36, 0.4, 0.28];
    candles.forEach((y, index) => {
      const px = width * (0.16 + index * 0.095);
      const rising = index % 3 !== 1;
      context.fillStyle = rising ? GOLD : CREAM;
      context.globalAlpha = rising ? 1 : 0.6;
      context.fillRect(px + 12, (y - 0.09) * height, 3, height * 0.3);
      context.fillRect(px, y * height, 27, height * 0.13);
    });
    context.globalAlpha = 1;
    return;
  }

  for (let ring = 0; ring < 5; ring += 1) {
    context.globalAlpha = 1 - ring * 0.18;
    context.beginPath();
    context.arc(cx, cy, 36 + ring * 44, 0, Math.PI * 2);
    context.stroke();
  }
  context.globalAlpha = 1;
  context.beginPath();
  context.arc(cx, cy, 12, 0, Math.PI * 2);
  context.fill();
}

/** Sets the largest size up to `size` at which `text` fits `room`, and leaves that font on the context. */
function fitFont(
  context: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  room: number,
) {
  const family = bodyFont();
  let fitted = size;
  context.font = `${weight} ${fitted}px ${family}`;
  while (fitted > 12 && context.measureText(text).width > room) {
    fitted -= 2;
    context.font = `${weight} ${fitted}px ${family}`;
  }
}

/**
 * Canvas for a project panel. The site screenshot fills the plate when there is one,
 * a drawn motif otherwise, and the caption underneath is part of the same image.
 */
export function projectArt(
  project: { slug: string; title: string; year: string; number: string; motif: Motif; color: string },
  image: HTMLImageElement | null,
) {
  return paint(`project-${project.slug}`, 1024, 640, (context, width, height) => {
    const plate = 470;
    if (image) {
      const crop = (image.width * plate) / width;
      context.drawImage(image, 0, 0, image.width, Math.min(crop, image.height), 0, 0, width, plate);
    } else {
      // A dark plate with the project's colour pooled behind the motif.
      const tone = new THREE.Color(project.color).offsetHSL(0, 0.2, 0.1);
      context.fillStyle = "#0e0c12";
      context.fillRect(0, 0, width, plate);
      const pool = context.createRadialGradient(width / 2, plate * 0.46, 20, width / 2, plate * 0.46, width * 0.62);
      pool.addColorStop(0, tone.getStyle());
      pool.addColorStop(1, "rgba(14,12,18,0)");
      context.fillStyle = pool;
      context.fillRect(0, 0, width, plate);
      context.strokeStyle = "rgba(244,239,230,0.05)";
      context.lineWidth = 1;
      for (let x = 64; x < width; x += 64) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, plate);
        context.stroke();
      }
      for (let y = 64; y < plate; y += 64) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      drawMotif(context, project.motif, width, plate);
    }

    const fade = context.createLinearGradient(0, plate - 110, 0, plate);
    fade.addColorStop(0, "rgba(14,12,18,0)");
    fade.addColorStop(1, "rgba(14,12,18,0.85)");
    context.fillStyle = fade;
    context.fillRect(0, plate - 110, width, 110);
    context.fillStyle = "#0e0c12";
    context.fillRect(0, plate, width, height - plate);
    context.fillStyle = GOLD;
    context.fillRect(0, plate, width, 3);

    context.textBaseline = "alphabetic";
    context.font = `500 30px ${bodyFont()}`;
    context.fillStyle = GOLD;
    context.fillText(project.number, 44, plate + 58);
    context.textAlign = "right";
    context.fillStyle = "rgba(244,239,230,0.6)";
    context.fillText(project.year, width - 44, plate + 58);
    context.textAlign = "left";
    context.fillStyle = CREAM;
    fitFont(context, project.title, 300, 62, width - 88);
    context.fillText(project.title, 44, plate + 130);
  });
}

/** Straight wood grain for a table top. */
export function grainTexture(base: string) {
  return paint(`grain-${base}`, 512, 256, (context, width, height) => {
    const random = seeded(11);
    context.fillStyle = base;
    context.fillRect(0, 0, width, height);
    for (let streak = 0; streak < 90; streak += 1) {
      const y = random() * height;
      const drift = random() * 6;
      const phase = random() * 6;
      context.strokeStyle =
        random() > 0.5 ? `rgba(255,226,190,${0.03 + random() * 0.05})` : `rgba(26,10,2,${0.05 + random() * 0.1})`;
      context.lineWidth = 0.6 + random() * 2.2;
      context.beginPath();
      for (let x = 0; x <= width; x += 16) {
        const gy = y + Math.sin(x * 0.012 + phase) * drift;
        if (x === 0) context.moveTo(x, gy);
        else context.lineTo(x, gy);
      }
      context.stroke();
    }
  });
}

const PIXEL_FONT = "bold 22px monospace";

/** The picture a cabinet shows while nobody is playing it. */
export function cabinetScreen(id: string, title: string, color: string) {
  const texture = paint(`cabinet-${id}`, 256, 192, (context, width, height) => {
    context.fillStyle = "#05040a";
    context.fillRect(0, 0, width, height);
    const cell = 8;
    const block = (x: number, y: number, w = 1, h = 1) =>
      context.fillRect(x * cell, y * cell, w * cell - 1, h * cell - 1);

    if (id === "snake") {
      context.fillStyle = color;
      for (let x = 6; x <= 14; x += 1) block(x, 14);
      for (let y = 11; y <= 13; y += 1) block(14, y);
      for (let x = 14; x <= 20; x += 1) block(x, 10);
      context.fillStyle = "#ffffff";
      block(21, 10);
      context.fillStyle = "#ff5fd2";
      block(25, 10);
    } else if (id === "breakout") {
      ["#ff5f6d", "#ffd84a", "#7dff8a", "#7ef6ff"].forEach((tone, row) => {
        context.fillStyle = tone;
        for (let x = 4; x < 28; x += 3) block(x, 7 + row, 3, 1);
      });
      context.fillStyle = "#ffffff";
      block(18, 14);
      context.fillStyle = color;
      block(12, 17, 6, 1);
    } else if (id === "invaders") {
      for (let row = 0; row < 2; row += 1) {
        context.fillStyle = row === 0 ? color : "#7ef6ff";
        for (let col = 0; col < 4; col += 1) {
          stamp(context, ALIEN_FRAMES[row], 38 + col * 50, 56 + row * 32, 3);
        }
      }
      context.fillStyle = "#f4efe6";
      stamp(context, SHIP, 108, 132, 3);
    } else if (id === "pong") {
      context.fillStyle = "rgba(126,246,255,0.4)";
      for (let y = 7; y < 19; y += 2) block(16, y);
      context.fillStyle = color;
      block(4, 9, 1, 5);
      context.fillStyle = "#f4efe6";
      block(27, 12, 1, 5);
      context.fillStyle = "#ffffff";
      block(11, 13);
    } else {
      context.strokeStyle = color;
      context.lineWidth = 2;
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          const x = 52 + col * 40;
          const y = 52 + row * 30;
          if ((row === 0 && col === 1) || (row === 2 && col === 2)) {
            context.fillStyle = color;
            context.fillRect(x, y, 32, 22);
          } else {
            context.strokeRect(x + 1, y + 1, 30, 20);
          }
        }
      }
    }

    context.textAlign = "center";
    context.font = PIXEL_FONT;
    context.fillStyle = color;
    context.fillText(title.toUpperCase(), width / 2, 34);
    context.font = "bold 12px monospace";
    context.fillStyle = "#f4efe6";
    context.fillText("PRESS START", width / 2, 176);

    context.fillStyle = "rgba(0,0,0,0.3)";
    for (let y = 0; y < height; y += 4) context.fillRect(0, y, width, 1);
  });
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

/** The lit sign across the top of a cabinet. */
export function marqueeTexture(id: string, title: string, color: string) {
  return paint(`marquee-${id}`, 512, 144, (context, width, height) => {
    const tone = new THREE.Color(color);
    const glow = context.createLinearGradient(0, 0, 0, height);
    glow.addColorStop(0, tone.clone().multiplyScalar(0.5).getStyle());
    glow.addColorStop(1, tone.clone().multiplyScalar(0.16).getStyle());
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    context.fillStyle = "rgba(255,255,255,0.07)";
    for (let x = -height; x < width; x += 44) {
      context.beginPath();
      context.moveTo(x, height);
      context.lineTo(x + height, 0);
      context.lineTo(x + height + 16, 0);
      context.lineTo(x + 16, height);
      context.fill();
    }
    context.strokeStyle = color;
    context.lineWidth = 6;
    context.strokeRect(8, 8, width - 16, height - 16);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#ffffff";
    context.shadowColor = color;
    context.shadowBlur = 18;
    let size = 76;
    const label = title.toUpperCase();
    context.font = `italic 900 ${size}px ${bodyFont()}`;
    while (size > 24 && context.measureText(label).width > width - 64) {
      size -= 4;
      context.font = `italic 900 ${size}px ${bodyFont()}`;
    }
    context.fillText(label, width / 2, height / 2 + 4);
  });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** What the desk monitors show: a locked sign-in on one, a plain notice on the other. */
export function lockScreen(side: "user" | "notice", owner: string) {
  return paint(`lock-${side}`, 512, 288, (context, width, height) => {
    const wallpaper = context.createLinearGradient(0, 0, width, height);
    wallpaper.addColorStop(0, side === "user" ? "#3a2a7a" : "#14121f");
    wallpaper.addColorStop(1, side === "user" ? "#0d0b1e" : "#07060c");
    context.fillStyle = wallpaper;
    context.fillRect(0, 0, width, height);
    const cx = width / 2;
    context.textAlign = "center";
    context.textBaseline = "middle";

    if (side === "user") {
      const bloom = context.createRadialGradient(cx, 90, 0, cx, 90, 220);
      bloom.addColorStop(0, "rgba(255,95,210,0.35)");
      bloom.addColorStop(1, "rgba(255,95,210,0)");
      context.fillStyle = bloom;
      context.fillRect(0, 0, width, height);
      context.fillStyle = "rgba(255,255,255,0.14)";
      context.beginPath();
      context.arc(cx, 92, 44, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.7)";
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = "#ffffff";
      context.font = `500 34px ${bodyFont()}`;
      context.fillText(initials(owner), cx, 94);
      context.font = `400 26px ${bodyFont()}`;
      context.fillText(owner, cx, 170);
      context.fillStyle = "rgba(255,255,255,0.12)";
      context.fillRect(cx - 110, 198, 220, 36);
      context.strokeStyle = "rgba(255,255,255,0.4)";
      context.lineWidth = 1.5;
      context.strokeRect(cx - 110, 198, 220, 36);
      context.fillStyle = "rgba(255,255,255,0.85)";
      for (let dot = 0; dot < 8; dot += 1) {
        context.beginPath();
        context.arc(cx - 84 + dot * 24, 216, 4.5, 0, Math.PI * 2);
        context.fill();
      }
      context.font = `400 16px ${bodyFont()}`;
      context.fillStyle = "rgba(255,255,255,0.6)";
      context.fillText("Locked", cx, 258);
      return;
    }

    context.strokeStyle = GOLD;
    context.fillStyle = GOLD;
    context.lineWidth = 9;
    context.beginPath();
    context.arc(cx, 82, 26, Math.PI, 0);
    context.lineTo(cx + 26, 104);
    context.moveTo(cx - 26, 82);
    context.lineTo(cx - 26, 104);
    context.stroke();
    context.fillRect(cx - 42, 100, 84, 62);
    context.fillStyle = "#14121f";
    context.beginPath();
    context.arc(cx, 126, 8, 0, Math.PI * 2);
    context.fill();
    context.fillRect(cx - 3, 126, 6, 20);
    context.fillStyle = CREAM;
    context.font = `600 30px ${bodyFont()}`;
    context.fillText("PERSONAL COMPUTER", cx, 204);
    context.fillStyle = "#ff7a8a";
    context.font = `600 24px ${bodyFont()}`;
    context.fillText("NO ACCESS", cx, 246);
  });
}

export function hobbyArt(id: string, color: string) {
  return paint(`hobby-${id}`, 420, 288, (context, width, height) => {
    backdrop(context, width, height, color);
    const cx = width / 2;
    const cy = height / 2;
    context.strokeStyle = CREAM;
    context.fillStyle = CREAM;
    context.lineWidth = 5;
    context.lineJoin = "round";

    if (id === "photography") {
      context.strokeRect(cx - 86, cy - 52, 172, 112);
      context.fillRect(cx - 36, cy - 70, 72, 20);
      context.beginPath();
      context.arc(cx, cy + 4, 34, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = GOLD;
      context.beginPath();
      context.arc(cx, cy + 4, 13, 0, Math.PI * 2);
      context.fill();
    } else if (id === "travel") {
      context.beginPath();
      context.arc(cx, cy, 78, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.ellipse(cx, cy, 34, 78, 0, 0, Math.PI * 2);
      context.stroke();
      context.strokeStyle = GOLD;
      for (const y of [-34, 0, 34]) {
        const half = Math.sqrt(78 * 78 - y * y);
        context.beginPath();
        context.moveTo(cx - half, cy + y);
        context.lineTo(cx + half, cy + y);
        context.stroke();
      }
    } else if (id === "markets") {
      [0.62, 0.5, 0.56, 0.38, 0.44, 0.28].forEach((y, index) => {
        const px = width * (0.2 + index * 0.11);
        context.fillStyle = index % 3 === 1 ? CREAM : GOLD;
        context.fillRect(px + 10, (y - 0.1) * height, 4, height * 0.36);
        context.fillRect(px, y * height, 24, height * 0.16);
      });
    } else if (id === "design") {
      context.strokeRect(cx - 92, cy - 62, 112, 112);
      context.strokeStyle = GOLD;
      context.beginPath();
      context.arc(cx + 34, cy + 12, 58, 0, Math.PI * 2);
      context.stroke();
    } else {
      context.strokeRect(cx - 54, cy - 54, 108, 108);
      context.fillStyle = GOLD;
      context.fillRect(cx - 24, cy - 24, 48, 48);
      for (const offset of [-32, 0, 32]) {
        context.fillStyle = CREAM;
        context.fillRect(cx + offset - 3, cy - 84, 6, 24);
        context.fillRect(cx + offset - 3, cy + 60, 6, 24);
        context.fillRect(cx - 84, cy + offset - 3, 24, 6);
        context.fillRect(cx + 60, cy + offset - 3, 24, 6);
      }
    }
  });
}

/** What is on the billiards room television: a made-up game landscape at dusk. */
export function tvArt() {
  return paint("tv-art", 640, 360, (context, width, height) => {
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#1b1140");
    sky.addColorStop(0.55, "#7a3fa8");
    sky.addColorStop(1, "#ff9a5a");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ffe9c4";
    context.beginPath();
    context.arc(width * 0.7, height * 0.42, 46, 0, Math.PI * 2);
    context.fill();
    const random = seeded(41);
    context.fillStyle = "rgba(255,255,255,0.8)";
    for (let star = 0; star < 60; star += 1) {
      context.fillRect(random() * width, random() * height * 0.45, 2, 2);
    }
    ["#4a2a78", "#2c1a55", "#150d2e"].forEach((color, layer) => {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(0, height);
      const base = height * (0.58 + layer * 0.13);
      for (let x = 0; x <= width; x += 40) {
        context.lineTo(x, base - random() * (70 - layer * 18));
      }
      context.lineTo(width, height);
      context.fill();
    });
    context.fillStyle = "rgba(255,255,255,0.9)";
    context.font = `600 20px ${bodyFont()}`;
    context.textAlign = "left";
    context.fillText("PRESS ANY BUTTON", 28, height - 26);
  });
}

const POSTER_SPRITES: Record<string, string[]> = {
  invader: [
    "..#.....#..",
    "...#...#...",
    "..#######..",
    ".##.###.##.",
    "###########",
    "#.#######.#",
    "#.#.....#.#",
    "...##.##...",
  ],
  heart: [
    ".##...##.",
    "####.####",
    "#########",
    "#########",
    ".#######.",
    "..#####..",
    "...###...",
    "....#....",
  ],
  ghost: [
    "...####...",
    ".########.",
    "##########",
    "##..##..##",
    "##..##..##",
    "##########",
    "##########",
    "#.##..##.#",
  ],
};

/** A pixel-art poster: one fat sprite on a flat field. */
export function pixelPoster(kind: "invader" | "heart" | "ghost", ink: string, field: string) {
  return paint(`poster-${kind}`, 320, 400, (context, width, height) => {
    context.fillStyle = field;
    context.fillRect(0, 0, width, height);
    const rows = POSTER_SPRITES[kind];
    const cell = Math.floor((width * 0.72) / rows[0].length);
    const left = (width - cell * rows[0].length) / 2;
    const top = (height - cell * rows.length) / 2 - 16;
    context.fillStyle = ink;
    rows.forEach((row, y) => {
      [...row].forEach((mark, x) => {
        if (mark === "#") context.fillRect(left + x * cell, top + y * cell, cell, cell);
      });
    });
    context.fillStyle = "rgba(255,255,255,0.85)";
    context.font = "bold 22px monospace";
    context.textAlign = "center";
    context.fillText(kind === "heart" ? "1 UP" : kind === "ghost" ? "RUN" : "INSERT COIN", width / 2, height - 34);
  });
}

/** What is on the living room screen: a violet nebula on deep blue. */
export function nebulaArt() {
  return paint("nebula", 640, 360, (context, width, height) => {
    const random = seeded(88);
    context.fillStyle = "#070a1c";
    context.fillRect(0, 0, width, height);
    for (const [x, y, reach, color] of [
      [330, 190, 260, "rgba(150,70,255,0.55)"],
      [250, 150, 170, "rgba(255,80,210,0.4)"],
      [430, 230, 190, "rgba(70,120,255,0.4)"],
      [350, 170, 70, "rgba(255,190,255,0.5)"],
    ] as Array<[number, number, number, string]>) {
      const cloud = context.createRadialGradient(x, y, 0, x, y, reach);
      cloud.addColorStop(0, color);
      cloud.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = cloud;
      context.fillRect(0, 0, width, height);
    }
    context.lineWidth = 1.5;
    for (let streak = 0; streak < 70; streak += 1) {
      const x = 120 + random() * 400;
      const y = 60 + random() * 240;
      context.strokeStyle = `rgba(${180 + random() * 75},${90 + random() * 80},255,${0.1 + random() * 0.3})`;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + 30, y - 40 * random(), x + 20 + random() * 60, y - 50 - random() * 60);
      context.stroke();
    }
    for (let star = 0; star < 160; star += 1) {
      context.fillStyle = `rgba(255,255,255,${0.2 + random() * 0.7})`;
      context.fillRect(random() * width, random() * height, 1.5, 1.5);
    }
  });
}

/** The lit keycaps of the gaming keyboard, seen from above: five rows running cyan to violet. */
export function keyboardTexture() {
  return paint("keyboard", 512, 176, (context, width, height) => {
    context.fillStyle = "#0b0c12";
    context.fillRect(0, 0, width, height);
    const rows = [15, 14, 13, 12, 8];
    const pitch = height / rows.length;
    rows.forEach((count, row) => {
      const y = row * pitch + 5;
      // The bottom row is mostly space bar.
      const widths = row === 4 ? [1.3, 1.3, 1.3, 6.2, 1.3, 1.3, 1.3, 1.3] : Array.from({ length: count }, () => 1);
      const unit = (width - 10) / widths.reduce((sum, value) => sum + value, 0);
      let x = 5;
      for (const span of widths) {
        const hue = 185 + ((x + row * 22) / width) * 95;
        context.fillStyle = `hsl(${hue} 95% 62%)`;
        context.fillRect(x + 1, y, span * unit - 3, pitch - 9);
        context.fillStyle = "rgba(8,9,14,0.82)";
        context.fillRect(x + 4, y + 3, span * unit - 9, pitch - 15);
        x += span * unit;
      }
    });
  });
}

/** Breaks `text` into at most `most` lines that fit `room`, in whatever font the context holds. */
function wrapLines(context: CanvasRenderingContext2D, text: string, room: number, most: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const longer = line ? `${line} ${word}` : word;
    if (!line || context.measureText(longer).width <= room) {
      line = longer;
      continue;
    }
    lines.push(line);
    line = word;
  }
  lines.push(line);
  if (lines.length <= most) return lines;
  const kept = lines.slice(0, most);
  let last = kept[most - 1];
  while (last.length > 1 && context.measureText(`${last}…`).width > room) last = last.slice(0, -1);
  kept[most - 1] = `${last.trimEnd()}…`;
  return kept;
}

const SCREEN_INK = "#56dcff";

/** One role on the career timeline: when, what, where, and the first three things it involved. */
export function careerCard(
  job: { id: string; position: string; company: string; period: string; location: string; highlights: string[] },
  current: boolean,
) {
  return paint(`career-${job.id}`, 1024, 683, (context, width, height) => {
    const edge = 54;
    const field = context.createLinearGradient(0, 0, width, height);
    field.addColorStop(0, "#0b1322");
    field.addColorStop(1, "#131f3a");
    context.fillStyle = field;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(86,220,255,0.45)";
    context.lineWidth = 3;
    context.strokeRect(1.5, 1.5, width - 3, height - 3);
    context.fillStyle = SCREEN_INK;
    context.fillRect(0, 0, width, current ? 10 : 5);

    const family = bodyFont();
    context.textBaseline = "alphabetic";
    context.font = `600 29px ${family}`;
    context.fillStyle = SCREEN_INK;
    context.fillText(job.period.toUpperCase(), edge, 96);
    if (current) {
      context.font = `700 22px ${family}`;
      const label = "CURRENT ROLE";
      const room = context.measureText(label).width + 36;
      context.fillRect(width - edge - room, 64, room, 44);
      context.fillStyle = "#0b1322";
      context.fillText(label, width - edge - room + 18, 94);
    }

    context.fillStyle = CREAM;
    fitFont(context, job.position, 300, 66, width - edge * 2);
    context.fillText(job.position, edge, 184);
    context.fillStyle = "rgba(244,239,230,0.72)";
    fitFont(context, `${job.company}  ·  ${job.location}`, 400, 31, width - edge * 2);
    context.fillText(`${job.company}  ·  ${job.location}`, edge, 238);
    context.fillStyle = "rgba(86,220,255,0.3)";
    context.fillRect(edge, 270, width - edge * 2, 2);

    const shown = job.highlights.slice(0, 3);
    let y = 326;
    for (const highlight of shown) {
      context.fillStyle = SCREEN_INK;
      context.fillRect(edge, y - 17, 10, 10);
      context.fillStyle = "rgba(244,239,230,0.9)";
      context.font = `400 27px ${family}`;
      for (const line of wrapLines(context, highlight, width - edge * 2 - 34, 2)) {
        context.fillText(line, edge + 34, y);
        y += 37;
      }
      y += 15;
    }

    const more = job.highlights.length - shown.length;
    context.font = `500 21px ${family}`;
    context.fillStyle = "rgba(244,239,230,0.5)";
    context.fillText(more > 0 ? `+${more} MORE INSIDE` : "READ MORE", edge, height - 36);
  });
}

const LAYER_INKS = ["#a6ff3d", "#4f9dff", "#8b6dff", "#3fd6b4"];
// Top of the stack first, the way an architecture diagram reads.
const LAYER_ORDER = ["Frontend", "State & Data", "Backend", "AI", "Cloud"];

function rounded(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  context.beginPath();
  if (context.roundRect) context.roundRect(x, y, w, h, r);
  else context.rect(x, y, w, h);
}

/** The tech stack board, drawn as an architecture diagram: one layer per row, its tools in a tray beside it. */
export function stackBoard(categories: Array<{ label: string; items: string[] }>) {
  return paint("stack-board", 1500, 900, (context, width, height) => {
    const rank = (label: string) => {
      const index = LAYER_ORDER.indexOf(label);
      return index < 0 ? LAYER_ORDER.length : index;
    };
    const layers = [...categories].sort((one, two) => rank(one.label) - rank(two.label));
    const edge = 34;
    const gap = 16;
    const row = (height - edge * 2 - gap * (layers.length - 1)) / layers.length;
    const label = 290;
    const tray = edge + label + 76;
    const cell = Math.min(150, (width - edge - tray - 24) / Math.max(...layers.map((layer) => layer.items.length)));
    const family = bodyFont();

    context.fillStyle = "#14151b";
    context.fillRect(0, 0, width, height);
    context.textBaseline = "alphabetic";

    layers.forEach((layer, index) => {
      const ink = LAYER_INKS[index % LAYER_INKS.length];
      const y = edge + index * (row + gap);
      const middle = y + row / 2;

      context.fillStyle = `${ink}1c`;
      rounded(context, edge, y + 6, label, row - 12, 14);
      context.fill();
      context.strokeStyle = ink;
      context.lineWidth = 3;
      context.stroke();
      context.fillStyle = ink;
      context.textAlign = "center";
      fitFont(context, layer.label, 700, 32, label - 36);
      context.fillText(layer.label, edge + label / 2, middle - 4);
      context.font = `700 30px ${family}`;
      context.fillText("Layer", edge + label / 2, middle + 32);

      context.strokeStyle = "rgba(255,255,255,0.4)";
      context.lineWidth = 2;
      context.setLineDash([6, 6]);
      context.beginPath();
      context.moveTo(edge + label + 8, middle);
      context.lineTo(tray - 8, middle);
      context.stroke();
      context.setLineDash([]);

      context.fillStyle = "#0a0a0d";
      rounded(context, tray, y, layer.items.length * cell + 24, row, 14);
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.42)";
      context.stroke();

      layer.items.forEach((item, slot) => {
        const x = tray + 12 + slot * cell + cell / 2;
        const mark = STACK_ICONS[item];
        const size = 62;
        if (mark) {
          context.save();
          context.translate(x - size / 2, y + 22);
          context.scale(size / 24, size / 24);
          context.fillStyle = mark.color;
          context.fill(new Path2D(mark.path));
          context.restore();
        } else {
          // No published mark for this one, so it gets a lettered tile in the layer's colour.
          context.fillStyle = `${ink}30`;
          rounded(context, x - size / 2, y + 22, size, size, 12);
          context.fill();
          context.strokeStyle = ink;
          context.lineWidth = 2;
          context.stroke();
          context.fillStyle = ink;
          const letters = item
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          context.font = `700 28px ${family}`;
          context.fillText(letters, x, y + 22 + size / 2 + 10);
        }
        context.fillStyle = "rgba(244,239,230,0.86)";
        fitFont(context, item, 500, 23, cell - 12);
        context.fillText(item, x, y + row - 22);
      });
      context.textAlign = "left";
    });
  });
}

/** The principles board: one lit column per principle, number, name and a line of what it means. */
export function principlesBoard(items: Array<{ number: string; title: string; description: string }>) {
  return paint("principles-board", 1500, 900, (context, width, height) => {
    const edge = 60;
    const gap = 28;
    const family = bodyFont();
    const field = context.createLinearGradient(0, 0, width, height);
    field.addColorStop(0, "#0a111f");
    field.addColorStop(1, "#121d36");
    context.fillStyle = field;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(86,220,255,0.45)";
    context.lineWidth = 3;
    context.strokeRect(1.5, 1.5, width - 3, height - 3);

    context.textBaseline = "alphabetic";
    context.fillStyle = CREAM;
    context.font = `300 68px ${family}`;
    context.fillText("How the work is made", edge, 128);
    context.fillStyle = "rgba(86,220,255,0.3)";
    context.fillRect(edge, 166, width - edge * 2, 2);

    const column = (width - edge * 2 - gap * (items.length - 1)) / items.length;
    const top = 214;
    const bottom = height - edge;
    items.forEach((item, index) => {
      const x = edge + index * (column + gap);
      const ink = LAYER_INKS[index % LAYER_INKS.length];
      context.fillStyle = "rgba(255,255,255,0.045)";
      rounded(context, x, top, column, bottom - top, 16);
      context.fill();
      context.strokeStyle = `${ink}88`;
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = ink;
      context.fillRect(x + 28, top + 28, 56, 5);

      context.font = `200 120px ${family}`;
      context.fillText(item.number, x + 22, top + 170);
      context.fillStyle = CREAM;
      fitFont(context, item.title, 500, 44, column - 56);
      context.fillText(item.title, x + 28, top + 250);

      context.fillStyle = "rgba(244,239,230,0.75)";
      context.font = `400 28px ${family}`;
      let y = top + 312;
      for (const line of wrapLines(context, item.description, column - 56, 5)) {
        context.fillText(line, x + 28, y);
        y += 40;
      }
    });
  });
}
