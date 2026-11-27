"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import Glow from "./Glow";
import { ROBOTS, blocked } from "./layout";
import { getSnapshot, livePose, prefersReducedMotion } from "./store";
import { poolTexture } from "./textures";

const SHELL = "#ece8e1";
const DARK = "#1b1a20";
const VACUUM_RADIUS = 0.2;
const PET_RADIUS = 0.2;

type Point = { x: number; z: number };

/** Shortest signed way round from one heading to another. */
function swing(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/** Nothing solid on the straight line between two points, for something this wide. */
function clear(from: Point, to: Point, radius: number) {
  const span = Math.hypot(to.x - from.x, to.z - from.z);
  const steps = Math.ceil(span / 0.15);
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    if (blocked(from.x + (to.x - from.x) * t, from.z + (to.z - from.z) * t, radius)) return false;
  }
  return true;
}

// Movers are left out of the baked shadow map, so each one carries its own soft patch.
function Shade({ size }: { size: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0]}>
      <circleGeometry args={[size, 24]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.32} depthWrite={false} />
    </mesh>
  );
}

/** Drives in straight lines and turns away from whatever it meets, the visitor included. */
function Vacuum() {
  const body = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshStandardMaterial>(null);
  const state = useRef({
    x: ROBOTS.dock.x,
    z: ROBOTS.dock.z - 0.14,
    heading: Math.PI,
    turn: 0,
    wander: 6,
  });

  useFrame(({ clock }, delta) => {
    const group = body.current;
    if (!group) return;
    const bot = state.current;
    const dt = Math.min(0.05, delta);
    const parked =
      prefersReducedMotion() || getSnapshot().phase !== "explore" || getSnapshot().overlay !== null;

    if (!parked) {
      if (bot.turn !== 0) {
        const step = Math.sign(bot.turn) * Math.min(Math.abs(bot.turn), 2.4 * dt);
        bot.heading += step;
        bot.turn -= step;
      } else {
        const nx = bot.x + Math.sin(bot.heading) * 0.42 * dt;
        const nz = bot.z + Math.cos(bot.heading) * 0.42 * dt;
        const visitor = Math.hypot(nx - livePose.x, nz - livePose.z) < 0.62;
        bot.wander -= dt;
        if (blocked(nx, nz, VACUUM_RADIUS) || visitor) {
          bot.turn = (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * 1.4);
        } else {
          bot.x = nx;
          bot.z = nz;
          if (bot.wander <= 0) {
            bot.turn = (Math.random() - 0.5) * 1.6;
            bot.wander = 5 + Math.random() * 8;
          }
        }
      }
    }

    group.position.set(bot.x, 0, bot.z);
    group.rotation.y = bot.heading;
    if (ring.current) {
      ring.current.emissiveIntensity = parked ? 0.6 : 1.5 + Math.sin(clock.elapsedTime * 3) * 0.5;
    }
  });

  return (
    <group ref={body}>
      <Shade size={0.24} />
      <mesh position={[0, 0.062, 0]}>
        <cylinderGeometry args={[0.18, 0.185, 0.07, 40]} />
        <meshStandardMaterial color={DARK} roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.099, 0]}>
        <cylinderGeometry args={[0.165, 0.18, 0.006, 40]} />
        <meshStandardMaterial color="#2c2b33" roughness={0.25} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.103, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.085, 0.097, 40]} />
        <meshStandardMaterial ref={ring} color="#0d2a30" emissive="#7ef6ff" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0.114, -0.02]}>
        <cylinderGeometry args={[0.05, 0.055, 0.028, 28]} />
        <meshStandardMaterial color="#34333c" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.07, 0.178]}>
        <boxGeometry args={[0.09, 0.018, 0.02]} />
        <meshStandardMaterial color="#0d2a30" emissive="#7ef6ff" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

function Dock() {
  return (
    <group position={[ROBOTS.dock.x, 0, ROBOTS.dock.z]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.012, 0.1]}>
        <boxGeometry args={[0.3, 0.02, 0.26]} />
        <meshStandardMaterial color={DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.09, -0.04]}>
        <boxGeometry args={[0.3, 0.18, 0.07]} />
        <meshStandardMaterial color="#26252c" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.15, -0.003]}>
        <boxGeometry args={[0.05, 0.008, 0.004]} />
        <meshStandardMaterial color="#12301c" emissive="#7dff8a" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

