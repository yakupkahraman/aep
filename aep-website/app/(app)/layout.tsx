"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/");
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  if (!token) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  return <>{children}</>;
}
