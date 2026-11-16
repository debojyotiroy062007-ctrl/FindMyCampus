"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, Upload, FileText, ChevronDown, Check, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/recommender";
import type { UserProfile, CountryCode } from "@/types/university";

interface Props {
  isOpen: boolean;
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

const DEGREE_OPTIONS = [
  "B.Tech Computer Science & Engineering",
  "B.Tech / B.E. Electronics & Communication",
  "B.S. Computer Science",
  "B.S. Artificial Intelligence",
  "M.S. / M.Tech Computer Science",
  "Integrated Dual Degree (B.Tech + M.S.)",
  "MBA / Management Tech",
];

const EXAM_PRESETS = [
  { name: "JEE Advanced", placeholder: "e.g. AIR 450", hint: "All-India Rank" },
  { name: "JEE Main", placeholder: "e.g. 99.85 %ile or AIR 2100", hint: "Percentile or Rank" },
  { name: "BITSAT", placeholder: "e.g. 335 / 390", hint: "Total Score" },
  { name: "VITEEE", placeholder: "e.g. Rank 3,800", hint: "All-India Rank" },
  { name: "SRMJEEE", placeholder: "e.g. Rank 4,200", hint: "All-India Rank" },
  { name: "WBJEE", placeholder: "e.g. GMR 115", hint: "General Merit Rank" },
  { name: "SAT", placeholder: "e.g. 1540 (Math 790)", hint: "Out of 1600" },
  { name: "ACT", placeholder: "e.g. 35", hint: "Out of 36" },
  { name: "TestAS", placeholder: "e.g. Standard Score 118", hint: "MINT Module (Germany)" },
  { name: "ATAR", placeholder: "e.g. 98.40", hint: "Australian Rank" },
  { name: "Class 12 Top 6 (Canada)", placeholder: "e.g. 96.5%", hint: "Board Percentage" },
];

export default function ResumeIntakeModal({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const { profile, setProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsingSuccess, setParsingSuccess] = useState(false);

  // Form State
  const [candidateName, setCandidateName] = useState("");
  const [targetDegree, setTargetDegree] = useState(DEGREE_OPTIONS[0]);
  const [boardPercentage, setBoardPercentage] = useState("96.2");
  const [primaryExam, setPrimaryExam] = useState("JEE Advanced");
  const [examScoreOrRank, setExamScoreOrRank] = useState("AIR 450");
  const [targetCountries, setTargetCountries] = useState<CountryCode[]>(["IN", "US", "DE"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Prepopulate if profile exists
  useEffect(() => {
    if (profile) {
      if (profile.name) setCandidateName(profile.name);
      if (profile.targetDegree) setTargetDegree(profile.targetDegree);
      if (profile.boardPercentage) setBoardPercentage(String(profile.boardPercentage));
      if (profile.primaryExam) setPrimaryExam(profile.primaryExam);
      if (profile.examScoreOrRank) setExamScoreOrRank(profile.examScoreOrRank);
      if (profile.targetCountries && profile.targetCountries.length > 0) {
        setTargetCountries(profile.targetCountries);
      }
    }
  }, [profile]);

  if (!mounted) return null;

  const toggleCountry = (code: CountryCode) => {
    setTargetCountries((prev) =>
      prev.includes(code)
        ? prev.length > 1
          ? prev.filter((c) => c !== code)
          : prev
        : [...prev, code]
    );
  };

  const simulateResumeParsing = (name: string) => {
    setFileName(name);
    setParsingSuccess(true);
    // Deterministic instant parsing simulation for UX
    const cleanName = name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    if (cleanName && !candidateName) {
      setCandidateName(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      simulateResumeParsing(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateResumeParsing(file.name);
    }
  };

  const handleSetProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: UserProfile = {
      name: candidateName.trim() || "Applicant",
      targetDegree,
      boardPercentage: parseFloat(boardPercentage) || 90.0,
      primaryExam,
      examScoreOrRank: examScoreOrRank.trim() || "Standard Floor",
      targetCountries,
      skills: ["Problem Solving", "Mathematics", "Computing"],
    };

    setProfile(newProfile);
    onClose();
  };

  const activePreset = EXAM_PRESETS.find((p) => p.name === primaryExam) || EXAM_PRESETS[0];

  const countryPills: { code: CountryCode; flag: string; label: string }[] = [
    { code: "IN", flag: "🇮🇳", label: "India" },
    { code: "US", flag: "🇺🇸", label: "USA" },
    { code: "GB", flag: "🇬🇧", label: "UK" },
    { code: "DE", flag: "🇩🇪", label: "Germany" },
    { code: "CA", flag: "🇨🇦", label: "Canada" },
    { code: "AU", flag: "🇦🇺", label: "Australia" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
          variants={overlayVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={onClose}
        >
          {/* Dialog Container */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 my-auto text-left text-zinc-900 dark:text-white"
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close (X) Button */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close profile intake modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pr-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Candidate Profile &amp; Resume Engine</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    On-Device Only
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Parsed locally in browser memory. Computes real-time target, competitive &amp; reach fits.
                </p>
              </div>
            </div>

            {/* Resume Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 mb-5",
                isDragging
                  ? "border-indigo-500 bg-indigo-500/15 shadow-[0_0_24px_rgba(99,102,241,0.25)]"
                  : parsingSuccess
                  ? "border-emerald-500/40 bg-emerald-500/8"
                  : "border-zinc-300 dark:border-white/15 hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-white/5"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                  <Upload className="w-5 h-5" />
                </div>
                {fileName ? (
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{fileName}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Drag &amp; drop candidate resume (PDF/DOCX) or{" "}
                      <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Strictly on-device parsing. Zero bytes transmitted to remote servers.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSetProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Candidate Name */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Candidate Legal Name
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 transition-colors"
                  />
                </div>

                {/* Target Degree */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Target Degree / Major
                  </label>
                  <div className="relative">
                    <select
                      value={targetDegree}
                      onChange={(e) => setTargetDegree(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white appearance-none focus:outline-none focus:border-indigo-500/70 transition-colors"
                    >
                      {DEGREE_OPTIONS.map((d) => (
                        <option key={d} value={d} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Primary Exam Selector & Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Primary Entrance Exam
                  </label>
                  <div className="relative">
                    <select
                      value={primaryExam}
                      onChange={(e) => {
                        const newExam = e.target.value;
                        setPrimaryExam(newExam);
                        const match = EXAM_PRESETS.find((p) => p.name === newExam);
                        if (match) setExamScoreOrRank(match.placeholder.replace("e.g. ", ""));
                      }}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white appearance-none focus:outline-none focus:border-indigo-500/70 transition-colors"
                    >
                      {EXAM_PRESETS.map((p) => (
                        <option key={p.name} value={p.name} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                          {p.name} ({p.hint})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
                      Score / Rank / Percentile
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">{activePreset.hint}</span>
                  </div>
                  <input
                    type="text"
                    value={examScoreOrRank}
                    onChange={(e) => setExamScoreOrRank(e.target.value)}
                    placeholder={activePreset.placeholder}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* 12th Board Percentage */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
                    Class 12 / Higher Secondary Aggregate (%)
                  </label>
                  <span className="text-[10px] text-zinc-500">CBSE / ISC / State / Abitur / Top 6</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="100"
                  value={boardPercentage}
                  onChange={(e) => setBoardPercentage(e.target.value)}
                  placeholder="e.g. 96.4"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 font-mono transition-colors"
                />
              </div>

              {/* Target Countries Pills */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
                  Target Admission Jurisdictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {countryPills.map(({ code, flag, label }) => {
                    const isSelected = targetCountries.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleCountry(code)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer",
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-600/25 border-indigo-500/60 text-indigo-900 dark:text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.25)] font-bold"
                            : "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                        <span className="text-sm leading-none">{flag}</span>
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_28px_rgba(99,102,241,0.5)] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Set Profile &amp; Recalculate Fits
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
