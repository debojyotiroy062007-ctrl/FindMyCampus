"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Globe,
  FileText,
  ShieldCheck,
  Edit3,
  Trash2,
  FolderLock,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useProfile } from "@/lib/recommender";
import { useAuth } from "@/lib/auth/authContext";
import type { ViewId } from "@/components/NavigationTabs";

interface ProfileViewProps {
  onNavigate: (view: "home" | "matrix" | "compare" | "vault" | "autopilot" | "profile" | "settings") => void;
}

export default function ProfileView({ onNavigate }: ProfileViewProps) {
  const { profile, clearProfile } = useProfile();
  const { user, isAuthenticated, openAuthModal, openOnboardingModal } = useAuth();

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Candidate Profile & Academic Scores</h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Sovereign academic credentials used for deterministic admissions clearance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => (!isAuthenticated ? openAuthModal("signin") : openOnboardingModal())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{profile ? "Edit Academic Scores" : (!isAuthenticated ? "Sign In / Create Profile" : "Complete Profile Setup")}</span>
          </button>

          {profile && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your candidate profile?")) {
                  clearProfile();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 text-xs transition-colors cursor-pointer"
              title="Clear academic profile data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {!profile ? (
        <div className="rounded-2xl p-10 text-center border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-slate-500 dark:text-zinc-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Academic Profile Initialized</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
            Provide your entrance exam scores (JEE, SAT, BITSAT, etc.) and high school board marks to generate deterministic fit clearances across 300+ universities.
          </p>
          {!isAuthenticated ? (
            <button
              onClick={() => openAuthModal("signin")}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              Sign In / Create Local Profile
            </button>
          ) : (
            <button
              onClick={() => openOnboardingModal()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              Set Profile &amp; Intake Scores →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity & Basic Details */}
          <div className="rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                {(profile.name || user?.name || "C")[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {profile.name || user?.name || "Candidate"}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED LOCAL NODE
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs border-t border-slate-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-300">
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <span className="truncate">{profile.email || user?.email || "candidate@findmycampus.local"}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-300">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-300">
                <GraduationCap className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span className="font-medium text-slate-900 dark:text-white">{profile.targetDegree}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                Target Destinations
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {profile.targetCountries && profile.targetCountries.length > 0 ? (
                  profile.targetCountries.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 font-semibold"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 dark:text-zinc-400">All Destinations</span>
                )}
              </div>
            </div>
          </div>

          {/* Academic Benchmarks */}
          <div className="md:col-span-2 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Official Academic Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1 block">
                  Primary Entrance Exam
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{profile.primaryExam}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1 block">
                  Score / All-India Rank
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {profile.examScoreOrRank}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1 block">
                  Class 12th Board Marks
                </span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {profile.boardPercentage}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1 block">
                  Uploaded Resume Dossier
                </span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 min-w-0">
                    <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="truncate">{profile.resumeFileName || "No resume parsed"}</span>
                  </div>
                  <button
                    onClick={() => openOnboardingModal()}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                  >
                    Upload PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions to Vault & Auto-Pilot */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate("vault")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-all cursor-pointer"
                >
                  <FolderLock className="w-3.5 h-3.5" />
                  <span>Open Sovereign Vault</span>
                </button>

                <button
                  onClick={() => onNavigate("autopilot")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold text-xs transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Dispatch via Auto-Pilot</span>
                </button>
              </div>

              <button
                onClick={() => onNavigate("matrix")}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer"
              >
                View Matches in Matrix →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

