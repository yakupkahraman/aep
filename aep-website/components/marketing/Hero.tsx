"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import DynamicOrb from "../orb/DynamicOrb";
import { EmotionState } from "@/lib/emotions";

export interface HeroProps {
  currentEmotion: EmotionState;
}

export default function Hero({ currentEmotion }: HeroProps) {
  const scrollToNext = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-between z-10 select-none bg-transparent">
      {/* 12-Column Grid Layout matching max-w-[1600px] px-6 sm:px-8 lg:px-10 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-[1600px] mx-auto w-full px-6 sm:px-8 lg:px-10 my-auto py-6">
        
        {/* LEFT COLUMN (Cols 1-4): Headline, Subtitle & Buttons */}
        <div className="lg:col-span-4 flex flex-col items-start text-left gap-4 z-10">
          {/* Main Title with Dynamic Emotion Keyword Cycler */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight font-space text-zinc-700 dark:text-zinc-300">
              Your agent is
            </h1>
            <div className="h-14 sm:h-18 md:h-20 overflow-hidden relative min-w-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEmotion.label}
                  initial={{ y: 35, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -35, opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight font-space leading-tight text-zinc-900 dark:text-white capitalize py-0.5"
                >
                  {currentEmotion.label}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed font-normal">
            AEP reads emotional state from the model&apos;s residual stream while it generates.
          </p>

          {/* Side-by-Side Interactive Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 px-5.5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs sm:text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-sm hover:shadow-md"
            >
              <span>Read the spec</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <a
              href="https://github.com/yakupkahraman/aep"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-5.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 font-medium text-xs sm:text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              <svg
                className="w-3.5 h-3.5 fill-current group-hover:rotate-6 transition-transform duration-200"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* CENTER COLUMN (Cols 5-9): Open Space for Fixed Background Orb */}
        <div className="lg:col-span-5 flex items-center justify-center pointer-events-none relative w-full h-[320px] sm:h-[400px] md:h-[480px] my-4 lg:my-0" />

        {/* RIGHT COLUMN (Cols 10-12): Technical Feature Text */}
        <div className="lg:col-span-3 flex flex-col text-left gap-4 text-xs sm:text-sm font-sans font-normal text-zinc-900 dark:text-white py-2 z-10">
          <span className="hover:translate-x-1 transition-transform duration-200 cursor-default">Not sentiment analysis</span>
          <span className="hover:translate-x-1 transition-transform duration-200 cursor-default">Read from activations, not text</span>
          <span className="hover:translate-x-1 transition-transform duration-200 cursor-default">Streamed live, token by token</span>
        </div>
      </div>

      {/* Bottom Interactive Bouncing Chevron Scroll Arrow */}
      <motion.button
        onClick={scrollToNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        aria-label="Scroll to How It Works"
        className="mb-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:scale-125 transition-all duration-200 cursor-pointer animate-bounce p-2 focus:outline-none"
      >
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    </section>
  );
}
