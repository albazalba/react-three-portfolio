"use client";

import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { experiences, principles, techCategories } from "@/data/site";
import { Light } from "./decor";
import Glow from "./Glow";
import { CAREER, CAREER_CARD, PRINCIPLES_BOARD, ROOMS, STACK_BOARD, type Action } from "./layout";
import { useSolidShadows } from "./shadows";
import { openOverlay, releaseLookLock } from "./store";
import { careerCard, poolTexture, principlesBoard, stackBoard } from "./textures";

const ICE = "#56dcff";
const LETTERING = "#9fe3fa";
const INK = "#f6f1e8";
const RAIL = 0.78;
// The timeline hangs on the west wall. Along it, +x runs north, which is left to right for a visitor facing it.
const WEST = ROOMS.experience.bounds.minX + 0.1;

function read(action: Action, event: ThreeEvent<MouseEvent>) {
  event.stopPropagation();
  releaseLookLock();
  openOverlay(action);
}

function Screen({ art, width, height }: { art: ReturnType<typeof careerCard>; width: number; height: number }) {
  return (
    <>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width + 0.8, height + 0.8]} />
        <Glow map={poolTexture()} color={ICE} opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[width + 0.05, height + 0.05, 0.04]} />
        <meshStandardMaterial color="#0b0a0f" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={art} emissiveMap={art} emissive="#ffffff" emissiveIntensity={0.7} roughness={0.55} />
      </mesh>
    </>
  );
}

/** Every role as a lit card, strung in order along one line of light, oldest first. */
function Timeline() {
  const along = CAREER.map((card) => -card.z);
  const start = Math.min(...along) - CAREER_CARD.w / 2;
  const end = Math.max(...along) + CAREER_CARD.w / 2 + 0.3;
  const foot = CAREER_CARD.y - CAREER_CARD.h / 2;
  const ongoing = /present/i.test(experiences[0]?.period ?? "");

  return (
    <group position={[WEST, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <Text
        position={[start, CAREER_CARD.y + CAREER_CARD.h / 2 + 0.17, 0.01]}
        fontSize={0.075}
        color={LETTERING}
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.3}
      >
        EXPERIENCE
      </Text>
      <mesh position={[(start + end) / 2, RAIL, 0.02]}>
        <boxGeometry args={[end - start, 0.02, 0.02]} />
        <Light color={ICE} />
      </mesh>
      <mesh position={[end + 0.04, RAIL, 0.02]} rotation={[0, 0, -Math.PI / 2]}>
        <circleGeometry args={[0.07, 3]} />
        <Light color={ICE} />
      </mesh>
      {ongoing && (
        <Text position={[end + 0.04, RAIL - 0.15, 0.01]} fontSize={0.06} color={LETTERING} anchorX="center" letterSpacing={0.2}>
          NOW
        </Text>
      )}
      {CAREER.map((card, index) => {
        const job = experiences.find((item) => item.id === card.id);
        if (!job) return null;
        const current = index === 0;
        return (
          <group
            key={card.id}
            position={[-card.z, 0, 0]}
            onClick={(event) => read({ type: "experience", id: card.id }, event)}
          >
            <group position={[0, CAREER_CARD.y, 0]}>
              <Screen art={careerCard(job, current)} width={CAREER_CARD.w} height={CAREER_CARD.h} />
            </group>
            <mesh position={[0, (foot + RAIL) / 2, 0.02]}>
              <boxGeometry args={[0.012, foot - RAIL, 0.012]} />
              <Light color={ICE} gain={1.4} />
            </mesh>
            <mesh position={[0, RAIL, 0.034]}>
              <circleGeometry args={[current ? 0.07 : 0.05, 24]} />
              <Light color={current ? "#ffffff" : ICE} />
            </mesh>
            <mesh position={[0, RAIL, 0.032]}>
              <ringGeometry args={[0.085, 0.1, 32]} />
              <Light color={ICE} gain={1.4} />
            </mesh>
            <Text position={[0, RAIL - 0.17, 0.01]} fontSize={0.085} color={INK} anchorX="center" anchorY="middle" letterSpacing={0.08}>
              {card.year}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

/** A lit board on the gallery's south wall, with its title above and a line of light along its top. */
function Board({
  board,
  art,
  title,
  action,
}: {
  board: typeof STACK_BOARD;
  art: ReturnType<typeof stackBoard>;
  title: string;
  action: Action;
}) {
  return (
    <group
      position={[board.x, board.y, board.z]}
      rotation={[0, Math.PI, 0]}
      onClick={(event) => read(action, event)}
    >
      <Screen art={art} width={board.w} height={board.h} />
      <Text
        position={[-board.w / 2, board.h / 2 + 0.2, 0.01]}
        fontSize={0.075}
        color={LETTERING}
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.3}
      >
        {title}
      </Text>
      <mesh position={[0, board.h / 2 + 0.06, 0.05]}>
        <boxGeometry args={[board.w, 0.02, 0.02]} />
        <Light color={ICE} />
      </mesh>
    </group>
  );
}

export default function CareerWall() {
  const root = useSolidShadows();
  return (
    <group ref={root}>
      <Timeline />
      <Board board={STACK_BOARD} art={stackBoard(techCategories)} title="TECH STACK" action={{ type: "stack" }} />
      <Board
        board={PRINCIPLES_BOARD}
        art={principlesBoard(principles)}
        title="PRINCIPLES"
        action={{ type: "principles" }}
      />
    </group>
  );
}
