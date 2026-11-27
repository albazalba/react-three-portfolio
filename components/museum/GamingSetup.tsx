"use client";

import { RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { siteConfig } from "@/data/site";
import { Light } from "./decor";
import Glow from "./Glow";
import type { Furnishing } from "./layout";
import Model from "./models";
import { openOverlay, releaseLookLock } from "./store";
import { keyboardTexture, lockScreen, poolTexture } from "./textures";

const ICE = "#56dcff";
const INDIGO = "#7d8cff";
const MAGENTA = "#ff5fd2";
const CARBON = "#101218";
const DESK_TOP = 0.77;

function Metal({ color = "#1a1c24" }: { color?: string }) {
  return <meshStandardMaterial color={color} metalness={0.8} roughness={0.32} />;
}

function Plastic({ color = CARBON }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.5} metalness={0.15} />;
}

function openPc(event: ThreeEvent<MouseEvent>) {
  event.stopPropagation();
  releaseLookLock();
  openOverlay({ type: "pc" });
}

/** A thin-bezel display on one side of the twin arm, with a light bar on top and a glow thrown behind it. */
function Monitor({ side, screen }: { side: -1 | 1; screen: THREE.Texture }) {
  return (
    <group position={[side * 0.335, 1.16, -0.19]} rotation={[0, side * -0.2, 0]}>
      <mesh position={[0, 0, -0.16]}>
        <planeGeometry args={[1.3, 0.9]} />
        <Glow map={poolTexture()} color={side < 0 ? INDIGO : ICE} opacity={0.35} />
      </mesh>
      <RoundedBox args={[0.63, 0.365, 0.02]} radius={0.008} smoothness={2}>
        <meshStandardMaterial color="#07080c" roughness={0.35} metalness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.004, 0.0108]}>
        <planeGeometry args={[0.612, 0.344]} />
        <meshStandardMaterial map={screen} emissiveMap={screen} emissive="#ffffff" emissiveIntensity={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.176, 0.0108]}>
        <boxGeometry args={[0.012, 0.004, 0.002]} />
        <Light color={ICE} gain={1.4} />
      </mesh>
      {/* The mount on the back, and the arm that carries it to the pole. */}
      <mesh position={[0, 0, -0.022]}>
        <boxGeometry args={[0.11, 0.11, 0.024]} />
        <Metal />
      </mesh>
      <mesh position={[side * -0.165, 0, -0.05]}>
        <boxGeometry args={[0.34, 0.034, 0.028]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.2, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.4, 12]} />
        <Plastic />
      </mesh>
      <mesh position={[0, 0.187, 0.034]}>
        <boxGeometry args={[0.36, 0.004, 0.01]} />
        <Light color="#fff0d8" gain={1.3} />
      </mesh>
    </group>
  );
}

const FANS = [MAGENTA, INDIGO, ICE];

