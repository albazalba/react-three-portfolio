"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  ENTER_POSE,
  EYE_HEIGHT,
  GATE_POSE,
  LIVING_TV,
  LOUNGE,
  POOL_TABLE,
  TV_SCREEN,
  moveWithCollision,
  nearestSpot,
  zoneAt,
} from "./layout";
import {
  consumeSkipEnter,
  consumeTeleport,
  getChaseClock,
  getSnapshot,
  input,
  openOverlay,
  prefersReducedMotion,
  publishPose,
  releaseLookLock,
  requestLookLock,
  requestSkipEnter,
  setPhase,
  setPrompt,
  setZone,
  sit,
  startChase,
  startPool,
  watch,
} from "./store";

const euler = new THREE.Euler(0, 0, 0, "YXZ");
const poolEye = new THREE.Vector3();
const poolAim = new THREE.Vector3();
const poolTurn = new THREE.Quaternion();
const poolFrame = new THREE.Matrix4();
const UP = new THREE.Vector3(0, 1, 0);
const right = new THREE.Vector3();
const forward = new THREE.Vector3();

function applyLook(dx: number, dy: number) {
  euler.y -= dx * 0.0022;
  euler.x -= dy * 0.0022;
  euler.x = Math.max(-1.15, Math.min(1.15, euler.x));
}

function placeEyes(camera: THREE.Camera, x: number, z: number) {
  camera.position.set(x, EYE_HEIGHT, z);
  camera.quaternion.setFromEuler(euler);
}

