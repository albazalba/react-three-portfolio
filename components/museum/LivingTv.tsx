"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { channelCanvas, channelKey, channelStep } from "./channels";
import { Light, White } from "./decor";
import Glow from "./Glow";
import { LIVING_TV } from "./layout";
import Model from "./models";
import { useSolidShadows } from "./shadows";
import { getSnapshot, releaseLookLock, subscribe, watch } from "./store";
import { poolTexture } from "./textures";

const ICE = "#56dcff";
const CONSOLE_Z = 1.91 - LIVING_TV.z;

/** The picture: always on while the visitor is in the living room, at full rate once they sit down to watch. */
function Picture() {
  const watching = useSyncExternalStore(
    subscribe,
    () => getSnapshot().watching,
    () => false,
  );
  const since = useRef(0);
  const live = useMemo(() => {
    const texture = new THREE.CanvasTexture(channelCanvas());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, []);

  useEffect(() => {
    if (!watching) return;
    const onDown = (event: KeyboardEvent) => {
      if (getSnapshot().overlay) return;
      if (event.target instanceof HTMLButtonElement) return;
      if (channelKey(event.code)) {
        event.preventDefault();
        live.needsUpdate = true;
      }
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [watching, live]);

  useFrame((_, deltaTime) => {
    const snap = getSnapshot();
    if (!snap.watching && snap.zone !== "atrium") return;
    since.current += Math.min(deltaTime, 0.1);
    // Seen across the room, a dozen frames a second is plenty.
    if (!snap.watching && since.current < 1 / 12) return;
    channelStep(since.current);
    since.current = 0;
    live.needsUpdate = true;
  });

  return <meshStandardMaterial map={live} emissiveMap={live} emissive="#ffffff" emissiveIntensity={watching ? 1 : 0.9} roughness={0.3} />;
}

/** The living room's big television, on the wall facing the sofa, over a low console. */
export default function LivingTv() {
  const root = useSolidShadows();
  const { w, h, y } = LIVING_TV;
  return (
    <group ref={root} position={[LIVING_TV.x, 0, LIVING_TV.z]}>
      <mesh position={[0, 1.5, -0.06]}>
        <boxGeometry args={[w + 0.7, 2.4, 0.02]} />
        <meshStandardMaterial color="#17131a" roughness={0.8} />
      </mesh>
      <mesh position={[0, y, -0.045]}>
        <planeGeometry args={[w + 1.4, h + 1.1]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.55} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (w / 2 + 0.38), 1.5, -0.04]}>
          <boxGeometry args={[0.014, 2.36, 0.014]} />
          <Light color={ICE} />
        </mesh>
      ))}

      <mesh position={[0, y, 0]}>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.05]} />
        <meshStandardMaterial color="#050608" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh
        position={[0, y, 0.027]}
        onClick={(event) => {
          event.stopPropagation();
          if (getSnapshot().phase !== "explore" || getSnapshot().overlay) return;
          releaseLookLock();
          watch();
        }}
      >
        <planeGeometry args={[w, h]} />
        <Picture />
      </mesh>

      <mesh position={[0, 0.34, CONSOLE_Z]}>
        <boxGeometry args={[3.0, 0.36, 0.44]} />
        <White />
      </mesh>
      {[-1, 0, 1].map((x) => (
        <mesh key={x} position={[x, 0.34, CONSOLE_Z + 0.222]}>
          <boxGeometry args={[0.94, 0.26, 0.004]} />
          <meshStandardMaterial color="#e4e1db" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, CONSOLE_Z]}>
        <boxGeometry args={[2.9, 0.015, 0.36]} />
        <Light color={ICE} />
      </mesh>
      <mesh position={[0, 0.034, CONSOLE_Z + 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 1.5]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.4} />
      </mesh>
      {/* A soundbar under the picture, and a plant at one end of the console. */}
      <mesh position={[0, 0.56, CONSOLE_Z + 0.06]}>
        <boxGeometry args={[1.3, 0.08, 0.1]} />
        <meshStandardMaterial color="#121318" roughness={0.6} />
      </mesh>
      <Model name="succulent" position={[1.2, 0.52, CONSOLE_Z]} />
      <Model name="vase" position={[-1.2, 0.52, CONSOLE_Z]} scale={0.6} />
    </group>
  );
}
