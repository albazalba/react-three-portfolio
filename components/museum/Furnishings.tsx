"use client";

import { Clone, RoundedBox, Text, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import CarCollection from "./CarCollection";
import { GamingChair, GamingDesk } from "./GamingSetup";
import Glow from "./Glow";
import Model from "./models";
import { CABINETS, FURNITURE, type Action, type Cabinet, type Furnishing } from "./layout";
import { useSolidShadows } from "./shadows";
import { openOverlay, releaseLookLock } from "./store";
import {
  cabinetScreen,
  marqueeTexture,
  poolTexture,
} from "./textures";

const BENCH_URL = "/museum/models/bench.glb";

const WOOD = "#6b4a30";
const STONE = "#6a5e52";

function open(action: Action, event: ThreeEvent<MouseEvent>) {
  event.stopPropagation();
  releaseLookLock();
  openOverlay(action);
}

function Bench({ item }: { item: Furnishing }) {
  const { scene } = useGLTF(BENCH_URL);
  return (
    <Clone
      object={scene}
      castShadow
      receiveShadow
      position={[item.x, 0, item.z]}
      rotation={[0, item.rotY ?? 0, 0]}
    />
  );
}

function Plant({ item }: { item: Furnishing }) {
  // Turned by where it stands, so no two plants show the same side.
  return <Model name="plant" position={[item.x, 0, item.z]} turn={item.x * 1.7 + item.z} scale={0.9} />;
}

function Plinth({ item }: { item: Furnishing }) {
  const color = item.color ?? "#c6a15a";
  return (
    <group position={[item.x, 0, item.z]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.3, 0.84, 6]} />
        <meshStandardMaterial color={STONE} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 6]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.16, 0]} rotation={[0.5, 0.8, 0.2]} castShadow>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          metalness={0.45}
          roughness={0.28}
        />
      </mesh>
    </group>
  );
}

function Stool({ item }: { item: Furnishing }) {
  return (
    <group position={[item.x, 0, item.z]}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.56, 8]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
        <meshStandardMaterial color="#2a3142" roughness={0.45} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Chair({ item }: { item: Furnishing }) {
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotY ?? 0, 0]}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.42, 0.06, 0.42]} />
        <meshStandardMaterial color={WOOD} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.72, -0.18]}>
        <boxGeometry args={[0.42, 0.55, 0.06]} />
        <meshStandardMaterial color="#4a3424" roughness={0.6} />
      </mesh>
      {[-0.16, 0.16].map((x) =>
        [-0.16, 0.16].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.2, z]}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color="#3a2a1e" />
          </mesh>
        )),
      )}
    </group>
  );
}

