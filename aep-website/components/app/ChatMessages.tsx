"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
}

export default function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  return (
    <div className="flex-1 w-full py-6 space-y-7">
      {messages.map((msg, idx) => {
        const isLastAssistant =
          msg.role === "assistant" && idx === messages.length - 1;

        return (
          <div
            key={msg.id}
            className={`flex w-full ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "user" ? (
              /* Gemini-style User Pill Bubble (Zinc neutral dark gray) */
              <div className="bg-zinc-200/90 dark:bg-[#1e1f20] text-zinc-900 dark:text-[#e3e3e3] px-5 py-3 rounded-[24px] text-sm sm:text-base max-w-[80%] sm:max-w-[70%] font-sans leading-relaxed shadow-xs whitespace-pre-wrap border border-zinc-300/50 dark:border-zinc-800/60">
                {msg.content}
              </div>
            ) : (
              /* Gemini-style Assistant Response */
              <div className="text-zinc-900 dark:text-[#e3e3e3] text-sm sm:text-[15px] leading-relaxed max-w-[95%] sm:max-w-[90%] font-sans pt-1">
                {msg.content ? (
                  <div className="markdown-body">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-3.5 last:mb-0 leading-relaxed">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-zinc-900 dark:text-white">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg sm:text-xl font-bold font-space text-zinc-900 dark:text-white mt-5 mb-2.5">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base sm:text-lg font-bold font-space text-zinc-900 dark:text-white mt-4 mb-2">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm sm:text-base font-bold font-space text-zinc-900 dark:text-white mt-3 mb-1.5">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 my-2.5 space-y-1.5">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 my-2.5 space-y-1.5">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed pl-0.5">{children}</li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-3.5 my-3 text-zinc-600 dark:text-zinc-400 italic">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-500 hover:underline underline-offset-2"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const isInline = !match && !String(children).includes("\n");

                          return isInline ? (
                            <code
                              className="font-mono text-[12px] sm:text-xs bg-zinc-200/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-zinc-900 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/60"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <pre className="font-mono text-xs sm:text-[13px] bg-zinc-900 text-zinc-100 dark:bg-[#141415] dark:text-zinc-200 p-4 rounded-xl border border-zinc-800 dark:border-zinc-800/80 my-3.5 overflow-x-auto leading-relaxed shadow-xs">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {isStreaming && isLastAssistant && (
                      <span className="inline-block w-2 h-4 bg-sky-500 animate-pulse ml-1 translate-y-0.5" />
                    )}
                  </div>
                ) : (
                  isStreaming && (
                    <span className="inline-block w-2 h-4 bg-sky-500 animate-pulse ml-0.5" />
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
