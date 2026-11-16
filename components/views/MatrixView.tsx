"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Sparkles, User, Search, ShieldCheck } from "lucide-react";
import {
  universities,
  getUniversitiesByCountry,
  getGlobalTopUniversities,
} from "@/lib/data/universities";
import { computeFit, useProfile } from "@/lib/recommender";
import { useCountry } from "@/lib/countryContext";
import type { University, FitCategory, CountryCode } from "@/types/university";
import GridFilterBar from "@/components/matrix/GridFilterBar";
import UniversityGrid from "@/components/matrix/UniversityGrid";
import UniversityDrawer from "@/components/matrix/UniversityDrawer";
import ComparisonDock from "@/components/matrix/ComparisonDock";
import ComparisonModal from "@/components/matrix/ComparisonModal";
import ResumeIntakeModal from "@/components/matrix/ResumeIntakeModal";

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.03 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
};

export default function MatrixView() {
  const { profile } = useProfile();
  const { country, setCountry } = useCountry();

  const [isGlobalUnified, setIsGlobalUnified] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [drawerUniversity, setDrawerUniversity] = useState<University | null>(null);
  const [compareList, setCompareList] = useState<University[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);

  // Listen for global custom events to open intake modal (e.g. from HeroHeader)
  useEffect(() => {
    const handleOpenIntake = () => setIntakeModalOpen(true);
    window.addEventListener("findmycampus_open_profile_modal", handleOpenIntake);
    return () => window.removeEventListener("findmycampus_open_profile_modal", handleOpenIntake);
  }, []);

  // Listen for quick filter events from the Left Control Rail
  useEffect(() => {
    const handleSetFilter = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      if (customEvent.detail !== undefined) {
        setActiveFilter(customEvent.detail);
      }
    };
    window.addEventListener("findmycampus_set_filter", handleSetFilter);
    return () => window.removeEventListener("findmycampus_set_filter", handleSetFilter);
  }, []);

  // Base list of institutions according to country or unified global mode
  const baseList = useMemo(() => {
    if (isGlobalUnified) {
      return getGlobalTopUniversities();
    }
    return getUniversitiesByCountry(country.code);
  }, [isGlobalUnified, country.code]);

  // Compute fit categories deterministically for each university in base list
  const fitMap = useMemo<Record<string, FitCategory>>(() => {
    if (!profile) return {};
    return Object.fromEntries(
      baseList.map((u) => [u.id, computeFit(profile, u)])
    );
  }, [profile, baseList]);

  // Filter list by search query and quick filter chips
  const filteredList = useMemo(() => {
    let list = baseList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((u) => {
        const inName = u.name.toLowerCase().includes(q) || u.shortName.toLowerCase().includes(q);
        const inCity = u.city.toLowerCase().includes(q) || (u.state || "").toLowerCase().includes(q);
        const inCountry = u.countryName.toLowerCase().includes(q);
        const inExams = u.acceptedExams.some((exam) => exam.toLowerCase().includes(q));
        const inBranches = u.branchCutoffs.some((b) => b.branchName.toLowerCase().includes(q));
        return inName || inCity || inCountry || inExams || inBranches;
      });
    }

    if (activeFilter === "recommended" && profile) {
      list = list.filter((u) => {
        const fit = fitMap[u.id];
        return fit === "Target Choice" || fit === "Competitive Fit";
      });
    } else if (activeFilter === "low-tuition") {
      list = list.filter((u) => {
        const amt = u.tuitionAnnual.localAmount.toLowerCase();
        const inr = u.tuitionAnnual.inrEquivalent.toLowerCase();
        return (
          amt.includes("free") ||
          amt.includes("zero") ||
          amt.includes("€600") ||
          amt.includes("€700") ||
          amt.includes("€3,000") ||
          amt.includes("10,000") ||
          amt.includes("55,000") ||
          inr.includes("free") ||
          inr.includes("1.") ||
          inr.includes("2.")
        );
      });
    } else if (activeFilter === "tier1-roi") {
      // Median placement exceeds tuition
      list = list.filter((u) => {
        return (
          u.medianPackage.inrEquivalent.includes("Crore") ||
          u.medianPackage.inrEquivalent.includes("Lakh") ||
          u.keyStrengths?.some((s) => s.toLowerCase().includes("roi") || s.toLowerCase().includes("highest"))
        );
      });
    }

    return list;
  }, [baseList, searchQuery, activeFilter, profile, fitMap]);

  const handleCompareToggle = (u: University) => {
    setCompareList((prev) => {
      let nextList: University[];
      if (prev.find((p) => p.id === u.id)) {
        nextList = prev.filter((p) => p.id !== u.id);
      } else {
        if (prev.length >= 5) return prev;
        nextList = [...prev, u];
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "findmycampus_compare_pair",
          JSON.stringify(nextList.map((x) => x.id))
        );
      }
      return nextList;
    });
  };

  const handleCountryChange = (c: CountryCode) => {
    setCountry(c);
    setSearchQuery("");
    setActiveFilter(null);
    setCompareList([]);
  };

  const currentRankingBody =
    baseList.length > 0 ? baseList[0].rankingBody : "Official Ranking Framework";

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Profile Ingestion Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 justify-between flex-wrap border-glow-hover"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-white leading-tight">
                {profile
                  ? `${profile.name || "Candidate"}: ${profile.primaryExam} (${profile.examScoreOrRank}) · 12th: ${profile.boardPercentage}%`
                  : "Upload Resume to Generate Tailored University Matches"}
              </p>
              {profile && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Recommender Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed truncate">
              {profile
                ? `Targeting ${profile.targetDegree} across ${profile.targetCountries?.join(", ") || "multiple countries"}. Cards show verified fit scores.`
                : "Deterministic local matching against native entrance exam benchmarks (JEE, SAT, BITSAT, WBJEE, TestAS, ATAR). Zero cloud leak."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIntakeModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/35 hover:border-indigo-500/60 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span>{profile ? "Edit Profile" : "Set Profile / Upload Resume →"}</span>
        </button>
      </motion.div>

      {/* Country Switching & Search Filter Bar */}
      <GridFilterBar
        selectedCountry={country.code}
        onCountryChange={handleCountryChange}
        isGlobalUnified={isGlobalUnified}
        onToggleGlobalUnified={setIsGlobalUnified}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        hasProfile={!!profile}
        onOpenProfile={() => setIntakeModalOpen(true)}
        totalInstitutions={filteredList.length}
        rankingBodyName={currentRankingBody}
        countryName={country.name}
      />

      {/* Architectural Canvas Frame with Vertical Dashed Guide Boundaries (Option 2 style) */}
      <div className="relative border-l border-r border-dashed border-slate-300 dark:border-zinc-800/60 px-4 sm:px-6 py-6 rounded-2xl bg-white/40 dark:bg-zinc-950/20">
        {/* Subtle Architectural Cross-hairs at Intersection Corners */}
        <div className="absolute -top-2.5 -left-2.5 select-none font-mono text-xs text-zinc-600 pointer-events-none z-10">┼</div>
        <div className="absolute -top-2.5 -right-2.5 select-none font-mono text-xs text-zinc-600 pointer-events-none z-10">┼</div>
        <div className="absolute -bottom-2.5 -left-2.5 select-none font-mono text-xs text-zinc-600 pointer-events-none z-10">┼</div>
        <div className="absolute -bottom-2.5 -right-2.5 select-none font-mono text-xs text-zinc-600 pointer-events-none z-10">┼</div>

        {/* Technical Coordinate Telemetry Header */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider pb-3 mb-5 border-b border-dashed border-slate-300 dark:border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>GRID://CANVAS.ACTIVE [{isGlobalUnified ? "QS_GLOBAL_TOP50" : country.code}]</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-zinc-600">
            <span>GUIDES: VERTICAL_ALIGNED</span>
            <span>CLEARANCE: DETERMINISTIC_AUDIT</span>
          </div>
          <div>INSTITUTIONS: {filteredList.length.toString().padStart(2, "0")} / {baseList.length.toString().padStart(2, "0")}</div>
        </div>

        {/* Universities Chunked Grid */}
        <UniversityGrid
          universities={filteredList}
          fitMap={fitMap}
          compareList={compareList}
          onCompareToggle={handleCompareToggle}
          onViewDetails={(u) => setDrawerUniversity(u)}
          searchQuery={searchQuery}
          onClearFilters={() => {
            setSearchQuery("");
            setActiveFilter(null);
          }}
        />

        {/* Architectural Bottom Ruler */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 pt-4 mt-6 border-t border-dashed border-zinc-800/60">
          <span>BENCHMARK_FRAMEWORK: {currentRankingBody}</span>
          <span>AUTONOMOUS MATRIX · ZERO CLOUD LEAK</span>
        </div>
      </div>

      {/* University Cutoffs & Document Checklist Drawer */}
      <UniversityDrawer
        university={drawerUniversity}
        isOpen={!!drawerUniversity}
        onClose={() => setDrawerUniversity(null)}
      />

      {/* Bottom Floating Comparison Dock */}
      <ComparisonDock
        selected={compareList}
        onClear={() => setCompareList([])}
        onCompare={() => {
          if (compareList.length >= 2) {
            localStorage.setItem(
              "findmycampus_compare_pair",
              JSON.stringify(compareList.map((x) => x.id))
            );
            window.dispatchEvent(
              new CustomEvent("findmycampus_switch_view", { detail: "compare" })
            );
          } else {
            setCompareModalOpen(true);
          }
        }}
        onRemove={(id) => setCompareList((prev) => prev.filter((u) => u.id !== id))}
      />

      {/* Multi-Institution Comparison Modal */}
      {compareModalOpen && compareList.length >= 2 && (
        <ComparisonModal
          universities={compareList}
          onClose={() => setCompareModalOpen(false)}
        />
      )}

      {/* Resume Intake & Profile Setup Modal */}
      <ResumeIntakeModal
        isOpen={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
      />
    </div>
  );
}
