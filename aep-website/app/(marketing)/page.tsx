"use client";

import React, { useState, useEffect } from "react";
import DynamicOrb from "@/components/orb/DynamicOrb";
import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import Difference from "@/components/marketing/Difference";
import TechStack from "@/components/marketing/TechStack";
import Footer from "@/components/marketing/Footer";
import { EMOTIONS } from "@/lib/emotions";

export default function Home() {
  const [emotionIndex, setEmotionIndex] = useState<number>(0);

  // 3.8 second relaxed emotion rotation interval
  useEffect(() => {
    const timer = setInterval(() => {
      setEmotionIndex((prev) => (prev + 1) % EMOTIONS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const currentEmotion = EMOTIONS[emotionIndex];

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Fixed 3D Particle Orb Background - Centered across entire page */}
      <DynamicOrb
        targetValence={currentEmotion.valence}
        targetArousal={currentEmotion.arousal}
      />

      {/* Page Content Layers with Refined Breather Gaps */}
      <div className="relative z-10">
        <Navbar />
        <Hero currentEmotion={currentEmotion} />

        {/* Compact 15vh Breather Gap between Hero and HowItWorks */}
        <div className="h-[15vh] w-full pointer-events-none" />

        <HowItWorks />

        {/* 20vh Breather Gap */}
        <div className="h-[20vh] w-full pointer-events-none" />

        <Difference />

        {/* 20vh Breather Gap */}
        <div className="h-[20vh] w-full pointer-events-none" />

        <TechStack />
        <Footer />
      </div>
    </main>
  );
}
