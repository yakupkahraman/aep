"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleOrbProps {
  isDarkMode: boolean;
  isReducedMotion: boolean;
  targetValence: number;
  targetArousal: number;
  dimmed?: boolean;
}

// 4-Quadrant Circumplex Color Anchors for Bilinear Interpolation
const C_ANGRY = new THREE.Color("#ff1744");     // Top-Left (-V, +A): Pure Fiery Blood Red
const C_DELIGHTED = new THREE.Color("#38bdf8"); // Top-Right (+V, +A): Cyan Blue
const C_SAD = new THREE.Color("#475569");       // Bottom-Left (-V, -A): Neutral Dark Slate (no purple bleed)
const C_CALM = new THREE.Color("#2dd4bf");      // Bottom-Right (+V, -A): Sage Teal

// Reusable scratch colors for zero-allocation bilinear lerp
const topColorScratch = new THREE.Color();
const botColorScratch = new THREE.Color();

// Continuous Bilinear 2D Emotion Color Evaluator (Zero Allocations)
function getEmotionColor(valence: number, arousal: number, outColor: THREE.Color): void {
  const v = Math.max(0, Math.min(1, (valence + 1) / 2));
  const a = Math.max(0, Math.min(1, arousal));

  topColorScratch.lerpColors(C_ANGRY, C_DELIGHTED, v);
  botColorScratch.lerpColors(C_SAD, C_CALM, v);

  outColor.lerpColors(botColorScratch, topColorScratch, a);
}