function Shelf({ item }: { item: Furnishing }) {
  const books = ["#8d4a3a", "#3d5a78", "#c6a15a", "#4e6a52", "#6a4a68", "#d7d0c4"];
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotY ?? 0, 0]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.7, 1.8, 0.32]} />
        <meshStandardMaterial color="#4a382c" roughness={0.7} />
      </mesh>
      {[0.35, 0.85, 1.35].map((y) => (
        <mesh key={y} position={[0, y, 0.02]}>
          <boxGeometry args={[1.55, 0.04, 0.28]} />
          <meshStandardMaterial color="#6b5340" roughness={0.5} />
        </mesh>
      ))}
      {books.map((color, index) => (
        <mesh key={color} position={[-0.62 + index * 0.24, index % 2 === 0 ? 0.58 : 1.08, 0.08]}>
          <boxGeometry args={[0.16, 0.42, 0.18]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Panel({ item }: { item: Furnishing }) {
  const color = item.color ?? "#6a5344";
  const w = item.w ?? 2.2;
  const h = item.h ?? 1.4;
  return (
    <group position={[item.x, item.y ?? 1.85, item.z]} rotation={[0, item.rotY ?? 0, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.03]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh>
        <boxGeometry args={[w, h, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.28} roughness={0.55} />
      </mesh>
    </group>
  );
}

/** A plain dark rug, big enough to sit under the whole seating group. */
function Rug({ item }: { item: Furnishing }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[item.x, 0.035, item.z]}>
      <planeGeometry args={[item.w ?? 3, item.h ?? 2]} />
      <meshStandardMaterial color="#161c2b" roughness={1} />
    </mesh>
  );
}

function Tripod({ item }: { item: Furnishing }) {
  return (
    <group position={[item.x, 0, item.z]}>
      {[0, 2.1, 4.2].map((angle) => (
        <mesh key={angle} position={[Math.sin(angle) * 0.16, 0.55, Math.cos(angle) * 0.16]} rotation={[0.18, angle, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 1.15, 6]} />
          <meshStandardMaterial color="#2c2c2c" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[0.28, 0.16, 0.18]} />
        <meshStandardMaterial color="#1c1c1c" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.22, 0.1]}>
        <cylinderGeometry args={[0.06, 0.08, 0.08, 12]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Globe({ item }: { item: Furnishing }) {
  return (
    <group position={[item.x, 0, item.z]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.08, 0.16, 1.1, 10]} />
        <meshStandardMaterial color="#4a382c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.32, 24, 16]} />
        <meshStandardMaterial color="#3d6a78" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[0.34, 0.012, 8, 24]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// A cabinet in profile, front to the right: kick panel, control deck, raked screen, marquee.
const CABINET_SIDE = (() => {
  const outline: Array<[number, number]> = [
    [-0.38, 0],
    [0.3, 0],
    [0.3, 0.82],
    [0.44, 0.9],
    [0.44, 0.96],
    [0.3, 1.04],
    [0.22, 1.56],
    [0.34, 1.62],
    [0.34, 1.84],
    [-0.38, 1.84],
  ];
  const shape = new THREE.Shape();
  outline.forEach(([z, y], index) => {
    if (index === 0) shape.moveTo(z, y);
    else shape.lineTo(z, y);
  });
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false });
})();

const CABINET_BODY = "#0d0b13";
const BUTTON_COLORS = ["#ff5f6d", "#ffd84a", "#7ef6ff"];

function ArcadeCabinet({ cabinet }: { cabinet: Cabinet }) {
  const { color } = cabinet;
  const screen = cabinetScreen(cabinet.id, cabinet.title, color);
  const marquee = marqueeTexture(cabinet.id, cabinet.title, color);
  return (
    <group position={[cabinet.x, 0, cabinet.z]} rotation={[0, cabinet.rotY, 0]}>
      <group onClick={(event) => open({ type: "game", id: cabinet.id }, event)}>
        {[0.39, -0.36].map((x) => (
          <mesh key={x} geometry={CABINET_SIDE} position={[x, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <meshStandardMaterial color="#1a1624" roughness={0.5} metalness={0.2} />
          </mesh>
        ))}
        {[-0.393, 0.393].map((x) => (
          <mesh key={x} position={[x, 0.62, -0.04]}>
            <boxGeometry args={[0.006, 0.05, 0.62]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 0.42, -0.04]}>
          <boxGeometry args={[0.72, 0.84, 0.64]} />
          <meshStandardMaterial color={CABINET_BODY} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.34, -0.13]}>
          <boxGeometry args={[0.72, 1, 0.46]} />
          <meshStandardMaterial color={CABINET_BODY} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.825, -0.02]}>
          <boxGeometry args={[0.72, 0.03, 0.72]} />
          <meshStandardMaterial color={CABINET_BODY} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.92, 0.36]}>
          <boxGeometry args={[0.72, 0.08, 0.14]} />
          <meshStandardMaterial color={CABINET_BODY} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.78, 0.283]}>
          <boxGeometry args={[0.72, 0.02, 0.01]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0, 0.46, 0.284]}>
          <boxGeometry args={[0.24, 0.3, 0.012]} />
          <meshStandardMaterial color="#1e1b27" roughness={0.4} metalness={0.6} />
        </mesh>
        {[-0.05, 0.05].map((x) => (
          <mesh key={x} position={[x, 0.5, 0.291]}>
            <boxGeometry args={[0.035, 0.06, 0.004]} />
            <meshStandardMaterial color="#ff7a3c" emissive="#ff7a3c" emissiveIntensity={1.6} />
          </mesh>
        ))}

        <group position={[0, 0.985, 0.32]} rotation={[0.43, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.72, 0.03, 0.27]} />
            <meshStandardMaterial color="#1c1925" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[-0.17, 0.05, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.07, 8]} />
            <meshStandardMaterial color="#9a9aa6" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-0.17, 0.095, 0]}>
            <sphereGeometry args={[0.024, 14, 12]} />
            <meshStandardMaterial color="#e23a4a" roughness={0.3} />
          </mesh>
          {BUTTON_COLORS.map((tone, index) => (
            <mesh key={tone} position={[0.04 + index * 0.085, 0.021, index === 1 ? -0.025 : 0.01]}>
              <cylinderGeometry args={[0.022, 0.022, 0.014, 14]} />
              <meshStandardMaterial color={tone} emissive={tone} emissiveIntensity={0.7} roughness={0.35} />
            </mesh>
          ))}
        </group>

        <group position={[0, 1.3, 0.15]} rotation={[-0.19, 0, 0]}>
          <mesh position={[0, 0, -0.012]}>
            <boxGeometry args={[0.72, 0.55, 0.02]} />
            <meshStandardMaterial color="#07060a" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <planeGeometry args={[0.6, 0.45]} />
            <meshStandardMaterial
              map={screen}
              emissiveMap={screen}
              emissive="#ffffff"
              emissiveIntensity={1.15}
              roughness={0.25}
            />
          </mesh>
        </group>

        <group position={[0, 1.59, 0.22]} rotation={[-0.245, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.72, 0.025, 0.26]} />
            <meshStandardMaterial color={CABINET_BODY} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.016, 0.04]}>
            <boxGeometry args={[0.6, 0.008, 0.03]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
          </mesh>
        </group>
        <mesh position={[0, 1.73, 0.31]}>
          <boxGeometry args={[0.72, 0.22, 0.05]} />
          <meshStandardMaterial color={CABINET_BODY} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.73, 0.337]}>
          <planeGeometry args={[0.7, 0.2]} />
          <meshStandardMaterial
            map={marquee}
            emissiveMap={marquee}
            emissive="#ffffff"
            emissiveIntensity={1.3}
            roughness={0.4}
          />
        </mesh>
      </group>
      <mesh position={[0, 0.03, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 1.4]} />
        <Glow map={poolTexture()} color={color} opacity={0.2} />
      </mesh>
    </group>
  );
}

