"use client";

import { CeilingBar, Circuit, Light, White } from "./decor";
import Glow from "./Glow";
import { ROOMS } from "./layout";
import Model from "./models";
import { useSolidShadows } from "./shadows";
import { nebulaArt, poolTexture, washTexture } from "./textures";

const CYAN = "#7ef6ff";
const PINK = "#7d8cff";
const ICE = "#56dcff";
const VIOLET = "#56dcff";
const SLAT = "#27344e";
const LIVING = ROOMS.atrium.bounds;
const GAME = ROOMS.projects.bounds;
// How far wall dressing stands off a wall's centre line.
const PROUD = 0.09;

const BOOKS = ["#2f6fe0", "#e1b74f", "#2a2a32", "#a8323c", "#3fbf5f", "#f2ede4"];

function Books({ x, y, count = 5 }: { x: number; y: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => {
        const tall = 0.2 - ((index * 7) % 4) * 0.014;
        return (
          <mesh key={index} position={[x + index * 0.052, y + tall / 2, 0.11]}>
            <boxGeometry args={[0.044, tall, 0.15]} />
            <meshStandardMaterial color={BOOKS[(index * 5 + count) % BOOKS.length]} roughness={0.6} />
          </mesh>
        );
      })}
    </>
  );
}

/** A floating white shelf with a strip of light under it washing down the wall. */
function Shelf({ x, y, width, color }: { x: number; y: number; width: number; color: string }) {
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[width, 0.035, 0.22]} />
        <White />
      </mesh>
      <mesh position={[0, -0.024, 0.02]}>
        <boxGeometry args={[width - 0.08, 0.012, 0.016]} />
        <Light color={color} />
      </mesh>
      <mesh position={[0, -0.24, 0.006]} rotation={[0, 0, Math.PI]}>
        <planeGeometry args={[width - 0.08, 0.44]} />
        <Glow map={washTexture()} color={color} opacity={0.16} />
      </mesh>
    </group>
  );
}

/** A honeycomb of light panels. Cells are [column, row] on a hex grid. */
function Honeycomb({
  x,
  y,
  cells,
  colors,
}: {
  x: number;
  y: number;
  cells: Array<[number, number]>;
  colors: string[];
}) {
  const size = 0.17;
  return (
    <group position={[x, y, 0.012]}>
      <mesh position={[0.3, 0, -0.004]}>
        <planeGeometry args={[2.2, 1.6]} />
        <Glow map={poolTexture()} color={colors[0]} opacity={0.28} />
      </mesh>
      {cells.map(([column, row], index) => (
        <mesh
          key={`${column}-${row}`}
          position={[column * size * 1.56, (row + (column % 2 ? 0.5 : 0)) * size * 1.8, 0]}
          rotation={[0, 0, Math.PI / 6]}
        >
          <circleGeometry args={[size, 6]} />
          <Light color={colors[index % colors.length]} gain={index % 3 === 0 ? 1.5 : 1} />
        </mesh>
      ))}
    </group>
  );
}

/** Vertical timber slats with light between them, and a ring lamp hung on the front. */
function SlatPanel({ x, width, color }: { x: number; width: number; color: string }) {
  const count = Math.floor(width / 0.13);
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.5, 0.01]}>
        <boxGeometry args={[width + 0.1, 2.0, 0.02]} />
        <meshStandardMaterial color="#17131a" roughness={0.8} />
      </mesh>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={index} position={[(index - (count - 1) / 2) * 0.13, 1.5, 0.045]}>
          <boxGeometry args={[0.07, 1.96, 0.05]} />
          <meshStandardMaterial color={SLAT} roughness={0.55} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 + 0.03), 1.5, 0.03]}>
          <boxGeometry args={[0.014, 1.96, 0.014]} />
          <Light color={color} />
        </mesh>
      ))}
      <mesh position={[0, 1.6, 0.085]}>
        <torusGeometry args={[0.42, 0.016, 10, 56]} />
        <Light color="#e6f7ff" gain={1.7} />
      </mesh>
      <mesh position={[0, 1.6, 0.075]}>
        <planeGeometry args={[2.2, 2.2]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.3} />
      </mesh>
    </group>
  );
}

