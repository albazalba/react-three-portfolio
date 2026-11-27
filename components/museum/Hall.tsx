"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Glow from "./Glow";
import { ARCHES, COLUMNS, LINTELS, OPEN_ROOMS, ROOMS, WALLS, type RoomId } from "./layout";
import { poolTexture, seeded, skylineTexture, washTexture } from "./textures";

const BRASS = "#56dcff";
const INK = "#f4efe6";
const LED = "#7ef6ff";
const GOLD = "#e1b74f";
const COOL = "#bfe0ff";

// Stand-in for bounced light: walls and ceilings glow faintly in their own colour.
const BOUNCE = 0.25;

const SHELL_ROOMS = OPEN_ROOMS.filter((id) => id !== "contact");

const CARPETED: RoomId[] = [];

const CONFETTI = ["#ff5fd2", "#7ef6ff", "#ffd84a", "#9d7bff", "#7dff8a"];

function useFloorTexture(base: string, kind: "wood" | "carpet" | "gloss") {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = base;
    context.fillRect(0, 0, 512, 512);
    if (kind === "wood") {
      const lengths = [192, 128, 192];
      for (let y = 0; y < 512; y += 64) {
        const row = y / 64;
        let x = (row * 173) % 512;
        lengths.forEach((length, plank) => {
          const tone = ((row * 7 + plank * 13) % 5) - 2;
          for (const start of [x, x - 512]) {
            context.fillStyle =
              tone >= 0 ? `rgba(255,226,190,${tone * 0.03})` : `rgba(20,8,2,${-tone * 0.05})`;
            context.fillRect(start, y, length, 64);
            context.fillStyle = "rgba(20,10,4,0.4)";
            context.fillRect(start, y, 2, 64);
          }
          x = (x + length) % 512;
        });
        context.fillStyle = "rgba(255,236,210,0.06)";
        context.fillRect(0, y + 4, 512, 26);
        context.fillStyle = "rgba(30,16,8,0.34)";
        context.fillRect(0, y + 62, 512, 2);
        context.strokeStyle = "rgba(40,18,8,0.16)";
        context.beginPath();
        for (let x = 0; x <= 512; x += 6) {
          const gy = y + 28 + Math.sin(x * 0.04 + y * 0.2) * 5;
          if (x === 0) context.moveTo(x, gy);
          else context.lineTo(x, gy);
        }
        context.stroke();
      }
    } else if (kind === "carpet") {
      // Arcade carpet: short pile, scattered with small bright shapes that tile across the seam.
      const random = seeded(23);
      for (let i = 0; i < 7000; i += 1) {
        context.fillStyle = random() > 0.5 ? "rgba(190,170,255,0.05)" : "rgba(0,0,0,0.12)";
        context.fillRect(random() * 512, random() * 512, 2, 2);
      }
      context.lineWidth = 3;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalAlpha = 0.5;
      for (let i = 0; i < 44; i += 1) {
        const x = random() * 512;
        const y = random() * 512;
        const turn = random() * Math.PI;
        const shape = Math.floor(random() * 4);
        context.strokeStyle = CONFETTI[i % CONFETTI.length];
        context.fillStyle = CONFETTI[i % CONFETTI.length];
        for (const ox of [-512, 0, 512]) {
          for (const oy of [-512, 0, 512]) {
            context.save();
            context.translate(x + ox, y + oy);
            context.rotate(turn);
            context.beginPath();
            if (shape === 0) {
              context.moveTo(0, -11);
              context.lineTo(10, 8);
              context.lineTo(-10, 8);
              context.closePath();
              context.stroke();
            } else if (shape === 1) {
              context.moveTo(-14, 0);
              context.quadraticCurveTo(-7, -11, 0, 0);
              context.quadraticCurveTo(7, 11, 14, 0);
              context.stroke();
            } else if (shape === 2) {
              context.arc(0, 0, 5, 0, Math.PI * 2);
              context.fill();
            } else {
              context.moveTo(-9, 0);
              context.lineTo(9, 0);
              context.moveTo(0, -9);
              context.lineTo(0, 9);
              context.stroke();
            }
            context.restore();
          }
        }
      }
      context.globalAlpha = 1;
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [base, kind]);
}

