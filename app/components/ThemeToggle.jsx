"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-yellow-2 dark:bg-cat-frappe-surface1 text-cat-frappe-base dark:text-cat-frappe-yellow
                 transition-all duration-300 ease-in-out
                 hover:bg-gradient-to-br hover:from-cat-frappe-peach hover:to-cat-frappe-yellow
                 hover:text-cat-frappe-base dark:hover:text-cat-frappe-crust
                 hover:scale-110 hover:rotate-12
                 active:scale-95 active:rotate-0
                 shadow-md hover:shadow-lg"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-6 h-6" />
      ) : (
        <Moon className="w-6 h-6" />
      )}
    </button>
  );
};

export default ThemeToggle;