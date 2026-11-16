"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  FolderLock,
  Lock,
  HardDrive,
  Download,
  Upload,
  Trash2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Plus,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/authContext";
import type { VaultDocument, VaultDocType } from "@/types/vault";
import type { University } from "@/types/university";
import {
  getAllVaultDocs,
  getVaultStorageUsage,
  purgeAllVaultDocs,
  exportVaultBackup,
  importVaultBackup,
  seedDemoCredentials,
} from "@/lib/vault/db";
import VaultDropzone from "@/components/vault/VaultDropzone";
import VaultList from "@/components/vault/VaultList";
import PreFlightAuditCard from "@/components/vault/PreFlightAuditCard";
import VaultPreviewModal from "@/components/vault/VaultPreviewModal";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function VaultView() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [storageBytes, setStorageBytes] = useState(0);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [presetDocType, setPresetDocType] = useState<VaultDocType | null>(null);
  const [isDropzoneExpanded, setIsDropzoneExpanded] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const backupInputRef = useRef<HTMLInputElement>(null);

  const refreshVault = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        setDocuments([]);
        setStorageBytes(0);
        return;
      }
      const docs = await getAllVaultDocs();
      setDocuments(docs);
      const usage = await getVaultStorageUsage();
      setStorageBytes(usage);
    } catch (err) {
      console.error("Failed to refresh vault:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMounted(true);
    refreshVault();

    const handleVaultUpdated = () => refreshVault();
    window.addEventListener("findmycampus_vault_updated", handleVaultUpdated);
    return () => window.removeEventListener("findmycampus_vault_updated", handleVaultUpdated);
  }, [refreshVault]);

  if (!mounted) return null;

  const handleExportBackup = async () => {
    try {
      const json = await exportVaultBackup();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FindMyCampus_EncryptedVault_Backup_${new Date().toISOString().slice(0, 10)}.vault`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Backup export failed:", err);
      alert("Failed to generate vault backup.");
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importVaultBackup(text);
      await refreshVault();
      alert(`Successfully restored ${count} encrypted credentials into your sovereign vault.`);
    } catch (err) {
      console.error("Backup import failed:", err);
      alert("Invalid .vault backup package format or corrupt payload.");
    } finally {
      if (backupInputRef.current) backupInputRef.current.value = "";
    }
  };

  const handlePurgeAll = async () => {
    if (
      !confirm(
        "WARNING: This will permanently delete ALL encrypted credentials and cryptographic keys from this device. Proceed?"
      )
    ) {
      return;
    }
    await purgeAllVaultDocs();
    await refreshVault();
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      await seedDemoCredentials();
      await refreshVault();
    } catch (err) {
      console.error("Demo seeding failed:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUploadMissing = (docType?: VaultDocType) => {
    if (docType) {
      setPresetDocType(docType);
    }
    setIsDropzoneExpanded(true);
    // Smooth scroll to dropzone
    const el = document.getElementById("vault-dropzone-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleDispatchToAutoPilot = (univ: University) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("findmycampus_switch_view", { detail: "autopilot" })
      );
    }
  };

  return (
    <motion.div
      key="vault-view"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      className="w-full max-w-7xl mx-auto pl-16 sm:pl-20 pr-4 sm:pr-8 space-y-6 pb-28"
    >
      {/* Hidden input for backup restoration */}
      <input
        ref={backupInputRef}
        type="file"
        accept=".vault,.json"
        className="hidden"
        onChange={handleImportBackup}
      />

      {/* Sovereign Vault Header & Security Strip */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-5 border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0b0f19] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <FolderLock className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Sovereign Document &amp; Biometric Vault
              </h1>
              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                AES-GCM-256 Active • Host-Machine Sandboxed • 0 Bytes Cloud Shared
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
              Native WebCrypto authenticated encryption paired with IndexedDB binary persistence. Your sensitive credentials never leave your browser memory unencrypted.
            </p>
          </div>
        </div>

        {/* Action Controls - Visible when Authenticated */}
        {isAuthenticated && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Storage Meter */}
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 font-mono text-xs flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="text-slate-500 dark:text-zinc-400">Local Quota:</span>
              <strong className="text-indigo-600 dark:text-indigo-300">{formatBytes(storageBytes)}</strong>
            </div>

            {/* Seed Demo Credentials */}
            <button
              onClick={handleSeedDemo}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/35 border border-indigo-200 dark:border-indigo-500/35 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Pre-populate vault with realistic test credentials"
            >
              <Sparkles className={cn("w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400", isSeeding && "animate-spin")} />
              <span>{isSeeding ? "Encrypting..." : "Load Demo Credentials"}</span>
            </button>

            {/* Export Backup */}
            <button
              onClick={handleExportBackup}
              disabled={documents.length === 0}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                documents.length > 0
                  ? "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
                  : "bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-40"
              )}
              title="Download encrypted backup (.vault)"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">Export (.vault)</span>
            </button>

            {/* Import Backup */}
            <button
              onClick={() => backupInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Restore from .vault backup package"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Purge All Data */}
            {documents.length > 0 && (
              <button
                onClick={handlePurgeAll}
                className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                title="Purge all credentials from device"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Gated Authentication State */}
      {!isAuthenticated ? (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0b0f19] shadow-lg text-center max-w-2xl mx-auto space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-[0_0_25px_rgba(99,102,241,0.25)]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <span>Sovereign Storage Gate</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Vault Locked — Sign In Required
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Client-side encrypted storage requires an active candidate profile to isolate local IndexedDB cryptographic keys, salt vectors, and binary blobs. Your documents are encrypted with AES-GCM-256 directly on your device and never uploaded to any cloud server.
            </p>
          </div>

          {/* Three isolation badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">AES-GCM-256</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Authenticated on-device encryption</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
              <HardDrive className="w-4 h-4 text-indigo-500 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">User Isolated</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Per-account IndexedDB sandbox</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
              <Sparkles className="w-4 h-4 text-amber-500 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pre-Flight Audit</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Deterministic cutoff clearance</p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex items-center justify-center pt-3">
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Create Local Profile</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Pre-Flight Institutional Readiness Inspector */}
          <motion.div variants={itemVariants}>
            <PreFlightAuditCard
              vaultDocuments={documents}
              onUploadMissing={handleUploadMissing}
              onDispatchToAutoPilot={handleDispatchToAutoPilot}
            />
          </motion.div>

          {/* Document Ingestion Dropzone */}
          <motion.div variants={itemVariants} id="vault-dropzone-section">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Encrypt New Credential into Sovereign Vault
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                WebCrypto AES-GCM-256 Authenticated Encryption
              </span>
            </div>
            <VaultDropzone
              presetDocType={presetDocType}
              onUploadSuccess={() => {
                refreshVault();
                setPresetDocType(null);
              }}
            />
          </motion.div>

          {/* Encrypted Vault Documents Matrix */}
          <motion.div variants={itemVariants} className="pt-2">
            <div className="flex items-center gap-2 mb-3 px-1">
              <HardDrive className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Encrypted Documents Matrix ({documents.length})
              </h2>
            </div>
            <VaultList
              documents={documents}
              onPreview={(id) => setPreviewDocId(id)}
              onDeleted={() => refreshVault()}
              onOpenUpload={() => {
                const el = document.getElementById("vault-dropzone-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </motion.div>
        </>
      )}

      {/* Secure In-Memory Decrypted Viewer Modal */}
      <VaultPreviewModal
        documentId={previewDocId}
        onClose={() => setPreviewDocId(null)}
      />
    </motion.div>
  );
}

export default VaultView;
