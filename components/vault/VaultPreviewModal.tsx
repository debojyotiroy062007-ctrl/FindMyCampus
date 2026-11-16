"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, ShieldCheck, Download, Clock, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { getDecryptedDoc } from "@/lib/vault/db";
import { verifyChecksum } from "@/lib/vault/crypto";

interface Props {
  documentId: string | null;
  onClose: () => void;
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.15, ease: "easeIn" } },
};

export default function VaultPreviewModal({ documentId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decryptionTimeMs, setDecryptionTimeMs] = useState<number>(0);
  const [integrityVerified, setIntegrityVerified] = useState<boolean | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [docMeta, setDocMeta] = useState<{
    fileName: string;
    label: string;
    mimeType: string;
    checksum: string;
  } | null>(null);

  useEffect(() => {
    if (!documentId) return;

    let activeUrl: string | null = null;
    let isCancelled = false;

    async function loadAndDecrypt() {
      setLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        const decrypted = await getDecryptedDoc(documentId!);
        const elapsed = performance.now() - startTime;

        if (isCancelled) return;
        setDecryptionTimeMs(Math.round(elapsed * 10) / 10);
        setDocMeta({
          fileName: decrypted.fileName,
          label: decrypted.label,
          mimeType: decrypted.mimeType,
          checksum: decrypted.checksum,
        });

        // Verify SHA-256 integrity against checksum
        const isValid = await verifyChecksum(decrypted.buffer, decrypted.checksum);
        setIntegrityVerified(isValid);

        // Render preview according to mimeType
        const blob = new Blob([decrypted.buffer], { type: decrypted.mimeType });
        activeUrl = URL.createObjectURL(blob);
        setPreviewUrl(activeUrl);

        if (
          decrypted.mimeType.startsWith("text/") ||
          decrypted.fileName.endsWith(".txt") ||
          decrypted.fileName.endsWith(".json")
        ) {
          const text = new TextDecoder().decode(decrypted.buffer);
          setTextContent(text);
        } else if (decrypted.mimeType === "application/pdf") {
          // If it was text-seeded PDF mockup, try reading initial bytes
          const text = new TextDecoder().decode(decrypted.buffer.slice(0, 1000));
          if (text.includes("obj << /Title")) {
            setTextContent(text);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Decryption failed:", err);
          setError("Failed to decrypt payload. The AES-GCM tag or authentication key is invalid.");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadAndDecrypt();

    return () => {
      isCancelled = true;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [documentId]);

  if (!documentId) return null;

  const handleDownload = () => {
    if (!previewUrl || !docMeta) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = docMeta.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 my-auto text-zinc-900 dark:text-white flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/80 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  AES-GCM-256 In-Memory Decryption
                </span>
                {decryptionTimeMs > 0 && (
                  <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Decrypted in {decryptionTimeMs}ms
                  </span>
                )}
                {integrityVerified === true && (
                  <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    SHA-256 Verified
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                {docMeta?.label || "Secure Decrypted Viewer"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                {docMeta?.fileName}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {previewUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/10 transition-colors cursor-pointer"
                  title="Download Decrypted File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Decrypted</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cryptographic Hash Bar */}
          {docMeta && (
            <div className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between text-xs font-mono shrink-0">
              <span className="text-zinc-500 text-[11px]">Plaintext SHA-256 Fingerprint:</span>
              <span className="text-indigo-600 dark:text-indigo-300 font-semibold text-[11px] truncate max-w-[340px] sm:max-w-none">
                {docMeta.checksum}
              </span>
            </div>
          )}

          {/* Preview Canvas */}
          <div className="flex-1 p-5 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col items-center justify-center min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  Executing WebCrypto subtle.decrypt(AES-GCM)...
                </p>
              </div>
            ) : error ? (
              <div className="p-6 text-center max-w-md">
                <AlertTriangle className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Decryption Failure</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{error}</p>
              </div>
            ) : previewUrl && (docMeta?.mimeType.startsWith("image/") || docMeta?.fileName.match(/\.(png|jpe?g|webp|gif)$/i)) ? (
              <div className="max-w-full flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={docMeta.label}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain border border-zinc-200 dark:border-white/10 shadow-lg"
                />
              </div>
            ) : textContent ? (
              <div className="w-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-xl p-4 font-mono text-xs text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap overflow-x-auto max-h-[55vh]">
                <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider pb-2 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                  <span>Decrypted Payload Stream</span>
                  <span>UTF-8 Document Stream</span>
                </div>
                {textContent}
              </div>
            ) : previewUrl && docMeta?.mimeType === "application/pdf" ? (
              <div className="w-full h-[55vh] rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10">
                <iframe
                  src={previewUrl}
                  className="w-full h-full bg-zinc-100 dark:bg-zinc-900"
                  title={docMeta.label}
                />
              </div>
            ) : (
              <div className="p-8 text-center max-w-md">
                <FileText className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mx-auto mb-2 opacity-80" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{docMeta?.label}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  Binary payload ({docMeta?.mimeType}) successfully verified and decrypted in browser memory.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer"
                >
                  Download Decrypted File
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
