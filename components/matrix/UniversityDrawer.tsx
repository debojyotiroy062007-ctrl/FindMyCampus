"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  X,
  CheckSquare,
  Square,
  ArrowRight,
  Calendar,
  DollarSign,
  FileText,
  Table,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  Globe,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { University } from "@/types/university";
import type { VaultDocument } from "@/types/vault";
import UniversityLogo from "@/components/ui/UniversityLogo";
import { getAllVaultDocs } from "@/lib/vault/db";
import { auditUniversityPrerequisites } from "@/lib/vault/documentMatcher";

interface Props {
  university: University | null;
  isOpen: boolean;
  onClose: () => void;
  onAutoPilot?: (u: University) => void;
}

const CHECKED_DOCS_KEY = "findmycampus_checked_docs";

function loadCheckedDocs(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CHECKED_DOCS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveCheckedDocs(docs: Record<string, boolean>) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHECKED_DOCS_KEY, JSON.stringify(docs));
  }
}

const drawerVariants: Variants = {
  hidden: { x: "100%" },
  show: { x: "0%", transition: { type: "spring", stiffness: 350, damping: 35 } },
  exit: { x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
};

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
};

export default function UniversityDrawer({ university: u, isOpen, onClose, onAutoPilot }: Props) {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [mounted, setMounted] = useState(false);
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    setCheckedDocs(loadCheckedDocs());

    async function loadVault() {
      try {
        const docs = await getAllVaultDocs();
        setVaultDocs(docs);
      } catch (err) {
        console.error("Failed to load vault docs in UniversityDrawer:", err);
      }
    }

    loadVault();

    const handleVaultUpdate = () => loadVault();
    window.addEventListener("findmycampus_vault_updated", handleVaultUpdate);
    return () => window.removeEventListener("findmycampus_vault_updated", handleVaultUpdate);
  }, []);

  // Sync with single source of truth documentMatcher
  const auditResult = useMemo(() => {
    if (!u) return null;
    return auditUniversityPrerequisites(u, vaultDocs);
  }, [u, vaultDocs]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Force scroll to top when drawer opens and focus top close button to prevent jump-scrolling
  useEffect(() => {
    if (isOpen && u) {
      if (drawerBodyRef.current) {
        drawerBodyRef.current.scrollTop = 0;
      }
      // Focus the close button at top so the browser does not scroll to bottom buttons
      requestAnimationFrame(() => {
        if (drawerBodyRef.current) {
          drawerBodyRef.current.scrollTop = 0;
        }
        closeButtonRef.current?.focus({ preventScroll: true });
      });
    }
  }, [isOpen, u]);

  const toggleDoc = (docKey: string) => {
    const updated = { ...checkedDocs, [docKey]: !checkedDocs[docKey] };
    setCheckedDocs(updated);
    saveCheckedDocs(updated);
  };

  if (!mounted || !u) return null;

  const checkedCount = u.requiredDocs.filter((d) => {
    const isVaultVerified = auditResult?.requirements.some(
      (r) => r.requiredName === d && r.status === "CLEARED"
    );
    return isVaultVerified || !!checkedDocs[`${u.id}::${d}`];
  }).length;
  const progress = Math.round((checkedCount / (u.requiredDocs.length || 1)) * 100);

  const drawerElement = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Full Screen Slide-Over Panel */}
          <motion.div
            className="relative z-10 w-full max-w-2xl h-screen bg-white dark:bg-[#09090b] border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col text-zinc-900 dark:text-white"
            variants={drawerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {/* 1. Top Header */}
            <div className="shrink-0 p-6 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <UniversityLogo university={u} size={48} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-md">
                      #{u.nationalRank} {u.rankingBody}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                      QS #{u.globalRankQS}
                    </span>
                    <span className="text-sm">{COUNTRY_FLAGS[u.countryCode] ?? "🌐"}</span>
                  </div>
                  <h2 className="text-zinc-900 dark:text-white font-bold text-base leading-snug">{u.name}</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                    {u.city}{u.state ? `, ${u.state}` : ""} ·{" "}
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">{u.countryName}</span>
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                tabIndex={0}
                className="shrink-0 p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Body: Full height with smooth vertical scrolling from top to bottom */}
            <div
              ref={drawerBodyRef}
              tabIndex={-1}
              className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 overscroll-contain pb-24 outline-none"
            >
              {/* Fee & Placement Highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Annual Tuition
                  </p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{u.tuitionAnnual.localAmount}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">≈ {u.tuitionAnnual.inrEquivalent}</p>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Median Placement
                  </p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{u.medianPackage.localAmount}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">≈ {u.medianPackage.inrEquivalent}</p>
                </div>
              </div>

              {/* Verified Career & Placement Outcomes */}
              {u.placementMetrics && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                        Career &amp; Placement Outcomes
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                      {u.placementMetrics.placementRate}% Placement Rate
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                      <span className="text-[10px] text-zinc-500 block">AVERAGE SALARY</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">{u.placementMetrics.averageSalary}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                      <span className="text-[10px] text-zinc-500 block">HIGHEST (DOMESTIC)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{u.placementMetrics.highestPackage.domestic}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Top Campus Recruiters
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {u.placementMetrics.topRecruiters.slice(0, 6).map((rec) => (
                        <span key={rec} className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium shadow-xs">
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span>Visa / Work Authorization: <strong className="text-zinc-800 dark:text-zinc-200">{u.placementMetrics.workVisaSupport}</strong></span>
                  </div>
                </div>
              )}

              {/* 1. Branch-Wise Cutoffs Matrix */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Table className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    Branch-Wise Cutoffs Matrix
                  </h3>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50 dark:bg-zinc-900/40 shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold">
                        <th className="p-3">Engineering Branch</th>
                        <th className="p-3">Exam</th>
                        <th className="p-3">Cutoff Benchmark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
                      {u.branchCutoffs.map((b, i) => (
                        <tr key={`${b.branchName}-${i}`} className="hover:bg-white/60 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-medium text-zinc-900 dark:text-white">
                            <div>{b.branchName}</div>
                            {b.categoryOrQuota && (
                              <div className="text-[10px] text-zinc-500 font-normal">{b.categoryOrQuota}</div>
                            )}
                          </td>
                          <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">{b.primaryExam}</td>
                          <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-300">{b.benchmark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Upcoming Exam & Admission Windows */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    Upcoming Exam &amp; Admission Windows
                  </h3>
                </div>
                <div className="space-y-2">
                  {u.upcomingDeadlines.map((d, i) => (
                    <div
                      key={`${d.title}-${i}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-xs shadow-xs"
                    >
                      <span className="text-zinc-700 dark:text-zinc-200 font-medium">{d.title}</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {d.dateOrWindow}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-xs shadow-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Standard Route:</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{u.admissionRoute}</span>
                  </div>
                </div>
              </div>

              {/* 3. Mandatory Document Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                      Mandatory Document Checklist
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                    {checkedCount} / {u.requiredDocs.length} Verified
                  </span>
                </div>

                <div className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>

                <div className="space-y-1.5">
                  {u.requiredDocs.map((doc) => {
                    const key = `${u.id}::${doc}`;
                    const matchedReq = auditResult?.requirements.find(
                      (r) => r.requiredName === doc && r.status === "CLEARED"
                    );
                    const isVaultVerified = !!matchedReq;
                    const isChecked = isVaultVerified || !!checkedDocs[key];

                    return (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => toggleDoc(key)}
                        className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-400 dark:text-zinc-600 shrink-0 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" />
                          )}
                          <div className="min-w-0">
                            <span
                              className={cn(
                                "text-xs leading-relaxed block truncate transition-colors",
                                isChecked && !isVaultVerified
                                  ? "text-zinc-400 dark:text-zinc-500 line-through"
                                  : "text-zinc-800 dark:text-zinc-200 font-medium"
                              )}
                            >
                              {doc}
                            </span>
                            {isVaultVerified && matchedReq?.matchedDoc && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block truncate">
                                Vault: {matchedReq.matchedDoc.label}
                              </span>
                            )}
                          </div>
                        </div>

                        {isVaultVerified && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 flex items-center gap-1 shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Verified in Vault
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 shadow-xs">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Advantages
                  </p>
                  <ul className="space-y-1.5">
                    {u.pros.map((p, i) => (
                      <li key={`pro-${i}`} className="text-[11px] text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5 leading-snug">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 shadow-xs">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Considerations
                  </p>
                  <ul className="space-y-1.5">
                    {u.cons.map((c, i) => (
                      <li key={`con-${i}`} className="text-[11px] text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5 leading-snug">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Bottom Action Footer */}
            <div className="shrink-0 p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (typeof window !== "undefined") {
                    localStorage.setItem("findmycampus_autopilot_target_univ", u.id);
                    window.dispatchEvent(
                      new CustomEvent("findmycampus_autopilot_select_university", { detail: u.id })
                    );
                    window.dispatchEvent(
                      new CustomEvent("findmycampus_switch_view", { detail: "autopilot" })
                    );
                  }
                  if (onAutoPilot) onAutoPilot(u);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] cursor-pointer"
              >
                <span>Pre-fill in Auto-Pilot Dispatch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerElement, document.body);
}