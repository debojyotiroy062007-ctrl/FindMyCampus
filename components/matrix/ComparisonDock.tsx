"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, BarChart3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { University } from "@/types/university";

interface Props {
  selected: University[];
  onClear: () => void;
  onCompare: () => void;
  onRemove: (id: string) => void;
}

const dockVariants: Variants = {
  hidden: { y: 80, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 350, damping: 30 },
  },
  exit: {
    y: 80,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
  SG: "🇸🇬",
  CH: "🇨🇭",
};

export default function ComparisonDock({ selected, onClear, onCompare, onRemove }: Props) {
  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
          variants={dockVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-4 shadow-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl">
            {/* Counter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm font-mono",
                  selected.length >= 2
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300"
                )}
              >
                {selected.length}
              </div>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium hidden sm:block">
                {selected.length}/5 Selected
              </span>
            </div>

            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 flex-shrink-0" />

            {/* Selected Pills */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none min-w-0">
              {selected.map((u) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex-shrink-0 flex items-center gap-2 bg-zinc-100 dark:bg-white/8 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-sm"
                >
                  <span className="text-sm">{COUNTRY_FLAGS[u.countryCode] ?? "🌐"}</span>
                  <span className="text-xs text-zinc-800 dark:text-white font-medium whitespace-nowrap max-w-[120px] truncate">
                    {u.shortName}
                  </span>
                  <button
                    onClick={() => onRemove(u.id)}
                    className="ml-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                    aria-label={`Remove ${u.shortName}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
              {/* Empty slot indicator */}
              {selected.length < 5 && (
                <div className="flex-shrink-0 flex items-center gap-2 border border-dashed border-zinc-300 dark:border-white/15 rounded-xl px-3 py-1.5">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">+ Add (Up to 5)</span>
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 flex-shrink-0" />

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onClear}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onCompare}
                disabled={selected.length < 2}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                  selected.length >= 2
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_28px_rgba(99,102,241,0.5)]"
                    : "bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                )}
              >
                <BarChart3 className="w-4 h-4" />
                Compare
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