/** The tower: glass on the side facing the monitors, lit parts inside, three fans in the front. */
function Tower() {
  return (
    <group position={[0.76, DESK_TOP, -0.08]}>
      {[-0.08, 0.08].map((x) =>
        [-0.17, 0.17].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.008, z]}>
            <boxGeometry args={[0.03, 0.016, 0.05]} />
            <Plastic color="#07080c" />
          </mesh>
        )),
      )}
      {/* Top, bottom, back and the closed right side. */}
      <mesh position={[0, 0.47, 0]}>
        <boxGeometry args={[0.22, 0.012, 0.44]} />
        <Plastic />
      </mesh>
      <mesh position={[0, 0.022, 0]}>
        <boxGeometry args={[0.22, 0.012, 0.44]} />
        <Plastic />
      </mesh>
      <mesh position={[0, 0.246, -0.214]}>
        <boxGeometry args={[0.22, 0.44, 0.012]} />
        <Plastic />
      </mesh>
      <mesh position={[0.104, 0.246, 0]}>
        <boxGeometry args={[0.012, 0.44, 0.44]} />
        <Plastic />
      </mesh>
      <mesh position={[-0.106, 0.246, 0]}>
        <boxGeometry args={[0.006, 0.44, 0.44]} />
        <meshPhysicalMaterial color="#9fb8d8" transparent opacity={0.16} roughness={0.05} metalness={0.3} />
      </mesh>

      {/* Inside: the board, the graphics card, memory and the cooler. */}
      <mesh position={[0.09, 0.27, -0.03]}>
        <boxGeometry args={[0.008, 0.34, 0.32]} />
        <meshStandardMaterial color="#161a26" roughness={0.6} />
      </mesh>
      <mesh position={[0.02, 0.17, -0.02]}>
        <boxGeometry args={[0.13, 0.045, 0.3]} />
        <Plastic color="#1c1f2a" />
      </mesh>
      <mesh position={[-0.047, 0.17, -0.02]}>
        <boxGeometry args={[0.004, 0.012, 0.26]} />
        <Light color={ICE} />
      </mesh>
      {[0, 1, 2, 3].map((stick) => (
        <group key={stick} position={[0.06, 0.34, 0.06 + stick * 0.014]}>
          <mesh>
            <boxGeometry args={[0.05, 0.11, 0.006]} />
            <Plastic color="#1c1f2a" />
          </mesh>
          <mesh position={[0, 0.058, 0]}>
            <boxGeometry args={[0.05, 0.008, 0.007]} />
            <Light color={stick % 2 ? MAGENTA : INDIGO} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.05, 0.33, -0.06]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.04, 0.007, 8, 28]} />
        <Light color={ICE} />
      </mesh>
      <mesh position={[0.06, 0.33, -0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.033, 0.033, 0.03, 20]} />
        <Plastic color="#07080c" />
      </mesh>
      <mesh position={[0, 0.43, -0.185]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.04, 0.006, 8, 24]} />
        <Light color={MAGENTA} />
      </mesh>

      {/* Front: a dark mesh panel with the three intake fans glowing through it. */}
      <mesh position={[0, 0.246, 0.214]}>
        <boxGeometry args={[0.22, 0.44, 0.012]} />
        <Plastic color="#0b0c12" />
      </mesh>
      {FANS.map((tone, index) => (
        <group key={tone} position={[0, 0.115 + index * 0.132, 0.2215]}>
          <mesh>
            <torusGeometry args={[0.048, 0.007, 8, 28]} />
            <Light color={tone} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.04, 24]} />
            <meshStandardMaterial color="#12141c" emissive={tone} emissiveIntensity={0.25} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <circleGeometry args={[0.013, 14]} />
            <Plastic color="#07080c" />
          </mesh>
        </group>
      ))}
      <mesh position={[0.08, 0.455, 0.2215]}>
        <circleGeometry args={[0.008, 12]} />
        <Light color={ICE} />
      </mesh>
    </group>
  );
}

function Headphones() {
  return (
    <group position={[-0.72, DESK_TOP, -0.12]} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.07, 0.075, 0.012, 24]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.27, 10]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.275, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.07, 10]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.085, 0.012, 10, 28, Math.PI]} />
        <Plastic />
      </mesh>
      {[-0.085, 0.085].map((x) => (
        <group key={x} position={[x, 0.17, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.036, 20]} />
            <Plastic />
          </mesh>
          <mesh position={[x > 0 ? 0.0185 : -0.0185, 0, 0]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <ringGeometry args={[0.022, 0.03, 20]} />
            <Light color={ICE} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A microphone on a boom arm clamped to the left end of the desk. */
function Microphone() {
  return (
    <group position={[-0.84, DESK_TOP, 0.12]}>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.26, 8]} />
        <Metal />
      </mesh>
      <mesh position={[0.12, 0.33, -0.02]} rotation={[0, 0, -0.95]}>
        <boxGeometry args={[0.018, 0.3, 0.018]} />
        <Metal />
      </mesh>
      <mesh position={[0.31, 0.37, -0.04]} rotation={[0, 0, 1.2]}>
        <boxGeometry args={[0.018, 0.18, 0.018]} />
        <Metal />
      </mesh>
      <group position={[0.4, 0.3, -0.04]}>
        <mesh>
          <cylinderGeometry args={[0.026, 0.026, 0.1, 16]} />
          <Plastic color="#191b24" />
        </mesh>
        <mesh position={[0, 0.062, 0]}>
          <sphereGeometry args={[0.027, 16, 12]} />
          <meshStandardMaterial color="#2a2d38" metalness={0.7} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.02, 0.0265]}>
          <boxGeometry args={[0.008, 0.008, 0.002]} />
          <Light color={MAGENTA} />
        </mesh>
      </group>
    </group>
  );
}

