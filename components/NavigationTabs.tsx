"use client";

import { motion } from "framer-motion";
import { Home, LayoutGrid, Scale, FolderLock, Zap, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewId = "home" | "matrix" | "compare" | "vault" | "autopilot" | "profile" | "settings";

interface Tab {
  id: ViewId;
  label: string;
  shortLabel: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  description: string;
}

export const TABS: Tab[] = [
  {
    id: "home",
    label: "Home",
    shortLabel: "Home",
    Icon: Home,
    description: "Overview and personalized recommendations",
  },
  {
    id: "matrix",
    label: "University Matrix",
    shortLabel: "Matrix",
    Icon: LayoutGrid,
    description: "600 Verified national & global institutions",
  },
  {
    id: "compare",
    label: "Compare Matrix",
    shortLabel: "Compare",
    Icon: Scale,
    description: "Head-to-head placement & ROI outcome engine",
  },
  {
    id: "vault",
    label: "Document Vault",
    shortLabel: "Vault",
    Icon: FolderLock,
    description: "On-device credentials and pre-flight compliance audit",
  },
  {
    id: "autopilot",
    label: "Auto-Pilot Dispatch",
    shortLabel: "Auto-Pilot",
    Icon: Zap,
    description: "Split-screen PDF form mapping and stamping",
  },
  {
    id: "profile",
    label: "Profile",
    shortLabel: "Profile",
    Icon: User,
    description: "Candidate academic scores and targets",
  },
  {
    id: "settings",
    label: "Settings",
    shortLabel: "Settings",
    Icon: Settings,
    description: "Preferences, currency and sovereign node",
  },
];

interface NavigationTabsProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}

export function NavigationTabs({ activeView, onViewChange }: NavigationTabsProps) {
  return (
    <nav className="relative flex items-center gap-1 p-1 rounded-xl bg-zinc-900/60 border border-white/6 w-fit mx-auto overflow-x-auto max-w-full">
      {TABS.map((tab) => {
        const isActive = tab.id === activeView;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 z-10 shrink-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 cursor-pointer",
              isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            )}
            aria-selected={isActive}
            role="tab"
            title={tab.description}
          >
            {/* Sliding background pill */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg bg-indigo-500/15 border border-indigo-500/25 glow-indigo"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <tab.Icon
              className={cn(
                "relative w-4 h-4 shrink-0 transition-colors duration-200",
                isActive ? "text-indigo-400" : "text-zinc-500"
              )}
              strokeWidth={isActive ? 2 : 1.75}
            />
            <span className="relative hidden md:inline">{tab.label}</span>
            <span className="relative md:hidden">{tab.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
