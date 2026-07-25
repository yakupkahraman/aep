"use client";

import React from "react";
import { AEPFrame } from "@/lib/api-client";

interface EmotionIndicatorProps {
  frame: AEPFrame | null;
}

export default function EmotionIndicator({ frame }: EmotionIndicatorProps) {
  if (!frame) return null;

  const valenceFormatted =
    frame.valence > 0 ? `+${frame.valence.toFixed(2)}` : frame.valence.toFixed(2);
  const arousalFormatted = frame.arousal.toFixed(2);

  return (
    <div className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50/90 dark:bg-zinc-950/90 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 backdrop-blur-xs flex items-center gap-3 shadow-xs select-none">
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-zinc-900 dark:text-white capitalize">
          {frame.dominant || "neutral"}
        </span>
      </div>
      <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
      <div>
        val: <span className="font-medium text-zinc-800 dark:text-zinc-200">{valenceFormatted}</span>
      </div>
      <div>
        aro: <span className="font-medium text-zinc-800 dark:text-zinc-200">{arousalFormatted}</span>
      </div>
    </div>
  );
}
