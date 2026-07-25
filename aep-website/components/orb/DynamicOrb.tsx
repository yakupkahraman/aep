"use client";

import dynamic from "next/dynamic";

interface DynamicOrbProps {
  targetValence?: number;
  targetArousal?: number;
  dimmed?: boolean;
}

const DynamicOrbCanvas = dynamic(() => import("./ParticleOrbCanvas"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

export default function DynamicOrb({
  targetValence = 0,
  targetArousal = 0.5,
  dimmed = false,
}: DynamicOrbProps) {
  return (
    <DynamicOrbCanvas
      targetValence={targetValence}
      targetArousal={targetArousal}
      dimmed={dimmed}
    />
  );
}
