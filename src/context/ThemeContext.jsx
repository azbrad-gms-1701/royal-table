import { createContext, useContext, useState, useEffect } from "react";

const themes = {
  lujo: {
    name: "LUJO",
    bg: "radial-gradient(ellipse at 50% 0%, #1a1208 0%, #0a0805 50%, #050504 100%)",
    felt: "radial-gradient(ellipse at 50% 50%, #0d2016 0%, #081510 40%, #040c0a 100%)",
    feltBorder: "#1a1208",
    accent: "#c9a84c",
    accentLight: "#f5d98b",
    accentMid: "#a8873c",
    text: "#c9a84c",
    textDim: "rgba(201,168,76,0.45)",
    cardBg: "linear-gradient(145deg, #fefefe 0%, #f0ece0 100%)",
    modalBg: "linear-gradient(145deg, #111108, #0a0a06)",
    font: "'Playfair Display', serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap",
  },
  clasico: {
    name: "CLÁSICO",
    bg: "radial-gradient(ellipse at 50% 0%, #1a2e1a 0%, #0d1f0d 50%, #060e06 100%)",
    felt: "radial-gradient(ellipse at 50% 50%, #155215 0%, #0e3b0e 40%, #071507 100%)",
    feltBorder: "#0a1f0a",
    accent: "#e8d5a3",
    accentLight: "#fff5d6",
    accentMid: "#c4a96e",
    text: "#e8d5a3",
    textDim: "rgba(232,213,163,0.45)",
    cardBg: "linear-gradient(145deg, #fffdf5 0%, #f5f0e0 100%)",
    modalBg: "linear-gradient(145deg, #0d1f0d, #061006)",
    font: "'IM Fell English', serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap",
  },
  moderno: {
    name: "MODERNO",
    bg: "radial-gradient(ellipse at 50% 0%, #1c1c1e 0%, #111113 50%, #08080a 100%)",
    felt: "radial-gradient(ellipse at 50% 50%, #1e1e22 0%, #15151a 40%, #0d0d10 100%)",
    feltBorder: "#2a2a2e",
    accent: "#a0a8c0",
    accentLight: "#dde3f5",
    accentMid: "#7880a0",
    text: "#a0a8c0",
    textDim: "rgba(160,168,192,0.45)",
    cardBg: "linear-gradient(145deg, #ffffff 0%, #f0f2f8 100%)",
    modalBg: "linear-gradient(145deg, #18181c, #101012)",
    font: "'DM Sans', sans-serif",
    fontUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(
    () => localStorage.getItem("royalTableTheme") || "lujo"
  );

  const theme = themes[themeKey];

  useEffect(() => {
    localStorage.setItem("royalTableTheme", themeKey);
    // Inyectar la fuente del tema activo
    const existing = document.getElementById("theme-font");
    if (existing) existing.remove();
    const link = document.createElement("link");
    link.id = "theme-font";
    link.rel = "stylesheet";
    link.href = theme.fontUrl;
    document.head.appendChild(link);
  }, [themeKey, theme.fontUrl]);

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setThemeKey, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}