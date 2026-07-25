"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleOrb } from "./ParticleOrb";
import { getEmotionHex } from "@/lib/emotions";

interface ParticleOrbCanvasProps {
  targetValence: number;
  targetArousal: number;
  dimmed?: boolean;
}

export default function ParticleOrbCanvas({
  targetValence,
  targetArousal,
  dimmed = false,
}: ParticleOrbCanvasProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    setMounted(true);

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkQuery.matches);
    const handleDarkChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkQuery.addEventListener("change", handleDarkChange);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      darkQuery.removeEventListener("change", handleDarkChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  if (!mounted) return null;

  // Active emotion hex color for enhanced dynamic ambient backdrop halo
  const activeColorHex = getEmotionHex(targetValence, targetArousal);
  
  // High contrast backdrop halo opacity in light mode during chat
  const opacityAlpha = dimmed
    ? isDarkMode ? "28" : "38"
    : isDarkMode ? "38" : "32";
  const outerAlpha = dimmed
    ? isDarkMode ? "0b" : "0e"
    : isDarkMode ? "15" : "12";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center transition-opacity duration-700"
    >
      {/* Dynamic ambient backdrop shadow/glow scaling up in chat mode (1800px) */}
      <div
        className={`absolute rounded-full pointer-events-none transition-all duration-700 ease-out ${
          dimmed
            ? "w-[1200px] h-[1200px] sm:w-[1800px] sm:h-[1800px]"
            : "w-[680px] h-[680px] sm:w-[820px] sm:h-[820px]"
        }`}
        style={{
          background: `radial-gradient(circle at center, ${activeColorHex}${opacityAlpha} 0%, ${activeColorHex}${outerAlpha} 45%, transparent 75%)`,
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 4], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ParticleOrb
          isDarkMode={isDarkMode}
          isReducedMotion={isReducedMotion}
          targetValence={targetValence}
          targetArousal={targetArousal}
          dimmed={dimmed}
        />
      </Canvas>
    </div>
  );
}
