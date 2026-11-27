"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CABINETS } from "../layout";
import { getSnapshot, subscribe } from "../store";
import { GAMES, KEYS, type ArcadeId } from "./games";
import { H, W, type Machine, type Pad, type Press } from "./types";

const BUTTONS: Record<Press, { glyph: string; name: string }> = {
  left: { glyph: "◀", name: "Left" },
  right: { glyph: "▶", name: "Right" },
  up: { glyph: "▲", name: "Up" },
  down: { glyph: "▼", name: "Down" },
  fire: { glyph: "●", name: "Fire" },
};

// The screen is drawn at twice its size and left unsmoothed, so the pixels stay square.
const SCALE = 2;

type Stage = "ready" | "playing" | "over";

const idle = (): Pad => ({ left: false, right: false, up: false, down: false, fire: false, presses: [] });

function show(context: CanvasRenderingContext2D, machine: Machine) {
  context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  context.imageSmoothingEnabled = false;
  machine.draw(context);
}

function line(machine: Machine) {
  return machine.readout?.() ?? `Score ${machine.score()}`;
}

function storedBest(key: string) {
  try {
    return Number(window.localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

export default function ArcadeGame({ id }: { id: ArcadeId }) {
  const game = GAMES[id];
  const cabinet = CABINETS.find((item) => item.id === id);
  const bestKey = `loft-arcade-${id}`;
  const coarse = useSyncExternalStore(subscribe, getSnapshot, getSnapshot).coarse;
  const canvas = useRef<HTMLCanvasElement>(null);
  const machine = useRef<Machine | null>(null);
  const pad = useRef<Pad>(idle());
  const endedAt = useRef(0);
  const [stage, setStage] = useState<Stage>("ready");
  const [readout, setReadout] = useState("");
  const [verdict, setVerdict] = useState("");
  const [best, setBest] = useState(() => storedBest(bestKey));

  const begin = useCallback(() => {
    // A beat after losing, so the key that was being mashed does not start the next game.
    if (stage === "playing" || performance.now() - endedAt.current < 500) return;
    machine.current = game.start();
    pad.current = idle();
    setReadout(line(machine.current));
    setStage("playing");
  }, [game, stage]);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    machine.current = game.start();
    show(context, machine.current);
  }, [game]);

  useEffect(() => {
    if (stage !== "playing") return;
    const context = canvas.current?.getContext("2d");
    const current = machine.current;
    if (!context || !current) return;
    let frame = 0;
    let last = performance.now();
    let shown = "";
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      current.step(dt, pad.current);
      pad.current.presses.length = 0;
      show(context, current);
      const next = line(current);
      if (next !== shown) {
        shown = next;
        setReadout(next);
      }
      if (current.over()) {
        const score = current.score();
        endedAt.current = performance.now();
        setVerdict(current.verdict?.() ?? "Game over.");
        if (game.ranked && score > best) {
          setBest(score);
          try {
            window.localStorage.setItem(bestKey, String(score));
          } catch {
            /* The score still shows for this visit. */
          }
        }
        setStage("over");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stage, game, best, bestKey]);

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      const press = KEYS[event.code];
      if (!press) return;
      event.preventDefault();
      if (stage !== "playing") {
        if (press === "fire" && !event.repeat) begin();
        return;
      }
      if (!event.repeat) pad.current.presses.push(press);
      pad.current[press] = true;
    };
    const onUp = (event: KeyboardEvent) => {
      const press = KEYS[event.code];
      if (!press) return;
      event.preventDefault();
      pad.current[press] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [stage, begin]);

  function hold(press: Press, down: boolean) {
    if (down && !pad.current[press]) pad.current.presses.push(press);
    pad.current[press] = down;
  }

  function touchButton(press: Press) {
    return (
      <button
        key={press}
        type="button"
        aria-label={BUTTONS[press].name}
        className="flex h-14 w-14 touch-none items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-lg text-white/80 active:border-accent active:text-accent"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          hold(press, true);
        }}
        onPointerUp={() => hold(press, false)}
        onPointerCancel={() => hold(press, false)}
        onLostPointerCapture={() => hold(press, false)}
        onContextMenu={(event) => event.preventDefault()}
      >
        {BUTTONS[press].glyph}
      </button>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-accent">Arcade</p>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-3xl font-light tracking-tight">{cabinet?.title}</h2>
        <p className="text-sm text-muted">
          {readout || "Ready"}
          {game.ranked && best > 0 ? ` · Best ${best}` : ""}
        </p>
      </div>
      <div
        className="relative mx-auto mt-6 w-full border border-white/15 bg-black"
        style={{
          maxWidth: "min(100%, calc(48vh * 4 / 3))",
          boxShadow: `0 0 44px ${cabinet?.color ?? "#e1b74f"}30`,
        }}
      >
        <canvas
          ref={canvas}
          width={W * SCALE}
          height={H * SCALE}
          className="block w-full"
          style={{ imageRendering: "pixelated" }}
          aria-label={`${cabinet?.title ?? "Arcade"} screen`}
        />
        {stage !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 text-center">
            {stage === "over" && <p className="text-xl font-light">{verdict}</p>}
            <button
              type="button"
              onClick={begin}
              className="border border-accent bg-black/40 px-5 py-2 text-sm uppercase tracking-[0.22em] text-accent transition-colors hover:bg-accent hover:text-[#1a140c]"
            >
              {stage === "over" ? "Play again" : "Start"}
            </button>
            {!coarse && <p className="text-xs tracking-wide text-white/55">or press Space</p>}
          </div>
        )}
      </div>
      {coarse ? (
        <div className="mt-4 flex select-none items-center justify-between gap-3">
          <div className="flex gap-2">
            {game.buttons.filter((press) => press !== "fire").map(touchButton)}
          </div>
          {game.buttons.includes("fire") && touchButton("fire")}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">{game.keys} Esc to walk away.</p>
      )}
    </div>
  );
}
