"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Difference() {
  return (
    <section
      id="difference"
      className="relative py-20 z-10 bg-[var(--background)] transition-colors duration-300 border-t border-b border-[var(--border)]"
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header (Cols 8-12, Right-aligned, mb-16) */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 lg:col-start-8 text-right space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-[11px] font-sans font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500"
            >
              COMPARISON
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight font-space text-zinc-900 dark:text-white"
            >
              What makes it different
            </motion.h2>
          </div>
        </div>

        {/* 2-Column Comparison Grid (Left: Cols 1-6, Right: Cols 7-12, Staggered +80px down) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
          {/* Vertical Divider Between Column 6 & 7 */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 -translate-x-1/2" />

          {/* Left Column: Sentiment Analysis (Cols 1-6, Starts at top) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-4 lg:pr-6"
          >
            <div>
              <span className="text-xs font-sans font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                OUTWARD TEXT
              </span>
              <h3 className="text-xl font-bold font-space text-zinc-900 dark:text-white">
                Sentiment analysis
              </h3>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Sentiment analysis inspects generated output text after generation. Regardless of how polite or apologetic the chosen words are, the classifier measures surface phrasing alone.
            </p>

            <div className="pt-2">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 font-sans text-xs text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 block mb-1 font-semibold uppercase tracking-wider">Generated Output Text:</span>
                &ldquo;I am pleased to assist you with this issue.&rdquo;
                <div className="mt-2 text-zinc-500 text-[11px]">
                  Estimated Sentiment: <strong className="text-zinc-800 dark:text-zinc-200">Positive (+0.85)</strong>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: AEP Probe (Cols 7-12, Staggered 80px down) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 space-y-4 lg:pl-6 lg:mt-20"
          >
            <div>
              <span className="text-xs font-sans font-semibold tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
                INTERNAL ACTIVATION
              </span>
              <h3 className="text-xl font-bold font-space text-zinc-900 dark:text-white">
                AEP Probe
              </h3>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              AEP measures the model from the inside. Tapping residual vectors at layer 22 during computation reveals true cognitive activation, uncovering divergence between surface text and inner emotion.
            </p>

            <div className="pt-2">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 font-sans text-xs text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 block mb-1 font-semibold uppercase tracking-wider">Layer-22 Probe Reading:</span>
                Valence: <strong className="text-zinc-800 dark:text-zinc-200">-0.42 (High Strain)</strong> &bull; Arousal: <strong className="text-zinc-800 dark:text-zinc-200">0.81</strong>
                <div className="mt-2 text-sky-600 dark:text-sky-400 text-[11px]">
                  State: Anxious / Conflicted (Diverged from surface text)
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
