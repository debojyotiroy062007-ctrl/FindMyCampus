"use client";

import { motion, type Variants } from "framer-motion";
import { Database, CloudOff, ShieldCheck } from "lucide-react";
import { HeroCanvas } from "@/components/hero/HeroCanvas";

interface MetricPillProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: "indigo" | "emerald" | "amber";
}

const colorMap = {
  indigo: {
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400",
  },
};

function MetricPill({ icon, value, label, color }: MetricPillProps) {
  const styles = colorMap[color];
  return (
    <div
      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 shadow-sm dark:bg-[#0d1117]/80 dark:border-zinc-800 dark:text-zinc-100 backdrop-blur-sm transition-transform duration-200 hover:scale-[1.01]"
    >
      <div className={`${styles.icon} shrink-0`}>{icon}</div>
      <div className="min-w-0 text-left">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">{value}</div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-tight mt-0.5 truncate">{label}</div>
      </div>
    </div>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

interface HeroHeaderProps {
  onOpenProfile?: () => void;
}

export function HeroHeader({ onOpenProfile }: HeroHeaderProps) {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-5 sm:py-6 px-4 sm:px-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      {/* Interactive Mouse-Reactive Canvas & Perspective Grid */}
      <HeroCanvas />

      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Refined Multi-Country Badge with Iridescent Glow & Pulsing Emerald Dot */}
        <motion.div variants={itemVariants} className="flex justify-center mb-3">
          <div className="relative inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border border-indigo-500/30 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm text-indigo-700 dark:text-indigo-300 uppercase animate-iridescent-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            </span>
            <span>Multi-Country Admissions Engine Active</span>
          </div>
        </motion.div>

        {/* Luminescent Shimmer Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.14] tracking-tight mb-3"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-900 to-purple-600 dark:from-indigo-300 dark:via-white dark:to-purple-300 bg-[length:200%_auto] animate-shimmer-sweep font-extrabold inline-block">
            Autonomous Admissions
          </span>
          <br />
          <span className="text-zinc-900 dark:text-white font-black tracking-tight drop-shadow-[0_0_35px_rgba(59,130,246,0.15)] dark:drop-shadow-[0_0_35px_rgba(59,130,246,0.35)] inline-block mt-0.5">
            &amp; Clearance Grid
          </span>
        </motion.h1>

        {/* Refined Subtitle with High-Contrast Clarity */}
        <motion.p
          variants={itemVariants}
          className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-5 font-normal"
        >
          Discover elite institutions across 6 countries, audit visa compliance, and auto-dispatch application forms
          directly from your{" "}
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            encrypted local device
          </span>
          .{" "}
          <span className="text-zinc-900 dark:text-white font-medium">Zero data leaves your machine.</span>
        </motion.p>

        {/* Live Metrics Strip */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto"
        >
          <MetricPill
            icon={<Database className="w-4 h-4" strokeWidth={1.75} />}
            value="300+ Target Institutions"
            label="NIRF 1-100 · US 100 · UK 100"
            color="indigo"
          />
          <MetricPill
            icon={<CloudOff className="w-4 h-4" strokeWidth={1.75} />}
            value="0 KB Cloud Data Shared"
            label="Fully encrypted local store"
            color="emerald"
          />
          <MetricPill
            icon={<ShieldCheck className="w-4 h-4" strokeWidth={1.75} />}
            value="Deterministic Pre-Flight Active"
            label="Multi-Exam Benchmark Engine"
            color="amber"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
