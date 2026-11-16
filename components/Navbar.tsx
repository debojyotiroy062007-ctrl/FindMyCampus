"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Shield,
  Cpu,
  Home,
  LayoutGrid,
  Scale,
  FolderLock,
  Zap,
  User,
  LogIn,
  Sun,
  Moon,
} from "lucide-react";
import { useCountry, COUNTRIES, type CountryCode } from "@/lib/countryContext";
import { useAuth } from "@/lib/auth/authContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { cn } from "@/lib/utils";
import type { ViewId } from "./NavigationTabs";

interface NavbarProps {
  activeView?: ViewId;
  onViewChange?: (view: ViewId) => void;
}

export function Navbar({ activeView = "home", onViewChange }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const { country, setCountry } = useCountry();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabClick = (view: ViewId) => {
    if (onViewChange) {
      onViewChange(view);
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("findmycampus_switch_view", { detail: view }));
    }
  };

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleSelect(code: CountryCode) {
    setCountry(code);
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass backdrop bar */}
      <div
        className="glass-card border-b border-slate-200 dark:border-zinc-800 bg-white/85 dark:bg-[#07090e]/90"
        style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Brand Crest */}
            <button
              onClick={() => handleTabClick("home")}
              className="flex items-center gap-3 shrink-0 text-left cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 group-hover:border-indigo-400 transition-colors">
                <Cpu className="w-4 h-4 text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping-slow opacity-75" />
                </span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                  FindMy<span className="gradient-text-indigo">Campus</span>
                </span>
                <span className="text-[9px] font-medium text-zinc-500 tracking-widest uppercase">
                  Admissions Engine
                </span>
              </div>
            </button>

            {/* Center: Navigation Shortcuts & Status Indicator */}
            <div className="flex items-center gap-4">
              {/* Quick Navigation Links */}
              <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-white/80 border border-slate-200 text-slate-800 dark:bg-zinc-900/80 dark:border-zinc-800 dark:text-zinc-200 shadow-sm">
                <button
                  onClick={() => handleTabClick("home")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeView === "home"
                      ? "bg-indigo-600/20 text-indigo-900 dark:text-white border border-indigo-500/35 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <Home className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => handleTabClick("matrix")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeView === "matrix"
                      ? "bg-indigo-600/20 text-indigo-900 dark:text-white border border-indigo-500/35 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>University Matrix</span>
                </button>

                <button
                  onClick={() => handleTabClick("compare")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeView === "compare"
                      ? "bg-indigo-600/20 text-indigo-900 dark:text-white border border-indigo-500/35 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <Scale className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                  <span>Compare</span>
                </button>

                <button
                  onClick={() => handleTabClick("vault")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeView === "vault"
                      ? "bg-indigo-600/20 text-indigo-900 dark:text-white border border-indigo-500/35 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <FolderLock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Document Vault</span>
                </button>

                <button
                  onClick={() => handleTabClick("autopilot")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    activeView === "autopilot"
                      ? "bg-indigo-600/20 text-indigo-900 dark:text-white border border-indigo-500/35 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Auto-Pilot</span>
                </button>
              </div>

              {/* Glowing Status Indicator Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 glow-emerald">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                </span>
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  100% On-Device Engine (Zero Cloud Leak)
                </span>
              </div>
            </div>

            {/* Right: Theme Toggle, Auth Profile & Country Selector */}
            <div className="flex items-center gap-2.5">
              {/* Theme Quick Toggle */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-white/8 bg-zinc-100 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
                  title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
                  aria-label="Toggle Theme"
                >
                  {theme === "light" ? (
                    <Moon className="w-4 h-4 text-zinc-700" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                </button>
              )}

              {/* User Account Button */}
              {mounted && (
                isAuthenticated && user ? (
                  <button
                    onClick={() => handleTabClick("profile")}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/8 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-all cursor-pointer shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-[10px] font-bold text-white">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.name || "Profile"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openAuthModal("signin")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )
              )}

              {/* Country Selector */}
              <div className="relative shrink-0" ref={dropdownRef}>
                {!mounted ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-white/8 bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span className="hidden xs:inline">India</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setIsOpen((v) => !v)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                        "border border-zinc-200 dark:border-white/8 bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200",
                        "hover:border-indigo-500/40 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white",
                        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 cursor-pointer shadow-sm"
                      )}
                      aria-haspopup="listbox"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base leading-none">{country.flag}</span>
                      <span className="hidden xs:inline">{country.name}</span>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 mt-2 w-52 rounded-xl glass-card overflow-hidden z-50 shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#07090e]/95"
                          role="listbox"
                        >
                          <div className="p-1">
                            {COUNTRIES.map((c) => (
                              <button
                                key={c.code}
                                role="option"
                                aria-selected={c.code === country.code}
                                onClick={() => handleSelect(c.code)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                                  c.code === country.code
                                    ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 font-semibold"
                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white border border-transparent"
                                )}
                              >
                                <span className="text-base">{c.flag}</span>
                                <span className="font-medium">{c.name}</span>
                                {c.code === country.code && (
                                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_#818cf8]" />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
