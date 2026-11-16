"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, Filter, FolderLock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VaultDocument, VaultDocType } from "@/types/vault";
import VaultCard from "./VaultCard";

interface Props {
  documents: VaultDocument[];
  onPreview: (id: string) => void;
  onDeleted?: (id: string) => void;
  onOpenUpload?: () => void;
}

const CATEGORY_FILTERS: { type: VaultDocType | "ALL"; label: string }[] = [
  { type: "ALL", label: "All Credentials" },
  { type: "CLASS_10", label: "Class 10" },
  { type: "CLASS_12", label: "Class 12" },
  { type: "EXAM_SCORECARD", label: "Exam Scorecards" },
  { type: "PASSPORT", label: "Passports" },
  { type: "ID_PROOF", label: "National ID" },
  { type: "MEDICAL_CERT", label: "Medical" },
  { type: "APS_CERT", label: "APS Certificate" },
  { type: "TRANSCRIPT", label: "Transcripts" },
];

const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

export default function VaultList({ documents, onPreview, onDeleted, onOpenUpload }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<VaultDocType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchesCategory = selectedCategory === "ALL" || d.docType === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.label.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.checksum.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credentials by title, filename, or SHA-256 hash..."
            className="w-full bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500/70 transition-colors"
          />
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-600 dark:text-zinc-400 font-mono flex items-center gap-1.5 shrink-0">
          <span>Encrypted Records:</span>
          <strong className="text-slate-900 dark:text-white">{filteredDocs.length}</strong>
          <span className="text-slate-400 dark:text-zinc-600">/</span>
          <span>{documents.length} Total</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {CATEGORY_FILTERS.map((cat) => {
          const isSelected = selectedCategory === cat.type;
          return (
            <button
              key={cat.type}
              onClick={() => setSelectedCategory(cat.type)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer",
                isSelected
                  ? "bg-indigo-600 text-white font-semibold border-indigo-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      <AnimatePresence mode="wait">
        {filteredDocs.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-3">
              <FolderLock className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {documents.length === 0 ? "Vault is Empty" : "No Matching Documents Found"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm mx-auto mb-4">
              {documents.length === 0
                ? "No credentials have been encrypted yet. Upload your marksheets, scorecards, and ID cards above to enable pre-flight clearance audits."
                : `No credentials found matching "${searchQuery}". Try selecting another category or resetting the search filter.`}
            </p>
            {documents.length === 0 && onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Encrypt Your First Credential
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${searchQuery}`}
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredDocs.map((doc) => (
              <motion.div key={doc.id} variants={cardVariants} layout>
                <VaultCard document={doc} onPreview={onPreview} onDeleted={onDeleted} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