const LEATHER = "#5b7391";

/**
 * A low leather sofa, blue-grey, with a seam down every cushion. `w` is how many seats it has
 * (three if unset). The seat faces -z.
 */
function Sofa({ item }: { item: Furnishing }) {
  const seats = item.w ?? 3;
  const width = seats * 0.68 + 0.24;
  const arm = width / 2 - 0.06;
  const spots = Array.from({ length: seats }, (_, index) => (index - (seats - 1) / 2) * 0.68);
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotY ?? 0, 0]}>
      <mesh position={[0, 0.2, 0.02]}>
        <boxGeometry args={[width, 0.16, 0.82]} />
        <meshStandardMaterial color="#1a2233" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.105, 0.02]}>
        <boxGeometry args={[width - 0.1, 0.012, 0.74]} />
        <meshBasicMaterial color={[0.5, 1.7, 2.2]} toneMapped={false} />
      </mesh>
      <RoundedBox args={[width, 0.52, 0.2]} radius={0.08} smoothness={3} position={[0, 0.72, 0.32]}>
        <meshPhysicalMaterial color={LEATHER} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} />
      </RoundedBox>
      {[-arm, arm].map((x) => (
        <RoundedBox key={x} args={[0.2, 0.34, 0.86]} radius={0.08} smoothness={3} position={[x, 0.5, -0.02]}>
          <meshPhysicalMaterial color={LEATHER} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} />
        </RoundedBox>
      ))}
      {spots.map((x) => (
        <group key={x}>
          <RoundedBox args={[0.66, 0.22, 0.62]} radius={0.07} smoothness={3} position={[x, 0.4, -0.05]}>
            <meshPhysicalMaterial color={LEATHER} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} />
          </RoundedBox>
          <RoundedBox args={[0.66, 0.4, 0.16]} radius={0.07} smoothness={3} position={[x, 0.74, 0.19]} rotation={[0.14, 0, 0]}>
            <meshPhysicalMaterial color={LEATHER} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} />
          </RoundedBox>
          <mesh position={[x, 0.512, -0.05]}>
            <boxGeometry args={[0.5, 0.004, 0.012]} />
            <meshStandardMaterial color="#33435c" roughness={0.6} />
          </mesh>
          <mesh position={[x, 0.76, 0.108]} rotation={[0.14, 0, 0]}>
            <boxGeometry args={[0.5, 0.012, 0.004]} />
            <meshStandardMaterial color="#33435c" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A glass table on a thin chrome frame, with a light under the lower shelf. */
function CoffeeTable({ item }: { item: Furnishing }) {
  return (
    <group position={[item.x, 0, item.z]}>
      {[0.4, 0.16].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[1.16, 0.02, 0.6]} />
          <meshPhysicalMaterial color="#bfe6ff" transparent opacity={0.32} roughness={0.05} metalness={0.2} />
        </mesh>
      ))}
      {[-0.56, 0.56].map((x) =>
        [-0.28, 0.28].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.2, z]}>
            <boxGeometry args={[0.024, 0.4, 0.024]} />
            <meshStandardMaterial color="#c9d3df" metalness={1} roughness={0.2} />
          </mesh>
        )),
      )}
      {[-0.28, 0.28].map((z) => (
        <mesh key={z} position={[0, 0.385, z]}>
          <boxGeometry args={[1.12, 0.018, 0.018]} />
          <meshStandardMaterial color="#c9d3df" metalness={1} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.146, 0]}>
        <boxGeometry args={[0.8, 0.008, 0.3]} />
        <meshBasicMaterial color={[0.5, 1.7, 2.2]} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 1.6]} />
        <Glow map={poolTexture()} color="#56dcff" opacity={0.35} />
      </mesh>
      <group position={[-0.26, 0.41, 0.03]} rotation={[0, 0.22, 0]}>
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[0.3, 0.03, 0.22]} />
          <meshStandardMaterial color="#232a44" roughness={0.9} />
        </mesh>
        <mesh position={[0.01, 0.042, 0.005]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.26, 0.024, 0.19]} />
          <meshStandardMaterial color="#8fa6c4" roughness={0.55} />
        </mesh>
      </group>
      <mesh position={[0.3, 0.45, -0.08]}>
        <cylinderGeometry args={[0.036, 0.03, 0.08, 20]} />
        <meshStandardMaterial color="#e6edf5" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Wardrobe({ item }: { item: Furnishing }) {
  const clothes = ["#1d2b44", "#f4f1ea", "#c4a574", "#2a2c2e", "#6d7a58"];
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotY ?? 0, 0]}>
      <mesh position={[0, 1.05, -0.12]}>
        <boxGeometry args={[2.2, 2.1, 0.08]} />
        <meshStandardMaterial color="#f7f1ea" roughness={0.8} />
      </mesh>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, 1.05, 0.08]}>
          <boxGeometry args={[0.06, 2.1, 0.42]} />
          <meshStandardMaterial color="#e7d3c4" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 1.72, 0.08]}>
        <boxGeometry args={[2.2, 0.06, 0.42]} />
        <meshStandardMaterial color="#e7d3c4" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 0.08]}>
        <boxGeometry args={[2.05, 0.025, 0.025]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.8} roughness={0.3} />
      </mesh>
      {clothes.map((color, index) => (
        <mesh key={color} position={[-0.82 + index * 0.41, 1.15, 0.1]}>
          <boxGeometry args={[0.28, 0.72, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0.08]}>
        <boxGeometry args={[2.05, 0.04, 0.38]} />
        <meshStandardMaterial color="#d9c3b2" roughness={0.6} />
      </mesh>
      {[-0.7, -0.2, 0.35, 0.75].map((x, index) => (
        <mesh key={x} position={[x, 0.28, 0.12]}>
          <boxGeometry args={[0.28, 0.12, 0.14]} />
          <meshStandardMaterial color={index % 2 ? "#2c2420" : "#f3efe8"} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Lamp({ item }: { item: Furnishing }) {
  return (
    <group position={[item.x, 0, item.z]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#2a241e" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 1.36, 8]} />
        <meshStandardMaterial color="#c6a15a" metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.28, 16]} />
        <meshStandardMaterial color="#f6edd8" emissive="#ffd9a0" emissiveIntensity={1.5} roughness={0.6} />
      </mesh>
      <pointLight position={[0, 1.36, 0]} color="#ffcf94" intensity={7} distance={6} decay={2} />
    </group>
  );
}

const NEON_CYAN = new THREE.Color("#7ef6ff").multiplyScalar(2);

// Brighter than white on purpose, so the tubes bloom.
function Neon({ item }: { item: Furnishing }) {
  const color = item.color ?? "#8eb4ff";
  const tube = useMemo(() => new THREE.Color(color).multiplyScalar(2.4), [color]);
  return (
    <group position={[item.x, item.y ?? 2.4, item.z]} rotation={[0, item.rotY ?? 0, 0]}>
      <mesh position={[0, -0.04, 0.004]}>
        <planeGeometry args={[3.8, 1.2]} />
        <Glow map={poolTexture()} color={color} opacity={0.5} />
      </mesh>
      <Text position={[0, 0.03, 0.03]} fontSize={0.27} letterSpacing={0.14} anchorX="center" anchorY="middle">
        {item.text ?? ""}
        <meshBasicMaterial color={tube} toneMapped={false} />
      </Text>
      <mesh position={[0, -0.2, 0.03]}>
        <boxGeometry args={[2.3, 0.022, 0.022]} />
        <meshBasicMaterial color={NEON_CYAN} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Piece({ item }: { item: Furnishing }) {
  switch (item.kind) {
    case "bench":
      return <Bench item={item} />;
    case "plant":
      return <Plant item={item} />;
    case "plinth":
      return <Plinth item={item} />;
    case "stool":
      return <Stool item={item} />;
    case "chair":
      return <Chair item={item} />;
    case "shelf":
      return <Shelf item={item} />;
    case "panel":
      return <Panel item={item} />;
    case "rug":
      return <Rug item={item} />;
    case "tripod":
      return <Tripod item={item} />;
    case "globe":
      return <Globe item={item} />;
    case "neon":
      return <Neon item={item} />;
    case "sofa":
      return <Sofa item={item} />;
    case "table":
      return <CoffeeTable item={item} />;
    case "cars":
      return <CarCollection item={item} />;
    case "bucket":
      return <GamingChair item={item} />;
    case "wardrobe":
      return <Wardrobe item={item} />;
    case "gaming":
      return <GamingDesk item={item} />;
    case "lamp":
      return <Lamp item={item} />;
    default:
      return null;
  }
}

export default function Furnishings() {
  const root = useSolidShadows();
  return (
    <group ref={root}>
      {FURNITURE.map((item, index) => (
        <Piece key={`${item.kind}-${index}`} item={item} />
      ))}
      {CABINETS.map((cabinet) => (
        <ArcadeCabinet key={cabinet.id} cabinet={cabinet} />
      ))}
    </group>
  );
}