export default function Player() {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const keys = useRef<Record<string, boolean>>({});
  const position = useRef(new THREE.Vector3(GATE_POSE.x, EYE_HEIGHT, GATE_POSE.z));
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const enterStart = useRef<number | null>(null);
  // How far the camera has leaned over the billiards table or settled on a sofa, and which.
  const lean = useRef(0);
  const poolSide = useRef(1);
  const view = useRef<"pool" | "seat" | "couch">("pool");

  useEffect(() => {
    const dom = gl.domElement;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      keys.current[event.code] = true;
      if (
        event.code === "KeyW" ||
        event.code === "KeyA" ||
        event.code === "KeyS" ||
        event.code === "KeyD" ||
        event.code === "Space" ||
        event.code.startsWith("Arrow")
      ) {
        event.preventDefault();
      }
      if ((event.code === "KeyE" || event.code === "Space") && !event.repeat) {
        input.interact = true;
      }
      if (getSnapshot().phase === "entering") requestSkipEnter();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.current[event.code] = false;
    };
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== dom) return;
      const snap = getSnapshot();
      if (snap.phase !== "explore" || snap.overlay) return;
      applyLook(event.movementX, event.movementY);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const snap = getSnapshot();
      if (snap.phase !== "explore" || snap.overlay || snap.playing || snap.seated || snap.watching) return;
      if (document.pointerLockElement !== dom && !snap.coarse) requestLookLock();
      if (document.pointerLockElement === dom) return;
      dragging.current = true;
      lastPointer.current.x = event.clientX;
      lastPointer.current.y = event.clientY;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging.current || document.pointerLockElement === dom) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current.x = event.clientX;
      lastPointer.current.y = event.clientY;
      applyLook(dx, dy);
    };
    const onPointerUp = () => {
      dragging.current = false;
    };

    const clearKeys = () => {
      keys.current = {};
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("blur", clearKeys);
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("blur", clearKeys);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [camera, gl]);

  useFrame((state, deltaTime) => {
    const delta = Math.min(deltaTime, 0.05);
    const snap = getSnapshot();
    const now = state.clock.elapsedTime;

    const jump = consumeTeleport();
    if (jump) {
      position.current.set(jump.x, EYE_HEIGHT, jump.z);
      euler.set(-0.12, jump.yaw, 0, "YXZ");
      camera.quaternion.setFromEuler(euler);
      enterStart.current = null;
    }

    if (snap.phase === "gate") {
      const sway = prefersReducedMotion() ? 0 : Math.sin(state.clock.elapsedTime * 0.18) * 0.28;
      position.current.set(GATE_POSE.x + sway, EYE_HEIGHT, GATE_POSE.z);
      camera.position.copy(position.current);
      euler.set(-0.05, sway * 0.04, 0, "YXZ");
      camera.quaternion.setFromEuler(euler);
      publishPose({ x: GATE_POSE.x, z: GATE_POSE.z, yaw: 0 }, now);
      return;
    }

    if (snap.phase === "entering") {
      if (consumeSkipEnter()) {
        position.current.set(ENTER_POSE.x, EYE_HEIGHT, ENTER_POSE.z);
        euler.set(-0.08, ENTER_POSE.yaw, 0, "YXZ");
        placeEyes(camera, ENTER_POSE.x, ENTER_POSE.z);
        enterStart.current = null;
        setPhase("explore");
        publishPose({ x: ENTER_POSE.x, z: ENTER_POSE.z, yaw: ENTER_POSE.yaw }, now);
        return;
      }
      if (enterStart.current === null) enterStart.current = state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - enterStart.current;
      const progress = Math.min(1, elapsed / 3.6);
      const eased = progress * progress * (3 - 2 * progress);
      const x = THREE.MathUtils.lerp(GATE_POSE.x, ENTER_POSE.x, eased);
      const z = THREE.MathUtils.lerp(GATE_POSE.z, ENTER_POSE.z, eased);
      const yaw = ENTER_POSE.yaw * eased;
      position.current.set(x, EYE_HEIGHT, z);
      euler.set(-0.08 * eased, yaw, 0, "YXZ");
      placeEyes(camera, x, z);
      publishPose({ x, z, yaw }, now);
      if (progress >= 1) {
        enterStart.current = null;
        setPhase("explore");
      }
      return;
    }

    if (input.lookX || input.lookY) {
      applyLook(input.lookX, input.lookY);
      input.lookX = 0;
      input.lookY = 0;
    }

    // Glides the camera between the visitor's eyes and a fixed view: down onto the billiards table, or a television from its sofa.
    const leanOver = () => {
      const held = snap.playing || snap.seated || snap.watching;
      if (held && lean.current === 0) {
        view.current = snap.watching ? "couch" : snap.seated ? "seat" : "pool";
        poolSide.current = position.current.z >= POOL_TABLE.z ? 1 : -1;
      }
      const toward = held ? 1 : 0;
      if (prefersReducedMotion()) lean.current = toward;
      else lean.current = THREE.MathUtils.clamp(lean.current + (toward ? delta : -delta) / 0.8, 0, 1);
      if (lean.current === 0) return;
      const aspect = state.size.width / state.size.height;
      if (view.current === "couch") {
        // Settled into the living room sofa. A narrow screen sits further back so the whole picture fits.
        const back = THREE.MathUtils.clamp(2.4 / aspect, 3.1, 6.2);
        poolEye.set(LIVING_TV.x, 1.3, LIVING_TV.z + back);
        // Aimed below the middle, so the picture sits above the remote's panel.
        poolAim.set(LIVING_TV.x, LIVING_TV.y - 0.32, LIVING_TV.z);
      } else if (view.current === "seat") {
        // Sitting forward on the sofa. A narrow screen sits further back so the whole television fits.
        const back = THREE.MathUtils.clamp(1.25 / aspect, 1.65, LOUNGE.z - TV_SCREEN.z);
        poolEye.set(TV_SCREEN.x, 1.22, TV_SCREEN.z + back);
        poolAim.set(TV_SCREEN.x, TV_SCREEN.y - 0.22, TV_SCREEN.z);
      } else if (aspect < 1) {
        // A tall screen looks down the length of the table from its west end.
        const back = Math.max(1, 0.62 / aspect);
        poolEye.set(POOL_TABLE.x - 1.55 - 0.65 * back, 1.2 + 1.1 * back, POOL_TABLE.z);
        poolAim.set(POOL_TABLE.x - 0.1, 0.78, POOL_TABLE.z);
      } else {
        const back = Math.max(1, 1.5 / aspect);
        poolEye.set(POOL_TABLE.x, 0.78 + 1.3 * back, POOL_TABLE.z + poolSide.current * 1.5 * back);
        poolAim.set(POOL_TABLE.x, 0.78, POOL_TABLE.z + poolSide.current * 0.22);
      }
      poolTurn.setFromRotationMatrix(poolFrame.lookAt(poolEye, poolAim, UP));
      const eased = lean.current * lean.current * (3 - 2 * lean.current);
      camera.position.lerp(poolEye, eased);
      camera.quaternion.slerp(poolTurn, eased);
    };

    if (snap.overlay || snap.playing || snap.seated || snap.watching) {
      input.interact = false;
      placeEyes(camera, position.current.x, position.current.z);
      leanOver();
      publishPose(
        { x: position.current.x, z: position.current.z, yaw: euler.y },
        now,
      );
      return;
    }

    const keyForward =
      (keys.current.KeyW || keys.current.ArrowUp ? 1 : 0) -
      (keys.current.KeyS || keys.current.ArrowDown ? 1 : 0);
    const keyStrafe =
      (keys.current.KeyD || keys.current.ArrowRight ? 1 : 0) -
      (keys.current.KeyA || keys.current.ArrowLeft ? 1 : 0);
    let moveForward = keyForward + input.forward;
    let moveStrafe = keyStrafe + input.strafe;
    const length = Math.hypot(moveForward, moveStrafe);
    if (length > 1) {
      moveForward /= length;
      moveStrafe /= length;
    }

    const sprint = keys.current.ShiftLeft || keys.current.ShiftRight || input.sprint;
    const speed = sprint ? 6.5 : 3.65;
    const yaw = euler.y;
    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, -Math.sin(yaw));

    const dx = (right.x * moveStrafe + forward.x * moveForward) * speed * delta;
    const dz = (right.z * moveStrafe + forward.z * moveForward) * speed * delta;
    const next = moveWithCollision(position.current.x, position.current.z, dx, dz);
    position.current.x = next.x;
    position.current.z = next.z;
    placeEyes(camera, position.current.x, position.current.z);
    leanOver();

    publishPose({ x: position.current.x, z: position.current.z, yaw }, now);
    setZone(zoneAt(position.current.x, position.current.z));

    const spot = nearestSpot(position.current.x, position.current.z);
    const chasing = getChaseClock().running;
    if (spot && !(chasing && spot.action.type === "chase")) {
      setPrompt(spot.id, spot.prompt);
    } else {
      setPrompt(null, null);
    }

    if (input.interact) {
      input.interact = false;
      if (!spot) return;
      if (spot.action.type === "chase") {
        if (!chasing) startChase();
        return;
      }
      if (spot.action.type === "billiards") {
        releaseLookLock();
        startPool();
        return;
      }
      if (spot.action.type === "console") {
        releaseLookLock();
        sit();
        return;
      }
      if (spot.action.type === "television") {
        releaseLookLock();
        watch();
        return;
      }
      releaseLookLock();
      openOverlay(spot.action);
    }
  });

  return null;
}
