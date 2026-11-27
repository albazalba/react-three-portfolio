"use client";

import { Clone, useGLTF } from "@react-three/drei";

// Downloaded models. Where each came from is listed in public/museum/models/SOURCES.md.
const MODELS = {
  plant: "/museum/models/potted_plant_02.glb",
  succulent: "/museum/models/potted_plant_04.glb",
  console: "/museum/models/gaming_console.glb",
  gamepad: "/museum/models/gamepad.glb",
  boombox: "/museum/models/boombox.glb",
  vase: "/museum/models/ceramic_vase_01.glb",
};

export type ModelName = keyof typeof MODELS;

/** One copy of a downloaded model. Each is modelled at real size, standing on y = 0. */
export default function Model({
  name,
  position,
  turn = 0,
  scale = 1,
}: {
  name: ModelName;
  position: [number, number, number];
  turn?: number;
  scale?: number;
}) {
  const { scene } = useGLTF(MODELS[name]);
  return (
    <Clone object={scene} castShadow receiveShadow position={position} rotation={[0, turn, 0]} scale={scale} />
  );
}

for (const url of Object.values(MODELS)) useGLTF.preload(url);
