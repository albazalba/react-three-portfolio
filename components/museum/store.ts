import { CHASE_SECONDS, type Action, type RoomId } from "./layout";

export type Phase = "gate" | "entering" | "explore";

export type Overlay = Action | null;

export type ChaseState = {
  running: boolean;
  found: number;
  total: number;
  remaining: number;
  collected: boolean[];
};

export type TvHud = { game: string; stage: "ready" | "playing" | "over"; readout: string; verdict: string; best: number };

export type PoolHud = { shots: number; left: number; best: number; done: boolean; note: string };

type Snapshot = {
  phase: Phase;
  overlay: Overlay;
  zone: RoomId;
  prompt: string | null;
  promptId: string | null;
  chase: ChaseState;
  ready: boolean;
  coarse: boolean;
  locked: boolean;
  /** True while the visitor is leaning over the billiards table. */
  playing: boolean;
  pool: PoolHud;
  /** True while the visitor is on the sofa in front of the television. */
  seated: boolean;
  tv: TvHud;
  /** True while the visitor is on the living room sofa watching the big television. */
  watching: boolean;
  channel: number;
};

export type Pose = { x: number; z: number; yaw: number };

export type Teleport = { x: number; z: number; yaw: number };

const emptyChase = (total: number): ChaseState => ({
  running: false,
  found: 0,
  total,
  remaining: 0,
  collected: Array.from({ length: total }, () => false),
});

let snapshot: Snapshot = {
  phase: "gate",
  overlay: null,
  zone: "foyer",
  prompt: null,
  promptId: null,
  chase: emptyChase(7),
  ready: false,
  coarse: false,
  locked: false,
  playing: false,
  pool: { shots: 0, left: 10, best: 0, done: false, note: "" },
  seated: false,
  tv: { game: "sunny", stage: "ready", readout: "", verdict: "", best: 0 },
  watching: false,
  channel: 0,
};

export const livePose: Pose = { x: 0, z: 22.4, yaw: 0 };
let pose: Pose = { x: 0, z: 22.4, yaw: 0 };
let lastPoseEmit = 0;
let skipEnter = false;
let teleport: Teleport | null = null;
let reducedMotion = false;

const listeners = new Set<() => void>();
const poseListeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return snapshot;
}

export function subscribePose(listener: () => void) {
  poseListeners.add(listener);
  return () => poseListeners.delete(listener);
}

export function getPose() {
  return pose;
}

export const input = {
  forward: 0,
  strafe: 0,
  lookX: 0,
  lookY: 0,
  sprint: false,
  interact: false,
};

export function setReady(ready: boolean) {
  if (snapshot.ready === ready) return;
  snapshot = { ...snapshot, ready };
  emit();
}

export function setCoarse(coarse: boolean) {
  if (snapshot.coarse === coarse) return;
  snapshot = { ...snapshot, coarse };
  emit();
}

export function setLocked(locked: boolean) {
  if (snapshot.locked === locked) return;
  snapshot = { ...snapshot, locked };
  emit();
}

export function setReducedMotion(value: boolean) {
  reducedMotion = value;
}

export function prefersReducedMotion() {
  return reducedMotion;
}

export function setPhase(phase: Phase) {
  if (snapshot.phase === phase) return;
  snapshot = { ...snapshot, phase };
  emit();
}

export function setZone(zone: RoomId) {
  if (snapshot.zone === zone) return;
  snapshot = { ...snapshot, zone };
  emit();
}

export function setPrompt(promptId: string | null, prompt: string | null) {
  if (snapshot.promptId === promptId && snapshot.prompt === prompt) return;
  snapshot = { ...snapshot, promptId, prompt };
  emit();
}

export function openOverlay(overlay: Action) {
  snapshot = { ...snapshot, overlay };
  emit();
}

export function sit() {
  if (snapshot.seated || snapshot.playing || snapshot.watching) return;
  snapshot = { ...snapshot, seated: true, prompt: null, promptId: null };
  emit();
}

export function stand() {
  if (!snapshot.seated) return;
  snapshot = { ...snapshot, seated: false };
  emit();
}

export function setTv(next: Partial<TvHud>) {
  snapshot = { ...snapshot, tv: { ...snapshot.tv, ...next } };
  emit();
}

export function startPool() {
  if (snapshot.playing || snapshot.seated || snapshot.watching) return;
  snapshot = { ...snapshot, playing: true, prompt: null, promptId: null };
  emit();
}

