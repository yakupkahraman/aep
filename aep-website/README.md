# AEP — AI Emotion Protocol Landing Page

A single-page presentation landing website for **AEP (AI Emotion Protocol)** built with Next.js (App Router, TypeScript, Tailwind CSS) and React Three Fiber (Three.js).

## Overview

AEP (AI Emotion Protocol) taps the residual stream of an LLM at decoder layer 22 during inference, projecting neural activations onto learned valence and arousal emotion axes. This site presents the protocol's architecture, methodology, and technical specifications, accompanied by an interactive 3D breathing particle orb visualization.

## Features

- **3D Particle Orb**: Built with React Three Fiber. Features Fibonacci sphere distribution (~5,000 particles), continuous sine breathing, and organic mouse parallax.
- **System Theme Adaptability**: Operates strictly via `prefers-color-scheme`. Particle shader brightness, blending, and site typography automatically adapt to system Light and Dark themes.
- **Accessibility & Performance**: Detects `prefers-reduced-motion` to freeze/dampen particle movement. Targets 60 FPS with responsive particle scaling for mobile devices. `aria-hidden` applied to canvas visualizers.
- **Zero Config / Vercel Ready**: Static single-page landing site deployable to Vercel without requiring external API keys or environment variables.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation & Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

### Build & Production Test

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 16+ (App Router, TypeScript)
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Known Issues

- **THREE.Clock deprecation warning**: `@react-three/fiber` internally references `THREE.Clock`, which logs a non-breaking deprecation warning in Three.js v0.185+ console logs (`THREE.Clock: This module has been deprecated. Please use THREE.Timer instead`). This warning originates inside R3F's internal loop, does not affect application functionality, and will be resolved in future `@react-three/fiber` releases. Custom code relies strictly on `useFrame((_, delta) => ...)` without invoking `THREE.Clock`.

## License

MIT — Created by [Yakup Kahraman](https://aep.yakupkahraman.com).
