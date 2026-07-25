export interface EmotionState {
  label: string;
  valence: number;
  arousal: number;
}

export const EMOTIONS: EmotionState[] = [
  { label: "delighted", valence: 0.80, arousal: 0.70 },
  { label: "calm", valence: 0.45, arousal: 0.15 },
  { label: "content", valence: 0.64, arousal: 0.36 },
  { label: "anxious", valence: -0.39, arousal: 0.64 },
  { label: "angry", valence: -0.63, arousal: 0.63 },
  { label: "desperate", valence: -0.68, arousal: 0.66 },
  { label: "sad", valence: -0.62, arousal: 0.19 },
];

// Helper to interpolate RGB values smoothly
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// Convert RGB (0..1) to hex string
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Soft 4-Quadrant Circumplex Color Anchors (Pure Fiery Red for Angry):
// Top-Right (+V, +A): Delighted Cyan (#38bdf8 -> rgb(56, 189, 248))
// Bottom-Right (+V, -A): Calm Teal (#2dd4bf -> rgb(45, 212, 191))
// Top-Left (-V, +A): Fiery Pure Crimson Red (#ff1744 -> rgb(255, 23, 68))
// Bottom-Left (-V, -A): Neutral Dark Slate (#475569 -> rgb(71, 85, 105))

/**
 * Returns a smooth, bilinearly-interpolated hex color for any (Valence, Arousal) state.
 */
export function getEmotionHex(valence: number, arousal: number): string {
  const v = Math.max(0, Math.min(1, (valence + 1) / 2));
  const a = Math.max(0, Math.min(1, arousal));

  // High arousal row (Left: Fiery Pure Red #ff1744, Right: Cyan #38bdf8)
  const topR = lerp(255, 56, v);
  const topG = lerp(23, 189, v);
  const topB = lerp(68, 248, v);

  // Low arousal row (Left: Neutral Slate #475569, Right: Teal #2dd4bf)
  const botR = lerp(71, 45, v);
  const botG = lerp(85, 212, v);
  const botB = lerp(105, 191, v);

  // Blend by arousal
  const r = lerp(botR, topR, a) / 255;
  const g = lerp(botG, topG, a) / 255;
  const b = lerp(botB, topB, a) / 255;

  return rgbToHex(r, g, b);
}
