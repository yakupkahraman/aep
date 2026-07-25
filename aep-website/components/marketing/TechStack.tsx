"use client";

import React from "react";
import { motion } from "framer-motion";

const technologies = [
  {
    name: "Gemma-2-2B Custom ML",
    description: "Recompiled with MLC LLM to return layer-22 residual stream activations alongside logits.",
  },
  {
    name: "CUDA Acceleration",
    description: "Low-latency activation probe execution on NVIDIA VRAM.",
  },
  {
    name: "Go Hexagonal Backend",
    description: "Masterfabric-go service handling authentication, metrics, and stream proxying.",
  },
  {
    name: "SSE Protocol",
    description: "Unbuffered Server-Sent Events delivering token and emotion frames live.",
  },
  {
    name: "Docker Stack",
    description: "Self-hosted Docker Compose infrastructure with Caddy load balancing.",
  },
  {
    name: "Prometheus & Grafana",
    description: "Real-time metrics dashboard tracking valence distribution and token throughput.",
  },
];

export default function TechStack() {
  return (
    <section
      id="technical-summary"
      className="relative py-20 z-10 bg-[var(--bg-semi)] transition-colors duration-300 border-t border-b border-[var(--border)]"
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header (Cols 1-6, mb-16) */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-[11px] font-sans font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500"
            >
              TECHNICAL SUMMARY
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight font-space text-zinc-900 dark:text-white"
            >
              Technical summary
            </motion.h2>
          </div>
        </div>

        {/* Technical Items Row List restricted to Left Half (Cols 1-8), leaving Cols 9-12 open for background orb */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-b border-zinc-200 dark:border-zinc-800">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="py-4 grid grid-cols-1 sm:grid-cols-8 items-start sm:items-center gap-2 sm:gap-4"
              >
                {/* Tech Name: Cols 1-3 */}
                <div className="sm:col-span-3">
                  <span className="font-medium text-sm text-zinc-900 dark:text-white font-space">
                    {tech.name}
                  </span>
                </div>

                {/* Tech Description: Cols 4-8 */}
                <div className="sm:col-span-5">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                    {tech.description}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
