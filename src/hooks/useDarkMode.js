import { useState, useEffect, useCallback } from "react";

function getInitialDarkMode() {
  try {
    const stored = localStorage.getItem("submanager-theme");
    if (stored !== null) return stored === "dark";

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (error) {
    console.error("Could not load the saved theme preference.", error);
    return false;
  }
}

export function useDarkMode() {
  const [dark, setDark] = useState(getInitialDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    try {
      localStorage.setItem("submanager-theme", dark ? "dark" : "light");
    } catch (error) {
      console.error("Could not save the theme preference.", error);
    }
  }, [dark]);

  const toggleDark = useCallback(() => setDark((v) => !v), []);

  return { dark, toggleDark };
}
