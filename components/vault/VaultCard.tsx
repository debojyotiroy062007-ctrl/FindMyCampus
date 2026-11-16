"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Lock,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  HardDrive,
  ShieldCheck,
  ChevronDown,
  Check,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VaultDocument, VaultDocType } from "@/types/vault";
import { getDecryptedDoc, deleteVaultDoc, saveEncryptedDoc } from "@/lib/vault/db";
import { verifyChecksum } from "@/lib/vault/crypto";

interface Props {
  document: VaultDocument;
  onPreview: (id: string) => void;
  onDeleted?: (id: string) => void;
}

const TYPE_CONFIG: Record<
  VaultDocType,
  { label: string; badge: string; icon: string }
> = {
  CLASS_10: { label: "Class 10 Proof", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: "🎓" },
  CLASS_12: { label: "Class 12 Proof", badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30", icon: "📜" },
  EXAM_SCORECARD: { label: "Exam Scorecard", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: "📊" },
  ID_PROOF: { label: "National ID", badge: "bg-violet-500/15 text-violet-400 border-violet-500/30", icon: "🪪" },
  PASSPORT: { label: "Official Passport", badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30", icon: "🛂" },
  MEDICAL_CERT: { label: "Medical Fitness", badge: "bg-rose-500/15 text-rose-400 border-rose-500/30", icon: "🩺" },
  APS_CERT: { label: "APS Certificate", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: "🇩🇪" },
  TRANSCRIPT: { label: "Transcript", badge: "bg-purple-500/15 text-purple-400 border-purple-500/30", icon: "📑" },
  OTHER: { label: "Credential", badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30", icon: "📁" },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export default function VaultCard({ document: d, onPreview, onDeleted }: Props) {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  const typeConfig = TYPE_CONFIG[d.docType] || TYPE_CONFIG.OTHER;

  const handleReclassify = async (newType: VaultDocType) => {
    setIsEditingCategory(false);
    const canonicalMap: Record<VaultDocType, string> = {
      CLASS_10: "class_10",
      CLASS_12: "class_12",
      EXAM_SCORECARD: "exam_scorecard",
      ID_PROOF: "national_id",
      PASSPORT: "passport",
      MEDICAL_CERT: "medical_fitness",
      APS_CERT: "transcript_degree",
      TRANSCRIPT: "transcript_degree",
      OTHER: "sop_lor_resume",
    };
    const updatedDoc: VaultDocument = {
      ...d,
      docType: newType,
      category: canonicalMap[newType] || "class_12",
    };
    try {
      await saveEncryptedDoc(updatedDoc);
    } catch (err) {
      console.error("Failed to reclassify document:", err);
    }
  };

  const handleVerifyIntegrity = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setVerifying(true);
    setVerifyResult(null);

    try {
      const decrypted = await getDecryptedDoc(d.id);
      const isValid = await verifyChecksum(decrypted.buffer, d.checksum);
      setVerifyResult(isValid);
    } catch (err) {
      console.error("Integrity check failed:", err);
      setVerifyResult(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadDecrypted = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const decrypted = await getDecryptedDoc(d.id);
      const blob = new Blob([decrypted.buffer], { type: decrypted.mimeType });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = decrypted.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Permanently delete "${d.label}" from your sovereign on-device vault?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteVaultDoc(d.id);
      if (onDeleted) onDeleted(d.id);
    } catch (err) {
      console.error("Delete failed:", err);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => onPreview(d.id)}
      className={cn(
        "rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-zinc-800 shadow-xs hover:shadow-md cursor-pointer relative group transition-all",
        isDeleting && "opacity-40 pointer-events-none"
      )}
    >
      {/* Top row: Type badge, lock pill, actions */}
      <div className="flex items-start justify-between gap-2 relative">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-base leading-none">{typeConfig.icon}</span>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingCategory((prev) => !prev);
              }}
              className={cn(
                "px-2 py-0.5 rounded-md text-[11px] font-bold border font-mono flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity",
                typeConfig.badge
              )}
              title="Click to reclassify credential category"
            >
              <span>{typeConfig.label}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
            </button>

            {isEditingCategory && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xl p-1.5 z-50 text-xs animate-in fade-in-0 duration-100"
              >
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-bold border-b border-slate-100 dark:border-zinc-800/80 mb-1">
                  Reclassify Category:
                </div>
                {Object.entries(TYPE_CONFIG).map(([k, cfg]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleReclassify(k as VaultDocType)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors",
                      d.docType === k
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </span>
                    {d.docType === k && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <Lock className="w-2.5 h-2.5" />
            AES-GCM-256
          </span>
        </div>

        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
          title="Delete from local vault"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Title & Filename */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors line-clamp-1">
          {d.label}
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate" title={d.fileName}>
          {d.fileName}
        </p>
      </div>

      {/* SHA-256 Checksum Fingerprint */}
      <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 font-mono text-[11px] flex items-center justify-between gap-2">
        <span className="text-slate-500 dark:text-zinc-400 text-[10px] uppercase font-bold shrink-0">SHA-256:</span>
        <span className="text-indigo-600 dark:text-indigo-400 truncate max-w-[190px] font-semibold" title={d.checksum}>
          {d.checksum}
        </span>
      </div>

      {/* Meta Row: Size & Upload Date */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono pt-1 border-t border-slate-100 dark:border-white/5">
        <span className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
          {formatBytes(d.fileSize)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
          {formatDate(d.uploadedAt)}
        </span>
      </div>

      {/* Live Integrity Banner (if checked) */}
      {verifyResult !== null && (
        <div
          className={cn(
            "p-2 rounded-xl text-[11px] font-mono flex items-center gap-1.5 border",
            verifyResult
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/15 border-red-500/30 text-red-300"
          )}
        >
          {verifyResult ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Integrity Confirmed (0 bits tampered)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Tamper Alert: Hash Mismatch</span>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(d.id);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold border border-slate-300 dark:border-zinc-700 shadow-xs transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Preview</span>
        </button>

        <button
          onClick={handleVerifyIntegrity}
          disabled={verifying}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold border border-slate-300 dark:border-zinc-700 shadow-xs transition-colors cursor-pointer"
          title="Re-run SHA-256 Tamper Verification"
        >
          <ShieldCheck className={cn("w-3.5 h-3.5", verifying ? "animate-spin text-indigo-400" : "text-emerald-500 dark:text-emerald-400")} />
          <span className="hidden sm:inline">Verify</span>
        </button>

        <button
          onClick={handleDownloadDecrypted}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 shadow-xs transition-colors cursor-pointer"
          title="Download decrypted file"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

