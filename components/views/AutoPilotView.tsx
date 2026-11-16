"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  FileText,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  Archive,
  ChevronDown,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Check,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { universities } from "@/lib/data/universities";
import { useProfile } from "@/lib/recommender";
import { useAuth } from "@/lib/auth/authContext";
import { getAllVaultDocs } from "@/lib/vault/db";
import { auditUniversityPrerequisites } from "@/lib/vault/documentMatcher";
import { generateAdmissionsDossier, generateCompleteDossierZip } from "@/lib/autopilot/pdfEngine";
import type { University, UserProfile } from "@/types/university";
import type { VaultDocument } from "@/types/vault";
import { UniversityLogo } from "@/components/ui/UniversityLogo";
import { UniversitySearchSelect } from "@/components/matrix/UniversitySearchSelect";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  CA: "🇨🇦",
  AU: "🇦🇺",
};

export function AutoPilotView() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { profile } = useProfile();
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);

  // Selected Target Institution
  const [selectedUnivId, setSelectedUnivId] = useState<string>("iit-madras");

  // Step 1: Form pre-filled values
  const [candidateName, setCandidateName] = useState("");
  const [targetDegree, setTargetDegree] = useState("");
  const [boardPercentage, setBoardPercentage] = useState("");
  const [primaryExam, setPrimaryExam] = useState("JEE Advanced");
  const [examScoreOrRank, setExamScoreOrRank] = useState("");

  // Step 2: Selected documents to attach
  const [attachedDocIds, setAttachedDocIds] = useState<Record<string, boolean>>({});

  // Step 3: Legal Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  // Compilation & Dispatch State
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState<string>("");
  const [compiledPdfBytes, setCompiledPdfBytes] = useState<Uint8Array | null>(null);
  const [compiledPdfUrl, setCompiledPdfUrl] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Load vault documents and profile on mount
  useEffect(() => {
    setMounted(true);

    async function loadVault() {
      try {
        if (!isAuthenticated) {
          setVaultDocs([]);
          setAttachedDocIds({});
          return;
        }
        const docs = await getAllVaultDocs();
        setVaultDocs(docs);

        // Default all available docs to checked
        const initialMap: Record<string, boolean> = {};
        docs.forEach((d) => (initialMap[d.id] = true));
        setAttachedDocIds(initialMap);
      } catch (err) {
        console.error("Failed to load vault documents:", err);
      }
    }
    loadVault();

    const handleVaultUpdated = () => {
      loadVault();
    };
    window.addEventListener("findmycampus_vault_updated", handleVaultUpdated);

    // Check for pre-selected university from matrix card or drawer
    const storedTarget = localStorage.getItem("findmycampus_autopilot_target_univ");
    if (storedTarget && universities.some((u) => u.id === storedTarget)) {
      setSelectedUnivId(storedTarget);
    }

    const handleTargetSelected = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && universities.some((u) => u.id === customEvent.detail)) {
        setSelectedUnivId(customEvent.detail);
      }
    };

    window.addEventListener("findmycampus_autopilot_select_university", handleTargetSelected);
    return () => {
      window.removeEventListener("findmycampus_vault_updated", handleVaultUpdated);
      window.removeEventListener("findmycampus_autopilot_select_university", handleTargetSelected);
    };
  }, [isAuthenticated]);

  // Sync profile values into form fields
  useEffect(() => {
    if (profile) {
      setCandidateName(profile.name || "");
      setTargetDegree(profile.targetDegree || "B.Tech Computer Science & Engineering");
      setBoardPercentage(profile.boardPercentage ? String(profile.boardPercentage) : "");
      setPrimaryExam(profile.primaryExam || "JEE Advanced");
      setExamScoreOrRank(profile.examScoreOrRank || "");
    } else {
      setCandidateName("");
      setTargetDegree("");
      setBoardPercentage("");
      setPrimaryExam("");
      setExamScoreOrRank("");
    }
  }, [profile]);

  const selectedUniversity = useMemo(() => {
    return universities.find((u) => u.id === selectedUnivId) || universities[0];
  }, [selectedUnivId]);

  // Pre-flight clearance evaluation using single deterministic matching engine
  const auditResult = useMemo(() => {
    if (!selectedUniversity) return null;
    return auditUniversityPrerequisites(selectedUniversity, vaultDocs);
  }, [vaultDocs, selectedUniversity]);

  // Filter ONLY verified docs that are attached by the user (strict synchronization with Pre-Flight)
  const selectedDocsForDossier = useMemo(() => {
    if (!auditResult) return [];
    const clearedDocIds = new Set(
      auditResult.requirements
        .filter((r) => r.status === "CLEARED" && r.matchedDoc)
        .map((r) => r.matchedDoc!.id)
    );
    return vaultDocs.filter(
      (d) => clearedDocIds.has(d.id) && attachedDocIds[d.id] !== false
    );
  }, [auditResult, vaultDocs, attachedDocIds]);

  const toggleDocAttachment = (docId: string) => {
    setAttachedDocIds((prev) => ({
      ...prev,
      [docId]: prev[docId] === false ? true : false,
    }));
  };

  // Dispatch & Compile Engine
  const handleCompileAndDispatch = useCallback(async () => {
    if (!declarationAccepted) {
      alert("Please accept the legal declaration before compiling the dossier.");
      return;
    }

    setIsCompiling(true);
    setDispatchSuccess(false);

    try {
      setCompilationProgress("Initializing sovereign vector graphics engine...");
      await new Promise((r) => setTimeout(r, 200));

      setCompilationProgress("Resolving official institutional template layout...");
      await new Promise((r) => setTimeout(r, 200));

      const activeProfile: UserProfile = {
        name: candidateName,
        targetDegree,
        boardPercentage: parseFloat(boardPercentage) || 95.0,
        primaryExam,
        examScoreOrRank,
      };

      setCompilationProgress("Injecting cryptographic seals & verified credentials...");
      const pdfBytes = await generateAdmissionsDossier(
        activeProfile,
        selectedUniversity,
        selectedDocsForDossier
      );

      setCompiledPdfBytes(pdfBytes);

      setCompilationProgress("Rendering vector PDF stream...");
      await new Promise((r) => setTimeout(r, 150));

      // Create download blob & trigger file save
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setCompiledPdfUrl(url);

      const safeCandidate = (activeProfile.name || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeUniv = selectedUniversity.shortName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `${safeCandidate}_${safeUniv}_Admissions_Dossier_2026.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDispatchSuccess(true);
    } catch (err) {
      console.error("Dossier compilation failed:", err);
      alert("Failed to compile dossier. Please ensure all required credentials are valid.");
    } finally {
      setIsCompiling(false);
      setCompilationProgress("");
    }
  }, [
    candidateName,
    targetDegree,
    boardPercentage,
    primaryExam,
    examScoreOrRank,
    selectedUniversity,
    selectedDocsForDossier,
    declarationAccepted,
  ]);

  // Export Complete ZIP Package
  const handleExportZip = useCallback(async () => {
    setIsZipping(true);
    try {
      const activeProfile: UserProfile = {
        name: candidateName,
        targetDegree,
        boardPercentage: parseFloat(boardPercentage) || 95.0,
        primaryExam,
        examScoreOrRank,
      };

      // Compile PDF if not already compiled
      let pdfBytes = compiledPdfBytes;
      if (!pdfBytes) {
        pdfBytes = await generateAdmissionsDossier(
          activeProfile,
          selectedUniversity,
          selectedDocsForDossier
        );
        setCompiledPdfBytes(pdfBytes);
      }

      const zipBlob = await generateCompleteDossierZip(
        pdfBytes,
        activeProfile,
        selectedUniversity,
        selectedDocsForDossier
      );

      const safeCandidate = (activeProfile.name || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeUniv = selectedUniversity.shortName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const zipFileName = `${safeCandidate}_${safeUniv}_Complete_Application_Package.zip`;

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP creation failed:", err);
      alert("Failed to compile complete application package.");
    } finally {
      setIsZipping(false);
    }
  }, [
    candidateName,
    targetDegree,
    boardPercentage,
    primaryExam,
    examScoreOrRank,
    selectedUniversity,
    selectedDocsForDossier,
    compiledPdfBytes,
  ]);

  if (!mounted) return null;

  const flag = COUNTRY_FLAGS[selectedUniversity.countryCode] || "🌐";

  return (
    <motion.div
      key="autopilot-view"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      className="space-y-6 pb-20"
    >
      {/* Top Status & Enclave Security Pill */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Autonomous Auto-Pilot Form Dispatcher
              </h1>
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50 shadow-xs">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Zero Cloud Leak • In-Memory PDF Vector Compilation
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              Synthesizes verified credentials from your sovereign vault directly into standardized official university application dossiers. No remote server processing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 flex items-center gap-2 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Vector Engine Ready</span>
          </div>
        </div>
      </motion.div>

      {/* Gated Authentication State */}
      {!isAuthenticated ? (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0b0f19] shadow-lg text-center max-w-2xl mx-auto space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            <Zap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <span>Dossier Engine Gate</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In to Launch Auto-Pilot
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Deterministic form pre-filling and SHA-256 stamped PDF dossier generation require an active candidate profile and academic record. Sign in or create your local profile to link your verified credentials.
            </p>
          </div>

          {/* Three isolation badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
              <FileText className="w-4 h-4 text-amber-500 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auto Pre-Fill</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Extracts rank, percentiles &amp; scores</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
              <Lock className="w-4 h-4 text-emerald-500 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Vault Verified</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Binds encrypted credential proofs</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
              <ShieldCheck className="w-4 h-4 text-indigo-500 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">SHA-256 Seal</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Tamper-evident legal certification</p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex items-center justify-center pt-3">
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Create Local Profile</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* 3-Column Interactive Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Target Institution Selector (3 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-2xl p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
                Target Institution
              </span>
              <UniversitySearchSelect
                value={selectedUnivId}
                onChange={(newId) => {
                  setSelectedUnivId(newId);
                  localStorage.setItem("findmycampus_autopilot_target_univ", newId);
                }}
              />
            </div>

            {/* Selected Institution Meta Card with Crest */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-start gap-3">
                <UniversityLogo
                  university={selectedUniversity}
                  size={48}
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-sm">{flag}</span>
                    <span className="font-mono text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/25">
                      #{selectedUniversity.nationalRank} {selectedUniversity.rankingBody}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">
                      QS #{selectedUniversity.globalRankQS}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedUniversity.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                    {selectedUniversity.city}, {selectedUniversity.countryName}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Primary Exam:</span>
                  <span className="text-slate-900 dark:text-white font-mono font-semibold">
                    {selectedUniversity.acceptedExams[0] || "Standard Exam"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Filing Route:</span>
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold truncate max-w-[140px]">
                    {selectedUniversity.admissionRoute.split(" ")[0]} Portal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Regular Deadline:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {selectedUniversity.upcomingDeadlines[0]?.dateOrWindow || "Rolling"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Tuition Tier:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-semibold">
                    {selectedUniversity.tuitionAnnual.localAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Clearance Audit Mini Bar */}
            {auditResult && (
              <div
                className={cn(
                  "p-3 rounded-xl border text-xs shadow-sm",
                  auditResult.status === "GREEN"
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300"
                    : auditResult.status === "AMBER"
                      ? "bg-amber-50/70 border border-amber-200/80 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-300"
                      : "bg-rose-50/80 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-300"
                )}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Vault Pre-Flight:</span>
                  <span>{auditResult.scorePercentage}% Cleared</span>
                </div>
                <p className="text-[11px] opacity-90 leading-snug">
                  {auditResult.clearedCount} of {auditResult.totalRequired} credentials verified in local vault.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* CENTER COLUMN: Multi-Step Dossier Form Pre-Filled (5 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-2xl p-5 sm:p-6 space-y-6">
            {/* Step 1: Candidate Bio & Academic Metrics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Candidate Bio &amp; Academic Metrics
                </h2>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-slate-50/60 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-zinc-800/80">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Candidate Legal Full Name
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-medium rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                    placeholder="e.g. Alex Chen"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      Target Degree / Major
                    </label>
                    <input
                      type="text"
                      value={targetDegree}
                      onChange={(e) => setTargetDegree(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-medium rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      12th Board Aggregate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={boardPercentage}
                      onChange={(e) => setBoardPercentage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-medium rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      Primary Entrance Exam
                    </label>
                    <input
                      type="text"
                      value={primaryExam}
                      onChange={(e) => setPrimaryExam(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-medium rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      Score / Rank / Percentile
                    </label>
                    <input
                      type="text"
                      value={examScoreOrRank}
                      onChange={(e) => setExamScoreOrRank(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-indigo-700 dark:text-indigo-300 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Vault Attached Credentials Checklist (100% Synchronized with Pre-Flight Engine) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Sovereign Vault Credentials Attached
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {selectedDocsForDossier.length} / {auditResult?.totalRequired || 0} Verified Attached
                </span>
              </div>

              {!auditResult || auditResult.requirements.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 text-center">
                  <FolderLock className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">No prerequisite checklist found for this institution.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {auditResult.requirements.map((req) => {
                    if (req.status === "CLEARED" && req.matchedDoc) {
                      const isAttached = attachedDocIds[req.matchedDoc.id] !== false;
                      return (
                        <div
                          key={req.requiredName}
                          onClick={() => toggleDocAttachment(req.matchedDoc!.id)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all text-xs shadow-xs",
                            isAttached
                              ? "bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-slate-900 dark:text-zinc-200"
                              : "bg-slate-50/50 border-slate-200 dark:bg-zinc-950/40 dark:border-zinc-800/60 text-slate-400 dark:text-zinc-500 opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={cn(
                                "w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors",
                                isAttached
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                              )}
                            >
                              {isAttached && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold truncate leading-tight text-slate-900 dark:text-white">
                                  {req.requiredName}
                                </span>
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 font-bold">
                                  VERIFIED
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                                Matched: {req.matchedDoc.label} ({req.matchedDoc.fileName}) • SHA-256: {req.matchedDoc.checksum.slice(0, 16)}...
                              </p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "font-mono text-[10px] px-2 py-0.5 rounded border shrink-0 font-bold",
                              isAttached
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50"
                                : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
                            )}
                          >
                            {isAttached ? "ATTACHED" : "EXCLUDED"}
                          </span>
                        </div>
                      );
                    }

                    // Requirement is missing from vault
                    return (
                      <div
                        key={req.requiredName}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-4 h-4 rounded flex items-center justify-center border border-rose-300 dark:border-rose-700 bg-white dark:bg-zinc-900 text-rose-500 shrink-0">
                            <X className="w-3 h-3 stroke-[3]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {req.requiredName}
                              </span>
                              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 font-bold">
                                MISSING IN VAULT
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                              {req.isMandatory ? "Mandatory enrollment prerequisite" : "Optional supplementary filing"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              window.dispatchEvent(new CustomEvent("findmycampus_switch_view", { detail: "vault" }));
                            }
                          }}
                          className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                        >
                          Upload in Vault →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Application Route Confirmation & Legal Declaration */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Application Route &amp; Declaration
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-zinc-400">Target System:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedUniversity.applicationTemplate}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-zinc-400">Filing Jurisdiction:</span>
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{selectedUniversity.countryName}</span>
                </div>

                <label className="flex items-start gap-2.5 pt-2.5 border-t border-slate-200 dark:border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-0.5 rounded bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-zinc-300 leading-tight">
                    I attest that all attached cryptographic credentials and academic marks are authentic, un-tampered representations of official records.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Live Dossier Preview & Dispatch Card (4 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Live Dossier Preview
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Official Admissions Package
              </h2>
            </div>

            {/* Mock Vector PDF Sheet Preview */}
            <div className="relative rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 p-4 shadow-sm overflow-hidden text-slate-800 dark:text-zinc-300 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                  FINDMYCAMPUS DOSSIER
                </span>
                <span className="text-[9px] text-slate-500 dark:text-zinc-400">
                  REF-{selectedUniversity.countryCode}-2026
                </span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                  {selectedUniversity.name}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-zinc-400">
                  {candidateName || "Candidate Applicant"} · {targetDegree}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[9px] space-y-1 shadow-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Exam:</span>
                  <span className="text-indigo-600 dark:text-indigo-300 font-bold">{primaryExam} ({examScoreOrRank})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">12th Board:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{boardPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Vault Attachments:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{selectedDocsForDossier.length} verified</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[9px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  AES-GCM-256 SEAL
                </span>
                <span className="text-slate-500 dark:text-zinc-400">0 BYTES CLOUD</span>
              </div>
            </div>

            {/* Compilation Progress Bar (if active) */}
            <AnimatePresence>
              {isCompiling && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {compilationProgress}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 w-full animate-pulse" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dispatch Success Alert */}
            {dispatchSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="leading-tight font-medium">
                  Official Dossier PDF compiled on-device and saved to your Downloads!
                </span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleCompileAndDispatch}
              disabled={isCompiling || !declarationAccepted}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md",
                !declarationAccepted
                  ? "bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed shadow-none"
                  : isCompiling
                    ? "bg-indigo-600/60 text-white cursor-wait"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              )}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {isCompiling
                  ? "Compiling PDF..."
                  : "⚡ Compile & Dispatch Official Dossier (.pdf)"}
              </span>
            </button>

            {/* Secondary Action: Export ZIP Package */}
            <button
              onClick={handleExportZip}
              disabled={isZipping || !declarationAccepted}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Archive className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span>{isZipping ? "Packaging ZIP..." : "Export Complete Application ZIP Archive"}</span>
            </button>

            <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center font-mono leading-relaxed">
              100% Client-Side WebCrypto Execution. Includes SHA-256 cryptographic attestation manifest and decrypted credential attachments.
            </p>
          </div>
        </motion.div>
      </div>
      )}
    </motion.div>
  );
}

export default AutoPilotView;
