"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { University } from "@/types/university";
import { universities } from "@/lib/data/universities";
import UniversityLogo from "@/components/ui/UniversityLogo";

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

export interface UniversitySearchSelectProps {
  value: string;
  onChange: (universityId: string, university: University) => void;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
}

export function UniversitySearchSelect({
  value,
  onChange,
  className = "",
  triggerClassName = "",
  placeholder = "Select institution...",
}: UniversitySearchSelectProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find active selected university object
  const selectedUniv = useMemo(() => {
    return universities.find((u) => u.id === value) || universities[0];
  }, [value]);

  // Recalculate anchor positioning
  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = Math.min(Math.max(rect.width, 360), window.innerWidth - 32);
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - 16 - popoverWidth;
      }
      if (left < 16) left = 16;
      setCoords({
        top: rect.bottom + 6,
        left,
        width: popoverWidth,
      });
    }
  };

  // Click-outside, resize, and window scroll listeners
  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleResize = () => {
      updateCoords();
    };

    const handleScroll = (e: Event) => {
      // If scroll occurred inside the popover's own scrollable list, keep open
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      // Close immediately if user scrolls page or outside container
      setIsOpen(false);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) {
        return;
      }
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Filter universities based on search query and country
  const filteredUniversities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let dataset = universities;

    if (countryFilter !== "ALL") {
      dataset = dataset.filter((u) => u.countryCode === countryFilter);
    }

    if (!q) {
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
  }, [searchQuery, countryFilter]);

  const flag = COUNTRY_FLAGS[selectedUniv?.countryCode] || "🌐";

  return (
    <div className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updateCoords();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all shadow-xs text-left",
          isOpen
            ? "bg-white dark:bg-zinc-900 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white"
            : "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-zinc-600",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedUniv ? (
            <>
              <div className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                <UniversityLogo
                  university={selectedUniv}
                  size={20}
                  className="w-full h-full !p-0 !border-0 !bg-transparent !shadow-none"
                />
              </div>
              <span className="text-xs">{flag}</span>
              <span className="font-bold truncate text-slate-900 dark:text-white">
                {selectedUniv.shortName}
              </span>
              <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.2 rounded shrink-0">
                #{selectedUniv.nationalRank}
              </span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-zinc-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 dark:text-zinc-400 shrink-0 transition-transform duration-150",
            isOpen && "rotate-180 text-indigo-500"
          )}
        />
      </button>

      {/* Portal Dropdown Popover (Rendered in document.body with z-[9999] and 100% solid background) */}
      {isOpen &&
        mounted &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            className="z-[9999] rounded-2xl bg-white dark:bg-[#121215] opacity-100 shadow-2xl border border-slate-200 dark:border-zinc-800 p-3 text-slate-900 dark:text-white animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {/* Search Input Box */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all 600+ institutions (e.g. 'IIT', 'MIT', 'TUM', 'Oxford')..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Country Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2 mb-2 border-b border-slate-200 dark:border-zinc-800">
              {COUNTRY_FILTERS.map((c) => {
                const isCurrent = countryFilter === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountryFilter(c.code)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0",
                      isCurrent
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
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
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {filteredUniversities.length} found
              </span>
            </div>

            {/* Scrollable Results List with overscroll-contain */}
            <div className="max-h-72 overflow-y-auto overscroll-contain space-y-1 scrollbar-thin pr-1">
              {filteredUniversities.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">
                  No universities found matching "{searchQuery}".
                </div>
              ) : (
                filteredUniversities.map((item) => {
                  const itemFlag = COUNTRY_FLAGS[item.countryCode] || "🌐";
                  const isSelected = item.id === value;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange(item.id, item);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors border",
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500/40 text-indigo-900 dark:text-indigo-200 font-semibold"
                          : "bg-white dark:bg-[#121215] border-transparent text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
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
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                              {itemFlag} {item.countryCode}
                            </span>
                            <span className="font-bold truncate text-slate-900 dark:text-white">
                              {item.shortName}
                            </span>
                            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                              #{item.nationalRank}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                            {item.name} · {item.city}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default UniversitySearchSelect;

