"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { type ViewId } from "@/components/NavigationTabs";
import LeftSidebar from "@/components/navigation/LeftSidebar";
import HomeView from "@/components/views/HomeView";
import MatrixView from "@/components/views/MatrixView";
import CompareView from "@/components/views/CompareView";
import { VaultView } from "@/components/views/VaultView";
import { AutoPilotView } from "@/components/views/AutoPilotView";
import ProfileView from "@/components/views/ProfileView";
import SettingsView from "@/components/views/SettingsView";
import AuthModal from "@/components/auth/AuthModal";
import OnboardingModal from "@/components/auth/OnboardingModal";
import AdmissionsChatbot from "@/components/chat/AdmissionsChatbot";
import { ShieldCheck, HardDrive, Terminal, Mail, Phone } from "lucide-react";
import { CountryProvider } from "@/lib/countryContext";
import { AuthProvider } from "@/lib/auth/authContext";

function MainAppContent() {
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Global event listener to switch views programmatically from anywhere in the app
  useEffect(() => {
    const handleSwitchView = (e: Event) => {
      const customEvent = e as CustomEvent<ViewId>;
      if (customEvent.detail) {
        setActiveView(customEvent.detail);
      }
    };
    window.addEventListener("findmycampus_switch_view", handleSwitchView);
    return () => window.removeEventListener("findmycampus_switch_view", handleSwitchView);
  }, []);

  // When switching views via rail or tabs, immediately scroll to top & eliminate empty gap
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeView]);

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("findmycampus_set_filter", { detail: filter })
      );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-[var(--foreground)] selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 md:pl-16 transition-colors duration-200">
      {/* Sleek Left-Hand Icon Navigation Rail */}
      <LeftSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Background Mesh Gradient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top center indigo radiance */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-indigo-600/10 blur-[140px] rounded-full" />
        {/* Bottom right subtle emerald glow */}
        <div className="absolute -bottom-40 right-10 w-[500px] h-[400px] bg-emerald-500/5 blur-[130px] rounded-full" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Sticky Glassmorphic Navbar */}
      <Navbar activeView={activeView} onViewChange={setActiveView} />

      {/* Main App Container with Clean Tight Top Spacing */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-12 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {activeView === "home" && (
            <motion.div
              key="view-home"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <HomeView onNavigate={setActiveView} />
            </motion.div>
          )}

          {activeView === "matrix" && (
            <motion.div
              key="view-matrix"
              className="w-full"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <MatrixView />
            </motion.div>
          )}

          {activeView === "compare" && (
            <motion.div
              key="view-compare"
              className="w-full"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <CompareView onNavigate={setActiveView} />
            </motion.div>
          )}

          {activeView === "vault" && (
            <motion.div
              key="view-vault"
              className="w-full"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <VaultView />
            </motion.div>
          )}

          {activeView === "autopilot" && (
            <motion.div
              key="view-autopilot"
              className="w-full"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <AutoPilotView />
            </motion.div>
          )}

          {activeView === "profile" && (
            <motion.div
              key="view-profile"
              className="w-full"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <ProfileView onNavigate={setActiveView} />
            </motion.div>
          )}

          {activeView === "settings" && (
            <motion.div
              key="view-settings"
              className="w-full"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <SettingsView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* High-Tech Terminal Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#07090e]/80 backdrop-blur-md py-4 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Host Machine Vault Encrypted (AES-GCM-256)</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400/90 hidden sm:flex">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Cloud Telemetry Policy Active</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-zinc-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
              <span>v2.4.0-scale100.prod</span>
            </span>
            <span>·</span>
            <a
              href="mailto:debojyoti.roy062007@gmail.com"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium cursor-pointer"
              title="Email Lead Architect"
            >
              <Mail className="w-3 h-3 text-indigo-500" />
              <span>Contact Support</span>
            </a>
            <span>·</span>
            <a
              href="tel:+918013600616"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono font-medium cursor-pointer"
              title="Call Creator Support"
            >
              <Phone className="w-3 h-3 text-emerald-500" />
              <span>+91 8013600616</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Global Modals & AI Admissions Copilot */}
      <AuthModal />
      <OnboardingModal />
      <AdmissionsChatbot />
    </div>
  );
}

export default function MainApp() {
  return (
    <CountryProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </CountryProvider>
  );
}
