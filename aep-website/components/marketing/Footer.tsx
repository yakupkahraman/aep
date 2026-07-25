"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="relative py-16 z-10 bg-[var(--background)] transition-colors duration-300 border-t border-[var(--border)]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center text-xs font-sans font-medium text-zinc-500 dark:text-zinc-400">
        {/* Left Side: Name / Attribution (Cols 1-6) */}
        <div className="lg:col-span-6">
          <span className="font-bold text-zinc-900 dark:text-white">AEP</span> &mdash; Yakup Kahraman
        </div>

        {/* Right Side: Interactive Navigation Links (Cols 7-12) */}
        <div className="lg:col-span-6 flex flex-wrap items-center lg:justify-end gap-6">
          <a
            href="https://github.com/yakupkahraman/aep"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-white hover:underline underline-offset-4 transition-all duration-150"
          >
            GitHub Repository
          </a>
          <a
            href="https://aep.yakupkahraman.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-white hover:underline underline-offset-4 transition-all duration-150"
          >
            aep.yakupkahraman.com
          </a>
        </div>
      </div>
    </footer>
  );
}
