"use client";

import * as THREE from "three";

// Every figure is assembled from these two shapes, stretched to size, so a shelf of them stays cheap.
const BOX = new THREE.BoxGeometry(1, 1, 1);
const ROD = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const FIGURE_HEIGHT = 0.24;

const materials = new Map<string, THREE.Material>();

function cached(key: string, make: () => THREE.Material) {
  let material = materials.get(key);
  if (!material) {
    material = make();
    materials.set(key, material);
  }
  return material;
}

/** Glossy painted plastic, the body of a toy. */
function paint(color: string) {
  return cached(`paint-${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.34,
      metalness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
    }),
  );
}

function chrome(color = "#c9ccd2") {
  return cached(`chrome-${color}`, () =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.2, metalness: 1, clearcoat: 0.4 }),
  );
}

function glass(color: string) {
  return cached(`glass-${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.08,
      metalness: 0.4,
      clearcoat: 1,
      emissive: color,
      emissiveIntensity: 0.25,
    }),
  );
}

function lamp(color: string) {
  return cached(`lamp-${color}`, () =>
    new THREE.MeshStandardMaterial({ color: "#101014", emissive: color, emissiveIntensity: 2.6 }),
  );
}

type V3 = [number, number, number];

function Part({ p, s, m, r, rod }: { p: V3; s: V3; m: THREE.Material; r?: V3; rod?: boolean }) {
  return <mesh geometry={rod ? ROD : BOX} material={m} position={p} scale={s} rotation={r} />;
}

export type TransformerId =
  | "optimus"
  | "bumblebee"
  | "megatron"
  | "starscream"
  | "thundercracker"
  | "skywarp"
  | "soundwave"
  | "shockwave"
  | "jazz"
  | "prowl"
  | "ironhide"
  | "ratchet";

type Spec = {
  chest: string;
  waist: string;
  pelvis: string;
  shoulder: string;
  upperArm: string;
  forearm: string;
  hand: string;
  thigh: string;
  shin: string;
  foot: string;
  head: string;
  face: string;
  eyes: string;
  badge: "autobot" | "decepticon";
  build: "truck" | "car" | "van" | "jet" | "tank" | "deck" | "cyclops";
  /** Second colour for stripes, wings and trim. */
  trim: string;
};

const SILVER = "#c9ccd2";
const BLACK = "#16161b";

function jet(body: string, trim: string, limb: string): Spec {
  return {
    chest: body,
    waist: body,
    pelvis: body,
    shoulder: body,
    upperArm: body,
    forearm: limb,
    hand: limb,
    thigh: body,
    shin: body,
    foot: limb,
    head: BLACK,
    face: SILVER,
    eyes: "#ff3b30",
    badge: "decepticon",
    build: "jet",
    trim,
  };
}

function van(body: string, trim: string): Spec {
  return {
    chest: body,
    waist: SILVER,
    pelvis: body,
    shoulder: body,
    upperArm: body,
    forearm: body,
    hand: BLACK,
    thigh: SILVER,
    shin: body,
    foot: body,
    head: body,
    face: SILVER,
    eyes: "#49b6ff",
    badge: "autobot",
    build: "van",
    trim,
  };
}

function racer(trim: string, head: string): Spec {
  return {
    chest: "#f1f1ee",
    waist: BLACK,
    pelvis: "#f1f1ee",
    shoulder: "#f1f1ee",
    upperArm: BLACK,
    forearm: "#f1f1ee",
    hand: BLACK,
    thigh: "#f1f1ee",
    shin: "#f1f1ee",
    foot: BLACK,
    head,
    face: SILVER,
    eyes: "#49b6ff",
    badge: "autobot",
    build: "car",
    trim,
  };
}

