"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Glow from "./Glow";
import { CHASE_PAD, CHASE_SECONDS, ORB_SPOTS } from "./layout";
import {
  getChaseClock,
  getSnapshot,
  livePose,
  markChase,
  openOverlay,
  releaseLookLock,
  startChase,
} from "./store";
import { poolTexture } from "./textures";

const COLLECT_RADIUS = 1.15;

export default function LightChase() {
  const group = useRef<THREE.Group>(null);
  const ended = useRef(false);

  useFrame(({ clock }) => {
    const clockState = getChaseClock();
    const paused = getSnapshot().overlay !== null;
    const meshes = group.current?.children ?? [];

    meshes.forEach((child, index) => {
      const mesh = child as THREE.Mesh;
      const spot = ORB_SPOTS[index];
      if (!spot) return;
      const bob = paused ? 0 : Math.sin(clock.elapsedTime * 1.6 + index) * 0.12;
      const collected = clockState.collected[index];
      mesh.position.set(spot[0], spot[1] + bob, spot[2]);
      mesh.scale.setScalar(collected ? 0.15 : clockState.running ? 1 : 0.22);
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = collected ? 0.05 : clockState.running ? 1.6 : 0.5;
      material.opacity = collected ? 0.15 : 1;
    });

    if (!clockState.running) {
      ended.current = false;
      return;
    }

    if (paused) {
      const elapsedMs = (CHASE_SECONDS - getSnapshot().chase.remaining) * 1000;
      clockState.startedAt = performance.now() - elapsedMs;
      return;
    }

    if (ended.current) return;

    const collected = clockState.collected.slice();
    let changed = false;
    ORB_SPOTS.forEach((spot, index) => {
      if (collected[index]) return;
      const distance = Math.hypot(livePose.x - spot[0], livePose.z - spot[2]);
      if (distance < COLLECT_RADIUS) {
        collected[index] = true;
        changed = true;
      }
    });

    const elapsed = (performance.now() - clockState.startedAt) / 1000;
    const remaining = Math.max(0, CHASE_SECONDS - elapsed);
    const found = collected.filter(Boolean).length;
    const finished = found === collected.length || remaining <= 0;

    if (changed || finished || Math.abs(remaining - getSnapshot().chase.remaining) > 0.2) {
      markChase(collected, remaining, !finished);
    }

    if (finished) {
      ended.current = true;
      releaseLookLock();
      openOverlay({
        type: "chase-result",
        found,
        total: collected.length,
        seconds: Math.min(CHASE_SECONDS, Math.round(elapsed)),
      });
    }
  });

  return (
    <group ref={group}>
      {ORB_SPOTS.map((spot, index) => (
        <mesh key={index} position={spot}>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshStandardMaterial
            color="#2b3558"
            emissive="#9eb6ff"
            emissiveIntensity={0.35}
            transparent
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}
      <group
        rotation={[-Math.PI / 2, 0, 0]}
        position={[CHASE_PAD.x, 0.04, CHASE_PAD.z]}
        onClick={(event) => {
          event.stopPropagation();
          if (!getChaseClock().running) startChase();
        }}
      >
        <mesh>
          <ringGeometry args={[0.8, 0.86, 48]} />
          <meshBasicMaterial color="#e1b74f" transparent opacity={0.75} />
        </mesh>
        <mesh position={[0, 0, -0.005]}>
          <circleGeometry args={[0.8, 48]} />
          <Glow map={poolTexture()} color="#e1b74f" opacity={0.12} />
        </mesh>
      </group>
    </group>
  );
}
