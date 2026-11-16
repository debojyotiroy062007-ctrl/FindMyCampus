"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Lock,
  CheckCircle2,
  FileCheck,
  ChevronDown,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VaultDocType, VaultDocument } from "@/types/vault";
import type { CanonicalDocumentType } from "@/lib/vault/documentMatcher";
import { encryptDocument } from "@/lib/vault/crypto";
import { saveEncryptedDoc } from "@/lib/vault/db";

interface Props {
  presetDocType?: VaultDocType | null;
  onUploadSuccess?: (doc: VaultDocument) => void;
}

const CATEGORIES: {
  type: VaultDocType;
  canonical: CanonicalDocumentType;
  label: string;
  defaultName: string;
}[] = [
  { type: "CLASS_10", canonical: "class_10", label: "Class 10 Certificate & Passing Proof", defaultName: "Class 10 Board Certificate" },
  { type: "CLASS_12", canonical: "class_12", label: "Class 12 Marksheet (CBSE / ISC / State)", defaultName: "Class 12 Marksheet & Passing Proof" },
  { type: "EXAM_SCORECARD", canonical: "exam_scorecard", label: "Entrance Exam Scorecard (JEE / SAT / BITSAT)", defaultName: "Entrance Exam Scorecard" },
  { type: "ID_PROOF", canonical: "national_id", label: "National ID Proof (Aadhaar / National Identity)", defaultName: "Government Photo Identification" },
  { type: "PASSPORT", canonical: "passport", label: "Official Passport Copy (International Admissions)", defaultName: "Valid Republic Passport Copy" },
  { type: "MEDICAL_CERT", canonical: "medical_fitness", label: "Medical Fitness Certificate (Annexure / Physician)", defaultName: "Medical Fitness Certificate" },
  { type: "APS_CERT", canonical: "transcript_degree", label: "German APS Academic Verification Certificate", defaultName: "APS Verification Certificate (India)" },
  { type: "TRANSCRIPT", canonical: "transcript_degree", label: "Official Academic Transcripts (Semesters / Degree)", defaultName: "Official Academic Transcripts" },
  { type: "OTHER", canonical: "sop_lor_resume", label: "Recommendation / Statement of Purpose / Other", defaultName: "Supporting Admissions Document" },
];

export default function VaultDropzone({ presetDocType, onUploadSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<VaultDocType>(presetDocType || "CLASS_12");
  const [customLabel, setCustomLabel] = useState("");

  const [encrypting, setEncrypting] = useState(false);
  const [lastEncrypted, setLastEncrypted] = useState<{
    fileName: string;
    checksum: string;
    size: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync if presetDocType changes
  if (presetDocType && presetDocType !== selectedType && !customLabel) {
    setSelectedType(presetDocType);
  }

  const handleProcessFile = useCallback(
    async (file: File) => {
      setError(null);
      setEncrypting(true);
      setLastEncrypted(null);

      try {
        const fileBuffer = await file.arrayBuffer();

        // 1. Authenticated AES-GCM-256 On-Device Encryption
        const { ciphertext, iv, checksum } = await encryptDocument(fileBuffer);

        const currentCategory = CATEGORIES.find((c) => c.type === selectedType);
        const resolvedLabel = customLabel.trim() || currentCategory?.defaultName || file.name;

        const docRecord: VaultDocument = {
          id: crypto.randomUUID(),
          docType: selectedType,
          category: currentCategory?.canonical || "class_12",
          label: resolvedLabel,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          encryptedData: ciphertext,
          iv,
          checksum,
          uploadedAt: new Date().toISOString(),
        };

        // 2. Persist into Sovereign IndexedDB
        await saveEncryptedDoc(docRecord);

        setLastEncrypted({
          fileName: file.name,
          checksum,
          size: file.size,
        });
        setCustomLabel("");

        if (onUploadSuccess) {
          onUploadSuccess(docRecord);
        }
      } catch (err) {
        console.error("Encryption and storage failed:", err);
        setError("Encryption failed. Ensure WebCrypto is permitted in your browser context.");
      } finally {
        setEncrypting(false);
      }
    },
    [selectedType, customLabel, onUploadSuccess]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className="rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0b0f19] shadow-sm relative overflow-hidden transition-colors">
      {/* Category selector row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
            Document Classification
          </label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as VaultDocType)}
              className="w-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs appearance-none focus:outline-none focus:border-indigo-500/70 transition-colors cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.type} value={c.type} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
            Document Label / Verified Subject
          </label>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder={
              CATEGORIES.find((c) => c.type === selectedType)?.defaultName ||
              "e.g. CBSE 12th Senior Certificate"
            }
            className="w-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500/70 transition-colors"
          />
        </div>
      </div>

      {/* Dropzone container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !encrypting && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[160px]",
          isDragging
            ? "border-indigo-500 bg-indigo-500/15 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            : encrypting
            ? "border-indigo-500/60 bg-indigo-500/10"
            : "border-slate-300 dark:border-zinc-700 hover:border-indigo-500/60 hover:bg-slate-50 dark:hover:bg-white/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={encrypting}
        />

        <AnimatePresence mode="wait">
          {encrypting ? (
            <motion.div
              key="encrypting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-3"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <Lock className="w-4 h-4 text-indigo-400 absolute" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                  Encrypting Payload via WebCrypto AES-GCM-256...
                </p>
                <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-300 mt-0.5">
                  Deriving initialization vector &amp; computing SHA-256 digest
                </p>
              </div>
            </motion.div>
          ) : lastEncrypted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-2 py-1"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                Document Encrypted &amp; Secured in Sovereign Vault
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1 rounded-lg">
                <span className="text-slate-500 dark:text-zinc-500">SHA-256:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[280px]">
                  {lastEncrypted.checksum}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1">
                Click or drag another file to encrypt additional credentials
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2.5">
                <Upload className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                Drag &amp; drop credentials (<span className="text-slate-900 dark:text-white font-bold">.pdf, .png, .jpg</span>)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Zero Cloud Leak • Authenticated In-Memory Encryption with AES-GCM-256
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

