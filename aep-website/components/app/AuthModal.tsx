"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { registerApi, loginApi } from "@/lib/api-client";
import { Loader2, X } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

export default function AuthModal({
  open,
  onOpenChange,
  defaultTab = "signin",
}: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFieldErrors({});
    setServerError(null);
    setIsSubmitting(false);
  };

  const handleTabSwitch = (newTab: "signin" | "signup") => {
    setTab(newTab);
    setFieldErrors({});
    setServerError(null);
  };

  const validate = () => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (tab === "signup" && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (tab === "signup") {
        await registerApi(email.trim(), password);
        const loginRes = await loginApi(email.trim(), password);
        login(loginRes.token, loginRes.user);
        resetForm();
        onOpenChange(false);
        router.push("/chat");
      } else {
        const loginRes = await loginApi(email.trim(), password);
        login(loginRes.token, loginRes.user);
        resetForm();
        onOpenChange(false);
        router.push("/chat");
      }
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop overlay: dark opacity + soft blur */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal content container: max-w 400px centered */}
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-2xl transition-all duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {/* Close button */}
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <Dialog.Title className="sr-only">
            {tab === "signin" ? "Sign In" : "Sign Up"}
          </Dialog.Title>

          {/* Underline Tabs Header */}
          <div className="flex border-b border-[var(--border)] mb-6">
            <button
              type="button"
              onClick={() => handleTabSwitch("signin")}
              className={`pb-2.5 px-4 font-sans text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer ${
                tab === "signin"
                  ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                  : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch("signup")}
              className={`pb-2.5 px-4 font-sans text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer ${
                tab === "signup"
                  ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                  : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-4 text-xs font-sans text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-600 dark:focus:border-zinc-400 outline-none transition-colors"
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 pt-0.5">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-600 dark:focus:border-zinc-400 outline-none transition-colors"
              />
              {fieldErrors.password && (
                <p className="text-[11px] text-red-500 pt-0.5">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Sign up only) */}
            {tab === "signup" && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-600 dark:focus:border-zinc-400 outline-none transition-colors"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-red-500 pt-0.5">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Full-width Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-950 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : tab === "signin" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
