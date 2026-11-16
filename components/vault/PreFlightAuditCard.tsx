"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Upload,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VaultDocument, VaultDocType } from "@/types/vault";
import type { University } from "@/types/university";
import { universities } from "@/lib/data/universities";
import { auditUniversityPrerequisites, classifyPrerequisite } from "@/lib/vault/documentMatcher";
import { UniversitySearchSelect } from "@/components/matrix/UniversitySearchSelect";

interface Props {
  vaultDocuments: VaultDocument[];
  onUploadMissing?: (docType?: VaultDocType) => void;
  onDispatchToAutoPilot?: (university: University) => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
};

export default function PreFlightAuditCard({
  vaultDocuments,
  onUploadMissing,
  onDispatchToAutoPilot,
}: Props) {
  const [selectedUnivId, setSelectedUnivId] = useState<string>(
    universities[0]?.id || "iit-madras"
  );

  const selectedUniversity = useMemo(() => {
    return universities.find((u) => u.id === selectedUnivId) || universities[0];
  }, [selectedUnivId]);

  const auditResult = useMemo(() => {
    if (!selectedUniversity) return null;
    return auditUniversityPrerequisites(selectedUniversity, vaultDocuments);
  }, [vaultDocuments, selectedUniversity]);

  if (!selectedUniversity || !auditResult) return null;

  const flag = COUNTRY_FLAGS[selectedUniversity.countryCode] ?? "🌐";

  const statusConfig = {
    GREEN: {
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-400 shadow-[0_0_8px_#10b981]",
      title: "100% Pre-Flight Clearance Passed",
      icon: CheckCircle2,
      cardBorder: "border-emerald-500/30",
    },
    AMBER: {
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      dot: "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
      title: "Ancillary Credentials Pending",
      icon: AlertTriangle,
      cardBorder: "border-amber-500/30",
    },
    RED: {
      badge: "bg-red-500/15 text-red-400 border-red-500/30",
      dot: "bg-red-400 shadow-[0_0_8px_#ef4444]",
      title: "Mandatory Roadblock Detected",
      icon: XCircle,
      cardBorder: "border-red-500/30",
    },
  }[auditResult.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        "rounded-2xl p-5 sm:p-6 border transition-all duration-300 relative bg-white dark:bg-[#0b0f19] border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xl",
        statusConfig.cardBorder
      )}
    >
      {/* Background glow based on status */}
      <div
        className={cn(
          "absolute -top-24 -right-24 w-64 h-64 blur-[100px] pointer-events-none rounded-full",
          auditResult.status === "GREEN"
            ? "bg-emerald-500/10"
            : auditResult.status === "AMBER"
            ? "bg-amber-500/10"
            : "bg-red-500/10"
        )}
      />

      {/* Target University Selector Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-200 dark:border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              Deterministic Compliance Audit
            </span>
            <span
              className={cn(
                "font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5",
                statusConfig.badge
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
              {statusConfig.title}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            Target Institutional Pre-Flight Inspector
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
            Cross-references verified encrypted credentials against official admission prerequisites.
          </p>
        </div>

        {/* Institution Dropdown */}
        <div className="shrink-0 w-full sm:w-72">
          <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
            Select Target Institution
          </label>
          <UniversitySearchSelect
            value={selectedUnivId}
            onChange={(newId) => setSelectedUnivId(newId)}
            triggerClassName="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 shadow-xs"
          />
        </div>
      </div>

      {/* Clearance Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 relative z-10">
        {/* Score Ring / Block */}
        <div className="bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shrink-0",
              statusConfig.badge
            )}
          >
            {auditResult.scorePercentage}%
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-bold">Clearance Score</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {auditResult.clearedCount} / {auditResult.totalRequired} Cleared
            </p>
          </div>
        </div>

        {/* Institution Details */}
        <div className="bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Target Body</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
            <span>{flag}</span>
            <span>{selectedUniversity.shortName}</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
            {selectedUniversity.rankingBody} #{selectedUniversity.nationalRank} · QS #{selectedUniversity.globalRankQS}
          </p>
        </div>

        {/* Admission Route */}
        <div className="bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Filing System</p>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate font-mono">
            {selectedUniversity.admissionRoute.split(" ")[0]} Portal
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
            {selectedUniversity.applicationTemplate}
          </p>
        </div>

        {/* Status Verdict */}
        <div className="bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Audit Verdict</p>
            <p
              className={cn(
                "text-xs font-bold truncate",
                auditResult.status === "GREEN"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : auditResult.status === "AMBER"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {auditResult.status === "GREEN"
                ? "Pre-Flight Cleared"
                : auditResult.status === "AMBER"
                ? "Ancillary Pending"
                : "Roadblock Detected"}
            </p>
          </div>
          <StatusIcon
            className={cn(
              "w-6 h-6 shrink-0",
              auditResult.status === "GREEN"
                ? "text-emerald-600 dark:text-emerald-400"
                : auditResult.status === "AMBER"
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          />
        </div>
      </div>

      {/* Status Message Banner */}
      <div
        className={cn(
          "p-3 rounded-xl mb-5 text-xs font-mono flex items-center gap-2 border relative z-10",
          statusConfig.badge
        )}
      >
        <StatusIcon className="w-4 h-4 shrink-0" />
        <span className="leading-snug">{auditResult.statusMessage}</span>
      </div>

      {/* Prerequisite Breakdown Checklist */}
      <div className="relative z-10 space-y-2 mb-5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-1">
          <span>Official Mandatory Admission Prerequisites</span>
          <span>Sovereign Vault Status</span>
        </div>

        <div className="space-y-1.5">
          {auditResult.requirements.map((req, idx) => {
            const isCleared = req.status === "CLEARED";
            return (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all text-xs",
                  isCleared
                    ? "bg-emerald-50/70 dark:bg-emerald-500/[0.04] border-emerald-500/25 text-slate-900 dark:text-zinc-200"
                    : req.isMandatory
                    ? "bg-rose-50/70 dark:bg-rose-500/[0.04] border-rose-500/25 text-slate-900 dark:text-zinc-300"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/8 text-slate-700 dark:text-zinc-400"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  {isCleared ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : req.isMandatory ? (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white leading-tight truncate">
                      {req.requiredName}
                    </p>
                    {isCleared && req.matchedDoc ? (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 truncate flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 inline" />
                        Matched: {req.matchedDoc.label} ({req.matchedDoc.fileName})
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {req.isMandatory ? "Mandatory enrollment blocker" : "Optional / Supplementary filing"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isCleared ? (
                    <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md">
                      VERIFIED ON-DEVICE
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        const prereq = classifyPrerequisite(req.requiredName);
                        if (onUploadMissing) onUploadMissing(prereq.suggestedDocType);
                      }}
                      className="flex items-center gap-1 font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-white bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload to Clear</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Pilot Dispatch CTA (Dedicated Bottom Action Footer) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10 relative z-10">
        <div className="text-xs text-slate-600 dark:text-zinc-400">
          {auditResult.status === "GREEN" ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Ready for autonomous split-screen form dispatch
            </span>
          ) : (
            <span>
              Clear missing items to unlock 100% deterministic stamping in Auto-Pilot
            </span>
          )}
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.setItem("findmycampus_autopilot_target_univ", selectedUniversity.id);
              window.dispatchEvent(
                new CustomEvent("findmycampus_autopilot_select_university", {
                  detail: selectedUniversity.id,
                })
              );
              window.dispatchEvent(
                new CustomEvent("findmycampus_switch_view", { detail: "autopilot" })
              );
            }
            if (onDispatchToAutoPilot) {
              onDispatchToAutoPilot(selectedUniversity);
            }
          }}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wide cursor-pointer",
            auditResult.status === "GREEN"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]"
          )}
        >
          <span>Dispatch to Auto-Pilot</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

