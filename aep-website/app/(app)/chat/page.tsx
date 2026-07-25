"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import DynamicOrb from "@/components/orb/DynamicOrb";
import { useAuth } from "@/lib/auth-context";
import { streamChat, AEPFrame } from "@/lib/api-client";
import ChatMessages, { Message } from "@/components/app/ChatMessages";
import ChatInput from "@/components/app/ChatInput";
import EmotionIndicator from "@/components/app/EmotionIndicator";

export default function ChatPage() {
  const { token, user, logout } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<AEPFrame | null>(null);

  // Background Orb emotion state (Neutral state: valence 0, arousal 0.4)
  const [targetValence, setTargetValence] = useState<number>(0);
  const [targetArousal, setTargetArousal] = useState<number>(0.4);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  const userFirstName = user?.first_name || user?.email?.split("@")[0] || "there";

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    userScrolledUpRef.current = !isAtBottom;
  };

  useEffect(() => {
    if (!userScrolledUpRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isStreaming]);

  const handleSend = (prompt: string) => {
    if (!token) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    streamChat({
      prompt,
      token,
      signal: abortController.signal,
      onToken: (textChunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + textChunk }
              : msg
          )
        );
      },
      onAEP: (frame) => {
        setCurrentFrame(frame);
        setTargetValence(frame.valence);
        setTargetArousal(frame.arousal);
      },
      onDone: () => {
        setIsStreaming(false);
        abortControllerRef.current = null;
      },
      onError: (errorMsg) => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content || `[Error: ${errorMsg}]`,
                }
              : msg
          )
        );
      },
    });
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <main className="relative h-screen flex flex-col justify-between overflow-hidden bg-[var(--background)]">
      {/* 3D Background Orb driven by live AEP emotion frames (Dimmed during active chat) */}
      <DynamicOrb
        targetValence={targetValence}
        targetArousal={targetArousal}
        dimmed={hasMessages}
      />

      {/* FIXED TOP BAR */}
      <header className="relative z-30 flex-none w-full bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] px-6 h-16 flex items-center justify-between">
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between">
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

          <div className="flex items-center gap-4 text-xs font-sans">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Floating Emotion State Indicator (Top Right) */}
      <div className="fixed top-20 right-6 z-30 pointer-events-none">
        <EmotionIndicator frame={currentFrame} />
      </div>

      {/* FULL-WIDTH SCROLL CONTAINER (Scrollbar sits at far right edge of screen) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative z-20 flex-1 w-full overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800"
      >
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 flex flex-col min-h-full pb-36">
          {!hasMessages ? (
            /* Perfectly balanced vertical placement (pt-16 sm:pt-22) */
            <div className="flex-1 flex flex-col items-center justify-start text-center space-y-3 pt-16 sm:pt-22 pb-12">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight font-space text-zinc-900 dark:text-white drop-shadow-sm"
              >
                Hello, {userFirstName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 max-w-md font-sans"
              >
                What should we talk about today?
              </motion.p>
            </div>
          ) : (
            <ChatMessages messages={messages} isStreaming={isStreaming} />
          )}
        </div>
      </div>

      {/* FLOATING CHATBOX FIXED AT THE BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-3 pt-2">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pointer-events-auto">
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </main>
  );
}
