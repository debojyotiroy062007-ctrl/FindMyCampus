"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (t: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const body = document.body;

    if (t === "dark") {
      root.classList.add("dark");
      body?.classList.add("dark");
      root.style.colorScheme = "dark";
      root.style.setProperty("--background", "#07090e");
      root.style.setProperty("--foreground", "#f8fafc");
      if (body) {
        body.style.backgroundColor = "#07090e";
        body.style.color = "#f8fafc";
      }
    } else {
      root.classList.remove("dark");
      body?.classList.remove("dark");
      root.style.colorScheme = "light";
      root.style.setProperty("--background", "#f8fafc");
      root.style.setProperty("--foreground", "#0f172a");
      if (body) {
        body.style.backgroundColor = "#f8fafc";
        body.style.color = "#0f172a";
      }
    }
  };

  useEffect(() => {
    const saved = (localStorage.getItem("findmycampus_theme") as Theme) || "light";
    setThemeState(saved);
    applyTheme(saved);
    setMounted(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem("findmycampus_theme", t);
    }
    applyTheme(t);
  };

  const toggleTheme = () => {
    setThemeState((current) => {
      const next: Theme = current === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("findmycampus_theme", next);
      }
      applyTheme(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {mounted ? children : <div className="opacity-0">{children}</div>}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