export function ParticleOrb({
  isDarkMode,
  isReducedMotion,
  targetValence,
  targetArousal,
  dimmed = false,
}: ParticleOrbProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const posAttrRef = useRef<THREE.BufferAttribute>(null!);
  const colorAttrRef = useRef<THREE.BufferAttribute>(null!);

  const rotationYRef = useRef<number>(0);
  const breathPhaseRef = useRef<number>(0);

  const currentValenceRef = useRef<number>(targetValence);
  const currentArousalRef = useRef<number>(targetArousal);
  const currentScaleRef = useRef<number>(dimmed ? 2.5 : 1.0);

  // Performance tracking refs for color updates
  const lastValenceRef = useRef<number>(-999);
  const lastArousalRef = useRef<number>(-999);
  const activeEmotionColorRef = useRef<THREE.Color>(new THREE.Color());

  const [count, setCount] = useState<number>(5000);

  // Debounced responsive particle count listener (200ms threshold check)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        setCount((prev) => {
          const target = isMobile ? 2000 : 5000;
          return prev !== target ? target : prev;
        });
      }, 200);
    };

    if (window.innerWidth < 768) {
      setCount(2000);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Pre-generate base sphere position and jitter arrays (base radius 0.95)
  const { basePositions, initialPositions, initialColors, jitterArray } = useMemo(() => {
    const baseRadius = 0.95;
    const basePos = new Float32Array(count * 3);
    const initPos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const jitters = new Float32Array(count);

    const initColor = new THREE.Color();
    getEmotionColor(0.8, 0.7, initColor);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = baseRadius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      basePos[i * 3] = x;
      basePos[i * 3 + 1] = y;
      basePos[i * 3 + 2] = z;

      initPos[i * 3] = x;
      initPos[i * 3 + 1] = y;
      initPos[i * 3 + 2] = z;

      jitters[i] = 0.9 + Math.random() * 0.2;

      const normZ = z / baseRadius;
      const depthFactor = 0.8 + (normZ + 1.0) * 0.2;

      // High contrast saturation multiplier for light mode readability
      const colMultiplier = isDarkMode ? 1.0 : 1.15;

      let red = initColor.r * depthFactor * jitters[i] * colMultiplier;
      let green = initColor.g * depthFactor * jitters[i] * colMultiplier;
      let blue = initColor.b * depthFactor * jitters[i] * colMultiplier;

      cols[i * 3] = Math.min(1.0, red);
      cols[i * 3 + 1] = Math.min(1.0, green);
      cols[i * 3 + 2] = Math.min(1.0, blue);
    }

    return {
      basePositions: basePos,
      initialPositions: initPos,
      initialColors: cols,
      jitterArray: jitters,
    };
  }, [count, isDarkMode]);

  // Frame animation loop: Positions updated per-frame; Colors updated with continuous LERP
  useFrame((_, delta) => {
    if (isReducedMotion) return;

    // Smooth continuous LERP for valence & arousal target parameters (~2.2s transition)
    currentValenceRef.current += (targetValence - currentValenceRef.current) * 0.02;
    currentArousalRef.current += (targetArousal - currentArousalRef.current) * 0.02;

    const val = currentValenceRef.current;
    const ar = Math.max(0, Math.min(1, currentArousalRef.current));

    // Smooth scale LERP for large chat mode expansion (scale 2.5 in chat vs 1.0 normal)
    const targetScale = dimmed ? 2.5 : 1.0;
    currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.04;

    // Arousal motion dynamics
    const breathSpeed = 0.75 + (1.75 - 0.75) * ar;
    const breathIntensity = 0.10 + (0.22 - 0.10) * ar;
    const rotationSpeed = 0.10 + (0.30 - 0.10) * ar;

    // Incrementally accumulate phases
    breathPhaseRef.current += delta * breathSpeed * 0.9;
    rotationYRef.current += delta * rotationSpeed;

    const phase = breathPhaseRef.current;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = rotationYRef.current;
      pointsRef.current.scale.setScalar(currentScaleRef.current);
    }

    const baseRadius = 0.95;

    // 1. POSITION UPDATES (per-frame organic radial breathing)
    if (posAttrRef.current) {
      const posArr = posAttrRef.current.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = basePositions[i3];
        const y = basePositions[i3 + 1];
        const z = basePositions[i3 + 2];

        const breath = 1 + Math.sin(phase + i * 0.1) * breathIntensity;

        posArr[i3] = x * breath;
        posArr[i3 + 1] = y * breath;
        posArr[i3 + 2] = z * breath;
      }
      posAttrRef.current.needsUpdate = true;
    }

    // 2. COLOR UPDATES (Silky continuous 2D bilinear LERP)
    const dVal = Math.abs(val - lastValenceRef.current);
    const dArousal = Math.abs(ar - lastArousalRef.current);

    if ((dVal > 0.002 || dArousal > 0.002) && colorAttrRef.current) {
      lastValenceRef.current = val;
      lastArousalRef.current = ar;

      getEmotionColor(val, ar, activeEmotionColorRef.current);

      const targetR = activeEmotionColorRef.current.r;
      const targetG = activeEmotionColorRef.current.g;
      const targetB = activeEmotionColorRef.current.b;
      
      // Crisp contrast color multiplier in light mode to prevent washed-out particles
      const colMultiplier = isDarkMode ? 1.0 : 1.15;

      const colArr = colorAttrRef.current.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const z = basePositions[i3 + 2];
        const normZ = z / baseRadius;
        const depthFactor = 0.8 + (normZ + 1.0) * 0.2;
        const jitter = jitterArray[i];

        const factor = depthFactor * jitter * colMultiplier;

        colArr[i3] = Math.min(1.0, targetR * factor);
        colArr[i3 + 1] = Math.min(1.0, targetG * factor);
        colArr[i3 + 2] = Math.min(1.0, targetB * factor);
      }

      colorAttrRef.current.needsUpdate = true;
    }
  });

  // Enhanced Light Mode opacity (0.58 in light chat mode vs 0.40 dark chat mode)
  const targetOpacity = dimmed
    ? isDarkMode
      ? 0.40
      : 0.58
    : isDarkMode
    ? 0.94
    : 0.88;

  const particleSize = dimmed ? 0.017 : 0.018;

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          ref={posAttrRef}
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
        <bufferAttribute
          ref={colorAttrRef}
          attach="attributes-color"
          args={[initialColors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={targetOpacity}
        depthTest={false}
        blending={isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}