function Floor({ room }: { room: RoomId }) {
  const data = ROOMS[room];
  // Every floor is one dark polished sheet now, and the base colour is all that needs. Name a
  // room here to give it back the arcade carpet; "wood" is still drawn for any room that is neither.
  const carpet = CARPETED.includes(room);
  const gloss = !carpet;
  const texture = useFloorTexture(data.floor, carpet ? "carpet" : gloss ? "gloss" : "wood");
  const width = data.bounds.maxX - data.bounds.minX;
  const depth = data.bounds.maxZ - data.bounds.minZ;
  const repeatX = Math.max(1, width / 2.4);
  const repeatZ = Math.max(1, depth / 2.4);

  const map = useMemo(() => {
    if (!texture) return null;
    const clone = texture.clone();
    clone.repeat.set(repeatX, repeatZ);
    clone.needsUpdate = true;
    return clone;
  }, [texture, repeatX, repeatZ]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[
        (data.bounds.minX + data.bounds.maxX) / 2,
        0.02,
        (data.bounds.minZ + data.bounds.maxZ) / 2,
      ]}
      receiveShadow
    >
      <planeGeometry args={[width, depth]} />
      <meshPhysicalMaterial
        map={map ?? undefined}
        color={map ? "#ffffff" : data.floor}
        roughness={carpet ? 0.96 : gloss ? 0.34 : 0.4}
        metalness={carpet ? 0 : gloss ? 0.12 : 0.06}
        clearcoat={carpet ? 0 : gloss ? 0.55 : 0.4}
        clearcoatRoughness={gloss ? 0.3 : 0.28}
      />
    </mesh>
  );
}

type Face = { room: RoomId; x: number; z: number; rotY: number; length: number };

function roomAt(x: number, z: number): RoomId | null {
  for (const id of SHELL_ROOMS) {
    const bounds = ROOMS[id].bounds;
    if (x > bounds.minX && x < bounds.maxX && z > bounds.minZ && z < bounds.maxZ) return id;
  }
  return null;
}

// Each side of a wall, cut into the stretches that actually face a room.
const FACES: Face[] = WALLS.flatMap((wall) => {
  const alongX = wall.maxX - wall.minX > wall.maxZ - wall.minZ;
  const start = alongX ? wall.minX : wall.minZ;
  const end = alongX ? wall.maxX : wall.maxZ;
  const steps = Math.ceil((end - start) / 0.2);
  const cell = (end - start) / steps;
  const faces: Face[] = [];
  for (const side of [-1, 1]) {
    const edge = alongX
      ? side < 0 ? wall.minZ : wall.maxZ
      : side < 0 ? wall.minX : wall.maxX;
    const sample = (at: number) =>
      alongX ? roomAt(at, edge + side * 0.3) : roomAt(edge + side * 0.3, at);
    let from = start;
    let current = sample(start + cell / 2);
    for (let i = 1; i <= steps; i += 1) {
      const next = i < steps ? sample(start + cell * (i + 0.5)) : undefined;
      if (next === current) continue;
      const to = start + cell * i;
      if (current) {
        const mid = (from + to) / 2;
        const out = edge + side * 0.004;
        faces.push({
          room: current,
          x: alongX ? mid : out,
          z: alongX ? out : mid,
          rotY: alongX ? (side > 0 ? 0 : Math.PI) : (side * Math.PI) / 2,
          length: to - from,
        });
      }
      from = to;
      current = next ?? null;
    }
  }
  return faces;
});