const SPECS: Record<TransformerId, Spec> = {
  optimus: {
    chest: "#c8202a",
    waist: SILVER,
    pelvis: SILVER,
    shoulder: "#c8202a",
    upperArm: "#c8202a",
    forearm: "#c8202a",
    hand: "#1f3f9c",
    thigh: SILVER,
    shin: "#1f3f9c",
    foot: "#1f3f9c",
    head: "#1f3f9c",
    face: SILVER,
    eyes: "#49b6ff",
    badge: "autobot",
    build: "truck",
    trim: "#9fd3ff",
  },
  bumblebee: {
    chest: "#f5c518",
    waist: BLACK,
    pelvis: "#f5c518",
    shoulder: "#f5c518",
    upperArm: BLACK,
    forearm: "#f5c518",
    hand: BLACK,
    thigh: BLACK,
    shin: "#f5c518",
    foot: "#f5c518",
    head: "#f5c518",
    face: SILVER,
    eyes: "#49b6ff",
    badge: "autobot",
    build: "car",
    trim: BLACK,
  },
  megatron: {
    chest: "#b9bcc4",
    waist: "#a3232b",
    pelvis: "#b9bcc4",
    shoulder: "#b9bcc4",
    upperArm: "#8f939c",
    forearm: "#b9bcc4",
    hand: BLACK,
    thigh: "#a3232b",
    shin: "#b9bcc4",
    foot: "#8f939c",
    head: "#8f939c",
    face: "#dfe1e6",
    eyes: "#ff3b30",
    badge: "decepticon",
    build: "tank",
    trim: BLACK,
  },
  starscream: jet("#d9dbe0", "#c8202a", "#2452b8"),
  thundercracker: jet("#2f63c9", "#c8202a", "#1b1b22"),
  skywarp: jet("#1b1b22", "#7a3fd0", "#7a3fd0"),
  soundwave: {
    chest: "#27408f",
    waist: "#27408f",
    pelvis: SILVER,
    shoulder: "#27408f",
    upperArm: "#27408f",
    forearm: SILVER,
    hand: "#27408f",
    thigh: SILVER,
    shin: "#27408f",
    foot: "#27408f",
    head: "#27408f",
    face: SILVER,
    eyes: "#ffd23a",
    badge: "decepticon",
    build: "deck",
    trim: "#e8c66a",
  },
  shockwave: {
    chest: "#6a3aa8",
    waist: "#55308a",
    pelvis: "#6a3aa8",
    shoulder: "#6a3aa8",
    upperArm: "#55308a",
    forearm: "#6a3aa8",
    hand: "#55308a",
    thigh: "#55308a",
    shin: "#6a3aa8",
    foot: "#6a3aa8",
    head: "#6a3aa8",
    face: "#55308a",
    eyes: "#ffd23a",
    badge: "decepticon",
    build: "cyclops",
    trim: "#d9a6ff",
  },
  jazz: racer("#2452b8", BLACK),
  prowl: racer(BLACK, "#f1f1ee"),
  ironhide: van("#c8202a", BLACK),
  ratchet: van("#f1f1ee", "#c8202a"),
};

/**
 * A shelf figure of one of the classic cartoon robots, about 24 cm tall.
 * Built in a 1-unit-tall frame facing +z, then scaled down.
 */