export function stopPool() {
  if (!snapshot.playing) return;
  snapshot = { ...snapshot, playing: false };
  emit();
}

export function setPool(next: Partial<PoolHud>) {
  snapshot = { ...snapshot, pool: { ...snapshot.pool, ...next } };
  emit();
}

export function watch() {
  if (snapshot.watching || snapshot.seated || snapshot.playing) return;
  snapshot = { ...snapshot, watching: true, prompt: null, promptId: null };
  emit();
}

export function stopWatching() {
  if (!snapshot.watching) return;
  snapshot = { ...snapshot, watching: false };
  emit();
}

export function setChannel(channel: number) {
  if (snapshot.channel === channel) return;
  snapshot = { ...snapshot, channel };
  emit();
}

export function closeOverlay() {
  if (!snapshot.overlay) return;
  snapshot = { ...snapshot, overlay: null };
  emit();
}

export function publishPose(next: Pose, now: number) {
  livePose.x = next.x;
  livePose.z = next.z;
  livePose.yaw = next.yaw;
  if (now - lastPoseEmit < 0.12) return;
  lastPoseEmit = now;
  pose = { x: next.x, z: next.z, yaw: next.yaw };
  poseListeners.forEach((listener) => listener());
}

export function requestSkipEnter() {
  skipEnter = true;
}

export function consumeSkipEnter() {
  const skip = skipEnter;
  skipEnter = false;
  return skip;
}

export function queueTeleport(next: Teleport) {
  teleport = next;
  chaseClock = {
    running: false,
    startedAt: 0,
    collected: Array.from({ length: chaseClock.collected.length }, () => false),
    frozenRemaining: null,
  };
  snapshot = {
    ...snapshot,
    overlay: null,
    playing: false,
    seated: false,
    watching: false,
    phase: "explore",
    chase: emptyChase(chaseClock.collected.length),
  };
  emit();
}

export function consumeTeleport() {
  const next = teleport;
  teleport = null;
  return next;
}

export function setChase(chase: ChaseState) {
  const previous = snapshot.chase;
  if (
    previous.running === chase.running &&
    previous.found === chase.found &&
    previous.remaining === chase.remaining &&
    previous.collected.every((value, index) => value === chase.collected[index])
  ) {
    return;
  }
  snapshot = { ...snapshot, chase };
  emit();
}

export function resetChase(total = snapshot.chase.total) {
  snapshot = { ...snapshot, chase: emptyChase(total) };
  emit();
}

export type ChaseClock = {
  running: boolean;
  startedAt: number;
  collected: boolean[];
  frozenRemaining: number | null;
};

let chaseClock: ChaseClock = {
  running: false,
  startedAt: 0,
  collected: Array.from({ length: 7 }, () => false),
  frozenRemaining: null,
};

export function getChaseClock() {
  return chaseClock;
}

export function startChase() {
  const total = 7;
  chaseClock = {
    running: true,
    startedAt: performance.now(),
    collected: Array.from({ length: total }, () => false),
    frozenRemaining: null,
  };
  snapshot = {
    ...snapshot,
    chase: {
      running: true,
      found: 0,
      total,
      remaining: CHASE_SECONDS,
      collected: chaseClock.collected,
    },
  };
  emit();
}

export function markChase(collected: boolean[], remaining: number, running: boolean) {
  chaseClock = { ...chaseClock, collected, running };
  setChase({
    running,
    found: collected.filter(Boolean).length,
    total: collected.length,
    remaining,
    collected,
  });
}

let canvas: HTMLCanvasElement | null = null;

export function bindCanvas(element: HTMLCanvasElement | null) {
  canvas = element;
}

export function requestLookLock() {
  if (snapshot.coarse || !canvas) return;
  const element = canvas as HTMLCanvasElement & {
    requestPointerLock?: (options?: { unadjustedMovement?: boolean }) => Promise<void> | void;
  };
  try {
    const result = element.requestPointerLock?.({ unadjustedMovement: true });
    if (result && typeof (result as Promise<void>).catch === "function") {
      void (result as Promise<void>).catch(() => undefined);
    }
  } catch {
    try {
      element.requestPointerLock?.();
    } catch {
      /* Drag-look remains available when the browser refuses the lock. */
    }
  }
}

export function releaseLookLock() {
  if (document.pointerLockElement) document.exitPointerLock();
}
