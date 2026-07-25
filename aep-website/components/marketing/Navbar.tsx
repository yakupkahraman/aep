"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "@/components/app/AuthModal";

export default function Navbar() {
  const { token } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleTryItClick = (e: React.MouseEvent) => {
    if (!token) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          {/* TOP-LEFT: AEP Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            <Image
              src="/aep-logo-black.svg"
              alt="AEP Logo"
              width={100}
              height={32}
              className="h-8 w-auto dark:hidden group-hover:opacity-90 transition-opacity duration-150"
              priority
            />
            <Image
              src="/aep-logo-white.svg"
              alt="AEP Logo"
              width={100}
              height={32}
              className="h-8 w-auto hidden dark:block group-hover:opacity-90 transition-opacity duration-150"
              priority
            />
          </Link>

          {/* TOP-RIGHT: Try It Button */}
          <Link
            href="/chat"
            onClick={handleTryItClick}
            className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs font-sans transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>Try It</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </header>

      {/* Auth Modal for unauthenticated users */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab="signin"
      />
    </>
  );
}
