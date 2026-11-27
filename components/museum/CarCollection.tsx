"use client";

import { Text, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { Light } from "./decor";
import Glow from "./Glow";
import type { Furnishing } from "./layout";
import { poolTexture, washTexture } from "./textures";

// Downloaded models, credited in public/museum/models/SOURCES.md.
const CONCEPT_URL = "/museum/models/concept_car.glb";
const TOY_URL = "/museum/models/toy_car.glb";

const ICE = "#56dcff";
// Every miniature is scaled to the same length, about 1:13, big enough to read from across the room.
const LENGTH = 0.33;
const WIDTH = 2.9;
const DEPTH = 0.3;
const ROWS = [0.7, 1.04, 1.38, 1.72, 2.06];
const TOP = 2.4;
const FLOOR = ROWS[0];
const SLOTS = [-1.2, -0.72, -0.24, 0.24, 0.72, 1.2];

// The concept car's main paint, in shelf order. The toy car keeps its flames and comes in five body colours.
const CONCEPT_PAINTS = [
  "#b3001b", "#0b47c9", "#f2b000", "#eeeee8",
  "#25282e", "#c0c4c8", "#1f6b3a", "#ff6a00",
  "#5a1f8c", "#7fb4d6", "#8a0f23", "#0e0f12",
  "#d9c9a3", "#0d2b5c", "#e83e8c", "#9aa0a6",
  "#4a5a3a", "#00a3a3", "#c8a24a", "#ffffff",
];
const TOY_BODIES: Array<string | null> = [null, "#a3121c", "#11408f", "#151515", "#e8dcc2"];
// Where in each row of six the two toy cars stand.
const TOY_SLOTS = [1, 4];

type Miniature = { x: number; y: number; turn: number; paint: string | null };

const CONCEPTS: Miniature[] = [];
const TOYS: Miniature[] = [];
ROWS.forEach((y, row) => {
  SLOTS.forEach((x, slot) => {
    // Each half of a shelf angles in toward the middle.
    const turn = (x < 0 ? 0.6 : -0.6) + (row % 2 ? 0.25 : 0);
    if (TOY_SLOTS.includes(slot)) {
      TOYS.push({ x, y, turn, paint: TOY_BODIES[(row * 2 + TOY_SLOTS.indexOf(slot)) % TOY_BODIES.length] });
    } else {
      CONCEPTS.push({ x, y, turn, paint: CONCEPT_PAINTS[CONCEPTS.length % CONCEPT_PAINTS.length] });
    }
  });
});

type Part = { geometry: THREE.BufferGeometry; material: THREE.Material; matrix: THREE.Matrix4; paint: boolean };

/**
 * Dark tinted glass in place of refracting glass, which would cost a second render of the room.
 * Clear glass let the pale backboard through and the cabins read as white.
 */
function plainGlass(material: THREE.MeshPhysicalMaterial) {
  const glass = material.clone();
  glass.transmission = 0;
  glass.transparent = true;
  glass.color.set("#10141c");
  glass.opacity = 0.82;
  glass.roughness = 0.05;
  glass.metalness = 0.2;
  return glass;
}

/** The toy car's colour map with its green body repainted, keeping the shading, flames and number. */
function repaint(material: THREE.MeshStandardMaterial, color: string) {
  const own = material.clone();
  own.envMapIntensity = 2;
  const source = material.map;
  const image = source?.image as (CanvasImageSource & { width: number; height: number }) | undefined;
  if (!source || !image) return own;
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) return own;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  const target = new THREE.Color(color);
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    if (green < red + 40 || green < blue + 30) continue;
    const shade = Math.min(1.4, green / 122);
    data[index] = Math.min(255, target.r * 255 * shade);
    data[index + 1] = Math.min(255, target.g * 255 * shade);
    data[index + 2] = Math.min(255, target.b * 255 * shade);
  }
  context.putImageData(pixels, 0, 0);
  const map = source.clone();
  map.image = canvas;
  map.needsUpdate = true;
  own.map = map;
  return own;
}

/**
 * The parts of a car model, shrunk to a miniature standing on y = 0. The toy car's fabric cushion is left out.
 * `paint` marks the part that takes each car's colour.
 */
function useParts(url: string) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const meshes: THREE.Mesh[] = [];
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh && (mesh.material as THREE.Material).name !== "Fabric") meshes.push(mesh);
    });
    const box = new THREE.Box3();
    for (const mesh of meshes) box.expandByObject(mesh, true);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const scale = LENGTH / Math.max(size.x, size.z);
    const normal = new THREE.Matrix4()
      .makeTranslation(-centre.x * scale, -box.min.y * scale, -centre.z * scale)
      .multiply(new THREE.Matrix4().makeScale(scale, scale, scale));

    const swapped = new Map<THREE.Material, THREE.Material>();
    return meshes.map((mesh): Part => {
      const material = mesh.material as THREE.MeshPhysicalMaterial;
      let own = swapped.get(material);
      if (!own) {
        if (material.transmission > 0) {
          own = plainGlass(material);
        } else if (material.name.startsWith("Paint 1")) {
          // White, so each copy's instance colour is the colour it shows.
          const coat = material.clone();
          coat.color.set("#ffffff");
          // The cabinet is dim, so the paint leans on the room's reflections to read as glossy.
          coat.envMapIntensity = 2.4;
          own = coat;
        } else {
          own = material;
        }
        swapped.set(material, own);
      }
      return {
        geometry: mesh.geometry,
        material: own,
        matrix: normal.clone().multiply(mesh.matrixWorld),
        paint: material.name.startsWith("Paint 1") || material.name === "ToyCar",
      };
    });
  }, [scene]);
}

