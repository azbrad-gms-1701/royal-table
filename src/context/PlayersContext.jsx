import { createContext, useContext, useState } from "react";

// ── Paleta extendida de colores neón ──────────────────────────────────────
export const PLAYER_COLORS = [
  { id: "gold",     label: "Dorado",        hex: "#f5d98b", glow: "rgba(245,217,139,0.6)" },
  { id: "electric", label: "Azul Eléctrico",hex: "#00cfff", glow: "rgba(0,207,255,0.6)"   },
  { id: "neongreen",label: "Verde Neón",    hex: "#39ff14", glow: "rgba(57,255,20,0.6)"   },
  { id: "fuchsia",  label: "Fucsia",        hex: "#ff2d78", glow: "rgba(255,45,120,0.6)"  },
  { id: "violet",   label: "Violeta",       hex: "#bf5fff", glow: "rgba(191,95,255,0.6)"  },
  { id: "orange",   label: "Naranja",       hex: "#ff8c00", glow: "rgba(255,140,0,0.6)"   },
  { id: "cyan",     label: "Cian",          hex: "#00ffe7", glow: "rgba(0,255,231,0.6)"   },
  { id: "crimson",  label: "Carmesí",       hex: "#ff3131", glow: "rgba(255,49,49,0.6)"   },
  { id: "lime",     label: "Lima",          hex: "#ccff00", glow: "rgba(204,255,0,0.6)"   },
  { id: "pink",     label: "Rosa Pastel",   hex: "#ff91d0", glow: "rgba(255,145,208,0.6)" },
  { id: "sky",      label: "Celeste",       hex: "#87ceeb", glow: "rgba(135,206,235,0.6)" },
  { id: "mint",     label: "Menta",         hex: "#00fa9a", glow: "rgba(0,250,154,0.6)"   },
  { id: "coral",    label: "Coral",         hex: "#ff6b6b", glow: "rgba(255,107,107,0.6)" },
  { id: "indigo",   label: "Índigo",        hex: "#6610f2", glow: "rgba(102,16,242,0.6)"  },
  { id: "amber",    label: "Ámbar",         hex: "#ffbf00", glow: "rgba(255,191,0,0.6)"   },
  { id: "white",    label: "Blanco Perla",  hex: "#f0f0f0", glow: "rgba(240,240,240,0.5)" },
];

// Colores por defecto según posición
const DEFAULT_COLOR_IDS = [
  "gold", "electric", "neongreen", "fuchsia",
  "violet", "orange", "cyan", "crimson",
];

const PlayersContext = createContext(null);

export function PlayersProvider({ children }) {
  const [players, setPlayers] = useState([]);

  const getColor = (colorId) =>
    PLAYER_COLORS.find(c => c.id === colorId) || PLAYER_COLORS[0];

  // Recibe names[] y colorIds[] por separado, y además guarda
  // el objeto color completo {hex, glow} para que App.jsx pueda
  // acceder a p.color.hex directamente sin llamar a getColor()
  const initPlayers = (names, colorIds) => {
    setPlayers(names.map((name, i) => {
      const colorId = colorIds
        ? colorIds[i % colorIds.length]
        : DEFAULT_COLOR_IDS[i % DEFAULT_COLOR_IDS.length];
      return {
        name,
        colorId,
        color: PLAYER_COLORS.find(c => c.id === colorId) || PLAYER_COLORS[0],
      };
    }));
  };

  const updateColor = (name, colorId) => {
    setPlayers(prev =>
      prev.map(p => p.name === name
        ? {
            ...p,
            colorId,
            color: PLAYER_COLORS.find(c => c.id === colorId) || PLAYER_COLORS[0],
          }
        : p
      )
    );
  };

  const updateName = (oldName, newName) => {
    setPlayers(prev =>
      prev.map(p => p.name === oldName ? { ...p, name: newName } : p)
    );
  };

  return (
    <PlayersContext.Provider value={{ players, initPlayers, updateColor, updateName, getColor }}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  return useContext(PlayersContext);
}