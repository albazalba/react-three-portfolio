import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

/** Solid meshes under the returned ref cast and receive shadows. Labels, glass and painted light do not. */
export function useSolidShadows() {
  const root = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    root.current?.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh || "fontSize" in mesh) return;
      const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (!material || material.transparent || material instanceof THREE.MeshBasicMaterial) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, []);
  return root;
}
