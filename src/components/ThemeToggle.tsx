"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  // null until mounted: the real theme is set on <html> by the inline script in app/layout.tsx.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage unavailable (private mode etc.) — theme still applies for this session.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="切换深色模式"
      title={isDark ? "切换到浅色模式" : "切换到深色模式"}
      onClick={toggle}
      className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-slate-200 bg-slate-100 p-1 transition-colors hover:border-teal-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-600"
    >
      <Sun className="absolute left-2 h-3.5 w-3.5 text-amber-500 dark:text-slate-500" aria-hidden="true" />
      <Moon className="absolute right-2 h-3.5 w-3.5 text-slate-400 dark:text-teal-300" aria-hidden="true" />
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-slate-950 ${
          isDark ? "translate-x-[26px]" : "translate-x-0"
        } ${theme === null ? "opacity-0" : "opacity-100"}`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-teal-300" aria-hidden="true" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
