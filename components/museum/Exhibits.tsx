"use client";

import { RoundedBox, Text, useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import Glow from "./Glow";
import {
  FRAMES,
  HOBBY_FRAMES,
  type Action,
} from "./layout";
import { useSolidShadows } from "./shadows";
import { openOverlay, releaseLookLock, startChase, getChaseClock } from "./store";
import { grainTexture, hobbyArt, poolTexture, projectArt, washTexture } from "./textures";

const PORTRAIT_URL = "/museum/portrait.jpg";
// Trim metal and wall lettering share one pale ice blue.
const BRASS = "#9fe3fa";
const INK = "#f6f1e8";

function activate(action: Action, event?: ThreeEvent<MouseEvent>) {
  event?.stopPropagation();
  if (action.type === "chase") {
    if (!getChaseClock().running) startChase();
    return;
  }
  releaseLookLock();
  openOverlay(action);
}

function Brass() {
  return <meshPhysicalMaterial color={BRASS} metalness={0.94} roughness={0.22} clearcoat={0.5} />;
}

/** A brass picture light and the wash it throws down the wall behind a frame. */
function PictureLight({ y, width, drop }: { y: number; width: number; drop: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[width * 0.5, 0.025, 0.06]} />
        <Brass />
      </mesh>
      <mesh position={[0, -0.016, 0.085]}>
        <boxGeometry args={[width * 0.44, 0.006, 0.03]} />
        <meshStandardMaterial color="#d6f3ff" emissive="#d6f3ff" emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[0, -drop / 2 - 0.03, 0.064]} rotation={[0, 0, Math.PI]}>
        <planeGeometry args={[width * 0.92, drop]} />
        <Glow map={washTexture()} color="#9fe3fa" opacity={0.16} />
      </mesh>
    </group>
  );
}

function Portrait() {
  const texture = useTexture(PORTRAIT_URL);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return (
    <group
      position={[-5.46, 0, 7.75]}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(event) => activate({ type: "intro" }, event)}
    >
      <mesh position={[0, 1.68, 0.012]}>
        <planeGeometry args={[2.1, 2.3]} />
        <Glow map={poolTexture()} color="#56dcff" opacity={0.2} />
      </mesh>
      <mesh position={[0, 1.68, 0.02]} castShadow>
        <boxGeometry args={[0.84, 1.02, 0.04]} />
        <Brass />
      </mesh>
      <mesh position={[0, 1.68, 0.03]}>
        <boxGeometry args={[0.8, 0.98, 0.04]} />
        <meshStandardMaterial color="#14110e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.68, 0.052]}>
        <planeGeometry args={[0.68, 0.85]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.55}
          roughness={0.85}
        />
      </mesh>
      <PictureLight y={2.3} width={0.84} drop={0.5} />
      <mesh position={[0, 1.02, 0.02]}>
        <boxGeometry args={[0.5, 0.13, 0.016]} />
        <Brass />
      </mesh>
      <Text
        position={[0, 1.04, 0.03]}
        fontSize={0.04}
        color="#1a140c"
        anchorX="center"
        letterSpacing={0.16}
      >
        ALBAZ AQTHER
      </Text>
      <Text
        position={[0, 0.99, 0.03]}
        fontSize={0.022}
        color="#1a140c"
        anchorX="center"
        letterSpacing={0.2}
        fillOpacity={0.8}
      >
        INTRODUCTION
      </Text>
    </group>
  );
}

const ART_FRAMES = FRAMES.filter((frame) => frame.art);
const ART_URLS = ART_FRAMES.map((frame) => frame.art as string);

function halo(color: string) {
  return `#${new THREE.Color(color).offsetHSL(0, 0.3, 0.24).getHexString()}`;
}

function WallTitle({ position, rotY, children }: { position: [number, number, number]; rotY: number; children: string }) {
  return (
    <Text
      position={position}
      rotation={[0, rotY, 0]}
      fontSize={0.075}
      color={BRASS}
      anchorX="left"
      anchorY="middle"
      letterSpacing={0.3}
    >
      {children}
    </Text>
  );
}