function WallFace({ face, wash }: { face: Face; wash: THREE.Texture }) {
  const room = ROOMS[face.room];
  const led = room.led ?? LED;
  const trim = room.trim ?? GOLD;
  return (
    <group position={[face.x, 0, face.z]} rotation={[0, face.rotY, 0]}>
      <mesh position={[0, room.height / 2, 0]} receiveShadow>
        <planeGeometry args={[face.length, room.height]} />
        <meshStandardMaterial
          color={room.wall}
          emissive={room.wall}
          emissiveIntensity={BOUNCE}
          roughness={0.86}
        />
      </mesh>
      <mesh position={[0, 0.56, 0.004]}>
        <planeGeometry args={[face.length, 0.7]} />
        <Glow map={wash} color={led} opacity={room.led ? 0.3 : 0.2} />
      </mesh>
      <mesh position={[0, 0.026, 0.4]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <planeGeometry args={[face.length, 0.7]} />
        <Glow map={wash} color={led} opacity={room.led ? 0.16 : 0.1} />
      </mesh>
      {room.led ? (
        // A wall is built by one room and seen from two, so this side's strip covers the shared one.
        <mesh position={[0, 0.2, 0.052]}>
          <boxGeometry args={[face.length, 0.018, 0.016]} />
          <meshStandardMaterial color={led} emissive={led} emissiveIntensity={1.7} />
        </mesh>
      ) : null}
      <mesh position={[0, room.height - 0.19, 0.01]}>
        <boxGeometry args={[face.length, 0.016, 0.02]} />
        <meshStandardMaterial color={trim} emissive={trim} emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0, room.height - 0.5, 0.004]} rotation={[0, 0, Math.PI]}>
        <planeGeometry args={[face.length, 0.6]} />
        <Glow map={wash} color={trim} opacity={room.led ? 0.2 : 0.12} />
      </mesh>
      <mesh position={[0, room.height - 0.146, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[face.length, 1.2]} />
        <Glow map={wash} color={trim} opacity={room.led ? 0.16 : 0.1} />
      </mesh>
    </group>
  );
}