/** The gaming desk: twin monitors on an arm, a glass-sided tower, lit keyboard, mouse and the rest. */
export function GamingDesk({ item }: { item: Furnishing }) {
  const owner = siteConfig.displayName;
  const keys = keyboardTexture();
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, item.rotY ?? 0, 0]}>
      <mesh position={[0, 1.3, -0.655]}>
        <planeGeometry args={[3.0, 1.9]} />
        <Glow map={poolTexture()} color={INDIGO} opacity={0.4} />
      </mesh>

      {/* A shelf on the wall above the screens. */}
      <group position={[0, 1.78, -0.56]}>
        <mesh>
          <boxGeometry args={[1.5, 0.03, 0.2]} />
          <Plastic color="#191b24" />
        </mesh>
        <mesh position={[0, -0.02, 0.09]}>
          <boxGeometry args={[1.44, 0.008, 0.01]} />
          <Light color={ICE} />
        </mesh>
        <Model name="gamepad" position={[-0.45, 0.015, 0]} turn={0.5} scale={0.4} />
        <Model name="succulent" position={[0.5, 0.015, 0]} scale={0.8} />
        {["#2f6fe0", "#7d8cff", "#e6edf5", "#1c1c22"].map((color, index) => (
          <mesh key={color} position={[0.02 + index * 0.05, 0.11 - index * 0.006, 0]}>
            <boxGeometry args={[0.042, 0.19 - index * 0.012, 0.14]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        ))}
      </group>

      <group onClick={openPc}>
        <RoundedBox args={[1.8, 0.04, 0.74]} radius={0.014} smoothness={3} position={[0, DESK_TOP - 0.02, 0]}>
          <meshPhysicalMaterial color="#12141c" roughness={0.42} metalness={0.3} clearcoat={0.5} clearcoatRoughness={0.35} />
        </RoundedBox>
        <mesh position={[0, DESK_TOP - 0.046, 0.362]}>
          <boxGeometry args={[1.72, 0.01, 0.014]} />
          <Light color={ICE} />
        </mesh>
        <mesh position={[0, 0.04, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6, 1.6]} />
          <Glow map={poolTexture()} color={ICE} opacity={0.22} />
        </mesh>
        {[-0.78, 0.78].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.39, -0.04]}>
              <boxGeometry args={[0.07, 0.72, 0.09]} />
              <Metal />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.08, 0.035, 0.66]} />
              <Metal />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.62, -0.26]}>
          <boxGeometry args={[1.5, 0.05, 0.03]} />
          <Metal />
        </mesh>
        {/* Cable tray under the back edge. */}
        <mesh position={[0, 0.69, -0.27]}>
          <boxGeometry args={[1.2, 0.07, 0.12]} />
          <Plastic color="#0b0c12" />
        </mesh>

        {/* The arm's pole and clamp, then a screen on each side. */}
        <mesh position={[0, DESK_TOP + 0.02, -0.32]}>
          <boxGeometry args={[0.1, 0.04, 0.09]} />
          <Metal />
        </mesh>
        <mesh position={[0, 1.03, -0.3]}>
          <cylinderGeometry args={[0.018, 0.018, 0.52, 14]} />
          <Metal />
        </mesh>
        <Monitor side={-1} screen={lockScreen("user", owner)} />
        <Monitor side={1} screen={lockScreen("notice", owner)} />

        {/* Sound bar under the screens. */}
        <RoundedBox args={[0.5, 0.05, 0.06]} radius={0.02} smoothness={2} position={[0, DESK_TOP + 0.025, -0.16]}>
          <Plastic color="#191b24" />
        </RoundedBox>
        <mesh position={[0, DESK_TOP + 0.006, -0.128]}>
          <boxGeometry args={[0.4, 0.004, 0.004]} />
          <Light color={INDIGO} />
        </mesh>

        {/* Desk mat with a lit edge, keyboard, wrist rest and mouse. */}
        <mesh position={[-0.06, DESK_TOP + 0.002, 0.14]}>
          <boxGeometry args={[1.04, 0.004, 0.4]} />
          <meshStandardMaterial color="#0c0e15" roughness={0.95} />
        </mesh>
        {[-0.06, 0.34].map((z) => (
          <mesh key={z} position={[-0.06, DESK_TOP + 0.003, z]}>
            <boxGeometry args={[1.04, 0.004, 0.006]} />
            <Light color={z < 0 ? INDIGO : ICE} gain={1.5} />
          </mesh>
        ))}
        <group position={[-0.16, DESK_TOP + 0.004, 0.13]} rotation={[0.07, 0, 0]}>
          <RoundedBox args={[0.44, 0.022, 0.15]} radius={0.008} smoothness={2} position={[0, 0.011, 0]}>
            <Plastic color="#0b0c12" />
          </RoundedBox>
          <mesh position={[0, 0.0225, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.425, 0.138]} />
            <meshStandardMaterial map={keys} emissiveMap={keys} emissive="#ffffff" emissiveIntensity={1.5} roughness={0.5} />
          </mesh>
        </group>
        <RoundedBox args={[0.44, 0.016, 0.07]} radius={0.007} smoothness={2} position={[-0.16, DESK_TOP + 0.012, 0.25]}>
          <meshStandardMaterial color="#191b24" roughness={0.9} />
        </RoundedBox>
        <group position={[0.24, DESK_TOP + 0.004, 0.15]} rotation={[0, -0.2, 0]}>
          <mesh position={[0, 0.014, 0]} scale={[1, 0.55, 1.65]}>
            <sphereGeometry args={[0.032, 20, 14]} />
            <Plastic color="#14161e" />
          </mesh>
          <mesh position={[0, 0.03, -0.02]}>
            <boxGeometry args={[0.006, 0.004, 0.02]} />
            <Light color={ICE} />
          </mesh>
          <mesh position={[0, 0.006, 0.03]}>
            <boxGeometry args={[0.05, 0.004, 0.03]} />
            <Light color={MAGENTA} gain={1.3} />
          </mesh>
        </group>

        {/* A can and a mug within reach. */}
        <mesh position={[0.44, DESK_TOP + 0.06, 0.06]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 18]} />
          <meshStandardMaterial color="#2f6fe0" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.44, DESK_TOP + 0.121, 0.06]}>
          <cylinderGeometry args={[0.027, 0.03, 0.004, 18]} />
          <Metal color="#c9d3df" />
        </mesh>
        <mesh position={[-0.5, DESK_TOP + 0.045, 0.24]}>
          <cylinderGeometry args={[0.038, 0.032, 0.09, 20]} />
          <meshStandardMaterial color="#e6edf5" roughness={0.4} />
        </mesh>

        <Tower />
        <Headphones />
        <Microphone />
      </group>
    </group>
  );
}