/** One draw call for a part of every car in `cars`, each copy tinted by `colors` when given. */
function instanced(part: Part, cars: Miniature[], colors?: Array<string | null>) {
  const mesh = new THREE.InstancedMesh(part.geometry, part.material, cars.length);
  const place = new THREE.Matrix4();
  const turn = new THREE.Matrix4();
  cars.forEach((car, index) => {
    place.makeTranslation(car.x, car.y + 0.012, DEPTH / 2).multiply(turn.makeRotationY(car.turn)).multiply(part.matrix);
    mesh.setMatrixAt(index, place);
    const color = colors?.[index];
    if (color) mesh.setColorAt(index, new THREE.Color(color));
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.computeBoundingSphere();
  return mesh;
}

function Batches({ meshes }: { meshes: THREE.InstancedMesh[] }) {
  return (
    <>
      {meshes.map((mesh) => (
        <primitive key={mesh.uuid} object={mesh} />
      ))}
    </>
  );
}

function Concepts() {
  const parts = useParts(CONCEPT_URL);
  const meshes = useMemo(
    () => parts.map((part) => instanced(part, CONCEPTS, part.paint ? CONCEPTS.map((car) => car.paint) : undefined)),
    [parts],
  );
  return <Batches meshes={meshes} />;
}

/** The toy cars, one batch per body colour. */
function Toys() {
  const parts = useParts(TOY_URL);
  const meshes = useMemo(
    () =>
      TOY_BODIES.flatMap((body) => {
        const cars = TOYS.filter((car) => car.paint === body);
        if (!cars.length) return [];
        return parts.map((part) =>
          instanced(
            part.paint && body ? { ...part, material: repaint(part.material as THREE.MeshStandardMaterial, body) } : part,
            cars,
          ),
        );
      }),
    [parts],
  );
  return <Batches meshes={meshes} />;
}

/** Clear acrylic plinths, one under every car. */
function Plinths() {
  const mesh = useMemo(() => {
    const plinths = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.38, 0.012, 0.2),
      new THREE.MeshPhysicalMaterial({ color: "#cfe9ff", roughness: 0.1, transparent: true, opacity: 0.18 }),
      ROWS.length * SLOTS.length,
    );
    const place = new THREE.Matrix4();
    ROWS.forEach((y, row) =>
      SLOTS.forEach((x, slot) => plinths.setMatrixAt(row * SLOTS.length + slot, place.makeTranslation(x, y + 0.006, DEPTH / 2))),
    );
    plinths.computeBoundingSphere();
    return plinths;
  }, []);
  return <primitive object={mesh} />;
}

function Metal() {
  return <meshStandardMaterial color="#0c0d12" metalness={0.6} roughness={0.35} />;
}

/** A lit, open-fronted wall cabinet of thirty miniature cars. */
export default function CarCollection({ item }: { item: Furnishing }) {
  const height = TOP - FLOOR + 0.06;
  const middle = (TOP + FLOOR) / 2;
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotY ?? 0, 0]}>
      <mesh position={[0, middle, 0.006]}>
        <planeGeometry args={[WIDTH + 1.2, height + 0.9]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.35} />
      </mesh>
      <mesh position={[0, middle, 0.012]}>
        <boxGeometry args={[WIDTH, height, 0.02]} />
        {/* A pale backboard, so dark and coloured paint both stand out against it. */}
        <meshStandardMaterial color="#7d8799" roughness={0.85} />
      </mesh>
      {/* The case: top, floor and sides in black metal, and a glass shelf under every row but the lowest. */}
      {[FLOOR - 0.02, TOP + 0.02].map((y) => (
        <mesh key={y} position={[0, y, DEPTH / 2]}>
          <boxGeometry args={[WIDTH + 0.04, 0.04, DEPTH]} />
          <Metal />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (WIDTH / 2), middle, DEPTH / 2]}>
          <boxGeometry args={[0.04, height + 0.04, DEPTH]} />
          <Metal />
        </mesh>
      ))}
      {ROWS.slice(1).map((y) => (
        <mesh key={y} position={[0, y - 0.009, DEPTH / 2]}>
          <boxGeometry args={[WIDTH - 0.04, 0.018, DEPTH - 0.02]} />
          <meshPhysicalMaterial color="#d8f2ff" roughness={0.08} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* A strip of light along the front of each row's ceiling, and its wash down the back panel. */}
      {[...ROWS.slice(1), TOP].map((y) => (
        <group key={y}>
          <mesh position={[0, y - 0.03, DEPTH - 0.03]}>
            <boxGeometry args={[WIDTH - 0.1, 0.01, 0.01]} />
            <Light color="#e8f7ff" gain={1.6} />
          </mesh>
          <mesh position={[0, y - 0.17, 0.024]} rotation={[0, 0, Math.PI]}>
            <planeGeometry args={[WIDTH - 0.1, 0.32]} />
            <Glow map={washTexture()} color={ICE} opacity={0.12} />
          </mesh>
        </group>
      ))}

      <Plinths />
      <Concepts />
      <Toys />

      <Text
        position={[0, FLOOR - 0.16, 0.03]}
        fontSize={0.035}
        color="#9fe3fa"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        MINIATURE COLLECTION
      </Text>
      {/* The concept car is CC BY 4.0, so its credit hangs with it. */}
      <Text
        position={[0, FLOOR - 0.22, 0.03]}
        fontSize={0.016}
        color="#9fe3fa"
        fillOpacity={0.7}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        Car Concept by Eric Chadwick, CC BY 4.0, simplified and repainted · Toy Car by Guido Odendahl, CC0
      </Text>
    </group>
  );
}

useGLTF.preload(CONCEPT_URL);
useGLTF.preload(TOY_URL);
