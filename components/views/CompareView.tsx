"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Briefcase,
  Award,
  Globe,
  Plus,
  X,
  Search,
  Check,
  Layers,
  ChevronDown,
  Zap,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { universities } from "@/lib/data/universities";
import type { University } from "@/types/university";
import { cn } from "@/lib/utils";
import UniversityLogo from "@/components/ui/UniversityLogo";

interface CompareViewProps {
  onNavigate?: (view: "home" | "matrix" | "compare" | "vault" | "autopilot" | "profile" | "settings") => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  UK: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
  SG: "🇸🇬",
  CH: "🇨🇭",
};

const COUNTRY_FILTERS = [
  { code: "ALL", label: "All (600+)" },
  { code: "IN", label: "🇮🇳 India" },
  { code: "US", label: "🇺🇸 United States" },
  { code: "GB", label: "🇬🇧 United Kingdom" },
  { code: "DE", label: "🇩🇪 Germany" },
  { code: "CA", label: "🇨🇦 Canada" },
  { code: "AU", label: "🇦🇺 Australia" },
];

export default function CompareView({ onNavigate }: CompareViewProps) {
  // Array of selected university IDs: 2 to 5 slots
  const [selectedIds, setSelectedIds] = useState<string[]>(["iit-bombay", "mit", "imperial"]);

  // Combobox state
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<Record<number, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with matrix selection if available in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("findmycampus_compare_pair");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setSelectedIds(parsed.slice(0, 5));
        }
      }
    } catch {
      // fallback to initial
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update localStorage when selectedIds changes
  useEffect(() => {
    try {
      localStorage.setItem("findmycampus_compare_pair", JSON.stringify(selectedIds));
    } catch {
      // ignore
    }
  }, [selectedIds]);

  // Resolve University objects across all 600+ universities
  const selectedUniversities = useMemo(() => {
    return selectedIds.map((id, index) => {
      const found = universities.find((u) => u.id === id);
      return found || universities[index % universities.length];
    });
  }, [selectedIds]);

  // Slot count selector helper
  const handleSetSlotCount = (count: number) => {
    if (count < 2 || count > 5) return;
    if (count === selectedIds.length) return;

    if (count < selectedIds.length) {
      setSelectedIds(selectedIds.slice(0, count));
    } else {
      const currentSet = new Set(selectedIds);
      const candidates = universities.filter((u) => !currentSet.has(u.id));
      const needed = count - selectedIds.length;
      const additional = candidates.slice(0, needed).map((u) => u.id);
      setSelectedIds([...selectedIds, ...additional]);
    }
  };

  const handleAddSlot = () => {
    if (selectedIds.length >= 5) return;
    const currentSet = new Set(selectedIds);
    const candidate = universities.find((u) => !currentSet.has(u.id)) || universities[0];
    setSelectedIds([...selectedIds, candidate.id]);
  };

  const handleRemoveSlot = (indexToRemove: number) => {
    if (selectedIds.length <= 2) return;
    setSelectedIds(selectedIds.filter((_, idx) => idx !== indexToRemove));
    if (dropdownIndex === indexToRemove) setDropdownIndex(null);
  };

  const handleSelectUniversity = (index: number, univId: string) => {
    const updated = [...selectedIds];
    updated[index] = univId;
    setSelectedIds(updated);
    setDropdownIndex(null);
    setSearchQueries((prev) => ({ ...prev, [index]: "" }));
  };

  // Real-time search across all 600+ universities across all 6 countries
  const getFilteredUniversities = (slotIndex: number) => {
    const q = (searchQueries[slotIndex] || "").toLowerCase().trim();
    const countryFilter = selectedCountryFilter[slotIndex] || "ALL";

    let dataset = universities;
    if (countryFilter !== "ALL") {
      dataset = dataset.filter((u) => u.countryCode === countryFilter);
    }

    if (!q) {
      // Return representative global top list sorted by national rank and QS
      return dataset.slice(0, 80);
    }

    return dataset
      .filter((u) => {
        const nameMatch = u.name.toLowerCase().includes(q);
        const shortNameMatch = u.shortName.toLowerCase().includes(q);
        const cityMatch = u.city.toLowerCase().includes(q);
        const countryMatch = u.countryName.toLowerCase().includes(q);
        const codeMatch = u.countryCode.toLowerCase().includes(q);
        const examMatch = u.acceptedExams?.some((e) => e.toLowerCase().includes(q));
        return nameMatch || shortNameMatch || cityMatch || countryMatch || codeMatch || examMatch;
      })
      .slice(0, 80);
  };

  const handleDispatchAutopilot = (u: University) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("findmycampus_autopilot_target_univ", u.id);
      window.dispatchEvent(
        new CustomEvent("findmycampus_autopilot_select_university", { detail: u.id })
      );
      window.dispatchEvent(
        new CustomEvent("findmycampus_switch_view", { detail: "autopilot" })
      );
    }
  };

  return (
    <div className="space-y-8 pb-28 max-w-7xl mx-auto w-full">
      {/* =========================================================================
          TOP HEADER CONTROLS (Slot Count, Summary, Add Slot)
         ========================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Dynamic Compare Matrix</span>
              <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/25 px-2.5 py-0.5 rounded-full font-semibold">
                600+ VERIFIED INSTITUTIONS
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Side-by-side synchronized comparison across 2 to 5 elite institutions: verified placements, cost ROI, and admissions floors.
            </p>
          </div>
        </div>

        {/* Slot Count Controller */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 px-2 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>COLUMNS:</span>
            </span>
            {[2, 3, 4, 5].map((cnt) => (
              <button
                key={cnt}
                onClick={() => handleSetSlotCount(cnt)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
                  selectedIds.length === cnt
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5"
                )}
                title={`Compare ${cnt} Institutions`}
              >
                {cnt}
              </button>
            ))}
            {selectedIds.length < 5 && (
              <button
                onClick={handleAddSlot}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors cursor-pointer"
                title="Add institution slot"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          UNIFIED HORIZONTAL SCROLL CONTAINER & AUTO-SCALING COLUMN GRID
          Every tier (header, placement, admissions) is wrapped in a single shared
          overflow-x-auto container so all cards scroll together in lockstep.
         ========================================================================= */}
      {selectedIds.length >= 4 && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-zinc-400 mb-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span>Horizontal scroll active • Swipe or shift+scroll to view all {selectedIds.length} columns</span>
        </div>
      )}

      <div className="w-full overflow-x-auto pb-8 scrollbar-thin">
        <div
          ref={dropdownRef}
          className="grid gap-5 min-w-full"
          style={{
            gridTemplateColumns: `repeat(${selectedUniversities.length}, minmax(320px, 1fr))`,
          }}
        >
          {selectedUniversities.map((univ, index) => {
            const isDropdownOpen = dropdownIndex === index;
            const searchVal = searchQueries[index] || "";
            const currentCountry = selectedCountryFilter[index] || "ALL";
            const filtered = getFilteredUniversities(index);
            const p = univ.placementMetrics;
            const cseCutoff =
              univ.branchCutoffs?.find((b) => b.branchName.toLowerCase().includes("comp")) ||
              univ.branchCutoffs?.[0];
            const flag = COUNTRY_FLAGS[univ.countryCode] || "🌐";

            return (
              <div
                key={`univ-col-${index}-${univ.id}`}
                className="flex flex-col gap-5 min-w-[320px]"
              >
                {/* -------------------------------------------------------------
                    TIER 1: INSTITUTION IDENTITY & COMBOBOX SELECTOR
                   ------------------------------------------------------------- */}
                <div
                  className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 bg-white/85 dark:bg-[#0d1117]/85 relative shadow-sm flex flex-col justify-between gap-4 transition-all"
                  style={{
                    borderTop: `3px solid ${univ.themeColor?.primary || "#6366f1"}`,
                  }}
                >
                  {/* Slot Label & Combobox Selector */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span>COLUMN #{index + 1}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Change Button / Combobox Trigger */}
                      <div className="relative">
                        <button
                          onClick={() => setDropdownIndex(isDropdownOpen ? null : index)}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition-all shadow-sm",
                            isDropdownOpen
                              ? "bg-violet-600 text-white border-violet-600"
                              : "bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:border-violet-500"
                          )}
                        >
                          <span>Change</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {/* Real-time 600-University Search Dropdown */}
                        {isDropdownOpen && (
                          <div
                            className={cn(
                              "absolute mt-2 w-[320px] sm:w-[350px] rounded-2xl bg-white dark:bg-[#121215] z-50 shadow-2xl border border-slate-200 dark:border-zinc-800 backdrop-blur-none opacity-100 p-3 text-slate-900 dark:text-white",
                              index === 0
                                ? "left-0 origin-top-left"
                                : index === selectedUniversities.length - 1
                                ? "right-0 origin-top-right"
                                : "left-0 sm:-left-12 origin-top"
                            )}
                          >
                            {/* Search Input Box */}
                            <div className="relative mb-2">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                              <input
                                type="text"
                                value={searchVal}
                                onChange={(e) =>
                                  setSearchQueries((prev) => ({ ...prev, [index]: e.target.value }))
                                }
                                placeholder="Search all 600+ institutions (e.g. 'IIT', 'MIT', 'TUM', 'Oxford')..."
                                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-colors"
                                autoFocus
                              />
                              {searchVal && (
                                <button
                                  onClick={() =>
                                    setSearchQueries((prev) => ({ ...prev, [index]: "" }))
                                  }
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Quick Country Filter Pills */}
                            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2 mb-2 border-b border-slate-200 dark:border-zinc-800">
                              {COUNTRY_FILTERS.map((c) => {
                                const isCurrentCountry = currentCountry === c.code;
                                return (
                                  <button
                                    key={c.code}
                                    onClick={() =>
                                      setSelectedCountryFilter((prev) => ({
                                        ...prev,
                                        [index]: c.code,
                                      }))
                                    }
                                    className={cn(
                                      "px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0",
                                      isCurrentCountry
                                        ? "bg-violet-600 text-white font-semibold"
                                        : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                  >
                                    {c.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Results Count Strip */}
                            <div className="flex items-center justify-between px-1 pb-1.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                              <span>MATCHING INSTITUTIONS:</span>
                              <span className="font-bold text-violet-600 dark:text-violet-400">
                                {filtered.length} found
                              </span>
                            </div>

                            {/* Scrollable Results List */}
                            <div className="max-h-72 overflow-y-auto space-y-1 scrollbar-thin pr-1">
                              {filtered.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">
                                  No universities found matching "{searchVal}".
                                </div>
                              ) : (
                                filtered.map((item) => {
                                  const itemFlag = COUNTRY_FLAGS[item.countryCode] || "🌐";
                                  const isSelected = item.id === univ.id;
                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() => handleSelectUniversity(index, item.id)}
                                      className={cn(
                                        "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors border",
                                        isSelected
                                          ? "bg-violet-50 dark:bg-violet-950/40 border-violet-500/40 text-violet-900 dark:text-violet-200 font-semibold"
                                          : "border-transparent bg-white dark:bg-[#121215] text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                                      )}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                          <UniversityLogo
                                            university={item}
                                            size={24}
                                            className="w-full h-full !p-0 !border-0 !bg-transparent !shadow-none"
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            {/* Country Badge */}
                                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                              {itemFlag} {item.countryCode}
                                            </span>
                                            <span className="font-bold truncate text-slate-900 dark:text-white">
                                              {item.shortName}
                                            </span>
                                            <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400">
                                              #{item.nationalRank}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                            {item.name} · {item.city}
                                          </p>
                                        </div>
                                      </div>

                                      {isSelected && (
                                        <Check className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Remove Column Button (if slots > 2) */}
                      {selectedIds.length > 2 && (
                        <button
                          onClick={() => handleRemoveSlot(index)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          title="Remove column"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Institution Crest, Name & Verified Ranks (Single-row flex baseline with locked 44px square logo) */}
                  <div className="flex items-center gap-3 min-w-0 pt-0.5">
                    {/* Locked rigid square logo: 44px x 44px */}
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-1.5 flex items-center justify-center overflow-hidden shadow-xs">
                      <UniversityLogo
                        university={univ}
                        size={32}
                        className="w-full h-full !p-0 !border-0 !bg-transparent !shadow-none"
                      />
                    </div>

                    {/* Adjacent title and rank area */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 overflow-hidden">
                        <span className="font-mono text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.5 rounded shrink-0">
                          #{univ.nationalRank} {univ.rankingBody?.split(" ")[0]}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded shrink-0">
                          QS #{univ.globalRankQS}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 shrink-0">
                          {flag} {univ.countryCode}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate" title={univ.name}>
                        {univ.name}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate font-normal" title={`${univ.city}, ${univ.countryName}`}>
                        {univ.city}, {univ.countryName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    TIER 2: PLACEMENT OUTCOMES & CAREER ROI CARD
                   ------------------------------------------------------------- */}
                <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 bg-white/85 dark:bg-[#0d1117]/85 space-y-4 shadow-sm flex-1 flex flex-col justify-between">
                  <div>
                    {/* Tier Subheader */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2.5 mb-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Placement Outcomes &amp; ROI</span>
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold">
                        VERIFIED
                      </span>
                    </div>

                    {/* Median & Average Placement */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                        Median Placement
                      </span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono block">
                        {p?.medianSalary || univ.medianPlacement}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 block pt-0.5">
                        Batch Average:{" "}
                        <strong className="text-slate-800 dark:text-zinc-200">
                          {p?.averageSalary || "High Quintile"}
                        </strong>
                      </span>
                    </div>

                    {/* Outlier Packages */}
                    <div className="space-y-1.5 pt-3">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                        Highest Outlier Packages
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                          <span className="text-[9px] text-slate-500 dark:text-zinc-400 block">DOMESTIC</span>
                          <span className="text-slate-900 dark:text-white font-bold block truncate">
                            {p?.highestPackage?.domestic || "Top Tier"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                          <span className="text-[9px] text-slate-500 dark:text-zinc-400 block">INT'L</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold block truncate">
                            {p?.highestPackage?.international || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Placement Rate Gauge */}
                    <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 mt-3">
                      <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-zinc-400 mb-1.5">
                        <span>PLACEMENT RATE</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          {p?.placementRate || 95}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                          style={{ width: `${p?.placementRate || 95}%` }}
                        />
                      </div>
                      {p?.ppoRate && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-1 block">
                          PPO Conversion: {p.ppoRate}%
                        </span>
                      )}
                    </div>

                    {/* Top Recruiters */}
                    <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 mt-3">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                        Prime Recruiters
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(p?.topRecruiters || ["Google", "Microsoft", "Goldman Sachs"]).slice(0, 5).map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 font-medium"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Post-Study Work Visa */}
                  <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center gap-2 text-xs">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span className="text-slate-700 dark:text-zinc-300 font-medium truncate">
                      {p?.workVisaSupport || "Standard Post-Study Work Rights"}
                    </span>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    TIER 3: ADMISSIONS BENCHMARKS & TUITION FLOOR CARD
                   ------------------------------------------------------------- */}
                <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 bg-white/85 dark:bg-[#0d1117]/85 space-y-4 shadow-sm flex flex-col justify-between">
                  <div>
                    {/* Tier Subheader */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2.5 mb-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Admissions &amp; Cost Floor</span>
                      </span>
                      <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-semibold">
                        OFFICIAL
                      </span>
                    </div>

                    {/* Tuition Fee */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                        Annual Tuition Fee
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono block">
                        {univ.tuitionAnnual?.localAmount || "Standard Fee"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                        ≈ {univ.tuitionAnnual?.inrEquivalent || "Direct Conversion"}
                      </span>
                    </div>

                    {/* Cutoff Floor */}
                    <div className="space-y-1 pt-3">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                        Flagship Branch / CSE Floor
                      </span>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono block">
                          {cseCutoff ? cseCutoff.benchmark : "Holistic Portfolio / Exam Review"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-0.5 truncate">
                          {cseCutoff ? cseCutoff.branchName : "General Benchmark"}
                        </span>
                      </div>
                    </div>

                    {/* Accepted Exams & Acceptance Rate */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 min-w-0">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase font-mono">
                          Accepted Exams
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block mt-0.5">
                          {univ.acceptedExams?.join(", ") || "Standard"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 min-w-0">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase font-mono">
                          Acceptance Rate
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 block mt-0.5">
                          {univ.acceptanceRate || "Selective"}
                        </span>
                      </div>
                    </div>

                    {/* Mandatory Documents Count */}
                    <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400">Required Documents:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {univ.requiredDocs?.length || 4} Certificates
                      </span>
                    </div>
                  </div>

                  {/* Direct Action Auto-Pilot Dispatch */}
                  <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 mt-2">
                    <button
                      onClick={() => handleDispatchAutopilot(univ)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                      title="Pre-fill and dispatch application in Auto-Pilot"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Auto-Fill Dossier →</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
