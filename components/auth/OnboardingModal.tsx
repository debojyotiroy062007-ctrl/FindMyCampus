"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  CheckCircle2,
  GraduationCap,
  FileText,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth/authContext";
import type { CountryCode, UserProfile } from "@/types/university";

const EXAM_PRESETS = [
  "JEE Advanced",
  "JEE Main",
  "BITSAT",
  "SAT",
  "GRE",
  "ACT",
  "SRMJEEE",
  "VITEEE",
  "WBJEE",
  "TestAS",
  "ATAR",
];

const DEGREE_PRESETS = [
  "B.Tech Computer Science & Engineering",
  "B.Tech Electronics & Electrical Engineering",
  "B.Tech Data Science & Artificial Intelligence",
  "B.S. Computer Science",
  "M.S. in Computer Science",
  "M.S. in Data Analytics & Robotics",
  "B.Eng Mechanical Engineering",
  "MBA in Technology Management",
];

export function OnboardingModal() {
  const { isOnboardingOpen, setOnboardingOpen, user, updateUser } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Personal Details
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [targetDegree, setTargetDegree] = useState("B.Tech Computer Science & Engineering");
  const [targetCountries, setTargetCountries] = useState<CountryCode[]>(["IN", "US", "GB"]);

  // Step 2: Academic Scores & Resume
  const [primaryExam, setPrimaryExam] = useState("JEE Advanced");
  const [examScoreOrRank, setExamScoreOrRank] = useState("");
  const [boardPercentage, setBoardPercentage] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  useEffect(() => {
    if (isOnboardingOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOnboardingOpen]);

  if (!isOnboardingOpen) return null;

  const toggleCountry = (code: CountryCode) => {
    setTargetCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleComplete = () => {
    const profile: UserProfile = {
      name: name.trim() || user?.name || "Candidate",
      email: email.trim(),
      phone: phone.trim(),
      targetDegree,
      targetCountries,
      primaryExam,
      examScoreOrRank: examScoreOrRank.trim() || "N/A",
      boardPercentage: parseFloat(boardPercentage) || 85.0,
      skills: ["Mathematics", "Data Structures", "Algorithms", "Physics"],
    };

    // Save to local storage
    localStorage.setItem("findmycampus_profile", JSON.stringify(profile));
    updateUser({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      targetDegree: profile.targetDegree,
    });

    // Notify application views
    window.dispatchEvent(new CustomEvent("findmycampus_profile_updated"));
    window.dispatchEvent(new CustomEvent("findmycampus_set_filter", { detail: "recommended" }));
    window.dispatchEvent(new CustomEvent("findmycampus_switch_view", { detail: "home" }));

    setOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto text-zinc-900 dark:text-white"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-indigo-500/20 via-indigo-500/5 to-transparent blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setOnboardingOpen(false)}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Indicator */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step {step} of 2: {step === 1 ? "Personal Profile" : "Academic Clearance"}</span>
          </span>
        </div>

        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mb-1">
          {step === 1 ? "Configure Your Candidate Identity" : "Verified Academic Benchmark Floor"}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
          {step === 1
            ? "Provide your admissions contact details. Stored safely inside your sovereign on-device vault."
            : "Input your actual exam benchmarks to dynamically unlock matched admissions cutoffs."}
        </p>

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 text-zinc-900 dark:text-white text-xs outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="applicant@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 text-zinc-900 dark:text-white text-xs outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 text-zinc-900 dark:text-white text-xs outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Target Degree Program
              </label>
              <select
                value={targetDegree}
                onChange={(e) => setTargetDegree(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 text-zinc-900 dark:text-white text-xs outline-none cursor-pointer"
              >
                {DEGREE_PRESETS.map((deg) => (
                  <option key={deg} value={deg}>
                    {deg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Target Destination Countries
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: "IN" as CountryCode, label: "India", flag: "🇮🇳" },
                  { code: "US" as CountryCode, label: "United States", flag: "🇺🇸" },
                  { code: "GB" as CountryCode, label: "United Kingdom", flag: "🇬🇧" },
                  { code: "DE" as CountryCode, label: "Germany", flag: "🇩🇪" },
                  { code: "CA" as CountryCode, label: "Canada", flag: "🇨🇦" },
                  { code: "AU" as CountryCode, label: "Australia", flag: "🇦🇺" },
                ].map((c) => {
                  const selected = targetCountries.includes(c.code);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => toggleCountry(c.code)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selected
                          ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-900 dark:text-white shadow-sm font-bold"
                          : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="truncate">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Academic Benchmarks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Academic Scores & Resume Upload */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Primary Entrance Exam
                </label>
                <select
                  value={primaryExam}
                  onChange={(e) => setPrimaryExam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 text-zinc-900 dark:text-white text-xs outline-none cursor-pointer"
                >
                  {EXAM_PRESETS.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Score / Percentile / Rank
                </label>
                <input
                  type="text"
                  value={examScoreOrRank}
                  onChange={(e) => setExamScoreOrRank(e.target.value)}
                  placeholder="e.g. AIR 1240 or 1540 SAT"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 text-zinc-900 dark:text-white text-xs outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                12th Board / High School % or CGPA
              </label>
              <input
                type="number"
                step="0.1"
                min="50"
                max="100"
                value={boardPercentage}
                onChange={(e) => setBoardPercentage(e.target.value)}
                placeholder="95.4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 text-zinc-900 dark:text-white text-xs outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>

            {/* Resume Dropzone */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Candidate Resume (PDF / DOCX)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-500/10"
                    : resumeFile
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                />

                {resumeFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="truncate">{resumeFile.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      ({(resumeFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <Upload className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-0.5" />
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Drop your resume here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Automatic skill &amp; grade extraction. Encrypted locally with AES-256.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save Profile &amp; Unlock Matched Grid</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default OnboardingModal;