/** Behind the sofa: a lit niche with chamfered corners, a screen in it and a ledge along its foot. */
function NicheWall() {
  const art = nebulaArt();
  return (
    <group position={[-3.2, 0, LIVING.maxZ - PROUD]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 1.78, 0.006]}>
        <planeGeometry args={[4.4, 2.4]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.3} />
      </mesh>
      <mesh position={[0, 1.76, 0.008]}>
        <boxGeometry args={[2.96, 1.46, 0.012]} />
        <meshStandardMaterial color="#42557c" emissive="#42557c" emissiveIntensity={0.35} roughness={0.6} />
      </mesh>
      <Circuit
        color={ICE}
        path={[
          [-1.5, 1.03],
          [-1.5, 2.22],
          [-1.22, 2.5],
          [1.22, 2.5],
          [1.5, 2.22],
          [1.5, 1.03],
        ]}
      />
      <mesh position={[-0.2, 1.82, 0.035]}>
        <boxGeometry args={[1.56, 0.9, 0.05]} />
        <meshStandardMaterial color="#06070c" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-0.2, 1.82, 0.062]}>
        <planeGeometry args={[1.5, 0.84]} />
        <meshStandardMaterial map={art} emissiveMap={art} emissive="#ffffff" emissiveIntensity={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.03, 0.11]}>
        <boxGeometry args={[3.04, 0.04, 0.22]} />
        <meshStandardMaterial color="#c9d6e8" roughness={0.35} />
      </mesh>
      <Books x={0.72} y={1.05} count={4} />
      <Model name="vase" position={[-1.25, 1.05, 0.11]} scale={0.6} />
      <Model name="succulent" position={[1.25, 1.05, 0.11]} scale={0.85} />
    </group>
  );
}

/** Upright lines of light on both sides of each doorway. */
function DoorLights() {
  const jambs: Array<[number, number]> = [
    [-1.57, LIVING.minZ + PROUD],
    [1.57, LIVING.minZ + PROUD],
    [-1.87, LIVING.maxZ - PROUD],
    [1.87, LIVING.maxZ - PROUD],
    [LIVING.minX + PROUD, 3.93],
    [LIVING.minX + PROUD, 6.67],
    // The same doorways from the career gallery, the entry and the game room.
    [-1.57, LIVING.minZ - PROUD],
    [1.57, LIVING.minZ - PROUD],
    [-1.87, LIVING.maxZ + PROUD],
    [1.87, LIVING.maxZ + PROUD],
    [LIVING.minX - PROUD, 3.93],
    [LIVING.minX - PROUD, 6.67],
  ];
  return (
    <>
      {jambs.map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 1.42, z]}>
          <boxGeometry args={[0.024, 2.36, 0.024]} />
          <Light color={ICE} />
        </mesh>
      ))}
    </>
  );
}

/** Where the toolkit stand was: three stepped shelves under a gold neon line. */
function ShelfWall() {
  return (
    <group position={[3.7, 0, LIVING.maxZ - PROUD]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 2.3, 0.006]}>
        <planeGeometry args={[3.4, 1.2]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.2} />
      </mesh>
      <Circuit
        color={ICE}
        path={[
          [-1.7, 2.6],
          [-0.8, 2.6],
          [-0.55, 2.35],
          [0.7, 2.35],
          [0.95, 2.6],
          [1.7, 2.6],
        ]}
      />
      <Shelf x={-0.75} y={1.95} width={1.5} color={CYAN} />
      <Shelf x={0.35} y={1.5} width={1.5} color={CYAN} />
      <Shelf x={-0.6} y={1.05} width={1.5} color={CYAN} />
      <Books x={-1.3} y={1.97} count={5} />
      <Model name="vase" position={[-0.35, 1.97, 0.11]} scale={0.5} />
      <Model name="succulent" position={[0.0, 1.52, 0.11]} scale={0.85} />
      <Model name="vase" position={[-0.3, 1.07, 0.11]} scale={0.6} turn={1} />
      <Books x={0.45} y={1.52} count={6} />
      <Books x={-1.15} y={1.07} count={4} />
    </group>
  );
}

