/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { applyTheme, DEFAULT_THEME_ID, getTheme, themes } from "./theme";

const ThemeContext = createContext({
  themeKey: DEFAULT_THEME_ID,
  theme: themes[DEFAULT_THEME_ID],
  changeTheme: () => {},
  themes,
});

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    try {
      return localStorage.getItem("app_theme") || DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  const changeTheme = (newKey) => {
    if (!themes[newKey]) return;
    setThemeKey(newKey);
    applyTheme(newKey);
  };

  useEffect(() => {
    applyTheme(themeKey);

    const onStorageChange = (e) => {
      if (e.key === "app_theme" && e.newValue && themes[e.newValue]) {
        setThemeKey(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, [themeKey]);

  const value = {
    themeKey,
    theme: getTheme(themeKey),
    changeTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