const SPOKES = [0, 1, 2, 3, 4];

/** A racing-style chair on a five-star base. `rotY` turns the whole chair; the sitter faces +z before that. */
export function GamingChair({ item }: { item: Furnishing }) {
  const shell = "#14161e";
  const accent = item.color ?? ICE;
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, (item.rotY ?? 0) + 0.25, 0]}>
      {SPOKES.map((spoke) => (
        <group key={spoke} rotation={[0, (spoke * Math.PI * 2) / 5, 0]}>
          <mesh position={[0, 0.07, 0.15]} rotation={[0.12, 0, 0]}>
            <boxGeometry args={[0.04, 0.03, 0.3]} />
            <Metal />
          </mesh>
          <mesh position={[0, 0.03, 0.29]}>
            <sphereGeometry args={[0.03, 12, 10]} />
            <Plastic color="#07080c" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.028, 0.034, 0.3, 12]} />
        <Metal color="#2a2d38" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.3]} />
        <Metal />
      </mesh>

      {/* Seat with raised bolsters. The front of the seat is +z here, so the sitter faces +z. */}
      <RoundedBox args={[0.5, 0.1, 0.5]} radius={0.04} smoothness={3} position={[0, 0.47, 0.02]}>
        <meshStandardMaterial color={shell} roughness={0.6} />
      </RoundedBox>
      {[-0.23, 0.23].map((x) => (
        <RoundedBox key={x} args={[0.08, 0.1, 0.46]} radius={0.035} smoothness={3} position={[x, 0.52, 0.03]} rotation={[0, 0, x > 0 ? -0.25 : 0.25]}>
          <meshStandardMaterial color={shell} roughness={0.6} />
        </RoundedBox>
      ))}
      <mesh position={[0, 0.523, 0.05]}>
        <boxGeometry args={[0.3, 0.004, 0.36]} />
        <meshStandardMaterial color="#1d2130" roughness={0.9} />
      </mesh>

      {/* Back, leaning a little, with shoulder wings, a stripe each side, and two cushions. */}
      <group position={[0, 0.54, -0.22]} rotation={[-0.14, 0, 0]}>
        <RoundedBox args={[0.46, 0.78, 0.1]} radius={0.045} smoothness={3} position={[0, 0.39, 0]}>
          <meshStandardMaterial color={shell} roughness={0.6} />
        </RoundedBox>
        {[-0.24, 0.24].map((x) => (
          <group key={x}>
            <RoundedBox args={[0.09, 0.34, 0.13]} radius={0.04} smoothness={3} position={[x, 0.2, 0.03]} rotation={[0, x > 0 ? -0.35 : 0.35, 0]}>
              <meshStandardMaterial color={shell} roughness={0.6} />
            </RoundedBox>
            <RoundedBox args={[0.1, 0.3, 0.12]} radius={0.04} smoothness={3} position={[x * 1.02, 0.6, 0.02]} rotation={[0, x > 0 ? -0.3 : 0.3, x > 0 ? 0.12 : -0.12]}>
              <meshStandardMaterial color={shell} roughness={0.6} />
            </RoundedBox>
            <mesh position={[x * 0.62, 0.42, 0.052]}>
              <boxGeometry args={[0.025, 0.62, 0.006]} />
              <Light color={accent} gain={1.4} />
            </mesh>
          </group>
        ))}
        <RoundedBox args={[0.3, 0.14, 0.07]} radius={0.03} smoothness={3} position={[0, 0.16, 0.07]}>
          <meshStandardMaterial color="#1d2130" roughness={0.8} />
        </RoundedBox>
        <RoundedBox args={[0.24, 0.13, 0.07]} radius={0.03} smoothness={3} position={[0, 0.68, 0.07]}>
          <meshStandardMaterial color="#1d2130" roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, 0.39, -0.052]}>
          <boxGeometry args={[0.3, 0.6, 0.006]} />
          <Plastic color="#0b0c12" />
        </mesh>
      </group>

      {[-0.3, 0.3].map((x) => (
        <group key={x} position={[x, 0, 0.02]}>
          <mesh position={[0, 0.56, 0]}>
            <boxGeometry args={[0.03, 0.22, 0.04]} />
            <Metal />
          </mesh>
          <RoundedBox args={[0.08, 0.03, 0.26]} radius={0.012} smoothness={2} position={[0, 0.68, 0.02]}>
            <Plastic color="#191b24" />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}
