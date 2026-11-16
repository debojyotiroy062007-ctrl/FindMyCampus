"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, FileCheck, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { University, FitCategory, UniversityThemeColor } from "@/types/university";
import { UNIVERSITY_BRANDS, DEFAULT_BRAND_PROFILE } from "@/lib/data/universityThemes";
import UniversityLogo from "@/components/ui/UniversityLogo";

interface Props {
  university: University;
  fit?: FitCategory;
  isSelected?: boolean;
  onCompareToggle?: () => void;
  onViewDetails?: () => void;
  compareDisabled?: boolean;
}

const FIT_CONFIG: Record<FitCategory, { label: string; cls: string; dot: string }> = {
  "Target Choice": {
    label: "Target Choice",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  "Competitive Fit": {
    label: "Competitive Fit",
    cls: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]",
    dot: "bg-indigo-500 dark:bg-indigo-400",
  },
  "Reach School": {
    label: "Reach School",
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
};

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
};

const DEFAULT_THEME: UniversityThemeColor = {
  primary: "#6366F1",
  glow: "rgba(99,102,241,0.25)",
  border: "rgba(99,102,241,0.45)",
  bgTint: "rgba(99,102,241,0.08)",
};

export default function UniversityCard({
  university: u,
  fit,
  isSelected = false,
  onCompareToggle,
  onViewDetails,
  compareDisabled = false,
}: Props) {
  const brand = UNIVERSITY_BRANDS[u.id] || DEFAULT_BRAND_PROFILE;
  const [isHovered, setIsHovered] = useState(false);

  const theme = u.themeColor || brand.themeColor || DEFAULT_THEME;
  const fitCfg = fit ? FIT_CONFIG[fit] : null;
  const flag = COUNTRY_FLAGS[u.countryCode] ?? "🌐";

  // Representative CSE cutoff or primary benchmark
  const cseCutoff =
    u.branchCutoffs.find((b) => b.branchName.toLowerCase().includes("comp")) ||
    u.branchCutoffs[0];

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={onViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: `1px solid ${
          isSelected
            ? "rgba(99, 102, 241, 0.75)"
            : isHovered
            ? theme.primary
            : "var(--card-border, rgba(255, 255, 255, 0.12))"
        }`,
        boxShadow: isSelected
          ? "0 0 25px rgba(99, 102, 241, 0.35), inset 0 0 15px rgba(99, 102, 241, 0.1)"
          : isHovered
          ? `0 0 28px ${theme.glow}, 0 12px 32px -10px rgba(0, 0, 0, 0.25)`
          : `0 0 16px ${theme.glow}, 0 4px 16px -4px rgba(0, 0, 0, 0.15)`,
      }}
      className={cn(
        "relative rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer group overflow-hidden transition-all duration-300 backdrop-blur-md bg-white/95 dark:bg-[#0d0e12]/90 shadow-sm dark:shadow-none",
        isSelected
          ? "ring-1 ring-indigo-500/70"
          : "hover:border-zinc-400 dark:hover:border-zinc-500"
      )}
    >
      {/* 1. Permanent Baseline Ambient Top-Glow Radial Layer (Always Visible at 0.65, boosts to 1.0 on hover) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(320px circle at 50% 0%, ${theme.glow || "rgba(99,102,241,0.18)"}, transparent 80%)`,
          opacity: isHovered ? 1.0 : 0.65,
        }}
      />

      {/* 2. Secondary Ambient Corner Tint Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse 80% 50% at top left, ${theme.bgTint || "rgba(99,102,241,0.08)"}, transparent 75%)`,
          opacity: isHovered ? 1.0 : 0.60,
        }}
      />

      {/* Top Header Row with Institutional Crest */}
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          {/* Logo Emblem Container with Fail-safe Component */}
          <div className="shrink-0 group-hover:scale-105 transition-transform duration-300">
            <UniversityLogo
              university={u}
              size={48}
            />
          </div>

          {/* Institution Header Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {/* Rank Pill Color-Coded to University Signature Theme */}
              <span
                className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors shadow-sm"
                style={{
                  color: theme.primary,
                  backgroundColor: theme.bgTint,
                  borderColor: theme.border,
                }}
              >
                #{u.nationalRank} {u.rankingBody}
              </span>

              {/* QS World Rank Pill */}
              <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-md">
                QS #{u.globalRankQS}
              </span>

              {/* Match Fit Badge */}
              {fitCfg && (
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ml-auto",
                    fitCfg.cls
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", fitCfg.dot)} />
                  {fitCfg.label}
                </span>
              )}
            </div>

            {/* Institution Name */}
            <h3 className="text-zinc-900 dark:text-white font-bold text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors line-clamp-1">
              {u.name}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 flex items-center gap-1.5 truncate font-normal">
              <span>{flag}</span>
              <span className="truncate">
                {u.city}
                {u.state ? `, ${u.state}` : ""} ·{" "}
                <span className="text-zinc-700 dark:text-zinc-300">{u.countryName}</span>
              </span>
            </p>
          </div>

          {/* Head-to-Head Compare Toggle */}
          {onCompareToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompareToggle();
              }}
              disabled={compareDisabled && !isSelected}
              className={cn(
                "flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-150 ml-0.5 cursor-pointer",
                isSelected
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                  : compareDisabled
                  ? "border-zinc-200 dark:border-white/5 text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-30"
                  : "border-zinc-200 dark:border-white/15 text-zinc-600 dark:text-zinc-400 hover:border-indigo-500/60 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-zinc-100 dark:hover:bg-white/5"
              )}
              title={isSelected ? "Remove from comparison" : "Add to comparison (Max 5)"}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Primary Verified Metrics Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-3 p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/5">
        {/* Accepted Entrance Exams */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-0.5">
            Accepted Exams
          </p>
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate font-mono">
            {u.acceptedExams.join(", ")}
          </p>
        </div>

        {/* CSE Branch Cutoff Floor */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-0.5">
            CSE Cutoff Floor
          </p>
          <p
            className="text-xs font-semibold truncate font-mono"
            style={{ color: theme.primary }}
          >
            {cseCutoff ? cseCutoff.benchmark : "Holistic"}
          </p>
        </div>

        {/* Annual Tuition (Native + INR) */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-0.5">
            Annual Tuition
          </p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
            {u.tuitionAnnual.localAmount}
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
            ≈ {u.tuitionAnnual.inrEquivalent}
          </p>
        </div>

        {/* Median Package */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-0.5">
            Median Placement
          </p>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 truncate">
            {u.medianPackage.localAmount}
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
            ≈ {u.medianPackage.inrEquivalent}
          </p>
        </div>
      </div>

      {/* Acceptance Rate & Placement Rate Meta */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
        <span>
          Acceptance: <strong className="text-zinc-800 dark:text-zinc-200">{u.acceptanceRate}</strong>
        </span>
        <span>
          Placed:{" "}
          <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
            {u.placementMetrics?.placementRate ? `${u.placementMetrics.placementRate}%` : "94%+"}
          </strong>
        </span>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-white/5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-all border border-zinc-200 dark:border-white/8 hover:border-zinc-300 dark:hover:border-white/15 cursor-pointer"
        >
          <FileCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Cutoffs</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (typeof window !== "undefined") {
              localStorage.setItem("findmycampus_autopilot_target_univ", u.id);
              window.dispatchEvent(
                new CustomEvent("findmycampus_autopilot_select_university", { detail: u.id })
              );
              window.dispatchEvent(
                new CustomEvent("findmycampus_switch_view", { detail: "autopilot" })
              );
            }
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/35 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white text-xs font-semibold transition-all border border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-300 dark:hover:border-indigo-500/50 cursor-pointer"
          title="Pre-fill Application Dossier in Auto-Pilot"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Auto-Fill</span>
          <ArrowRight className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
        </button>
      </div>
    </motion.div>
  );
}
