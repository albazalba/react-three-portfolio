"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import * as THREE from "three";
import { tvCanvas, tvKey, tvRelease, tvStep, tvWake } from "./arcade/tv";
import { CeilingBar, Light, Tube, White } from "./decor";
import Glow from "./Glow";
import Model from "./models";
import { POOL_TABLE, ROOMS } from "./layout";
import { useSolidShadows } from "./shadows";
import { getSnapshot, subscribe } from "./store";
import Transformer, { type TransformerId } from "./Transformers";
import { pixelPoster, poolTexture, tvArt, washTexture } from "./textures";

const ICE = "#56dcff";
const INDIGO = "#7d8cff";
const ROOM = ROOMS.play.bounds;
// Wall faces, just proud of the plaster.
const NORTH = ROOM.minZ + 0.09;
const SOUTH = ROOM.maxZ - 0.09;

const SIDE_SHELVES = [0.98, 1.28, 1.58, 1.88];
// Twelve shelves, one robot each, reading down each column from the left.
const SHELF_FIGURES: TransformerId[] = [
  "optimus",
  "bumblebee",
  "jazz",
  "ironhide",
  "megatron",
  "starscream",
  "soundwave",
  "shockwave",
  "prowl",
  "ratchet",
  "thundercracker",
  "skywarp",
];

/** The television picture: its idle art, or the console game while someone is on the sofa. */
function TvScreen() {
  const seated = useSyncExternalStore(
    subscribe,
    () => getSnapshot().seated,
    () => false,
  );
  const idle = tvArt();
  const live = useMemo(() => {
    const texture = new THREE.CanvasTexture(tvCanvas());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }, []);

  useEffect(() => {
    if (!seated) return;
    tvWake();
    const onDown = (event: KeyboardEvent) => {
      if (getSnapshot().overlay) return;
      // Space on a focused button should press that button.
      if (event.target instanceof HTMLButtonElement) return;
      if (tvKey(event.code, true, event.repeat)) event.preventDefault();
    };
    const onUp = (event: KeyboardEvent) => {
      tvKey(event.code, false, false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      tvRelease();
    };
  }, [seated]);

  useFrame((_, deltaTime) => {
    if (!seated) return;
    if (!getSnapshot().overlay) tvStep(Math.min(deltaTime, 0.05));
    live.needsUpdate = true;
  });

  const picture = seated ? live : idle;
  return (
    <meshStandardMaterial
      map={picture}
      emissiveMap={picture}
      emissive="#ffffff"
      emissiveIntensity={seated ? 1 : 0.85}
      roughness={0.3}
    />
  );
}

/** North wall: television, floating shelves, a long white console lit from below. */
function MediaWall() {
  return (
    <group position={[POOL_TABLE.x, 0, NORTH]}>
      <mesh position={[0, 2.26, 0.13]}>
        <boxGeometry args={[4.9, 0.04, 0.26]} />
        <White />
      </mesh>
      <mesh position={[0, 2.292, 0.02]}>
        <boxGeometry args={[4.8, 0.02, 0.02]} />
        <Light color={ICE} />
      </mesh>
      <mesh position={[0, 2.53, 0.006]}>
        <planeGeometry args={[5.2, 0.6]} />
        <Glow map={washTexture()} color={ICE} opacity={0.75} />
      </mesh>
      <Transformer who="optimus" x={-1.9} y={2.28} turn={0.3} />
      <Transformer who="megatron" x={1.95} y={2.28} turn={-0.3} />
      {[-0.9, -0.82, -0.74, -0.66].map((x, index) => (
        <mesh key={x} position={[x, 2.28 + 0.1 - index * 0.008, 0.12]}>
          <boxGeometry args={[0.06, 0.2 - index * 0.016, 0.15]} />
          <meshStandardMaterial color={["#2f6fe0", "#f2c230", "#2a2a32", "#e86fb0"][index]} roughness={0.6} />
        </mesh>
      ))}

      <mesh position={[0.2, 1.52, 0.03]}>
        <boxGeometry args={[1.56, 0.9, 0.05]} />
        <meshStandardMaterial color="#09090c" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0.2, 1.52, 0.057]}>
        <planeGeometry args={[1.5, 0.84]} />
        <TvScreen />
      </mesh>

      {[-1.05, 1.5, 2.1].map((x, column) =>
        SIDE_SHELVES.map((y, row) => (
          <group key={`${x}-${y}`}>
            <mesh position={[x, y, 0.1]}>
              <boxGeometry args={[0.44, 0.03, 0.2]} />
              <White />
            </mesh>
            <Transformer who={SHELF_FIGURES[column * SIDE_SHELVES.length + row]} x={x} y={y + 0.015} turn={x < 0 ? 0.25 : -0.2} />
          </group>
        )),
      )}

      <mesh position={[0.2, 0.34, 0.22]}>
        <boxGeometry args={[3.5, 0.36, 0.44]} />
        <White />
      </mesh>
      {[-0.95, 0.2, 1.35].map((x) => (
        <mesh key={x} position={[x, 0.34, 0.442]}>
          <boxGeometry args={[1.08, 0.26, 0.004]} />
          <meshStandardMaterial color="#e4e1db" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.2, 0.15, 0.22]}>
        <boxGeometry args={[3.4, 0.015, 0.36]} />
        <Light color={ICE} />
      </mesh>
      <mesh position={[0.2, 0.034, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.4, 1.5]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.42} />
      </mesh>
      {/* On the console: a light tower, a games console and its pad. */}
      <mesh position={[-1.25, 0.67, 0.22]}>
        <boxGeometry args={[0.07, 0.3, 0.07]} />
        <Light color="#ffd9f0" gain={1.6} />
      </mesh>
      <Model name="console" position={[-0.7, 0.52, 0.2]} turn={0.15} />
      <Model name="gamepad" position={[1.3, 0.52, 0.22]} turn={0.4} scale={0.55} />
      <Model name="succulent" position={[0.3, 0.52, 0.2]} />
    </group>
  );
}