/** The wall facing the sofa, right of the gallery door: a slat panel over a console. The television is on the left. */
function SlatWall() {
  const face = LIVING.minZ + PROUD;
  return (
    <>
      <group position={[3.55, 0, face]}>
        <SlatPanel x={0} width={2.6} color={CYAN} />
        <mesh position={[0, 0.34, 0.22]}>
          <boxGeometry args={[2.8, 0.36, 0.44]} />
          <White />
        </mesh>
        {[-0.92, 0, 0.92].map((x) => (
          <mesh key={x} position={[x, 0.34, 0.442]}>
            <boxGeometry args={[0.86, 0.26, 0.004]} />
            <meshStandardMaterial color="#e4e1db" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.15, 0.22]}>
          <boxGeometry args={[2.7, 0.015, 0.36]} />
          <Light color={CYAN} />
        </mesh>
        <mesh position={[0, 0.034, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 1.5]} />
          <Glow map={poolTexture()} color={CYAN} opacity={0.4} />
        </mesh>
        <Books x={-1.1} y={0.52} count={5} />
        <Model name="boombox" position={[0.8, 0.52, 0.22]} turn={-0.15} scale={0.8} />
      </group>
    </>
  );
}

/** The game room's west wall: neon above and below the car collection. */
function GameWall() {
  return (
    <group position={[GAME.minX + PROUD, 0, 5.7]} rotation={[0, Math.PI / 2, 0]}>
      <Circuit
        color={VIOLET}
        path={[
          [-3.1, 2.3],
          [-1.4, 2.3],
          [-1.15, 2.55],
          [1.15, 2.55],
          [1.4, 2.3],
          [3.1, 2.3],
        ]}
      />
      <Circuit
        color={PINK}
        path={[
          [-3.1, 1.0],
          [-2.2, 1.0],
          [-1.95, 0.75],
          [-1.6, 0.75],
        ]}
      />
      <Circuit
        color={PINK}
        path={[
          [3.1, 1.0],
          [2.2, 1.0],
          [1.95, 0.75],
          [1.6, 0.75],
        ]}
      />
      <Honeycomb
        x={1.75}
        y={1.75}
        colors={[PINK, VIOLET, "#fff4e6"]}
        cells={[
          [0, 0],
          [1, 0],
          [1, -1],
          [2, 0],
          [3, -1],
        ]}
      />
    </group>
  );
}

/** Wall dressing and ceiling coves for every room except the billiards room, which has its own. */
export default function LoftDecor() {
  const root = useSolidShadows();
  return (
    <group ref={root}>
      <NicheWall />
      <DoorLights />
      <CeilingBar room="atrium" x={0} z={3.6} length={6.4} />
      <CeilingBar room="atrium" x={0} z={5.4} length={4.6} />
      <ShelfWall />
      <SlatWall />
      <GameWall />
      <CeilingBar room="foyer" x={-0.6} z={10.8} length={2.2} turned />
      <CeilingBar room="foyer" x={0.6} z={10.8} length={2.2} turned />
      <CeilingBar room="experience" x={0} z={-1.2} length={6.4} />
      <CeilingBar room="experience" x={0} z={-3.9} length={4.6} />
      <CeilingBar room="projects" x={-8.6} z={4.6} length={3.6} />
      <CeilingBar room="projects" x={-8.6} z={6.8} length={3.6} />
    </group>
  );
}
