"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Activation capture",
    description:
      "The model's layer-22 residual stream is sampled during generation, reading hidden states every N tokens without interrupting inference.",
  },
  {
    number: "02",
    title: "Contrastive probe",
    description:
      "Extracted activations are projected onto learned valence and arousal emotion axes to calculate directional intensity.",
  },
  {
    number: "03",
    title: "Live stream",
    description:
      "Emotion readings stream alongside text tokens over an unbuffered Server-Sent Events (SSE) protocol.",
    hasCodeBlock: true,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 z-10 bg-[var(--bg-semi)] transition-colors duration-300 border-t border-b border-[var(--border)]"
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* 12-Column Grid: Header (Cols 1-5) and Timeline (Cols 6-12) side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Header Block (Cols 1-5) */}
          <div className="lg:col-span-5 space-y-2 sticky top-28">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-[11px] font-sans font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500"
            >
              ARCHITECTURE FLOW
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight font-space text-zinc-900 dark:text-white"
            >
              How it works
            </motion.h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm pt-2 leading-relaxed">
              Continuous residual extraction and contrastive probe scoring running token by token.
            </p>
          </div>

          {/* Timeline Block (Cols 6-12) - Starting right at Col 6 alongside the header */}
          <div className="lg:col-span-7 relative pl-6 sm:pl-8 border-l border-zinc-200 dark:border-zinc-800 space-y-14">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-700 border-2 border-[var(--background)] group-hover:bg-sky-500 transition-colors duration-150" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-bold font-space text-zinc-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-xl">
                    {step.description}
                  </p>

                  {/* Step 3 SSE Event Payload Code Block */}
                  {step.hasCodeBlock && (
                    <div className="pt-4 max-w-xl">
                      <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 font-sans font-semibold">
                          SSE Event Payload (`event: aep`)
                        </div>
                        <pre className="overflow-x-auto text-[11px]">
                          {`{
  "type": "aep",
  "frame": {
    "valence": +0.79,
    "arousal": 0.689,
    "dominant": "delighted",
    "layer": 22,
    "source": "probe"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
