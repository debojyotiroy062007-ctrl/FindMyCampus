"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  LayoutGrid,
  FolderLock,
  Zap,
  Sparkles,
  Coins,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  X,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/components/NavigationTabs";

interface ControlRailProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

interface RailItemProps {
  icon: React.ReactNode;
  label: string;
  tooltipDesc?: string;
  isActive?: boolean;
  badgeDot?: boolean;
  badgeColor?: string;
  onClick: () => void;
}

function RailItem({
  icon,
  label,
  tooltipDesc,
  isActive = false,
  badgeDot,
  badgeColor,
  onClick,
}: RailItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        aria-label={label}
        className={cn(
          "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer group",
          isActive
            ? "bg-indigo-600/25 text-white border border-indigo-500/40 shadow-[0_0_16px_rgba(99,102,241,0.35)]"
            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
        )}
      >
        {/* Active Pill Indicator */}
        {isActive && (
          <motion.div
            layoutId="rail-active-pill"
            className="absolute -left-3 w-1 h-5 rounded-r-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          />
        )}

        {icon}

        {/* Badge Dot */}
        {badgeDot && (
          <span
            className={cn(
              "absolute top-1.5 right-1.5 w-2 h-2 rounded-full",
              badgeColor || "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]"
            )}
          />
        )}
      </button>

      {/* Framer Motion Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900/95 border border-zinc-800 text-xs text-zinc-100 whitespace-nowrap shadow-2xl backdrop-blur-md flex flex-col gap-0.5">
              <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                {label}
              </span>
              {tooltipDesc && (
                <span className="text-[10px] text-zinc-400 font-normal">
                  {tooltipDesc}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ControlRail({
  activeView,
  onViewChange,
  activeFilter,
  onFilterChange,
}: ControlRailProps) {
  const [modalState, setModalState] = useState<"crypto" | "help" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFilterClick = (filterId: string) => {
    // If not in matrix view, switch to matrix first
    if (activeView !== "matrix") {
      onViewChange("matrix");
    }

    const nextFilter = activeFilter === filterId ? null : filterId;
    if (onFilterChange) {
      onFilterChange(nextFilter);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("findmycampus_set_filter", { detail: nextFilter })
      );
    }
  };

  const handleResetProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("findmycampus_profile");
      window.dispatchEvent(new CustomEvent("findmycampus_profile_updated"));
      window.dispatchEvent(new CustomEvent("findmycampus_set_filter", { detail: null }));
    }
    showToast("Profile & recommendations reset successfully");
  };

  return (
    <>
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 z-40 border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex-col items-center py-5 justify-between select-none"
        aria-label="Sidebar Control Rail"
      >
        {/* Top Logo / Brand Mark */}
        <div className="flex flex-col items-center gap-5 w-full">
          <button
            onClick={() => {
              onViewChange("matrix");
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 hover:border-indigo-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] cursor-pointer"
            aria-label="FindMyCampus Home"
          >
            <Cpu className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </button>

          <div className="w-8 h-[1px] bg-zinc-800/80" />

          {/* Section 1: View Switchers */}
          <div className="flex flex-col items-center gap-3 w-full">
            <RailItem
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Grid Matrix"
              tooltipDesc="Official NIRF & QS verified explorer"
              isActive={activeView === "matrix"}
              onClick={() => onViewChange("matrix")}
            />

            <RailItem
              icon={<FolderLock className="w-4 h-4" />}
              label="Sovereign Vault"
              tooltipDesc="AES-GCM-256 encrypted local document vault"
              isActive={activeView === "vault"}
              badgeDot
              badgeColor="bg-emerald-400"
              onClick={() => onViewChange("vault")}
            />

            <RailItem
              icon={<Zap className="w-4 h-4 text-amber-400" />}
              label="Auto-Pilot Dispatcher"
              tooltipDesc="Client-side PDF dossier & application engine"
              isActive={activeView === "autopilot"}
              onClick={() => onViewChange("autopilot")}
            />
          </div>

          <div className="w-8 h-[1px] bg-zinc-800/80" />

          {/* Section 2: Quick Filter Action Icons */}
          <div className="flex flex-col items-center gap-3 w-full">
            <RailItem
              icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
              label="Recommended for Me"
              tooltipDesc="Filter by verified test score match"
              isActive={activeFilter === "recommended"}
              onClick={() => handleFilterClick("recommended")}
            />

            <RailItem
              icon={<Coins className="w-4 h-4 text-emerald-400" />}
              label="Low Tuition"
              tooltipDesc="Subsidized & low-tuition elite campuses"
              isActive={activeFilter === "low-tuition"}
              onClick={() => handleFilterClick("low-tuition")}
            />

            <RailItem
              icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
              label="Tier 1 Placements"
              tooltipDesc="Highest verified median salary packages"
              isActive={activeFilter === "tier1-roi"}
              onClick={() => handleFilterClick("tier1-roi")}
            />
          </div>
        </div>

        {/* Section 3: Bottom Utility Icons */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="w-8 h-[1px] bg-zinc-800/80" />

          {/* Cryptographic Status Indicator */}
          <RailItem
            icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            label="Cryptographic Security"
            tooltipDesc="100% On-Device · Zero Cloud Leak Active"
            badgeDot
            badgeColor="bg-emerald-400"
            onClick={() => setModalState("crypto")}
          />

          {/* Architecture & Help Documentation */}
          <RailItem
            icon={<HelpCircle className="w-4 h-4 text-zinc-400" />}
            label="Architecture Docs"
            tooltipDesc="Pre-flight clearance & privacy standards"
            onClick={() => setModalState("help")}
          />

          {/* Clear Profile Reset */}
          <RailItem
            icon={<RotateCcw className="w-4 h-4 text-zinc-500 hover:text-amber-400" />}
            label="Clear Profile Reset"
            tooltipDesc="Wipe candidate credentials & cached filters"
            onClick={handleResetProfile}
          />
        </div>
      </aside>

      {/* Floating Temporary Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-20 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-white shadow-2xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cryptographic & Help Modal Shell */}
      <AnimatePresence>
        {modalState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl glass-card border border-white/10 p-6 bg-zinc-950/95 text-white shadow-2xl"
            >
              <button
                onClick={() => setModalState(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {modalState === "crypto" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Cryptographic Vault Status
                      </h3>
                      <p className="text-xs text-emerald-400 font-mono">
                        AES-GCM-256 · Native Web Crypto
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                    <p>
                      FindMyCampus executes <strong>100% on-device</strong>. All documents, academic transcripts, and candidate profiles are encrypted locally using native browser Web Crypto API and IndexedDB.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-[11px]">
                      <li>Authenticated Encryption: AES-GCM-256</li>
                      <li>Cryptographic Digest: SHA-256 checksums</li>
                      <li>Network Transmission: Zero bytes transmitted off-device</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setModalState(null)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    Acknowledged
                  </button>
                </div>
              )}

              {modalState === "help" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        FindMyCampus Architecture
                      </h3>
                      <p className="text-xs text-indigo-400 font-mono">
                        Autonomous Admissions Engine v1.0
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                    <p>
                      Explore official NIRF 2025 and QS 2026 university cutoffs, verify visa document compliance pre-flight, and generate standardized application PDF dossiers right in your browser.
                    </p>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 space-y-1 font-mono">
                      <div>• Control Rail: Quick view &amp; filter shortcuts</div>
                      <div>• University Cards: Brand-tinted crest benchmarks</div>
                      <div>• Vault: On-device encrypted document locker</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setModalState(null)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                  >
                    Got It
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

