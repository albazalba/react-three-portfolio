"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { R, aimAt, aiming, left, nudge, rerack, shoot, sight, step, table, wake } from "./arcade/pool";
import Glow from "./Glow";
import { POOL_TABLE, ROOMS } from "./layout";
import { useSolidShadows } from "./shadows";
import { getSnapshot, releaseLookLock, startPool, subscribe } from "./store";
import { poolTexture } from "./textures";

const WOOD = "#1d2638";
const FELT = "#1f7a4d";
const CUSHION = "#17603c";
const BRASS = "#c9d3df";
const BED = 0.775;
const RAIL_TOP = 0.826;

const LEGS: Array<[number, number]> = [
  [-1.08, -0.5],
  [1.08, -0.5],
  [-1.08, 0.5],
  [1.08, 0.5],
];

const POCKETS: Array<[number, number]> = [
  [-1.16, -0.56],
  [1.16, -0.56],
  [-1.16, 0.56],
  [1.16, 0.56],
  [0, -0.585],
  [0, 0.585],
];

// The level the ball centres roll at, where the pointer is read against the cloth.
const ROLL = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(BED + R));
const caster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const spot = new THREE.Vector3();
const KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "Enter"];

/** The balls, the cue and the aim line. These move, so they stay out of the table's baked shadows. */
export function PoolGame() {
  const playing = useSyncExternalStore(
    subscribe,
    () => getSnapshot().playing,
    () => false,
  );
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const balls = useRef<Array<THREE.Group | null>>([]);
  const cue = useRef<THREE.Group>(null);
  const line = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);
  const ghost = useRef<THREE.Mesh>(null);
  const held = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!playing) return;
    wake();
    const dom = gl.domElement;
    const keys = held.current;
    let pressed = false;
    const aim = (event: PointerEvent) => {
      if (getSnapshot().overlay) return;
      const box = dom.getBoundingClientRect();
      pointer.set(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        1 - ((event.clientY - box.top) / box.height) * 2,
      );
      caster.setFromCamera(pointer, camera);
      if (!caster.ray.intersectPlane(ROLL, spot)) return;
      aimAt(spot.x - POOL_TABLE.x, spot.z - POOL_TABLE.z);
    };
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pressed = true;
      aim(event);
    };
    const onUp = (event: PointerEvent) => {
      if (!pressed) return;
      pressed = false;
      if (getSnapshot().overlay) return;
      if (event.target === dom) aim(event);
      shoot();
    };
    const onCancel = () => {
      pressed = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (getSnapshot().overlay) return;
      keys[event.code] = true;
      if (!KEYS.includes(event.code)) return;
      // Space or Enter on a focused button should press that button, not take a shot.
      if (event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      if ((event.code === "Space" || event.code === "Enter") && !event.repeat) {
        if (left() === 0) rerack();
        else shoot();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys[event.code] = false;
    };
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", aim);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", aim);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      for (const key of Object.keys(keys)) keys[key] = false;
    };
  }, [playing, camera, gl]);

  useFrame((_, deltaTime) => {
    const delta = Math.min(deltaTime, 0.033);
    if (playing && !getSnapshot().overlay) {
      const keys = held.current;
      const fine = keys.ShiftLeft || keys.ShiftRight ? 0.25 : 1;
      const turn = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0);
      const push = (keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0);
      if (turn || push) nudge(turn * 1.6 * fine * delta, push * 0.7 * delta);
    }
    // A shot that is still rolling finishes even if the visitor has walked away.
    step(delta);

    table.balls.forEach((ball, index) => {
      const mesh = balls.current[index];
      if (!mesh) return;
      mesh.visible = ball.live;
      mesh.position.set(ball.x, BED + R, ball.z);
    });

    const ready = playing && aiming();
    if (line.current) line.current.visible = ready;
    if (ghost.current) ghost.current.visible = ready;
    if (!cue.current) return;
    if (!ready) {
      // Between shots the cue lies along the near rail.
      cue.current.position.set(0.5, RAIL_TOP + 0.014, 0.65);
      cue.current.rotation.set(0, 0, 0);
      return;
    }
    const white = table.balls[0];
    const dx = Math.cos(table.angle);
    const dz = Math.sin(table.angle);
    // The cue draws back as the shot gets harder, and tips up to clear the rail.
    const back = R + 0.015 + table.power * 0.16;
    cue.current.position.set(white.x - dx * back, BED + R, white.z - dz * back);
    cue.current.rotation.set(0, -table.angle, -0.1);
    const { reach } = sight();
    if (line.current) {
      const from = R + 0.01;
      const length = Math.max(0.001, reach - from);
      const middle = from + length / 2;
      line.current.position.set(white.x + dx * middle, BED + 0.004, white.z + dz * middle);
      line.current.rotation.set(0, -table.angle, 0);
      line.current.scale.set(length, 1, 1);
      // Cool for a soft shot, hot for a hard one.
      line.current.material.color.setHSL(0.52 - table.power * 0.5, 1, 0.62);
    }
    ghost.current?.position.set(white.x + dx * reach, BED + 0.004, white.z + dz * reach);
  });

  return (
    <group position={[POOL_TABLE.x, 0, POOL_TABLE.z]}>
      {table.balls.map((ball, index) => (
        <group
          key={ball.color}
          ref={(node) => {
            balls.current[index] = node;
          }}
          position={[ball.x, BED + R, ball.z]}
        >
          <mesh>
            <sphereGeometry args={[R, 24, 24]} />
            <meshStandardMaterial color={ball.color} roughness={0.22} envMapIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.002 - R, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[R * 1.15, 20]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.34} depthWrite={false} />
          </mesh>
        </group>
      ))}
      <group ref={cue} position={[0.5, RAIL_TOP + 0.014, 0.65]}>
        <mesh position={[-0.7, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.013, 1.4, 10]} />
          <meshStandardMaterial color="#d8b27a" roughness={0.4} />
        </mesh>
        <mesh position={[-1.22, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.0125, 0.014, 0.36, 10]} />
          <meshStandardMaterial color="#1c1c22" roughness={0.5} />
        </mesh>
        <mesh position={[-0.006, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.0062, 0.0064, 0.012, 10]} />
          <meshStandardMaterial color="#3f7fd0" roughness={0.8} />
        </mesh>
      </group>
      <mesh ref={line} visible={false}>
        <boxGeometry args={[1, 0.002, 0.006]} />
        <meshBasicMaterial color="#56dcff" transparent opacity={0.75} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ghost} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R * 0.8, R, 28]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function PoolTable() {
  const root = useSolidShadows();
  const ceiling = ROOMS.play.height;

  return (
    <group
      ref={root}
      position={[POOL_TABLE.x, 0, POOL_TABLE.z]}
      onClick={(event) => {
        event.stopPropagation();
        if (getSnapshot().playing) return;
        releaseLookLock();
        startPool();
      }}
    >
      {LEGS.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.15, 0.56, 0.15]} />
            <meshStandardMaterial color="#141a28" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.17, 0.04, 0.17]} />
            <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[2.5, 0.2, 1.3]} />
        <meshStandardMaterial color={WOOD} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.765, 0]}>
        <boxGeometry args={[2.4, 0.02, 1.2]} />
        <meshStandardMaterial color={FELT} roughness={0.95} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[0, 0.79, side * 0.65]}>
            <boxGeometry args={[2.62, 0.07, 0.12]} />
            <meshStandardMaterial color={WOOD} roughness={0.35} />
          </mesh>
          <mesh position={[side * 1.25, 0.79, 0]}>
            <boxGeometry args={[0.12, 0.07, 1.18]} />
            <meshStandardMaterial color={WOOD} roughness={0.35} />
          </mesh>
          {[-0.58, 0.58].map((x) => (
            <mesh key={x} position={[x, 0.795, side * 0.575]}>
              <boxGeometry args={[1.02, 0.04, 0.04]} />
              <meshStandardMaterial color={CUSHION} roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[side * 1.175, 0.795, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.98]} />
            <meshStandardMaterial color={CUSHION} roughness={0.9} />
          </mesh>
          {[-0.62, 0, 0.62].map((x) => (
            <mesh key={x} position={[x, 0.826, side * 0.65]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.012, 12]} />
              <meshBasicMaterial color="#f6f1e8" />
            </mesh>
          ))}
        </group>
      ))}
      {POCKETS.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.778, z]}>
          <cylinderGeometry args={[0.072, 0.072, 0.006, 24]} />
          <meshStandardMaterial color="#060608" roughness={0.9} />
        </mesh>
      ))}

      {/* The lamp over the table, hung from the ceiling on two rods. */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, (ceiling + 1.98) / 2, 0]}>
          <cylinderGeometry args={[0.008, 0.008, ceiling - 1.98, 8]} />
          <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.93, 0]}>
        <boxGeometry args={[1.7, 0.1, 0.34]} />
        <meshStandardMaterial color="#141a28" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.876, 0]}>
        <boxGeometry args={[1.6, 0.01, 0.26]} />
        <meshStandardMaterial color="#e6f4ff" emissive="#bfe6ff" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0, BED + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 1.5]} />
        <Glow map={poolTexture()} color="#bfe6ff" opacity={0.16} />
      </mesh>
      <Text
        position={[0, 0.65, 0.652]}
        fontSize={0.05}
        color={BRASS}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        BILLIARDS
      </Text>
    </group>
  );
}
