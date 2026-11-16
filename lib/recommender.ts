"use client";

import { useState, useEffect, useCallback } from "react";
import type { University, UserProfile, FitCategory } from "@/types/university";

export const PROFILE_KEY = "findmycampus_profile";

/**
 * Extracts the first numeric value from a string (e.g. "AIR ≤ 148" -> 148, "Score ≥ 332" -> 332, "99.75%ile" -> 99.75)
 */
function extractNumber(str: string): number | null {
  if (!str) return null;
  const cleaned = str.replace(/,/g, "");
  const match = cleaned.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

export function computeFit(profile: UserProfile, university: University): FitCategory {
  if (!profile) return "Competitive Fit";

  const userExam = (profile.primaryExam || "").toLowerCase().trim();
  const rawScore = profile.examScoreOrRank ? profile.examScoreOrRank.trim() : "";
  const userNum = extractNumber(rawScore);
  const userBoard = profile.boardPercentage || 85;

  // Find relevant branch cutoff for user's exam or CSE/first cutoff
  const relevantCutoff =
    university.branchCutoffs.find((b) =>
      b.primaryExam.toLowerCase().includes(userExam) ||
      userExam.includes(b.primaryExam.toLowerCase())
    ) || university.branchCutoffs[0];

  const benchNum = relevantCutoff ? extractNumber(relevantCutoff.benchmark) : null;

  // 1. JEE Advanced (lower rank = better)
  if (userExam.includes("jee adv") || userExam.includes("advanced")) {
    if (university.acceptedExams.some((e) => e.toLowerCase().includes("advanced"))) {
      if (userNum && benchNum) {
        if (userNum <= benchNum * 0.8) return "Target Choice";
        if (userNum <= benchNum * 1.3) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // 2. JEE Main (can be rank or percentile)
  if (userExam.includes("jee main") || userExam === "jee") {
    if (university.acceptedExams.some((e) => e.toLowerCase().includes("main"))) {
      if (userNum && benchNum) {
        // If percentile (e.g. 99.5 vs 99.2)
        if (userNum <= 100 && benchNum <= 100) {
          if (userNum >= benchNum + 0.3) return "Target Choice";
          if (userNum >= benchNum - 0.5) return "Competitive Fit";
          return "Reach School";
        }
        // If Rank (lower = better)
        if (userNum > 100) {
          if (userNum <= benchNum * 0.85) return "Target Choice";
          if (userNum <= benchNum * 1.35) return "Competitive Fit";
          return "Reach School";
        }
      }
    }
  }

  // 3. BITSAT (higher score = better, max 390)
  if (userExam.includes("bitsat")) {
    if (university.acceptedExams.some((e) => e.toLowerCase().includes("bitsat"))) {
      if (userNum && benchNum) {
        if (userNum >= benchNum + 10) return "Target Choice";
        if (userNum >= benchNum - 25) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // 4. SRMJEEE (rank: lower = better)
  if (userExam.includes("srmjeee") || userExam.includes("srm")) {
    if (university.acceptedExams.some((e) => e.toLowerCase().includes("srmjeee"))) {
      if (userNum && benchNum) {
        if (userNum <= benchNum * 0.75) return "Target Choice";
        if (userNum <= benchNum * 1.25) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // 5. VITEEE (rank: lower = better)
  if (userExam.includes("viteee") || userExam.includes("vit")) {
    if (university.acceptedExams.some((e) => e.toLowerCase().includes("viteee"))) {
      if (userNum && benchNum) {
        if (userNum <= benchNum * 0.8) return "Target Choice";
        if (userNum <= benchNum * 1.3) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // 6. WBJEE (rank: lower = better)
  if (userExam.includes("wbjee")) {
    if (university.acceptedExams.some((e) => e.toLowerCase().includes("wbjee"))) {
      if (userNum && benchNum) {
        if (userNum <= benchNum * 0.9) return "Target Choice";
        if (userNum <= benchNum * 1.4) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // 7. SAT (higher score = better, max 1600)
  if (userExam.includes("sat")) {
    if (university.countryCode === "US" || university.acceptedExams.some((e) => e.toLowerCase().includes("sat"))) {
      if (userNum) {
        if (userNum >= 1550) return "Target Choice";
        if (userNum >= 1480) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // 8. ACT (higher score = better, max 36)
  if (userExam.includes("act")) {
    if (userNum) {
      if (userNum >= 35) return "Target Choice";
      if (userNum >= 32) return "Competitive Fit";
      return "Reach School";
    }
  }

  // 9. TestAS (Germany, higher score = better, average 100, top 120+)
  if (userExam.includes("testas")) {
    if (university.countryCode === "DE") {
      if (userNum) {
        if (userNum >= 115) return "Target Choice";
        if (userNum >= 105) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // 10. ATAR (Australia, scale 0.00 to 99.95)
  if (userExam.includes("atar")) {
    if (university.countryCode === "AU") {
      if (userNum) {
        if (userNum >= 95.0) return "Target Choice";
        if (userNum >= 88.0) return "Competitive Fit";
        return "Reach School";
      }
    }
  }

  // 11. Board Percentage fallback / Multi-Country General Evaluation
  if (userBoard >= 95) {
    if (university.nationalRank <= 3) return "Competitive Fit";
    return "Target Choice";
  } else if (userBoard >= 88) {
    if (university.nationalRank <= 5) return "Reach School";
    if (university.nationalRank <= 15) return "Competitive Fit";
    return "Target Choice";
  } else if (userBoard >= 75) {
    if (university.nationalRank <= 10) return "Reach School";
    return "Competitive Fit";
  }

  return "Reach School";
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("findmycampus_profile_updated", { detail: profile }));
  }
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfileState(loadProfile());

    const handleUpdate = () => {
      setProfileState(loadProfile());
    };

    window.addEventListener("findmycampus_profile_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("findmycampus_profile_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    saveProfile(p);
    setProfileState(p);
  }, []);

  const clearProfile = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(PROFILE_KEY);
      window.dispatchEvent(new CustomEvent("findmycampus_profile_updated", { detail: null }));
    }
    setProfileState(null);
  }, []);

  return { profile, setProfile, clearProfile };
}
