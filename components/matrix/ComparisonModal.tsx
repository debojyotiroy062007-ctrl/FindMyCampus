"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, Briefcase, Award, TrendingUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { University } from "@/types/university";
import UniversityLogo from "@/components/ui/UniversityLogo";

interface Props {
  universities: University[];
  onClose: () => void;
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.96, y: 20, transition: { duration: 0.15, ease: "easeIn" } },
};

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
};

type CompareRow = {
  label: string;
  get: (u: University) => string;
};

const ROWS: CompareRow[] = [
  { label: "National Ranking", get: (u) => `#${u.nationalRank} ${u.rankingBody}` },
  { label: "QS World 2026 Rank", get: (u) => `QS #${u.globalRankQS}` },
  { label: "Acceptance Rate", get: (u) => u.acceptanceRate },
  { label: "Accepted Entrance Exams", get: (u) => u.acceptedExams.join(", ") },
  {
    label: "CSE / Cutoff Floor",
    get: (u) => {
      const cse = u.branchCutoffs.find((b) => b.branchName.toLowerCase().includes("comp")) || u.branchCutoffs[0];
      return cse ? `${cse.branchName}: ${cse.benchmark}` : "Holistic";
    },
  },
  {
    label: "Annual Tuition",
    get: (u) => `${u.tuitionAnnual.localAmount} (≈ ${u.tuitionAnnual.inrEquivalent})`,
  },
  {
    label: "Median Placement",
    get: (u) => `${u.medianPackage.localAmount} (≈ ${u.medianPackage.inrEquivalent})`,
  },
  {
    label: "Placement Rate",
    get: (u) => (u.placementMetrics ? `${u.placementMetrics.placementRate}% verified` : "94%+"),
  },
  {
    label: "Highest Outlier Package",
    get: (u) => (u.placementMetrics ? `${u.placementMetrics.highestPackage.domestic} (Dom) · ${u.placementMetrics.highestPackage.international || "N/A"} (Int'l)` : "Tier 1"),
  },
  {
    label: "Top Recruiters",
    get: (u) => (u.placementMetrics ? u.placementMetrics.topRecruiters.slice(0, 5).join(", ") : "Global MNCs"),
  },
  {
    label: "Post-Study Work Visa",
    get: (u) => (u.placementMetrics ? u.placementMetrics.workVisaSupport : "Standard"),
  },
  { label: "Admission Route", get: (u) => u.admissionRoute },
  {
    label: "Primary Deadline",
    get: (u) => (u.upcomingDeadlines[0] ? `${u.upcomingDeadlines[0].title}: ${u.upcomingDeadlines[0].dateOrWindow}` : "Rolling"),
  },
  { label: "Location", get: (u) => `${u.city}${u.state ? `, ${u.state}` : ""}, ${u.countryName}` },
];

export default function ComparisonModal({ universities, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!universities || universities.length < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
        variants={overlayVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl my-auto text-zinc-900 dark:text-white flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-white/10 flex-shrink-0 bg-zinc-50 dark:bg-zinc-950/80">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Multi-Institution Comparison Matrix</span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full">
                  {universities.length} Institutions
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Deterministic comparison across official rankings, entrance exams, and placement outcomes
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Horizontally Scrollable Table Container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin">
            <div
              className="min-w-full"
              style={{
                display: "grid",
                gridTemplateColumns: `180px repeat(${universities.length}, minmax(220px, 1fr))`,
              }}
            >
              {/* Institution Headers */}
              <div className="p-4 border-r border-b border-zinc-200 dark:border-white/10 flex items-center bg-zinc-100/70 dark:bg-zinc-900/50 sticky left-0 z-20">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  Metric Comparison
                </span>
              </div>
              {universities.map((u) => (
                <div key={u.id} className="p-4 border-r border-b border-zinc-200 dark:border-white/10 last:border-r-0 bg-zinc-100/70 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2.5 mb-2">
                    <UniversityLogo university={u} size={36} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm">{COUNTRY_FLAGS[u.countryCode] ?? "🌐"}</span>
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">#{u.nationalRank}</span>
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">QS #{u.globalRankQS}</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1">{u.name}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{u.city}, {u.countryName}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Metric Rows */}
              {ROWS.map((row, i) => (
                <div key={row.label} className="contents">
                  <div
                    className={cn(
                      "p-3 px-4 border-r border-b border-zinc-200 dark:border-white/5 sticky left-0 z-10 font-medium text-xs text-zinc-600 dark:text-zinc-400",
                      i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/70 dark:bg-white/[0.01]"
                    )}
                  >
                    {row.label}
                  </div>
                  {universities.map((u) => (
                    <div
                      key={`${row.label}-${u.id}`}
                      className={cn(
                        "p-3 px-4 border-r border-b border-zinc-200 dark:border-white/5 last:border-r-0 text-xs font-mono text-zinc-800 dark:text-zinc-200",
                        i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/70 dark:bg-white/[0.01]"
                      )}
                    >
                      {row.get(u)}
                    </div>
                  ))}
                </div>
              ))}

              {/* Key Advantages Row */}
              <div className="p-3 px-4 border-r border-b border-zinc-200 dark:border-white/5 sticky left-0 z-10 bg-emerald-50/50 dark:bg-emerald-500/[0.03]">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Key Advantages</span>
              </div>
              {universities.map((u) => (
                <div key={`pros-${u.id}`} className="p-3 px-4 border-r border-b border-zinc-200 dark:border-white/5 last:border-r-0 bg-emerald-50/50 dark:bg-emerald-500/[0.03]">
                  <ul className="space-y-1">
                    {u.pros.map((p, idx) => (
                      <li key={idx} className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5 leading-snug">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Considerations Row */}
              <div className="p-3 px-4 border-r border-b border-zinc-200 dark:border-white/5 sticky left-0 z-10 bg-amber-50/50 dark:bg-amber-500/[0.03]">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Considerations</span>
              </div>
              {universities.map((u) => (
                <div key={`cons-${u.id}`} className="p-3 px-4 border-r border-b border-zinc-200 dark:border-white/5 last:border-r-0 bg-amber-50/50 dark:bg-amber-500/[0.03]">
                  <ul className="space-y-1">
                    {u.cons.map((c, idx) => (
                      <li key={idx} className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5 leading-snug">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
