"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { GAMES, type ArcadeId } from "./arcade/games";
import { rerack } from "./arcade/pool";
import { tvBegin, tvHold, tvPick } from "./arcade/tv";
import { CHANNELS, tune } from "./channels";
import type { Press } from "./arcade/types";
import { ENTER_POSE, MAP_BOUNDS, OPEN_ROOMS, ROOMS, type RoomId } from "./layout";
import {
  closeOverlay,
  getPose,
  getSnapshot,
  input,
  openOverlay,
  prefersReducedMotion,
  queueTeleport,
  requestLookLock,
  requestSkipEnter,
  setPhase,
  stand,
  stopPool,
  stopWatching,
  subscribe,
  subscribePose,
} from "./store";
import Placard from "./Placard";

function useMuseum() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function Minimap({ zone }: { zone: RoomId }) {
  const pose = useSyncExternalStore(subscribePose, getPose, getPose);
  const size = 148;
  const spanX = MAP_BOUNDS.maxX - MAP_BOUNDS.minX;
  const spanZ = MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ;
  const mapX = (x: number) => ((x - MAP_BOUNDS.minX) / spanX) * size;
  const mapY = (z: number) => ((z - MAP_BOUNDS.minZ) / spanZ) * size;
  const px = mapX(pose.x);
  const py = mapY(pose.z);
  const fx = -Math.sin(pose.yaw);
  const fz = -Math.cos(pose.yaw);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="border border-white/10 bg-black/50 backdrop-blur-sm"
      aria-hidden="true"
    >
      {OPEN_ROOMS.map((id) => {
        const bounds = ROOMS[id].bounds;
        const x = mapX(bounds.minX);
        const y = mapY(bounds.minZ);
        const w = mapX(bounds.maxX) - x;
        const h = mapY(bounds.maxZ) - y;
        return (
          <rect
            key={id}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={id === zone ? "rgba(225,183,79,0.22)" : "rgba(255,255,255,0.04)"}
            stroke="rgba(225,183,79,0.45)"
            strokeWidth={1}
          />
        );
      })}
      <line
        x1={px}
        y1={py}
        x2={px + fx * 10}
        y2={py + fz * 10}
        stroke="#e1b74f"
        strokeWidth={1.5}
      />
      <circle cx={px} cy={py} r={3.2} fill="#f4efe6" />
    </svg>
  );
}

function Joystick() {
  const pad = useRef<HTMLDivElement>(null);

  function setFromEvent(clientX: number, clientY: number) {
    const rect = pad.current?.getBoundingClientRect();
    if (!rect) return;
    let dx = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    let dy = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const length = Math.hypot(dx, dy);
    if (length > 1) {
      dx /= length;
      dy /= length;
    }
    input.strafe = dx;
    input.forward = -dy;
  }

  return (
    <div
      ref={pad}
      className="absolute bottom-6 left-6 z-20 h-28 w-28 touch-none rounded-full border border-white/15 bg-black/40"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromEvent(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        setFromEvent(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        input.strafe = 0;
        input.forward = 0;
      }}
      onPointerCancel={() => {
        input.strafe = 0;
        input.forward = 0;
      }}
    >
      <span className="pointer-events-none absolute inset-8 rounded-full border border-accent/40" />
    </div>
  );
}

function LookPad() {
  const last = useRef({ x: 0, y: 0, active: false });
  return (
    <div
      className="absolute top-0 right-0 z-0 h-[calc(100%-8.5rem)] w-1/2 touch-none"
      onPointerDown={(event) => {
        last.current = { x: event.clientX, y: event.clientY, active: true };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!last.current.active) return;
        input.lookX += event.clientX - last.current.x;
        input.lookY += event.clientY - last.current.y;
        last.current.x = event.clientX;
        last.current.y = event.clientY;
      }}
      onPointerUp={() => {
        last.current.active = false;
      }}
    />
  );
}

const PAD_GLYPHS: Record<Press, { glyph: string; name: string }> = {
  left: { glyph: "◀", name: "Left" },
  right: { glyph: "▶", name: "Right" },
  up: { glyph: "▲", name: "Up" },
  down: { glyph: "▼", name: "Down" },
  fire: { glyph: "●", name: "Fire" },
};

/** One touch button of the console's controller. */
function PadButton({ press }: { press: Press }) {
  return (
    <button
      type="button"
      aria-label={PAD_GLYPHS[press].name}
      className="flex h-12 w-12 touch-none items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-lg text-white/80 active:border-accent active:text-accent"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        tvHold(press, true);
      }}
      onPointerUp={() => tvHold(press, false)}
      onPointerCancel={() => tvHold(press, false)}
      onLostPointerCapture={() => tvHold(press, false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {PAD_GLYPHS[press].glyph}
    </button>
  );
}