const LEGS: Array<[number, number]> = [
  [-0.075, 0.12],
  [0.075, 0.12],
  [-0.075, -0.12],
  [0.075, -0.12],
];

/** Waits in the living room, then follows the visitor along the path they walked. */
function Pet() {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const legs = useRef<Array<THREE.Group | null>>([]);
  const eyes = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const state = useRef({
    x: ROBOTS.pet.x,
    z: ROBOTS.pet.z,
    heading: ROBOTS.pet.yaw,
    trail: [{ ...ROBOTS.pet.via }] as Point[],
    seen: null as Point | null,
    following: false,
    look: 0,
    stuck: 0,
    stride: 0,
    pace: 0,
  });

  useFrame(({ clock }, delta) => {
    const group = root.current;
    if (!group) return;
    const pet = state.current;
    const dt = Math.min(0.05, delta);
    const snap = getSnapshot();
    const awake = !prefersReducedMotion() && snap.phase === "explore" && snap.overlay === null;
    const visitor = { x: livePose.x, z: livePose.z };
    let speed = 0;

    if (awake) {
      // A jump through the directory leaves no path to follow, so the pet turns up beside the visitor.
      // So does a pet that has been wedged against something for a while.
      const jumped = pet.seen && Math.hypot(visitor.x - pet.seen.x, visitor.z - pet.seen.z) > 2.5;
      if (jumped || pet.stuck > 2) {
        pet.stuck = 0;
        for (let turn = 0; turn < 8; turn += 1) {
          const angle = livePose.yaw + Math.PI + 0.6 + (turn * Math.PI) / 4;
          const x = visitor.x + Math.sin(angle) * 2.3;
          const z = visitor.z + Math.cos(angle) * 2.3;
          if (!blocked(x, z, PET_RADIUS + 0.05)) {
            pet.x = x;
            pet.z = z;
            break;
          }
        }
        pet.trail = [];
      }
      pet.seen = visitor;

      const crumb = pet.trail[pet.trail.length - 1];
      if (!crumb || Math.hypot(visitor.x - crumb.x, visitor.z - crumb.z) > 0.35) {
        pet.trail.push(visitor);
        if (pet.trail.length > 80) pet.trail.shift();
      }

      const apart = Math.hypot(visitor.x - pet.x, visitor.z - pet.z);
      if (apart > 2.7) pet.following = true;
      if (apart < 2) pet.following = false;

      pet.look -= dt;
      if (pet.following && pet.look <= 0) {
        pet.look = 0.2;
        // Cut the corner to the newest part of the path the pet can reach in a straight line.
        for (let index = pet.trail.length - 1; index > 0; index -= 1) {
          if (clear(pet, pet.trail[index], PET_RADIUS)) {
            pet.trail.splice(0, index);
            break;
          }
        }
      }

      if (pet.following) {
        while (pet.trail.length > 1 && Math.hypot(pet.trail[0].x - pet.x, pet.trail[0].z - pet.z) < 0.18) {
          pet.trail.shift();
        }
        const target = pet.trail[0] ?? visitor;
        const dx = target.x - pet.x;
        const dz = target.z - pet.z;
        const span = Math.hypot(dx, dz);
        if (span > 0.02) {
          speed = Math.min(apart > 4 ? 3.4 : 2.1, span / dt);
          const nx = pet.x + (dx / span) * speed * dt;
          const nz = pet.z + (dz / span) * speed * dt;
          const from = { x: pet.x, z: pet.z };
          if (!blocked(nx, pet.z, PET_RADIUS)) pet.x = nx;
          if (!blocked(pet.x, nz, PET_RADIUS)) pet.z = nz;
          const made = Math.hypot(pet.x - from.x, pet.z - from.z);
          pet.stuck = made < speed * dt * 0.3 ? pet.stuck + dt : 0;
          pet.heading += swing(pet.heading, Math.atan2(dx, dz)) * Math.min(1, dt * 10);
        }
      } else {
        const facing = Math.atan2(visitor.x - pet.x, visitor.z - pet.z);
        pet.heading += swing(pet.heading, facing) * Math.min(1, dt * 4);
      }
    }

    pet.pace += (speed - pet.pace) * Math.min(1, dt * 8);
    pet.stride += pet.pace * dt * 7;
    const gait = Math.min(1, pet.pace / 1.6);
    const time = clock.elapsedTime;

    group.position.set(pet.x, 0, pet.z);
    group.rotation.y = pet.heading;
    if (torso.current) {
      torso.current.position.y = Math.abs(Math.sin(pet.stride)) * 0.012 * gait;
      // Standing still, it settles back on its haunches.
      torso.current.rotation.x = -0.12 * (1 - gait);
    }
    legs.current.forEach((leg, index) => {
      if (!leg) return;
      const pair = index === 0 || index === 3 ? 0 : Math.PI;
      leg.rotation.x = Math.sin(pet.stride + pair) * 0.6 * gait;
    });
    if (tail.current) {
      tail.current.rotation.y = awake ? Math.sin(time * (9 + gait * 5)) * 0.5 : 0;
    }
    if (head.current) {
      head.current.rotation.z = awake ? Math.sin(time * 0.9) * 0.14 * (1 - gait) : 0;
      head.current.rotation.x = -0.1 * (1 - gait);
    }
    // A blink every few seconds.
    for (const eye of eyes.current) {
      if (eye) eye.emissiveIntensity = time % 3.7 < 0.12 ? 0.1 : 2;
    }
  });

  return (
    <group ref={root}>
      <Shade size={0.26} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.024, 0]}>
        <circleGeometry args={[0.34, 24]} />
        <Glow map={poolTexture()} color="#7ef6ff" opacity={0.1} />
      </mesh>
      {LEGS.map(([x, z], index) => (
        <group
          key={index}
          ref={(node) => {
            legs.current[index] = node;
          }}
          position={[x, 0.2, z]}
        >
          <mesh position={[0, -0.085, 0]}>
            <boxGeometry args={[0.045, 0.17, 0.05]} />
            <meshStandardMaterial color={SHELL} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.18, 0.008]}>
            <boxGeometry args={[0.055, 0.04, 0.07]} />
            <meshStandardMaterial color={DARK} roughness={0.6} />
          </mesh>
        </group>
      ))}
      <group ref={torso}>
        <RoundedBox args={[0.2, 0.15, 0.36]} radius={0.05} smoothness={3} position={[0, 0.27, 0]}>
          <meshStandardMaterial color={SHELL} roughness={0.35} metalness={0.1} />
        </RoundedBox>
        <mesh position={[0, 0.27, 0.11]}>
          <boxGeometry args={[0.206, 0.156, 0.025]} />
          <meshStandardMaterial color="#3a2a08" emissive="#e1b74f" emissiveIntensity={1.3} />
        </mesh>
        <group ref={tail} position={[0, 0.32, -0.17]}>
          <mesh position={[0, 0.06, -0.035]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[0.028, 0.14, 0.028]} />
            <meshStandardMaterial color={DARK} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.13, -0.073]}>
            <sphereGeometry args={[0.024, 12, 12]} />
            <meshStandardMaterial color="#0d2a30" emissive="#7ef6ff" emissiveIntensity={1.8} />
          </mesh>
        </group>
        <group ref={head} position={[0, 0.41, 0.2]}>
          <RoundedBox args={[0.2, 0.16, 0.18]} radius={0.05} smoothness={3}>
            <meshStandardMaterial color={SHELL} roughness={0.35} metalness={0.1} />
          </RoundedBox>
          <mesh position={[0, 0.005, 0.088]}>
            <boxGeometry args={[0.16, 0.085, 0.012]} />
            <meshStandardMaterial color="#08080b" roughness={0.15} metalness={0.6} />
          </mesh>
          {[-0.04, 0.04].map((x, index) => (
            <mesh key={x} position={[x, 0.008, 0.096]}>
              <boxGeometry args={[0.03, 0.038, 0.004]} />
              <meshStandardMaterial
                ref={(node) => {
                  eyes.current[index] = node;
                }}
                color="#0d2a30"
                emissive="#7ef6ff"
                emissiveIntensity={2}
              />
            </mesh>
          ))}
          {[-0.075, 0.075].map((x) => (
            <mesh key={x} position={[x, 0.105, -0.03]} rotation={[0, 0, x > 0 ? -0.25 : 0.25]}>
              <boxGeometry args={[0.035, 0.08, 0.06]} />
              <meshStandardMaterial color={DARK} roughness={0.5} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export default function Robots() {
  return (
    <>
      <Dock />
      <Vacuum />
      <Pet />
    </>
  );
}
