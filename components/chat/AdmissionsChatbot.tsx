"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  GraduationCap,
  ChevronDown,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/recommender";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  "🎯 What colleges should I opt for based on my rank?",
  "💰 Top institutions with highest ROI & median package",
  "📅 When are the upcoming admission & counseling deadlines?",
  "📋 What documents do I need to prepare for admissions?",
];

const INITIAL_MESSAGE: ChatMessage = {
  id: "init-1",
  role: "assistant",
  content: `Hello! I am **CampusCopilot AI**, your autonomous admissions advisor powered by **Google Gemini 3.5 Flash-Lite**.

I am grounded directly against FindMyCampus's **600+ verified institutions** across India, the US, the UK, Canada, Germany, and Australia. 

Ask me anything about:
- 📊 **Branch cutoffs** (JEE, BITSAT, SAT, GATE, A-Levels)
- 💰 **Exact tuition & median placement packages**
- 📅 **Upcoming counseling & admission deadlines**
- 🎯 **Target, Reach, and Safe college recommendations** based on your score!`,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export function AdmissionsChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsLoading(true);

    try {
      // Build conversation history (excluding initial static welcome message)
      const outgoingMessages = [...messages.slice(1), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoingMessages,
          userProfile: profile || undefined,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content || data.message || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Failed to connect to the Admissions Copilot server. Please verify your network connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* -----------------------------------------------------------------
          1. TRIGGER FLOATING BUTTON (Fixed bottom-6 right-6 z-40)
         ----------------------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              type="button"
              initial={{ scale: 0.85, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 12 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.48)] border border-white/20 transition-all cursor-pointer backdrop-blur-md group"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                </div>
                {/* Active Pulse Dot */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-indigo-600" />
                </span>
              </div>

              <div className="text-left">
                <div className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <span>CampusCopilot</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/25 text-white/90">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-white/80 font-medium">
                  Gemini 3.5 Flash-Lite
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* -----------------------------------------------------------------
          2. EXPANDABLE CHAT WINDOW (Width: ~420px, Height: ~600px)
         ----------------------------------------------------------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] rounded-3xl bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden text-slate-900 dark:text-zinc-100 transition-all duration-200",
              isMinimized ? "h-14" : "h-[600px] max-h-[88vh]"
            )}
          >
            {/* Header Bar */}
            <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-zinc-900 dark:to-indigo-950/20 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      CampusCopilot AI
                    </h3>
                  </div>
                  {/* Status Tag */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="truncate">Gemini 3.5 Flash-Lite • 100% Grounded</span>
                  </div>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized((prev) => !prev)}
                  title={isMinimized ? "Expand" : "Minimize"}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Minimize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Copilot"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Candidate Context Pill (if profile present) */}
            {!isMinimized && profile?.boardPercentage && (
              <div className="shrink-0 px-4 py-1.5 bg-indigo-50/70 dark:bg-indigo-950/25 border-b border-indigo-100 dark:border-indigo-900/40 text-[10px] flex items-center justify-between text-indigo-700 dark:text-indigo-300">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    Candidate: <strong>{profile.name || "Student"}</strong> ({profile.primaryExam || "Board"}: {profile.examScoreOrRank || `${profile.boardPercentage}%`})
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider shrink-0 font-bold bg-indigo-500/15 px-1 rounded">
                  Context Active
                </span>
              </div>
            )}

            {/* Scrollable Message Feed */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-2.5 max-w-[90%]",
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs",
                          isUser
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-slate-300/60 dark:border-zinc-700"
                        )}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                      </div>

                      {/* Content Bubble */}
                      <div
                        className={cn(
                          "px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs",
                          isUser
                            ? "bg-indigo-600 text-white rounded-tr-xs"
                            : "bg-slate-100 dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-tl-xs"
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        ) : (
                          <MarkdownRenderer content={m.content} />
                        )}
                        <div
                          className={cn(
                            "text-[9px] mt-1 text-right font-mono",
                            isUser ? "text-indigo-200" : "text-slate-400 dark:text-zinc-500"
                          )}
                        >
                          {m.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2.5 mr-auto">
                    <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-slate-300/60 dark:border-zinc-700 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 shadow-xs">
                      <span>Reasoning over 600+ universities</span>
                      <span className="flex gap-1 items-center ml-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Quick Starter Chips & Input Section */}
            {!isMinimized && (
              <div className="shrink-0 p-3 bg-slate-50/80 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                {/* Starter Chips (shown when few messages) */}
                {messages.length <= 2 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                    {STARTER_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-800 whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Form */}
                <div className="relative flex items-center gap-1.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Ask anything about cutoffs, fees, strategy..."
                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all pr-9 disabled:opacity-50 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputVal.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white disabled:text-slate-400 dark:disabled:text-zinc-600 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                    title="Send inquiry"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdmissionsChatbot;