const CIRCUIT: Array<[number, number]> = [
  [-2.6, 1.95],
  [-2.0, 1.95],
  [-1.7, 2.25],
  [-0.7, 2.25],
  [-0.4, 1.95],
  [0.5, 1.95],
  [0.8, 2.25],
  [2.9, 2.25],
];
const BRANCH: Array<[number, number]> = [
  [-0.7, 2.25],
  [-0.45, 2.5],
  [1.2, 2.5],
];

const POSTERS = [
  { kind: "invader", ink: "#7dff8a", field: "#161226", x: 1.5 },
  { kind: "heart", ink: "#ff5f7a", field: "#f2ede4", x: 2.08 },
  { kind: "ghost", ink: "#7ef6ff", field: "#2a1a55", x: 2.66 },
] as const;

/** South wall: a neon circuit line, a band of light panels, a shelf and three pixel posters. */
function NeonWall() {
  return (
    <group position={[POOL_TABLE.x + 0.1, 0, SOUTH]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 2.15, 0.006]}>
        <planeGeometry args={[5.4, 1.5]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.22} />
      </mesh>
      {[CIRCUIT, BRANCH].map((path, line) =>
        path.slice(1).map((point, index) => (
          <Tube key={`${line}-${index}`} from={path[index]} to={point} color={ICE} />
        )),
      )}

      {/* Two rows of triangles, pink below and white above, pointing in turn. */}
      {Array.from({ length: 9 }, (_, index) => {
        const up = index % 2 === 0;
        return (
          <group key={index} position={[-2.35 + index * 0.2, 0, 0.012]}>
            <mesh position={[0, up ? 1.18 : 1.24, 0]} rotation={[0, 0, up ? Math.PI / 2 : -Math.PI / 2]}>
              <circleGeometry args={[0.19, 3]} />
              <Light color={INDIGO} gain={1.5} />
            </mesh>
            <mesh position={[0, up ? 1.53 : 1.47, 0]} rotation={[0, 0, up ? -Math.PI / 2 : Math.PI / 2]}>
              <circleGeometry args={[0.19, 3]} />
              <Light color="#fff4e6" gain={index % 3 === 0 ? 1.4 : 0.9} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[-1.55, 1.35, 0.008]}>
        <planeGeometry args={[2.8, 1.5]} />
        <Glow map={poolTexture()} color={INDIGO} opacity={0.3} />
      </mesh>

      <mesh position={[-1.55, 1.72, 0.11]}>
        <boxGeometry args={[2.3, 0.035, 0.22]} />
        <White />
      </mesh>
      <mesh position={[-0.2, 1.72, 0.11]}>
        <boxGeometry args={[0.035, 0.035, 0.22]} />
        <White />
      </mesh>
      <mesh position={[-0.2, 1.35, 0.11]}>
        <boxGeometry args={[0.035, 0.78, 0.22]} />
        <White />
      </mesh>
      <mesh position={[0.25, 0.96, 0.11]}>
        <boxGeometry args={[0.94, 0.035, 0.22]} />
        <White />
      </mesh>
      <Transformer who="bumblebee" x={-2.4} y={1.74} />
      <Transformer who="soundwave" x={-1.2} y={1.74} />
      <Transformer who="starscream" x={0.45} y={0.98} turn={-0.3} />
      <group position={[-1.8, 1.82, 0.1]}>
        <mesh>
          <boxGeometry args={[0.42, 0.16, 0.05]} />
          <meshStandardMaterial color="#0c0c10" roughness={0.4} />
        </mesh>
        <Text position={[0, 0, 0.027]} fontSize={0.055} lineHeight={1} textAlign="center" anchorX="center" anchorY="middle" letterSpacing={0.12}>
          {"GAME\nOVER"}
          <Light color="#ffffff" gain={1.6} />
        </Text>
      </group>

      {POSTERS.map((poster) => (
        <group key={poster.kind} position={[poster.x, 1.35, 0.02]}>
          <mesh>
            <boxGeometry args={[0.5, 0.62, 0.03]} />
            <meshStandardMaterial color="#0c0c10" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.017]}>
            <planeGeometry args={[0.46, 0.575]} />
            <PosterFace poster={poster} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PosterFace({ poster }: { poster: (typeof POSTERS)[number] }) {
  const art = pixelPoster(poster.kind, poster.ink, poster.field);
  return <meshStandardMaterial map={art} emissiveMap={art} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.8} />;
}

export default function BilliardsWalls() {
  const root = useSolidShadows();
  return (
    <group ref={root}>
      <MediaWall />
      <NeonWall />
      <CeilingBar room="play" x={POOL_TABLE.x} z={ROOM.minZ + 1.5} length={4.4} />
      <CeilingBar room="play" x={POOL_TABLE.x} z={POOL_TABLE.z - 1.7} length={4.4} />
      <CeilingBar room="play" x={POOL_TABLE.x} z={POOL_TABLE.z + 1.7} length={4.4} />
    </group>
  );
}
