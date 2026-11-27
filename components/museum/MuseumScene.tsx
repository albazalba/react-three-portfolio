"use client";

import { BakeShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, SMAA, ToneMapping } from "@react-three/postprocessing";
import { Suspense, useState } from "react";
import BilliardsWalls from "./BilliardsWalls";
import CareerWall from "./CareerWall";
import Exhibits from "./Exhibits";
import Furnishings from "./Furnishings";
import Hall from "./Hall";
import LightChase from "./LightChase";
import LivingTv from "./LivingTv";
import LoftDecor from "./LoftDecor";
import Player from "./Player";
import PoolTable, { PoolGame } from "./PoolTable";
import Robots from "./Robots";
import { bindCanvas, setReady } from "./store";

export default function MuseumScene() {
  // Full-screen passes are the cost here, so pixels are capped at 1.5x and slow devices drop to 1x.
  const [lean, setLean] = useState(false);

  return (
    <Canvas
      className="h-full w-full touch-none"
      shadows="percentage"
      dpr={lean ? 1 : [1, 1.5]}
      camera={{ fov: 66, near: 0.08, far: 40, position: [0, 1.64, 11.15] }}
      gl={{
        antialias: true,
        toneMappingExposure: 1.05,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        bindCanvas(gl.domElement);
        setReady(true);
      }}
    >
      <PerformanceMonitor bounds={() => [40, 60]} onDecline={() => setLean(true)} />
      <Player />
      <Suspense fallback={null}>
        <Hall />
        <Exhibits />
        <Furnishings />
        <LightChase />
        <PoolTable />
        <PoolGame />
        <BilliardsWalls />
        <CareerWall />
        <LoftDecor />
        <LivingTv />
        <Robots />
        <Environment resolution={256} environmentIntensity={0.4}>
          <color attach="background" args={["#120e18"]} />
          <Lightformer intensity={1.4} position={[0, 5, -6]} scale={[14, 4, 1]} color="#9fd0ff" />
          <Lightformer intensity={1.1} position={[-8, 3, 6]} scale={[8, 3, 1]} color="#7ef6ff" />
          <Lightformer intensity={0.9} position={[8, 3, 4]} scale={[8, 3, 1]} color="#7a8cff" />
        </Environment>
        <BakeShadows />
      </Suspense>
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <SMAA />
        <Bloom luminanceThreshold={0.95} intensity={0.5} mipmapBlur luminanceSmoothing={0.2} />
        <ToneMapping />
      </EffectComposer>
    </Canvas>
  );
}
