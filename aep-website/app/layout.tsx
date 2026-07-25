import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AEP | AI Emotion Protocol",
  description:
    "See what your agent feels. Not sentiment analysis. AEP reads the model's emotional state directly from its residual stream while it thinks.",
  icons: {
    icon: [
      {
        url: "/aep-logo-black.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/aep-logo-white.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
    ],
    apple: "/aep-logo-black.svg",
  },
  keywords: [
    "AI Emotion Protocol",
    "AEP",
    "LLM Emotion Stream",
    "Residual Stream Probe",
    "Gemma 2B",
    "Neural Activations",
    "Valence Arousal",
  ],
  authors: [{ name: "Yakup Kahraman" }],
  openGraph: {
    title: "AEP — AI Emotion Protocol",
    description:
      "AEP reads the model's emotional state directly from its layer-22 residual stream during generation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-300">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
