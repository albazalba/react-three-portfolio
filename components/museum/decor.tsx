"use client";

import { useMemo } from "react";
import * as THREE from "three";
import Glow from "./Glow";
import { ROOMS, type RoomId } from "./layout";
import { poolTexture } from "./textures";

const WHITE = "#f2f0ec";

function lit(color: string, gain = 2.2) {
  return new THREE.Color(color).multiplyScalar(gain);
}

/** A light that is only ever colour: neon tube, LED strip, light panel. */
export function Light({ color, gain, both }: { color: string; gain?: number; both?: boolean }) {
  const bright = useMemo(() => lit(color, gain), [color, gain]);
  return <meshBasicMaterial color={bright} toneMapped={false} side={both ? THREE.DoubleSide : THREE.FrontSide} />;
}

export function White() {
  return <meshStandardMaterial color={WHITE} roughness={0.35} />;
}

/** One straight run of neon between two points on a wall. */
export function Tube({ from, to, color }: { from: [number, number]; to: [number, number]; color: string }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return (
    <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0.02]} rotation={[0, 0, Math.atan2(dy, dx)]}>
      <boxGeometry args={[Math.hypot(dx, dy) + 0.02, 0.024, 0.024]} />
      <Light color={color} />
    </mesh>
  );
}

/** A neon line that turns corners: every pair of neighbouring points gets a tube. */
export function Circuit({ path, color }: { path: Array<[number, number]>; color: string }) {
  return (
    <>
      {path.slice(1).map((point, index) => (
        <Tube key={index} from={path[index]} to={point} color={color} />
      ))}
    </>
  );
}

/** A lit many-sided cove in a room's ceiling, open in the middle around the downlight set there. */
export function Cove({
  room,
  x,
  z,
  radius,
  sides,
  fill = "#b8ad9c",
  rim = "#fff0d8",
}: {
  room: RoomId;
  x: number;
  z: number;
  radius: number;
  sides: number;
  fill?: string;
  rim?: string;
}) {
  // The ceiling slab's underside sits 0.14 below the room height.
  const y = ROOMS[room].height - 0.15;
  return (
    <group position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[0.24, radius, sides, 1]} />
        <meshBasicMaterial color={fill} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <ringGeometry args={[radius * 0.93, radius * 1.04, sides, 1]} />
        <Light color={rim} gain={1.5} both />
      </mesh>
    </group>
  );
}

/** A straight run of light set into a room's ceiling, with its spill on the plaster. Runs east to west unless turned. */
export function CeilingBar({
  room,
  x,
  z,
  length,
  turned = false,
  color = "#56dcff",
}: {
  room: RoomId;
  x: number;
  z: number;
  length: number;
  turned?: boolean;
  color?: string;
}) {
  // The ceiling slab's underside sits 0.14 below the room height.
  const y = ROOMS[room].height - 0.15;
  return (
    <group position={[x, y, z]} rotation={[0, turned ? Math.PI / 2 : 0, 0]}>
      <mesh>
        <boxGeometry args={[length, 0.02, 0.07]} />
        <Light color={color} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length + 1.2, 1.5]} />
        <Glow map={poolTexture()} color={color} opacity={0.3} />
      </mesh>
    </group>
  );
}
