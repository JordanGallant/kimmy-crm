"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "default" | "pink";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "default",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  initialTheme = "default",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    const saved = localStorage.getItem("amin-crm-theme") as Theme | null;
    if (saved) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved === "default" ? "" : saved);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("amin-crm-theme", newTheme);
    document.documentElement.setAttribute(
      "data-theme",
      newTheme === "default" ? "" : newTheme
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
