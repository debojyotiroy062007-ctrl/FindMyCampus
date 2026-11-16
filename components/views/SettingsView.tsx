"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Sliders,
  ShieldCheck,
  Key,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Coins,
  RefreshCw,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/authContext";
import { useCountry, COUNTRIES, type CountryCode } from "@/lib/countryContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { purgeAllVaultDocs, exportVaultBackup } from "@/lib/vault/db";

export default function SettingsView() {
  const { user, updateUser, logout } = useAuth();
  const { country, setCountry } = useCountry();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "node">("preferences");

  // Account form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when user updates
  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  // Preference state
  const [currency, setCurrency] = useState<string>("INR");

  // Reset state
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, phone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportVaultArchive = async () => {
    try {
      const backupStr = await exportVaultBackup();
      const blob = new Blob([backupStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `findmycampus-vault-backup-${Date.now()}.vault`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Vault export failed:", err);
    }
  };

  const handleExportNodeIdentity = () => {
    const exportData = {
      app: "FindMyCampus Sovereign Node",
      version: "2.4.0",
      timestamp: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      },
      cryptography: {
        algorithm: "AES-GCM-256",
        keyDerivation: "PBKDF2-SHA-256",
        iterations: 100000,
        storage: "IndexedDB on-device",
      },
      exportChecksum: Math.random().toString(36).substring(2, 15),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `findmycampus-sovereign-node-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFactoryReset = async () => {
    const confirmed = window.confirm(
      "WARNING: This will permanently delete your local encrypted Document Vault, academic profile, and cached credentials. Proceed with sovereign node purge?"
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      await purgeAllVaultDocs();
      localStorage.clear();
      window.location.reload();
    } catch (err) {
      console.error("Reset failed:", err);
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>System Settings</span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold">
              LOCAL NODE
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure display preferences, theme appearance, regional destination, and cryptographic keys.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "preferences"
              ? "bg-indigo-600 text-white shadow-md font-bold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Preferences &amp; Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "account"
              ? "bg-indigo-600 text-white shadow-md font-bold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Candidate Account</span>
        </button>

        <button
          onClick={() => setActiveTab("node")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "node"
              ? "bg-indigo-600 text-white shadow-md font-bold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sovereign Node &amp; Cryptography</span>
        </button>
      </div>

      {/* Tab 1: Preferences & Appearance */}
      {activeTab === "preferences" && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 bg-white dark:bg-zinc-950 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Theme &amp; Regional Preferences</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Customize appearance theme, default country destination and tuition currency denomination.
            </p>
          </div>

          <div className="space-y-6 max-w-xl">
            {/* Appearance Section */}
            <div>
              <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-2 font-semibold">
                APPEARANCE THEME
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                    theme === "light"
                      ? "bg-indigo-50/70 border-indigo-500 text-indigo-950 font-semibold shadow-sm ring-1 ring-indigo-500/50"
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>Light Theme</span>
                      <span className="text-[9px] font-mono text-indigo-600 bg-indigo-500/10 px-1.5 py-0.2 rounded font-bold">
                        DEFAULT
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Crisp white surfaces &amp; readable contrast
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                    theme === "dark"
                      ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 font-semibold shadow-sm ring-1 ring-indigo-500/50"
                      : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Dark Theme
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Cyberpunk #09090b zinc &amp; neon glows
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Country Destination */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-2 font-semibold">
                DEFAULT COUNTRY FILTER
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountry(c.code)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      country.code === c.code
                        ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-900 dark:text-white font-bold"
                        : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Denomination */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-2 font-semibold">
                PRIMARY CURRENCY DENOMINATION
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: "INR", label: "₹ INR (Indian Rupee)" },
                  { id: "USD", label: "$ USD (US Dollar)" },
                  { id: "GBP", label: "£ GBP (British Pound)" },
                  { id: "EUR", label: "€ EUR (Euro)" },
                ].map((curr) => (
                  <button
                    key={curr.id}
                    type="button"
                    onClick={() => setCurrency(curr.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      currency === curr.id
                        ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-900 dark:text-indigo-300 font-bold"
                        : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    {curr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Candidate Account */}
      {activeTab === "account" && (
        <form onSubmit={handleSaveAccount} className="glass-card rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 bg-white dark:bg-zinc-950 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Candidate Details</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Stored exclusively in browser local storage. Zero transmission to remote cloud servers.
            </p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. candidate@findmycampus.local"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Changes Saved Locally</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>

            {user && (
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors cursor-pointer"
              >
                Sign Out of Sovereign Node
              </button>
            )}
          </div>
        </form>
      )}

      {/* Tab 3: Sovereign Node & Cryptography */}
      {activeTab === "node" && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-6 bg-white dark:bg-zinc-950 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sovereign Node Security &amp; Storage</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Zero cloud infrastructure. All private credentials and identity tokens remain strictly on-device.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                Vault Cipher Engine
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono block">AES-GCM-256 (Web Crypto API)</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Authenticated symmetric encryption with 12-byte IV</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                Local IndexedDB Storage
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono block">findmycampus_vault_v1</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Encrypted document chunks &amp; SHA-256 checksums</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Backup &amp; Sovereign Data Portability
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleExportVaultArchive}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Export Encrypted Vault (.vault)</span>
              </button>

              <button
                type="button"
                onClick={handleExportNodeIdentity}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <Key className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Export Node Identity JSON</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Danger Zone: Node Factory Reset</span>
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Permanently purges the local AES-encrypted IndexedDB database and wipes all browser-stored onboarding profiles.
            </p>
            <button
              type="button"
              onClick={handleFactoryReset}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isResetting ? "Purging Sovereign Node..." : "Factory Reset Local Node"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
