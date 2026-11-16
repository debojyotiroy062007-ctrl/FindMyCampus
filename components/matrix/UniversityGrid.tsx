"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, ChevronDown, Sparkles } from "lucide-react";
import type { University, FitCategory } from "@/types/university";
import UniversityCard from "./UniversityCard";

interface UniversityGridProps {
  universities: University[];
  fitMap: Record<string, FitCategory>;
  compareList: University[];
  onCompareToggle: (u: University) => void;
  onViewDetails: (u: University) => void;
  searchQuery?: string;
  onClearFilters?: () => void;
}

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
};

const CHUNK_SIZE = 24;

export default function UniversityGrid({
  universities,
  fitMap,
  compareList,
  onCompareToggle,
  onViewDetails,
  searchQuery = "",
  onClearFilters,
}: UniversityGridProps) {
  const [visibleCount, setVisibleCount] = useState<number>(CHUNK_SIZE);

  // Reset pagination whenever the universities list changes (filter or country switch)
  useEffect(() => {
    setVisibleCount(CHUNK_SIZE);
  }, [universities.length, searchQuery]);

  const displayedUniversities = universities.slice(0, visibleCount);
  const hasMore = visibleCount < universities.length;
  const progressPercent = Math.min(100, Math.round((displayedUniversities.length / Math.max(1, universities.length)) * 100));

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={`grid-chunk-${visibleCount}-${universities.length}-${searchQuery}`}
          variants={gridVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {universities.length === 0 ? (
            <motion.div
              variants={cardVariants}
              className="col-span-full text-center py-16 px-4 rounded-2xl glass-card border border-white/5"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                No matching institutions found
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
                No institutions match your search query or filter in this view. Try adjusting criteria.
              </p>
              {onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </motion.div>
          ) : (
            displayedUniversities.map((u) => (
              <motion.div key={u.id} variants={cardVariants} layout>
                <UniversityCard
                  university={u}
                  fit={fitMap[u.id]}
                  isSelected={!!compareList.find((c) => c.id === u.id)}
                  compareDisabled={compareList.length >= 5}
                  onCompareToggle={() => onCompareToggle(u)}
                  onViewDetails={() => onViewDetails(u)}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Chunked Pagination & Load More Controls */}
      {hasMore && (
        <div className="pt-6 flex flex-col items-center justify-center gap-3">
          {/* Progress Bar & Telemetry */}
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span>SHOWING {displayedUniversities.length} OF {universities.length} INSTITUTIONS</span>
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-zinc-500">{progressPercent}%</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(universities.length, prev + CHUNK_SIZE))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-medium transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10"
            >
              <ChevronDown className="w-4 h-4 text-indigo-400" />
              <span>Load Next {Math.min(CHUNK_SIZE, universities.length - visibleCount)} Institutions</span>
            </button>

            <button
              onClick={() => setVisibleCount(universities.length)}
              className="px-4 py-2.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 text-xs font-mono transition-colors cursor-pointer"
            >
              Show All ({universities.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

