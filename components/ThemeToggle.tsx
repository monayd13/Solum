"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border"
      style={{
        background: "var(--surface2)",
        borderColor: "var(--border2)",
        color: "var(--muted)",
      }}
      aria-label="Toggle theme"
    >
      <span suppressHydrationWarning>
        {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </span>
    </button>
  );
}
