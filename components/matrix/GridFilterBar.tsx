"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, Globe2, X, Sparkles, Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CountryCode } from "@/types/university";

interface Props {
  selectedCountry: CountryCode;
  onCountryChange: (c: CountryCode) => void;
  isGlobalUnified: boolean;
  onToggleGlobalUnified: (val: boolean) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  activeFilter: string | null;
  onFilterChange: (f: string | null) => void;
  hasProfile: boolean;
  onOpenProfile: () => void;
  totalInstitutions: number;
  rankingBodyName: string;
  countryName: string;
}

const COUNTRIES: { code: CountryCode; flag: string; name: string }[] = [
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
];

const FILTERS = [
  { id: "recommended", label: "Recommended for My Profile", icon: "✦" },
  { id: "low-tuition", label: "Low Tuition", icon: "💎" },
  { id: "tier1-roi", label: "Tier 1 ROI", icon: "📈" },
];

const chipVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export default function GridFilterBar({
  selectedCountry,
  onCountryChange,
  isGlobalUnified,
  onToggleGlobalUnified,
  searchQuery,
  onSearch,
  activeFilter,
  onFilterChange,
  hasProfile,
  onOpenProfile,
  totalInstitutions,
  rankingBodyName,
  countryName,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Country Selection Strip & Global Unified Switch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Country Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {COUNTRIES.map((c) => {
            const isSelected = !isGlobalUnified && selectedCountry === c.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  onToggleGlobalUnified(false);
                  onCountryChange(c.code);
                }}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                  isSelected
                    ? "bg-indigo-600/25 border-indigo-500/60 text-indigo-900 dark:text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                    : "bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-400 hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-zinc-200 shadow-sm"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="countryActivePill"
                    className="absolute inset-0 bg-indigo-600/30 rounded-xl border border-indigo-500/50"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="text-base leading-none relative z-10">{c.flag}</span>
                <span className="relative z-10">{c.name}</span>
              </button>
            );
          })}

          {/* Global QS Top 50 Unified Toggle */}
          <button
            onClick={() => onToggleGlobalUnified(!isGlobalUnified)}
            className={cn(
              "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ml-1",
              isGlobalUnified
                ? "bg-emerald-600/25 border-emerald-500/60 text-emerald-900 dark:text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                : "bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-300 shadow-sm"
            )}
          >
            {isGlobalUnified && (
              <motion.div
                layoutId="globalActivePill"
                className="absolute inset-0 bg-emerald-600/20 rounded-xl border border-emerald-500/50"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <Globe2 className={cn("w-4 h-4 relative z-10", isGlobalUnified ? "text-emerald-400" : "text-zinc-400")} />
            <span className="relative z-10">Global QS Top 50 Unified</span>
            {isGlobalUnified && (
              <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            )}
          </button>
        </div>

        {/* Set Profile Trigger Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/35 hover:border-indigo-500/60 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-[0_0_16px_rgba(99,102,241,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{hasProfile ? "Active Profile (Update)" : "Set Profile / Upload Resume"}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Institution Counter Strip */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            {isGlobalUnified ? (
              <>
                Showing <strong className="text-white">{totalInstitutions}</strong> verified institutions in{" "}
                <strong className="text-emerald-300">Global QS Top 50</strong> — Ranked by{" "}
                <strong className="text-white">QS World University Rankings 2026</strong>
              </>
            ) : (
              <>
                Showing <strong className="text-white">{totalInstitutions}</strong> verified institutions in{" "}
                <strong className="text-indigo-300">{countryName}</strong> — Ranked by{" "}
                <strong className="text-white">{rankingBodyName}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Live Search & Quick Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by university name, city, or accepted exam (e.g. BITSAT, WBJEE, SAT, TestAS)..."
            className="w-full bg-white/80 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500/70 shadow-sm transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>
          {FILTERS.map((f) => {
            const isSelected = activeFilter === f.id;
            const isDisabled = f.id === "recommended" && !hasProfile;
            return (
              <motion.button
                key={f.id}
                variants={chipVariants}
                onClick={() => {
                  if (isDisabled) {
                    onOpenProfile();
                    return;
                  }
                  onFilterChange(isSelected ? null : f.id);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200",
                  isSelected
                    ? "bg-indigo-600/30 border-indigo-500/70 text-indigo-900 dark:text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                    : isDisabled
                    ? "bg-slate-100/60 dark:bg-zinc-900/40 border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 hover:border-indigo-500/40 hover:text-slate-600 dark:hover:text-zinc-300"
                    : "bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white shadow-sm"
                )}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
                {isDisabled && <span className="text-[10px] text-indigo-400 font-normal">(Set profile)</span>}
              </motion.button>
            );
          })}

          <AnimatePresence>
            {activeFilter && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => onFilterChange(null)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <X className="w-3 h-3" />
                Reset
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
