"use client";

import { useEffect, useRef } from "react";

type MangaStroke = {
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  phase: number;
  speed: number;
  color: "ink" | "blue" | "red";
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function getStrokeCount(width: number, height: number) {
  if (width < 768) {
    return Math.min(30, Math.max(20, Math.floor((width * height) / 13_000)));
  }

  return Math.min(72, Math.max(44, Math.floor((width * height) / 18_000)));
}

function createStrokes(count: number, width: number, height: number) {
  const random = createRandom(1707 + count + Math.round(width + height));

  return Array.from({ length: count }, (_, index): MangaStroke => {
    const accentRoll = random();

    return {
      x: random() * width,
      y: random() * height,
      angle: -0.7 + random() * 0.34,
      length: 26 + random() * Math.min(150, width * 0.16),
      width: 0.65 + random() * 1.4,
      phase: random(),
      speed: 0.025 + random() * 0.035,
      color:
        index % 17 === 0 || accentRoll > 0.95
          ? "red"
          : index % 9 === 0 || accentRoll > 0.82
            ? "blue"
            : "ink",
    };
  });
}

function strokeColor(color: MangaStroke["color"], opacity: number) {
  if (color === "blue") {
    return `rgba(151, 206, 76, ${opacity})`;
  }

  if (color === "red") {
    return `rgba(240, 225, 74, ${opacity})`;
  }

  return `rgba(190, 229, 253, ${opacity})`;
}

export function SignalNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasElement;

    const canvasContext = canvas.getContext("2d", { alpha: true });

    if (!canvasContext) {
      canvas.dataset.animationState = "unavailable";
      return;
    }

    const context: CanvasRenderingContext2D = canvasContext;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const pointer: PointerState = { active: false, x: 0, y: 0 };
    const background = canvas.parentElement;
    let strokes: MangaStroke[] = [];
    let width = 1;
    let height = 1;
    let dpr = 1;
    let isMobile = false;
    let reducedMotion = reducedMotionQuery.matches;
    let documentVisible = document.visibilityState === "visible";
    let inView = true;
    let frameId = 0;
    let frameCount = 0;

    function pointerEnabled() {
      return !isMobile && !coarsePointerQuery.matches && !reducedMotion;
    }

    function canAnimate() {
      return !reducedMotion && documentVisible && inView;
    }

    function setCanvasMetadata(animationState: string) {
      canvas.dataset.animationState = animationState;
      canvas.dataset.pointerFollow = pointerEnabled() ? "desktop" : "disabled";
      canvas.dataset.signalCount = String(strokes.length);
      canvas.dataset.dpr = String(Number(dpr.toFixed(2)));
    }

    function updateParallax() {
      if (!background || !pointerEnabled() || !pointer.active) {
        background?.style.setProperty("--mecha-shift-x", "0px");
        background?.style.setProperty("--mecha-shift-y", "0px");
        return;
      }

      const normalizedX = pointer.x / width - 0.5;
      const normalizedY = pointer.y / height - 0.5;
      background.style.setProperty(
        "--mecha-shift-x",
        `${(normalizedX * -10).toFixed(2)}px`,
      );
      background.style.setProperty(
        "--mecha-shift-y",
        `${(normalizedY * -7).toFixed(2)}px`,
      );
    }

    function updateScrollShift() {
      if (!background || isMobile || reducedMotion) {
        background?.style.setProperty("--mecha-scroll-y", "0px");
        return;
      }

      const rect = background.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      background.style.setProperty(
        "--mecha-scroll-y",
        `${(progress * 12).toFixed(2)}px`,
      );
    }

    function drawMangaStrokes(time: number) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.scale(dpr, dpr);
      context.lineCap = "square";

      const pointerInfluence = pointerEnabled() && pointer.active ? 1 : 0;

      for (const stroke of strokes) {
        const travel = ((time * stroke.speed * 0.001 + stroke.phase) % 1) - 0.5;
        const baseX = stroke.x + travel * 22;
        const baseY = stroke.y - travel * 12;
        const dx = pointer.x - baseX;
        const dy = pointer.y - baseY;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const attraction =
          pointerInfluence * Math.max(0, 1 - distance / 360) * 0.16;
        const pointerAngle = Math.atan2(dy, dx);
        const angle = stroke.angle * (1 - attraction) + pointerAngle * attraction;
        const pulse = 0.5 + Math.sin(time * 0.0014 + stroke.phase * 8) * 0.18;
        const opacity =
          stroke.color === "ink" ? 0.12 + pulse * 0.16 : 0.18 + pulse * 0.18;

        context.beginPath();
        context.moveTo(baseX, baseY);
        context.lineTo(
          baseX + Math.cos(angle) * stroke.length,
          baseY + Math.sin(angle) * stroke.length,
        );
        context.strokeStyle = strokeColor(stroke.color, opacity);
        context.lineWidth = stroke.width;
        context.stroke();
      }

      context.restore();
    }

    function stopLoop(animationState: string) {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }

      setCanvasMetadata(animationState);
      drawMangaStrokes(0);
    }

    function drawFrame(time: number) {
      if (!canAnimate()) {
        stopLoop(reducedMotion ? "reduced-motion" : "paused");
        return;
      }

      frameCount += 1;
      canvas.dataset.frameCount = String(frameCount);
      setCanvasMetadata("active");
      drawMangaStrokes(time);
      frameId = window.requestAnimationFrame(drawFrame);
    }

    function startLoop() {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(drawFrame);
      }
    }

    function updateLoopState() {
      if (canAnimate()) {
        setCanvasMetadata("active");
        startLoop();
      } else {
        stopLoop(reducedMotion ? "reduced-motion" : "paused");
      }
    }

    function syncSize() {
      const bounds = background?.getBoundingClientRect();
      width = Math.max(1, Math.floor(bounds?.width ?? canvas.clientWidth));
      height = Math.max(1, Math.floor(bounds?.height ?? canvas.clientHeight));
      isMobile = width < 768;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      strokes = createStrokes(getStrokeCount(width, height), width, height);
      frameCount = 0;
      canvas.dataset.frameCount = "0";
      updateParallax();
      updateScrollShift();
      drawMangaStrokes(0);
      updateLoopState();
    }

    function handlePointerMove(event: PointerEvent) {
      if (!pointerEnabled()) {
        pointer.active = false;
        updateParallax();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= rect.width &&
        pointer.y <= rect.height;
      updateParallax();
    }

    function handlePointerLeave() {
      pointer.active = false;
      updateParallax();
    }

    function handleVisibilityChange() {
      documentVisible = document.visibilityState === "visible";
      updateLoopState();
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      pointer.active = false;
      updateParallax();
      updateScrollShift();
      updateLoopState();
    }

    function handlePointerModeChange() {
      pointer.active = false;
      updateParallax();
      setCanvasMetadata(canAnimate() ? "active" : "paused");
    }

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(background ?? canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        updateLoopState();
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(canvas);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", updateScrollShift, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener("change", handleMotionChange);
    coarsePointerQuery.addEventListener("change", handlePointerModeChange);

    syncSize();

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", updateScrollShift);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener("change", handleMotionChange);
      coarsePointerQuery.removeEventListener("change", handlePointerModeChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-signal-canvas="true"
      data-animation-state="initializing"
      data-pointer-follow="disabled"
      data-signal-count="0"
      data-dpr="1"
      data-frame-count="0"
      className="lab-signal-canvas"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
