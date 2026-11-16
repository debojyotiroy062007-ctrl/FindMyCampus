"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LayoutGrid,
  Scale,
  FolderLock,
  Zap,
  User,
  Settings,
  LogOut,
  LogIn,
  Sparkles,
  Coins,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Lock,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/components/NavigationTabs";
import { useAuth } from "@/lib/auth/authContext";
import { useTheme } from "@/lib/theme/ThemeContext";

interface LeftSidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  tooltipDesc?: string;
  badge?: string;
  isActive?: boolean;
  onClick: () => void;
}

function NavItem({
  icon,
  label,
  tooltipDesc,
  badge,
  isActive = false,
  onClick,
}: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        aria-label={label}
        className={cn(
          "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer group",
          isActive
            ? "bg-indigo-600/20 text-indigo-900 dark:text-white border border-indigo-500/40 shadow-[0_0_16px_rgba(99,102,241,0.25)]"
            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
        )}
      >
        {/* Active Pill Indicator */}
        {isActive && (
          <motion.div
            layoutId="rail-active-pill"
            className="absolute -left-3 w-1 h-5 rounded-r-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          />
        )}

        {icon}

        {badge && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
        )}
      </button>

      {/* Floating Framer Motion Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#0d1117]/95 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 whitespace-nowrap shadow-2xl backdrop-blur-md flex flex-col gap-0.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                {label}
                {badge && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                    {badge}
                  </span>
                )}
              </span>
              {tooltipDesc && (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">{tooltipDesc}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LeftSidebar({
  activeView,
  onViewChange,
  activeFilter,
  onFilterChange,
}: LeftSidebarProps) {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-16 border-r border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#07090e]/95 text-slate-800 dark:text-zinc-200 backdrop-blur-md flex-col items-center py-5 justify-between shrink-0 z-30 transition-colors">
      {/* Top Application Mark */}
      <div className="flex flex-col items-center gap-6 w-full">
        <button
          onClick={() => onViewChange("home")}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-indigo-500/25 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 hover:scale-105 transition-transform cursor-pointer shadow-sm"
          title="FindMyCampus Home"
        >
          <Cpu className="w-5 h-5" />
        </button>

        {/* Primary View Switcher Navigation Rails */}
        <nav className="flex flex-col items-center gap-2.5">
          <NavItem
            icon={<Home className="w-4 h-4" />}
            label="Home Dashboard"
            tooltipDesc="Autonomous recommendations & system discovery"
            isActive={activeView === "home"}
            onClick={() => onViewChange("home")}
          />

          <NavItem
            icon={<LayoutGrid className="w-4 h-4" />}
            label="University Matrix"
            tooltipDesc="300+ Verified target institutions & cutoffs"
            isActive={activeView === "matrix"}
            onClick={() => onViewChange("matrix")}
          />

          <NavItem
            icon={<Scale className="w-4 h-4 text-violet-500 dark:text-violet-400" />}
            label="Compare Matrix"
            tooltipDesc="Dynamic 2 to 5 institution placement ROI"
            isActive={activeView === "compare"}
            onClick={() => onViewChange("compare")}
          />

          <NavItem
            icon={<FolderLock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
            label="Sovereign Vault"
            tooltipDesc="On-device encrypted credential vault"
            badge="AES"
            isActive={activeView === "vault"}
            onClick={() => onViewChange("vault")}
          />

          <NavItem
            icon={<Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
            label="Auto-Pilot"
            tooltipDesc="Autonomous PDF dossier dispatch engine"
            isActive={activeView === "autopilot"}
            onClick={() => onViewChange("autopilot")}
          />
        </nav>

        {/* Quick Filter Section when Matrix is Active */}
        {activeView === "matrix" && onFilterChange && (
          <div className="flex flex-col items-center gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-900/80 w-full px-2">
            <NavItem
              icon={<Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
              label="Recommended"
              tooltipDesc="Filter institutions matched to profile"
              isActive={activeFilter === "recommended"}
              onClick={() =>
                onFilterChange(activeFilter === "recommended" ? null : "recommended")
              }
            />

            <NavItem
              icon={<Coins className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
              label="Zero / Low Fee"
              tooltipDesc="Institutions under ₹5 Lakhs / year"
              isActive={activeFilter === "low-tuition"}
              onClick={() =>
                onFilterChange(activeFilter === "low-tuition" ? null : "low-tuition")
              }
            />

            <NavItem
              icon={<TrendingUp className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
              label="Tier-1 ROI"
              tooltipDesc="Median placement exceeds total annual fee"
              isActive={activeFilter === "tier1-roi"}
              onClick={() =>
                onFilterChange(activeFilter === "tier1-roi" ? null : "tier1-roi")
              }
            />

            {activeFilter && (
              <NavItem
                icon={<RotateCcw className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300" />}
                label="Reset Filters"
                tooltipDesc="Clear active filters"
                onClick={() => onFilterChange(null)}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Utility Cluster: Theme Toggle, Profile, Settings, Auth */}
      <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-200 dark:border-zinc-800">
        <NavItem
          icon={theme === "light" ? <Moon className="w-4 h-4 text-zinc-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          tooltipDesc={theme === "light" ? "Currently in Daylight Light Theme" : "Currently in Sovereign Dark Mode"}
          onClick={toggleTheme}
        />

        <NavItem
          icon={<User className="w-4 h-4" />}
          label="Candidate Profile"
          tooltipDesc="Academic scores, exams & uploaded resume"
          isActive={activeView === "profile"}
          onClick={() => onViewChange("profile")}
        />

        <NavItem
          icon={<Settings className="w-4 h-4" />}
          label="System Settings"
          tooltipDesc="Preferences, appearance & sovereign node key"
          isActive={activeView === "settings"}
          onClick={() => onViewChange("settings")}
        />

        {/* Auth CTA or Avatar */}
        {isAuthenticated && user ? (
          <>
            <NavItem
              icon={
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
              }
              label={user.name || "Candidate"}
              tooltipDesc="View Profile"
              onClick={() => onViewChange("profile")}
            />

            <NavItem
              icon={<LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />}
              label="Sign Out"
              tooltipDesc="Clears active session & opens Auth modal"
              onClick={() => setIsSignOutModalOpen(true)}
            />
          </>
        ) : (
          <NavItem
            icon={<LogIn className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />}
            label="Sign In"
            tooltipDesc="Sovereign on-device account login"
            onClick={() => openAuthModal("signin")}
          />
        )}

        {/* Security Badge */}
        <div className="pt-2 text-[9px] font-mono text-zinc-500 flex flex-col items-center">
          <Lock className="w-3 h-3 text-zinc-500 mb-0.5" />
          <span className="text-[8px]">LOCAL</span>
        </div>
      </div>

      {/* Centered Sign Out Confirmation Modal via React Portal directly into document.body */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isSignOutModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsSignOutModalOpen(false);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.18 }}
                  className="max-w-sm w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        Sign Out of FindMyCampus?
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        End active sovereign session
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    Your encrypted documents and cryptographic clearance credentials remain safely saved on your local device.
                  </p>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsSignOutModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignOutModalOpen(false);
                        logout();
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-sm shadow-rose-500/20"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </aside>
  );
}
