"use client";

import * as THREE from "three";

/** Additive, unlit material for painted light: washes on walls, halos, pools on the floor. */
export default function Glow({
  map,
  color,
  opacity = 0.3,
}: {
  map: THREE.Texture;
  color: string;
  opacity?: number;
}) {
  return (
    <meshBasicMaterial
      map={map}
      color={color}
      opacity={opacity}
      transparent
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      fog={false}
    />
  );
}