export default function MuseumChrome() {
  const museum = useMuseum();
  const dialog = useRef<HTMLDivElement>(null);
  const exploring =
    museum.phase === "explore" && !museum.overlay && !museum.playing && !museum.seated && !museum.watching;
  const pool = museum.pool;
  const tv = museum.tv;
  const tvGame = GAMES[tv.game as ArcadeId];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Escape") return;
      if (getSnapshot().overlay) {
        event.preventDefault();
        closeOverlay();
      } else if (getSnapshot().playing) {
        event.preventDefault();
        stopPool();
      } else if (getSnapshot().seated) {
        event.preventDefault();
        stand();
      } else if (getSnapshot().watching) {
        event.preventDefault();
        stopWatching();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (museum.overlay) dialog.current?.focus();
  }, [museum.overlay]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-[#f4efe6]">
      {museum.phase === "gate" && !museum.overlay && (
        <div className="pointer-events-auto absolute inset-0 bg-gradient-to-t from-[#0c0b09]/95 via-[#0c0b09]/35 to-transparent">
          <div className="absolute right-0 bottom-0 left-0 p-6 sm:p-10 md:p-14">
            <p className="text-xs uppercase tracking-[0.42em] text-accent">Night loft</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-light tracking-tight sm:text-7xl">
              Albaz Aqther
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              You walk it yourself. The living room is ahead, and the career gallery,
              with the project wall, is through the back. The game room is on the left,
              and its arcade machines are real, so you can play them.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={!museum.ready}
                onClick={() => {
                  requestLookLock();
                  if (prefersReducedMotion()) {
                    queueTeleport(ENTER_POSE);
                    return;
                  }
                  setPhase("entering");
                }}
                className="border border-accent bg-accent/10 px-6 py-3 text-sm uppercase tracking-[0.22em] text-accent transition-colors hover:bg-accent hover:text-[#1a140c] disabled:cursor-wait disabled:opacity-50"
              >
                {museum.ready ? "Come inside" : "Opening the door"}
              </button>
              <button
                type="button"
                onClick={() => openOverlay({ type: "index" })}
                className="px-2 py-3 text-sm text-white/60 hover:text-white"
              >
                Skip to a room
              </button>
            </div>
            <p className="mt-6 hidden text-xs tracking-wide text-white/45 sm:block">
              WASD to walk · mouse to look around · E to read · Shift to hurry
            </p>
          </div>
        </div>
      )}

      {museum.phase === "entering" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <button
            type="button"
            onClick={() => requestSkipEnter()}
            className="pointer-events-auto border border-white/20 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/80"
          >
            Skip
          </button>
        </div>
      )}

      {museum.phase !== "gate" && (
        <>
          <div className="absolute top-5 left-5 sm:top-7 sm:left-7">
            <p className="text-[10px] uppercase tracking-[0.32em] text-accent">You are in</p>
            <p className="mt-1 text-lg font-light">{ROOMS[museum.zone].label}</p>
            {museum.chase.running && (
              <p className="mt-2 text-sm text-white/80">
                Light Chase · {museum.chase.found}/{museum.chase.total} · {Math.ceil(museum.chase.remaining)}s
              </p>
            )}
          </div>

          <div className="absolute top-5 right-5 flex flex-col items-end gap-2 sm:top-7 sm:right-7">
            <Minimap zone={museum.zone} />
            <button
              type="button"
              onClick={() => openOverlay({ type: "index" })}
              className="pointer-events-auto text-xs uppercase tracking-[0.22em] text-white/70 hover:text-accent"
            >
              Directory
            </button>
          </div>

          {exploring && (
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full border ${
                  museum.prompt ? "border-accent bg-accent/30" : "border-white/40"
                }`}
              />
              {museum.prompt && (
                <button
                  type="button"
                  onClick={() => {
                    input.interact = true;
                  }}
                  className="pointer-events-auto border border-white/15 bg-black/55 px-4 py-2 text-sm backdrop-blur-sm hover:border-accent"
                >
                  <span className="mr-2 text-accent">E</span>
                  {museum.prompt}
                </button>
              )}
            </div>
          )}

          {museum.playing && !museum.overlay && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center px-3">
              <div className="pointer-events-auto w-full max-w-xl border border-white/15 bg-black/60 px-5 py-4 backdrop-blur-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-accent">Billiards</p>
                  <p className="text-sm text-white/75">
                    Shots {pool.shots} · Left {pool.left}
                    {pool.best > 0 ? ` · Best ${pool.best}` : ""}
                  </p>
                </div>
                <p className="mt-2 text-sm text-white/85" aria-live="polite">
                  {pool.done
                    ? `Table cleared in ${pool.shots} shots.`
                    : pool.note ||
                      (museum.coarse
                        ? "Drag on the table to aim, further from the cue ball for a harder shot, and let go to shoot."
                        : "Point to aim, further from the cue ball for a harder shot, and click to shoot. Arrow keys and Space work too.")}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={(event) => {
                      // Focus goes back to the table, so Space takes a shot instead of pressing this again.
                      event.currentTarget.blur();
                      rerack();
                    }}
                    className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] hover:border-accent hover:text-accent"
                  >
                    Rack again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopPool();
                      requestLookLock();
                    }}
                    className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] hover:border-accent hover:text-accent"
                  >
                    Walk away{museum.coarse ? "" : " · Esc"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {museum.seated && !museum.overlay && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center px-3">
              <div className="pointer-events-auto w-full max-w-xl border border-white/15 bg-black/60 px-5 py-4 backdrop-blur-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-accent">Console</p>
                  <p className="text-sm text-white/75">
                    {tv.readout || "Ready"}
                    {tvGame.ranked && tv.best > 0 ? ` · Best ${tv.best}` : ""}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(Object.keys(GAMES) as ArcadeId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={tv.game === id}
                      onClick={(event) => {
                        event.currentTarget.blur();
                        tvPick(id);
                      }}
                      className={`border px-3 py-1.5 text-xs uppercase tracking-[0.18em] ${
                        tv.game === id
                          ? "border-accent text-accent"
                          : "border-white/20 text-white/75 hover:border-accent hover:text-accent"
                      }`}
                    >
                      {GAMES[id].title}
                    </button>
                  ))}
                </div>
                {museum.coarse ? (
                  <div className="mt-3 flex select-none items-center justify-between gap-3">
                    <div className="flex gap-2">
                      {tvGame.buttons
                        .filter((press) => press !== "fire")
                        .map((press) => (
                          <PadButton key={press} press={press} />
                        ))}
                    </div>
                    {tv.stage === "playing" && tvGame.buttons.includes("fire") ? (
                      <PadButton press="fire" />
                    ) : (
                      tv.stage !== "playing" && (
                        <button
                          type="button"
                          onClick={() => tvBegin()}
                          className="border border-accent px-4 py-2 text-xs uppercase tracking-[0.22em] text-accent"
                        >
                          {tv.stage === "over" ? "Play again" : "Start"}
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-white/85">
                    {tv.stage === "playing" ? tvGame.keys : "Press Space to start."} Esc to stand up.
                  </p>
                )}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      stand();
                      requestLookLock();
                    }}
                    className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] hover:border-accent hover:text-accent"
                  >
                    Stand up
                  </button>
                </div>
              </div>
            </div>
          )}

          {museum.watching && !museum.overlay && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center px-3">
              <div className="pointer-events-auto w-full max-w-xl border border-white/15 bg-black/60 px-5 py-4 backdrop-blur-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-accent">Television</p>
                  <p className="text-sm text-white/75" aria-live="polite">
                    Channel {museum.channel + 1} · {CHANNELS[museum.channel].name}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CHANNELS.map((channel, index) => (
                    <button
                      key={channel.name}
                      type="button"
                      aria-pressed={museum.channel === index}
                      onClick={(event) => {
                        event.currentTarget.blur();
                        tune(index);
                      }}
                      className={`border px-3 py-1.5 text-xs uppercase tracking-[0.18em] ${
                        museum.channel === index
                          ? "border-accent text-accent"
                          : "border-white/20 text-white/75 hover:border-accent hover:text-accent"
                      }`}
                    >
                      {index + 1} · {channel.name}
                    </button>
                  ))}
                </div>
                {!museum.coarse && (
                  <p className="mt-3 text-sm text-white/85">
                    Arrow keys or 1–{CHANNELS.length} to change channel. Esc to stand up.
                  </p>
                )}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      stopWatching();
                      requestLookLock();
                    }}
                    className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] hover:border-accent hover:text-accent"
                  >
                    Stand up
                  </button>
                </div>
              </div>
            </div>
          )}

          {exploring && !museum.coarse && (
            <div className="absolute bottom-6 left-6 hidden items-center gap-2 text-[11px] tracking-[0.18em] text-white/70 md:flex">
              <span className="border border-[#7ef6ff]/50 px-2 py-1 text-[#7ef6ff]">WASD</span>
              <span>MOVE</span>
              <span className="ml-2 border border-accent/50 px-2 py-1 text-accent">MOUSE</span>
              <span>LOOK</span>
              <span className="ml-2 border border-white/30 px-2 py-1">E</span>
              <span>READ</span>
            </div>
          )}

          {museum.coarse && exploring && (
            <>
              <LookPad />
              <Joystick />
            </>
          )}
        </>
      )}

      {museum.overlay && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-black/45 p-3 sm:items-center sm:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeOverlay();
          }}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="max-h-[min(82vh,820px)] w-full max-w-2xl overflow-y-auto border border-white/10 bg-[#12110e]/95 p-6 shadow-2xl backdrop-blur-md outline-none sm:p-10"
          >
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => closeOverlay()}
                className="text-xs uppercase tracking-[0.22em] text-white/60 hover:text-accent"
              >
                Close
              </button>
            </div>
            <Placard overlay={museum.overlay} />
          </div>
        </div>
      )}
    </div>
  );
}