function Walls() {
  const wash = washTexture();
  return (
    <group>
      {WALLS.map((wall, index) => {
        const width = wall.maxX - wall.minX;
        const depth = wall.maxZ - wall.minZ;
        const height = ROOMS[wall.room].height;
        const thin = Math.min(width, depth) < 0.7;
        if (!thin) return null;
        const alongX = depth < width;
        const trimW = alongX ? width : width + 0.1;
        const trimD = alongX ? depth + 0.1 : depth;
        const cx = (wall.minX + wall.maxX) / 2;
        const cz = (wall.minZ + wall.maxZ) / 2;
        return (
          <group key={`${wall.room}-${index}`}>
            <mesh position={[cx, height / 2, cz]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={ROOMS[wall.room].wall} roughness={0.86} />
            </mesh>
            <mesh position={[cx, 0.08, cz]} receiveShadow>
              <boxGeometry args={[trimW, 0.16, trimD]} />
              <meshStandardMaterial color="#0c0a0e" roughness={0.7} />
            </mesh>
            <mesh position={[cx, 0.2, cz]}>
              <boxGeometry args={[trimW, 0.014, trimD]} />
              <meshStandardMaterial color={LED} emissive={LED} emissiveIntensity={1.7} />
            </mesh>
          </group>
        );
      })}
      {FACES.map((face) => (
        <WallFace key={`${face.x}-${face.z}-${face.rotY}`} face={face} wash={wash} />
      ))}
    </group>
  );
}

function Columns() {
  return (
    <group>
      {COLUMNS.map((column) => (
        <group key={`${column.x}-${column.z}`} position={[column.x, 0, column.z]}>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.78, 0.16, 0.78]} />
            <meshStandardMaterial color="#3a3126" roughness={0.6} metalness={0.2} />
          </mesh>
          <mesh position={[0, 3.55, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.3, 6.7, 32]} />
            <meshStandardMaterial color="#7a6e60" roughness={0.55} metalness={0.08} />
          </mesh>
          <mesh position={[0, 6.95, 0]}>
            <boxGeometry args={[0.7, 0.18, 0.7]} />
            <meshPhysicalMaterial color={BRASS} metalness={0.92} roughness={0.24} clearcoat={0.45} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Arches() {
  return (
    <group>
      {ARCHES.map((arch) => (
        <group key={arch.id} position={[arch.x, 0, arch.z]} rotation={[0, arch.rotY, 0]}>
          <mesh position={[-(arch.width / 2), arch.y / 2, 0]}>
            <boxGeometry args={[0.12, arch.y, 0.12]} />
            <meshPhysicalMaterial color={BRASS} metalness={0.92} roughness={0.24} clearcoat={0.45} />
          </mesh>
          <mesh position={[arch.width / 2, arch.y / 2, 0]}>
            <boxGeometry args={[0.12, arch.y, 0.12]} />
            <meshPhysicalMaterial color={BRASS} metalness={0.92} roughness={0.24} clearcoat={0.45} />
          </mesh>
          <mesh position={[0, arch.y, 0]}>
            <boxGeometry args={[arch.width + 0.12, 0.1, 0.12]} />
            <meshPhysicalMaterial color={BRASS} metalness={0.92} roughness={0.24} clearcoat={0.45} />
          </mesh>
          <Text
            position={[0, arch.y + 0.28, 0]}
            fontSize={0.16}
            color={BRASS}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.28}
          >
            {arch.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

function Lintel({
  minX,
  maxX,
  minZ,
  maxZ,
  y0,
  y1,
  color,
}: (typeof LINTELS)[number]) {
  return (
    <mesh position={[(minX + maxX) / 2, (y0 + y1) / 2, (minZ + maxZ) / 2]}>
      <boxGeometry args={[maxX - minX, y1 - y0, maxZ - minZ]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

function Inlay() {
  return null;
}

type DownlightSpec = {
  room: RoomId;
  x: number;
  z: number;
  aim?: [number, number, number];
  color: string;
  intensity: number;
  shadow?: boolean;
};

const ALL_DOWNLIGHTS: DownlightSpec[] = [
  { room: "foyer", x: 0, z: 10.7, color: COOL, intensity: 26 },
  { room: "atrium", x: -2.4, z: 5.7, color: COOL, intensity: 70, shadow: true },
  { room: "atrium", x: 2.6, z: 4.9, color: COOL, intensity: 46 },
  { room: "experience", x: 0, z: -2.6, color: COOL, intensity: 66, shadow: true },
  { room: "experience", x: -3.4, z: -2.5, aim: [-5.5, 1.5, -2.6], color: COOL, intensity: 30 },
  { room: "projects", x: -8.6, z: 5.6, color: "#bfd4ff", intensity: 44, shadow: true },
  { room: "projects", x: -8.6, z: 7.2, aim: [-8.6, 0.9, 8.7], color: "#9ad8ff", intensity: 30 },
  { room: "projects", x: -8.2, z: 4.3, aim: [-8.4, 0.6, 3.1], color: "#cfc4ff", intensity: 26 },
  // Plain white on the miniature cars, so their paint shows true.
  { room: "projects", x: -9.9, z: 5.7, aim: [-11.45, 1.5, 5.7], color: "#f4f8ff", intensity: 30 },
  { room: "hobbies", x: 8.5, z: 0.6, color: "#ffe2d0", intensity: 60, shadow: true },
  { room: "play", x: 8.5, z: 6.6, color: "#d6ebff", intensity: 48 },
  { room: "play", x: 8.7, z: 3.6, color: COOL, intensity: 34 },
];

const DOWNLIGHTS = ALL_DOWNLIGHTS.filter((light) => OPEN_ROOMS.includes(light.room));

function Downlight({ light, halo }: { light: DownlightSpec; halo: THREE.Texture }) {
  const target = useMemo(() => new THREE.Object3D(), []);
  const y = ROOMS[light.room].height - 0.15;
  return (
    <group>
      <primitive object={target} position={light.aim ?? [light.x, 0, light.z]} />
      <spotLight
        position={[light.x, y, light.z]}
        target={target}
        color={light.color}
        intensity={light.intensity}
        angle={1.05}
        penumbra={0.9}
        distance={11}
        decay={2}
        castShadow={light.shadow}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-near={0.3}
        shadow-camera-far={11}
      />
      <group position={[light.x, y, light.z]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.07, 0.11, 24]} />
          <meshStandardMaterial color="#0c0a0e" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.07, 24]} />
          <meshStandardMaterial color={light.color} emissive={light.color} emissiveIntensity={2.4} />
        </mesh>
        <mesh position={[0, 0, -0.004]}>
          <planeGeometry args={[1.8, 1.8]} />
          <Glow map={halo} color={light.color} opacity={0.16} />
        </mesh>
      </group>
    </group>
  );
}

function Lights() {
  const halo = poolTexture();
  return (
    <group>
      <hemisphereLight args={["#8fa0d0", "#3a4a66", 2.4]} />
      {DOWNLIGHTS.map((light) => (
        <Downlight key={`${light.x},${light.z}`} light={light} halo={halo} />
      ))}
    </group>
  );
}

function Ceilings() {
  return (
    <group>
      {SHELL_ROOMS.map((id) => {
        const room = ROOMS[id];
        const width = room.bounds.maxX - room.bounds.minX;
        const depth = room.bounds.maxZ - room.bounds.minZ;
        return (
          <mesh
            key={id}
            position={[
              (room.bounds.minX + room.bounds.maxX) / 2,
              room.height - 0.08,
              (room.bounds.minZ + room.bounds.maxZ) / 2,
            ]}
          >
            <boxGeometry args={[width, 0.12, depth]} />
            <meshStandardMaterial
              color={room.ceiling}
              emissive={room.ceiling}
              emissiveIntensity={BOUNCE * 3.6}
              roughness={0.94}
            />
          </mesh>
        );
      })}
    </group>
  );
}

const WINDOW = { x: 11.31, y: 1.5, z: 6.3, width: 4.4, height: 1.75 };

// The east wall of the billiards room looks out over the city.
function Window() {
  const skyline = skylineTexture();
  const target = useMemo(() => new THREE.Object3D(), []);
  const { width, height } = WINDOW;
  const bars: Array<[number, number, number, number]> = [
    [0, height / 2, width + 0.1, 0.07],
    [0, -height / 2, width + 0.1, 0.07],
    [-width / 2, 0, 0.07, height],
    [width / 2, 0, 0.07, height],
    [-width / 6, 0, 0.04, height],
    [width / 6, 0, 0.04, height],
  ];
  return (
    <group>
      <group position={[WINDOW.x, WINDOW.y, WINDOW.z]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={skyline} fog={false} />
        </mesh>
        {bars.map(([x, y, w, h]) => (
          <mesh key={`${x},${y}`} position={[x, y, 0.03]}>
            <boxGeometry args={[w, h, 0.06]} />
            <meshStandardMaterial color="#17141c" roughness={0.45} metalness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, -height / 2 - 0.05, 0.08]}>
          <boxGeometry args={[width + 0.2, 0.04, 0.18]} />
          <meshStandardMaterial color="#17141c" roughness={0.45} metalness={0.5} />
        </mesh>
      </group>
      <primitive object={target} position={[6.4, 0, 6]} />
      <spotLight
        position={[WINDOW.x - 0.3, 1.9, WINDOW.z]}
        target={target}
        color="#8f8cff"
        intensity={14}
        angle={1.1}
        penumbra={1}
        distance={9}
        decay={2}
      />
    </group>
  );
}

function frontOnly(mesh: THREE.Object3D) {
  const material = (mesh as THREE.Mesh).material as THREE.Material | undefined;
  if (material) material.side = THREE.FrontSide;
}

function Title() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y = 2.42 + Math.sin(clock.elapsedTime * 0.45) * 0.015;
  });

  return (
    <group ref={group} position={[0, 2.42, 8.55]}>
      <Text
        fontSize={0.22}
        color={BRASS}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
        onSync={frontOnly}
      >
        ALBAZ AQTHER
      </Text>
      <Text
        position={[0, -0.38, 0]}
        fontSize={0.1}
        color={INK}
        anchorX="center"
        letterSpacing={0.42}
        fillOpacity={0.8}
        onSync={frontOnly}
      >
        SOFTWARE ENGINEER
      </Text>
    </group>
  );
}

export default function Hall() {
  return (
    <group>
      <color attach="background" args={["#07060c"]} />
      <fogExp2 attach="fog" args={["#07060c", 0.014]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 2]}>
        <circleGeometry args={[40, 32]} />
        <meshBasicMaterial color="#07060c" />
      </mesh>
      {SHELL_ROOMS.map((id) => (
        <Floor key={id} room={id} />
      ))}
      <Walls />
      <Columns />
      <Arches />
      {LINTELS.map((lintel, index) => (
        <Lintel key={index} {...lintel} />
      ))}
      <Inlay />
      <Ceilings />
      <Lights />
      <Window />
      <Title />
    </group>
  );
}
