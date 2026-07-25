"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (prompt: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export default function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height up to 6 lines (~144px)
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    const newHeight = Math.min(textareaRef.current.scrollHeight, 144);
    textareaRef.current.style.height = `${newHeight}px`;
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) {
      onStop();
      return;
    }

    const trimmed = prompt.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Gemini-style Pill Input Container (Zinc neutral gray) */}
      <div className="relative flex items-center w-full rounded-[28px] border border-zinc-300 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 py-2.5 shadow-xl transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Ask GemmaAEP..."
          rows={1}
          className="w-full resize-none bg-transparent px-2 py-1 text-sm sm:text-base text-zinc-900 dark:text-[#e3e3e3] placeholder:text-zinc-500 dark:placeholder:text-zinc-400 outline-none font-sans max-h-36 scrollbar-none"
        />

        <div className="pl-2 shrink-0">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generation"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              aria-label="Send message"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Gemini-style Bottom Small Disclaimer Note */}
      <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 pt-2 font-sans select-none">
        Gemma-2-AEP reads neural activations directly from layer 22. Model outputs may vary.
      </p>
    </div>
  );
}