export default function Transformer({ who, x, y, turn = 0 }: { who: TransformerId; x: number; y: number; turn?: number }) {
  const spec = SPECS[who];
  const { build } = spec;
  const trim = paint(spec.trim);
  const dark = paint(BLACK);
  const eyes = lamp(spec.eyes);
  const badge = paint(spec.badge === "autobot" ? "#d3222b" : "#6a2fb8");
  const cyclops = build === "cyclops";

  return (
    <group position={[x, y, 0.1]} rotation={[0, turn, 0]} scale={FIGURE_HEIGHT}>
      <Part rod p={[0, 0.012, 0]} s={[0.62, 0.024, 0.46]} m={dark} />
      <group position={[0, 0.024, 0]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <Part p={[side * 0.1, 0.035, 0.025]} s={[0.125, 0.07, 0.2]} m={paint(spec.foot)} />
            <Part p={[side * 0.1, 0.2, 0]} s={[0.12, 0.27, 0.135]} m={paint(spec.shin)} />
            <Part p={[side * 0.1, 0.24, 0.07]} s={[0.07, 0.12, 0.012]} m={build === "truck" ? chrome() : trim} />
            <Part p={[side * 0.1, 0.345, 0.045]} s={[0.1, 0.05, 0.06]} m={paint(spec.shin)} />
            <Part p={[side * 0.085, 0.43, 0]} s={[0.09, 0.16, 0.1]} m={spec.thigh === SILVER ? chrome() : paint(spec.thigh)} />

            <Part p={[side * 0.245, 0.8, 0]} s={[0.13, 0.12, 0.15]} m={paint(spec.shoulder)} />
            <Part p={[side * 0.255, 0.685, 0]} s={[0.08, 0.13, 0.09]} m={paint(spec.upperArm)} />
            {!(cyclops && side === -1) && (
              <>
                <Part p={[side * 0.265, 0.55, 0.01]} s={[0.1, 0.16, 0.115]} m={spec.forearm === SILVER ? chrome() : paint(spec.forearm)} />
                <Part p={[side * 0.265, 0.445, 0.015]} s={[0.07, 0.06, 0.075]} m={paint(spec.hand)} />
              </>
            )}

            {build === "truck" && (
              <>
                <Part rod p={[side * 0.325, 0.87, -0.04]} s={[0.026, 0.3, 0.026]} m={chrome()} />
                <Part p={[side * 0.085, 0.78, 0.097]} s={[0.13, 0.085, 0.012]} m={glass(spec.trim)} />
                <Part p={[side * 0.085, 0.685, 0.097]} s={[0.035, 0.035, 0.012]} m={lamp("#fff2c4")} />
                <Part rod p={[side * 0.1, 0.12, -0.075]} s={[0.09, 0.05, 0.09]} r={[0, 0, Math.PI / 2]} m={dark} />
                <Part p={[side * 0.068, 1.0, 0]} s={[0.014, 0.11, 0.03]} m={paint(spec.head)} />
              </>
            )}
            {(build === "car" || build === "van") && (
              <>
                <Part rod p={[side * 0.325, 0.8, 0]} s={[0.1, 0.035, 0.1]} r={[0, 0, Math.PI / 2]} m={dark} />
                <Part rod p={[side * 0.17, 0.14, 0]} s={[0.1, 0.03, 0.1]} r={[0, 0, Math.PI / 2]} m={dark} />
                <Part p={[side * 0.1, 0.665, 0.1]} s={[0.05, 0.03, 0.012]} m={lamp("#fff2c4")} />
              </>
            )}
            {build === "car" && who !== "bumblebee" && (
              // Door wings, standing up behind the shoulders.
              <Part p={[side * 0.3, 0.93, -0.09]} s={[0.17, 0.2, 0.02]} r={[0, 0, side * -0.5]} m={paint(spec.chest)} />
            )}
            {build === "car" && (
              <Part p={[side * 0.055, 1.005, 0.01]} s={[0.022, 0.05, 0.03]} r={[0, 0, side * -0.3]} m={who === "prowl" ? paint("#c8202a") : paint(spec.head)} />
            )}
            {build === "jet" && (
              <>
                <Part p={[side * 0.4, 0.74, -0.11]} s={[0.36, 0.3, 0.018]} r={[0, 0, side * 0.22]} m={paint(spec.chest)} />
                <Part p={[side * 0.43, 0.7, -0.098]} s={[0.26, 0.035, 0.012]} r={[0, 0, side * 0.22]} m={trim} />
                <Part p={[side * 0.2, 0.93, -0.03]} s={[0.085, 0.17, 0.1]} m={paint(spec.shoulder)} />
                <Part p={[side * 0.2, 1.0, 0.022]} s={[0.06, 0.03, 0.012]} m={dark} />
                <Part rod p={[side * 0.325, 0.68, 0.03]} s={[0.04, 0.2, 0.04]} r={[Math.PI / 2, 0, 0]} m={chrome()} />
                <Part p={[side * 0.1, 0.1, -0.09]} s={[0.1, 0.16, 0.015]} m={trim} />
              </>
            )}
            {build === "cyclops" && (
              <Part p={[side * 0.075, 1.0, -0.01]} s={[0.02, 0.1, 0.035]} r={[0, 0, side * -0.25]} m={paint(spec.head)} />
            )}
          </group>
        ))}

        <Part p={[0, 0.545, 0]} s={[0.27, 0.09, 0.135]} m={spec.pelvis === SILVER ? chrome() : paint(spec.pelvis)} />
        <Part p={[0, 0.535, 0.07]} s={[0.07, 0.07, 0.012]} m={trim} />
        <Part p={[0, 0.62, 0]} s={[0.19, 0.075, 0.115]} m={spec.waist === SILVER ? chrome() : paint(spec.waist)} />
        <Part p={[0, 0.755, 0]} s={[0.37, 0.2, 0.185]} m={paint(spec.chest)} />
        <Part p={[0, 0.865, 0]} s={[0.07, 0.03, 0.07]} m={dark} />

        {build === "truck" && (
          <>
            {[-0.03, 0, 0.03].map((bar) => (
              <Part key={bar} p={[0, 0.62 + bar * 0.8, 0.06]} s={[0.17, 0.012, 0.012]} m={chrome("#e6e8ec")} />
            ))}
            <Part p={[0, 0.845, 0.097]} s={[0.05, 0.035, 0.012]} m={badge} />
          </>
        )}
        {(build === "car" || build === "van") && (
          <>
            <Part p={[0, 0.74, 0.1]} s={[0.33, 0.13, 0.02]} m={paint(spec.chest)} />
            <Part p={[0, 0.83, 0.085]} s={[0.3, 0.06, 0.03]} r={[-0.5, 0, 0]} m={glass(build === "van" ? "#20242c" : "#6fb7ff")} />
            <Part p={[0, 0.74, 0.112]} s={[0.05, 0.05, 0.006]} m={badge} />
            <Part p={[0, 0.675, 0.1]} s={[0.36, 0.022, 0.03]} m={build === "van" ? chrome() : trim} />
          </>
        )}
        {build === "car" && who !== "bumblebee" && (
          <>
            <Part p={[-0.06, 0.74, 0.1125]} s={[0.035, 0.128, 0.006]} m={trim} />
            <Part p={[0.06, 0.74, 0.1125]} s={[0.035, 0.128, 0.006]} m={who === "jazz" ? paint("#c8202a") : trim} />
          </>
        )}
        {build === "tank" && (
          <>
            <Part p={[0, 0.77, 0.097]} s={[0.2, 0.11, 0.012]} m={paint("#8f939c")} />
            <Part p={[0, 0.78, 0.105]} s={[0.05, 0.05, 0.006]} m={badge} />
            {/* The fusion cannon on the right arm. */}
            <Part rod p={[-0.37, 0.6, 0.03]} s={[0.11, 0.3, 0.11]} r={[Math.PI / 2, 0, 0]} m={dark} />
            <Part rod p={[-0.37, 0.6, 0.185]} s={[0.075, 0.02, 0.075]} r={[Math.PI / 2, 0, 0]} m={lamp("#b06bff")} />
            <Part p={[-0.315, 0.6, 0]} s={[0.03, 0.04, 0.06]} m={chrome()} />
            <Part p={[0, 1.0, -0.005]} s={[0.15, 0.03, 0.14]} m={paint(spec.head)} />
          </>
        )}
        {build === "jet" && (
          <>
            <Part p={[0, 0.79, 0.1]} s={[0.12, 0.13, 0.05]} r={[-0.25, 0, 0]} m={glass("#ffa733")} />
            <Part p={[-0.135, 0.76, 0.097]} s={[0.08, 0.16, 0.012]} m={trim} />
            <Part p={[0.135, 0.76, 0.097]} s={[0.08, 0.16, 0.012]} m={trim} />
            <Part p={[0, 0.66, 0.062]} s={[0.05, 0.04, 0.006]} m={badge} />
          </>
        )}
        {build === "deck" && (
          <>
            <Part p={[0, 0.765, 0.097]} s={[0.26, 0.13, 0.012]} m={trim} />
            <Part p={[0, 0.765, 0.102]} s={[0.22, 0.095, 0.008]} m={glass("#9fc4e8")} />
            <Part p={[0, 0.765, 0.108]} s={[0.05, 0.05, 0.004]} m={badge} />
            {[-0.06, -0.02, 0.02, 0.06].map((button, index) => (
              <Part key={button} p={[button, 0.625, 0.06]} s={[0.028, 0.03, 0.01]} m={index % 2 ? lamp("#ffd23a") : lamp("#ff3b30")} />
            ))}
            {/* The cannon on his right shoulder. */}
            <Part rod p={[-0.26, 0.91, 0.01]} s={[0.07, 0.26, 0.07]} r={[Math.PI / 2, 0, 0]} m={dark} />
            <Part rod p={[-0.26, 0.91, 0.145]} s={[0.045, 0.015, 0.045]} r={[Math.PI / 2, 0, 0]} m={chrome()} />
          </>
        )}
        {cyclops && (
          <>
            <Part p={[0, 0.775, 0.097]} s={[0.2, 0.1, 0.012]} m={glass(spec.trim)} />
            <Part p={[0, 0.69, 0.097]} s={[0.05, 0.04, 0.006]} m={badge} />
            {/* The left arm is a cannon. */}
            <Part rod p={[-0.265, 0.53, 0.05]} s={[0.1, 0.28, 0.1]} r={[Math.PI / 2, 0, 0]} m={paint(spec.forearm)} />
            <Part rod p={[-0.265, 0.53, 0.195]} s={[0.07, 0.02, 0.07]} r={[Math.PI / 2, 0, 0]} m={lamp(spec.trim)} />
          </>
        )}

        <Part p={[0, 0.94, 0]} s={cyclops ? [0.11, 0.13, 0.11] : [0.125, 0.125, 0.125]} m={paint(spec.head)} />
        {cyclops ? (
          <Part rod p={[0, 0.945, 0.058]} s={[0.055, 0.012, 0.055]} r={[Math.PI / 2, 0, 0]} m={eyes} />
        ) : (
          <>
            <Part p={[0, 0.92, 0.062]} s={[0.085, 0.075, 0.012]} m={spec.face === SILVER ? chrome("#e6e8ec") : paint(spec.face)} />
            {build === "deck" || who === "jazz" ? (
              <Part p={[0, 0.953, 0.07]} s={[0.095, 0.024, 0.008]} m={eyes} />
            ) : (
              [-0.023, 0.023].map((eye) => (
                <Part key={eye} p={[eye, 0.95, 0.07]} s={[0.026, 0.016, 0.008]} m={eyes} />
              ))
            )}
            <Part p={[0, 1.01, 0.02]} s={[0.03, 0.03, 0.09]} m={paint(spec.head)} />
          </>
        )}
      </group>
    </group>
  );
}