// Lit from behind, so each panel floats off the wall on its own colour.
function Frames() {
  const shots = useTexture(ART_URLS);
  return (
    <group>
      <WallTitle position={[-4.29, 2.24, -6.29]} rotY={0}>SELECTED WORK</WallTitle>
      <WallTitle position={[5.49, 2.08, -3.93]} rotY={-Math.PI / 2}>EARLIER WORK</WallTitle>
      {FRAMES.map((frame) => {
        const shot = frame.art ? shots[ART_FRAMES.indexOf(frame)] : undefined;
        const art = projectArt(frame, (shot?.image as HTMLImageElement | undefined) ?? null);
        return (
          <group
            key={frame.slug}
            position={[frame.x, frame.y, frame.z]}
            rotation={[0, frame.rotY, 0]}
            onClick={(event) => activate({ type: "project", slug: frame.slug }, event)}
          >
            <mesh position={[0, 0, 0.012]}>
              <planeGeometry args={[frame.w + 0.9, frame.h + 0.9]} />
              <Glow map={poolTexture()} color={halo(frame.color)} opacity={0.75} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[frame.w + 0.05, frame.h + 0.05, 0.04]} />
              <meshStandardMaterial color="#0b0a0f" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.062]}>
              <planeGeometry args={[frame.w, frame.h]} />
              <meshStandardMaterial
                map={art}
                emissiveMap={art}
                emissive="#ffffff"
                emissiveIntensity={0.6}
                roughness={0.55}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Hobbies() {
  return (
    <group>
      {HOBBY_FRAMES.map((frame) => (
        <group
          key={frame.id}
          position={[frame.x, 1.35, frame.z]}
          rotation={[0, frame.rotY, 0]}
          scale={0.46}
          onClick={(event) => activate({ type: "hobby", id: frame.id }, event)}
        >
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.55, 1.9, 0.05]} />
            <meshStandardMaterial color={BRASS} metalness={0.65} roughness={0.32} />
          </mesh>
          <mesh>
            <planeGeometry args={[1.35, 1.7]} />
            <meshStandardMaterial color="#4a3c34" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.25, 0.02]}>
            <planeGeometry args={[1.05, 0.72]} />
            <meshStandardMaterial
              map={hobbyArt(frame.id, frame.color)}
              emissiveMap={hobbyArt(frame.id, frame.color)}
              emissive="#ffffff"
              emissiveIntensity={0.55}
              roughness={0.6}
            />
          </mesh>
          <Text
            position={[0, -0.4, 0.04]}
            fontSize={0.08}
            color={INK}
            anchorX="center"
            maxWidth={1.2}
            textAlign="center"
          >
            {frame.title}
          </Text>
        </group>
      ))}
    </group>
  );
}

function Desk() {
  const grain = grainTexture("#2a3852");
  return (
    <group
      position={[3.85, 0, -4.85]}
      rotation={[0, -Math.PI / 2, 0]}
      onClick={(event) => activate({ type: "contact" }, event)}
    >
      <RoundedBox args={[1.7, 0.05, 0.78]} radius={0.018} smoothness={3} position={[0, 0.765, 0]} castShadow>
        <meshPhysicalMaterial map={grain} roughness={0.38} clearcoat={0.5} clearcoatRoughness={0.3} />
      </RoundedBox>
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, 0.37, 0]}>
          <boxGeometry args={[0.05, 0.74, 0.7]} />
          <meshStandardMaterial color="#141a28" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.47, 0.3]}>
        <boxGeometry args={[1.51, 0.5, 0.03]} />
        <meshStandardMaterial map={grain} color="#c9d6ea" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, 0.317]}>
        <boxGeometry args={[1.51, 0.012, 0.006]} />
        <Brass />
      </mesh>

      <mesh position={[0.58, 0.8, -0.05]}>
        <cylinderGeometry args={[0.09, 0.1, 0.02, 24]} />
        <Brass />
      </mesh>
      <mesh position={[0.58, 1.03, -0.05]}>
        <cylinderGeometry args={[0.012, 0.012, 0.46, 10]} />
        <Brass />
      </mesh>
      <mesh position={[0.58, 1.3, -0.05]}>
        <cylinderGeometry args={[0.09, 0.15, 0.17, 24, 1, true]} />
        <meshStandardMaterial
          color="#e6f4ff"
          emissive="#9fd8ff"
          emissiveIntensity={1.1}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight position={[0.58, 1.22, 0.05]} color="#9fd8ff" intensity={5} distance={5} decay={2} />

      <group position={[-0.08, 0.79, -0.08]}>
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[0.34, 0.016, 0.24]} />
          <meshStandardMaterial color="#9a9ba3" metalness={0.7} roughness={0.35} />
        </mesh>
        <group position={[0, 0.016, 0.12]} rotation={[0.28, 0, 0]}>
          <mesh position={[0, 0.115, 0]}>
            <boxGeometry args={[0.34, 0.23, 0.01]} />
            <meshStandardMaterial color="#9a9ba3" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.115, -0.0055]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.31, 0.2]} />
            <meshStandardMaterial color="#1a2030" emissive="#8eb4ff" emissiveIntensity={0.55} roughness={0.3} />
          </mesh>
        </group>
      </group>
      <mesh position={[-0.55, 0.797, -0.02]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.014, 0.27]} />
        <meshStandardMaterial color="#1f3a34" roughness={0.6} />
      </mesh>
      <mesh position={[-0.42, 0.797, -0.02]} rotation={[0, 0.5, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.14, 8]} />
        <Brass />
      </mesh>

      <mesh position={[0, 0.825, 0.3]}>
        <boxGeometry args={[0.5, 0.07, 0.035]} />
        <meshStandardMaterial color="#14110d" roughness={0.45} metalness={0.3} />
      </mesh>
      <Text position={[0, 0.826, 0.319]} fontSize={0.032} color={BRASS} anchorX="center" anchorY="middle" letterSpacing={0.2}>
        GET IN TOUCH
      </Text>
    </group>
  );
}

export default function Exhibits() {
  const root = useSolidShadows();
  return (
    <group ref={root}>
      <Portrait />
      <Frames />
      <Hobbies />
      <Desk />
    </group>
  );
}

useTexture.preload(ART_URLS);
useTexture.preload(PORTRAIT_URL);
