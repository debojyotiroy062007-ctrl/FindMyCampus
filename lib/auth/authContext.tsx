"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/types/university";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  targetDegree?: string;
  createdAt: string;
}

export interface OAuthOptions {
  prompt?: string;
  access_type?: string;
  queryParams?: Record<string, string>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isOnboardingOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  setOnboardingOpen: (open: boolean) => void;
  openAuthModal: (mode?: "signin" | "signup") => void;
  openOnboardingModal: () => void;
  closeAuthModal: () => void;
  closeOnboardingModal: () => void;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithOAuth: (provider: "google" | "github", options?: OAuthOptions) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "findmycampus_auth_user";
const PROFILE_STORAGE_KEY = "findmycampus_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore error
    }
  }, []);

  const login = useCallback(async (email: string, _password?: string) => {
    const existingName = email.split("@")[0].replace(/[._]/g, " ");
    const formattedName = existingName.charAt(0).toUpperCase() + existingName.slice(1);
    
    // Check if profile exists to pull actual name
    let profileName = formattedName;
    try {
      const p = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (p) {
        const parsed: UserProfile = JSON.parse(p);
        if (parsed.name) profileName = parsed.name;
      }
    } catch {
      // fallback
    }

    const authUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name: profileName,
      createdAt: new Date().toISOString(),
    };

    setUser(authUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    setAuthModalOpen(false);

    // If profile has not been completed, prompt onboarding
    const p = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!p) {
      setOnboardingOpen(true);
    }
  }, []);

  const signup = useCallback(async (email: string, _password: string, name: string) => {
    const authUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name: name.trim() || email.split("@")[0],
      createdAt: new Date().toISOString(),
    };

    setUser(authUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    setAuthModalOpen(false);
    // Always trigger onboarding for brand new signup
    setOnboardingOpen(true);
  }, []);

  const loginWithOAuth = useCallback(
    async (
      provider: "google" | "github",
      options: OAuthOptions = provider === "google"
        ? { prompt: "select_account", access_type: "offline" }
        : {}
    ) => {
      const isGoogle = provider === "google";
      // Record query params including prompt: 'select_account'
      const authParams = {
        prompt: options.prompt || (isGoogle ? "select_account" : undefined),
        access_type: options.access_type || (isGoogle ? "offline" : undefined),
        ...options.queryParams,
      };

      const authUser: User = {
        id: `usr_${provider}_${Date.now()}`,
        email: isGoogle ? "candidate@findmycampus.local" : "developer@findmycampus.local",
        name: isGoogle ? "Google Candidate" : "GitHub Developer",
        createdAt: new Date().toISOString(),
      };

      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setAuthModalOpen(false);

      const p = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!p) {
        setOnboardingOpen(true);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("findmycampus_profile_updated", { detail: null }));
      window.dispatchEvent(new CustomEvent("findmycampus_vault_updated"));
    }
    setAuthModalOpen(false);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const openAuthModal = useCallback((_mode?: "signin" | "signup") => {
    setAuthModalOpen(true);
  }, []);

  const openOnboardingModal = useCallback(() => {
    setOnboardingOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const closeOnboardingModal = useCallback(() => {
    setOnboardingOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        isOnboardingOpen,
        setAuthModalOpen,
        setOnboardingOpen,
        openAuthModal,
        openOnboardingModal,
        closeAuthModal,
        closeOnboardingModal,
        login,
        signup,
        loginWithOAuth,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

