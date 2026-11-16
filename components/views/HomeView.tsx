"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Search,
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  Compass,
  FileText,
  Zap,
  GraduationCap,
  TrendingUp,
  Sliders,
} from "lucide-react";
import { HeroHeader } from "@/components/HeroHeader";
import { useProfile, computeFit } from "@/lib/recommender";
import { useAuth } from "@/lib/auth/authContext";
import { universities } from "@/lib/data/universities";
import type { University } from "@/types/university";
import type { ViewId } from "@/components/NavigationTabs";
import UniversityCard from "@/components/matrix/UniversityCard";
import UniversityDrawer from "@/components/matrix/UniversityDrawer";
import ContactSection from "@/components/home/ContactSection";

interface HomeViewProps {
  onNavigate: (view: "home" | "matrix" | "compare" | "vault" | "autopilot" | "profile" | "settings") => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const { profile } = useProfile();
  const { isAuthenticated, openAuthModal, openOnboardingModal } = useAuth();
  const [drawerUniversity, setDrawerUniversity] = useState<University | null>(null);
  const [quickSearch, setQuickSearch] = useState("");

  // Compute recommendations for the candidate or flagship benchmarks
  const recommendedUniversities = useMemo(() => {
    if (!profile) {
      // Curated flagship institutions across all 6 destination countries
      const flagshipIds = ["iit-madras", "mit", "oxford", "ca-u-of-t", "tum-munich", "melbourne"];
      const matched = flagshipIds
        .map((id) => universities.find((u) => u.id === id))
        .filter(Boolean) as University[];

      return matched.map((u) => ({
        u,
        fit: "Competitive Fit" as const,
      }));
    }

    const fits: { u: University; fit: string }[] = [];
    for (const u of universities) {
      const fit = computeFit(profile, u);
      if (fit === "Target Choice" || fit === "Competitive Fit") {
        fits.push({ u, fit });
      }
    }

    // Sort by nationalRank ascending, take top 6
    fits.sort((a, b) => a.u.nationalRank - b.u.nationalRank);
    return fits.slice(0, 6);
  }, [profile]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onNavigate("matrix");
    }
  };

  return (
    <div className="w-full space-y-6 pb-28 max-w-7xl mx-auto">
      {/* Dynamic Animated Hero Header */}
      <HeroHeader />

      {/* Instant Discovery & Search Bar */}
      <section className="relative -mt-4">
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-2xl mx-auto flex items-center bg-white/80 border border-slate-200 text-slate-900 shadow-sm dark:bg-[#0d1117]/80 dark:border-zinc-800 dark:text-zinc-100 rounded-2xl p-2 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_25px_rgba(99,102,241,0.25)] transition-all"
        >
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 ml-3 shrink-0" />
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Search 600 verified institutions across 6 destinations (e.g. 'IIT Madras', 'MIT', 'Waterloo', 'TUM', 'Melbourne')..."
            className="w-full bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onNavigate("matrix")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Explore Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Tag Pills */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Popular:</span>
          {["NIRF Engineering", "US Top 100", "UK Russell Group", "Zero Tuition (TUM)", "AI & Computing"].map((tag) => (
            <button
              key={tag}
              onClick={() => onNavigate("matrix")}
              className="px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200 text-slate-800 shadow-sm dark:bg-[#0d1117]/80 dark:border-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer text-[11px]"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Dynamic Recommendations Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{profile ? "Personalized Recommendations" : "Curated Global Flagships"}</span>
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  {profile ? "LIVE MATCH" : "BENCHMARK PREVIEW"}
                </span>
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {profile
                  ? `Deterministic matches tailored to ${profile.name || "Candidate"} (${profile.primaryExam} AIR/Score ${profile.examScoreOrRank})`
                  : "Top-ranked institutions across India NIRF, US Top 100, UK Russell Group, Canada, Germany, and Australia"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile ? (
              <button
                onClick={() => onNavigate("matrix")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-indigo-600 shadow-sm dark:bg-zinc-900 dark:border-indigo-500/30 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <span>View Full Matrix ({universities.length} Institutions)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => (isAuthenticated ? openOnboardingModal() : openAuthModal("signin"))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>{isAuthenticated ? "Complete Profile Setup" : "Sign In to Match Profile"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Cards - Always Rendered */}
        {recommendedUniversities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedUniversities.map(({ u, fit }) => (
              <UniversityCard
                key={u.id}
                university={u}
                fit={fit as any}
                onViewDetails={() => setDrawerUniversity(u)}
                compareDisabled
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-8 text-center border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0d1117]/80 shadow-sm">
            <GraduationCap className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Expanding Recommendation Bounds</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-4">
              Your profile is active. Open the University Matrix to browse institutions across India NIRF, US Top 100, and UK Top 100.
            </p>
            <button
              onClick={() => onNavigate("matrix")}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg"
            >
              Browse Full Matrix →
            </button>
          </div>
        )}

        {/* Profile Intake Callout if Profile Not Yet Set */}
        {!profile && (
          <div className="relative overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-500/25 p-5 sm:p-6 bg-gradient-to-br from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-[#0d1117]/80 dark:to-[#07090e] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Deterministic Scoring Engine · 100% On-Device</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                Unlock Precision Admissions Clearance for All 600+ Universities
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Connect your entrance exam (JEE Advanced/Mains, SAT, BITSAT, TestAS, ATAR) and 12th board percentage to calibrate personalized Target, Competitive, and Reach match fit classifications. Zero telemetry leaves your local node.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => (isAuthenticated ? openOnboardingModal() : openAuthModal("signup"))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Intake &amp; Audit</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Feature Pillar Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate("matrix")}
          className="group rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0d1117]/80 hover:border-indigo-500/40 transition-all cursor-pointer relative overflow-hidden shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5 flex items-center justify-between">
            <span>300+ Scaled Catalog</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Official NIRF Engineering #1–100, US Top 100, and UK Top 100 institutions with verified cutoffs, verified tuition fees, and official application portals.
          </p>
        </div>

        <div
          onClick={() => onNavigate("vault")}
          className="group rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0d1117]/80 hover:border-emerald-500/40 transition-all cursor-pointer relative overflow-hidden shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5 flex items-center justify-between">
            <span>Sovereign Document Vault</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            AES-GCM-256 encrypted local storage in browser IndexedDB. Store transcripts, identity proofs, and scorecards with deterministic pre-flight compliance audits.
          </p>
        </div>

        <div
          onClick={() => onNavigate("autopilot")}
          className="group rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0d1117]/80 hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5 flex items-center justify-between">
            <span>Auto-Pilot PDF Dossier</span>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Generate tamper-proof, stamped PDF application dossiers directly on-device using client-side Web Crypto and pdf-lib. Zero telemetry or server transmission.
          </p>
        </div>
      </section>

      {/* System Telemetry & Sovereign Node Verification */}
      <section className="rounded-2xl p-5 border border-slate-200 dark:border-zinc-800/70 bg-white/80 dark:bg-[#0d1117]/80 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-zinc-800 dark:text-zinc-300 font-semibold uppercase tracking-wider">
              SOVEREIGN NODE: ONLINE
            </span>
          </div>
          <div className="flex items-center gap-6 text-zinc-600 dark:text-zinc-400 flex-wrap">
            <span>CATALOG: {universities.length} VERIFIED INSTITUTIONS</span>
            <span>ENCRYPTION: AES-GCM-256 AUTHENTICATED</span>
            <span>STORAGE: INDEXEDDB LOCAL BINARY BLOBS</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ZERO CLOUD LEAK</span>
          </div>
        </div>
      </section>

      {/* Direct Architect & Admissions Engine Support */}
      <ContactSection />

      {/* University Details Drawer */}
      <UniversityDrawer
        university={drawerUniversity}
        isOpen={!!drawerUniversity}
        onClose={() => setDrawerUniversity(null)}
      />
    </div>
  );
}
