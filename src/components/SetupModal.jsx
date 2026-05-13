import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { usePlayers, PLAYER_COLORS } from "../context/PlayersContext";

const DEFAULT_COLOR_IDS = [
  "gold", "electric", "neongreen", "fuchsia",
  "violet", "orange", "cyan", "crimson",
];

export default function SetupModal({ onStart }) {
  const { theme, themeKey, setThemeKey, themes } = useTheme();
  const { initPlayers } = usePlayers();

  const [playerCount, setPlayerCount] = useState(3);
  const [names, setNames] = useState(["Anfitrión", "Jugador 2", "Jugador 3"]);
  const [colorIds, setColorIds] = useState(
    DEFAULT_COLOR_IDS.slice(0, 3)
  );
  const [openColorPicker, setOpenColorPicker] = useState(null); // índice del jugador con picker abierto

  // ── Cambiar cantidad de jugadores ────────────────────────────────────────
  const updateCount = (n) => {
    setPlayerCount(n);
    setNames(prev => {
      const next = [...prev];
      while (next.length < n) next.push(`Jugador ${next.length + 1}`);
      return next.slice(0, n);
    });
    setColorIds(prev => {
      const next = [...prev];
      while (next.length < n) next.push(DEFAULT_COLOR_IDS[next.length % DEFAULT_COLOR_IDS.length]);
      return next.slice(0, n);
    });
  };

  // ── Cambiar color de un jugador ───────────────────────────────────────────
  const updateColor = (idx, colorId) => {
    setColorIds(prev => {
      const next = [...prev];
      next[idx] = colorId;
      return next;
    });
    setOpenColorPicker(null);
  };

  // ── Confirmar y arrancar ──────────────────────────────────────────────────
  const handleStart = () => {
    const playerData = names.map((name, i) => ({
      name,
      colorId: colorIds[i],
    }));
    initPlayers(names, colorIds);
    onStart(playerData);
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        background: theme.modalBg,
        border: `1px solid ${theme.accent}44`,
        borderRadius: "16px",
        padding: "40px",
        width: "480px",
        maxWidth: "95vw",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px ${theme.accent}18`,
        fontFamily: theme.font,
      }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "30px", marginBottom: "6px" }}>♦</div>
          <h2 style={{
            fontSize: "26px",
            color: theme.accentLight,
            letterSpacing: "3px",
            margin: 0,
            fontFamily: theme.font,
            fontWeight: "800",
            textShadow: `0 0 24px ${theme.accent}88`,
          }}>ROYAL TABLE</h2>
          <p style={{
            color: theme.textDim,
            fontSize: "10px",
            letterSpacing: "3px",
            marginTop: "6px",
          }}>MESA PRIVADA DE CARTAS</p>
        </div>

        {/* ── Selector de tema ── */}
        <div style={{ marginBottom: "24px" }}>
          <SectionLabel theme={theme}>TEMA VISUAL</SectionLabel>
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.entries(themes).map(([key, t]) => (
              <button key={key} onClick={() => setThemeKey(key)} style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "6px",
                border: themeKey === key
                  ? `2px solid ${theme.accent}`
                  : `1px solid ${theme.accent}25`,
                background: themeKey === key
                  ? `${theme.accent}18`
                  : "transparent",
                color: themeKey === key ? theme.accentLight : theme.textDim,
                fontFamily: theme.font,
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cantidad de jugadores ── */}
        <div style={{ marginBottom: "24px" }}>
          <SectionLabel theme={theme}>NÚMERO DE JUGADORES</SectionLabel>
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {[2,3,4,5,6,7,8].map(n => (
              <button key={n} onClick={() => updateCount(n)} style={{
                width: "42px", height: "42px",
                borderRadius: "6px",
                border: playerCount === n
                  ? `2px solid ${theme.accent}`
                  : `1px solid ${theme.accent}28`,
                background: playerCount === n
                  ? `${theme.accent}22`
                  : "transparent",
                color: playerCount === n ? theme.accentLight : theme.textDim,
                fontSize: "16px",
                fontFamily: theme.font,
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
              }}>{n}</button>
            ))}
          </div>
        </div>

        {/* ── Lista de jugadores ── */}
        <div style={{ marginBottom: "32px" }}>
          <SectionLabel theme={theme}>JUGADORES Y COLORES</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {names.map((name, i) => {
              const color = PLAYER_COLORS.find(c => c.id === colorIds[i]) || PLAYER_COLORS[0];
              return (
                <div key={i}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                  }}>
                    {/* Número */}
                    <span style={{
                      color: theme.textDim, fontSize: "11px",
                      fontFamily: theme.font, width: "16px",
                      textAlign: "right", flexShrink: 0,
                    }}>{i + 1}</span>

                    {/* Input nombre */}
                    <input
                      value={name}
                      onChange={e => {
                        const next = [...names];
                        next[i] = e.target.value;
                        setNames(next);
                      }}
                      style={{
                        flex: 1,
                        background: `${color.hex}10`,
                        border: `1px solid ${color.hex}55`,
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: i === 0 ? theme.accentLight : theme.text,
                        fontFamily: theme.font,
                        fontSize: "13px",
                        transition: "border 0.2s, background 0.2s",
                      }}
                    />

                    {/* Botón selector de color */}
                    <button
                      onClick={() => setOpenColorPicker(openColorPicker === i ? null : i)}
                      style={{
                        width: "34px", height: "34px",
                        borderRadius: "50%",
                        border: `2px solid ${color.hex}`,
                        background: `${color.hex}22`,
                        boxShadow: `0 0 10px ${color.glow}`,
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                    >
                      <div style={{
                        width: "16px", height: "16px",
                        borderRadius: "50%",
                        background: color.hex,
                        margin: "auto",
                        boxShadow: `0 0 6px ${color.glow}`,
                      }} />
                    </button>

                    {/* Badge HOST */}
                    {i === 0 && (
                      <span style={{
                        fontSize: "9px", color: theme.textDim,
                        fontFamily: theme.font, letterSpacing: "1px",
                        flexShrink: 0,
                      }}>HOST</span>
                    )}
                  </div>

                  {/* ── Panel selector de color expandible ── */}
                  {openColorPicker === i && (
                    <div style={{
                      marginTop: "10px",
                      marginLeft: "26px",
                      background: `rgba(0,0,0,0.5)`,
                      border: `1px solid ${theme.accent}25`,
                      borderRadius: "10px",
                      padding: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      animation: "fadeIn 0.2s ease",
                    }}>
                      {PLAYER_COLORS.map(c => {
                        const isSelected = colorIds[i] === c.id;
                        const isUsedByOther = colorIds.some(
                          (cid, idx) => idx !== i && cid === c.id
                        );
                        return (
                          <button
                            key={c.id}
                            onClick={() => !isUsedByOther && updateColor(i, c.id)}
                            title={c.label}
                            style={{
                              width: "32px", height: "32px",
                              borderRadius: "50%",
                              border: isSelected
                                ? `2.5px solid white`
                                : `2px solid ${c.hex}66`,
                              background: `${c.hex}22`,
                              boxShadow: isSelected
                                ? `0 0 12px ${c.glow}`
                                : "none",
                              cursor: isUsedByOther ? "not-allowed" : "pointer",
                              opacity: isUsedByOther ? 0.25 : 1,
                              transition: "all 0.15s",
                              position: "relative",
                              flexShrink: 0,
                            }}
                          >
                            <div style={{
                              width: "16px", height: "16px",
                              borderRadius: "50%",
                              background: c.hex,
                              margin: "auto",
                            }} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Botón iniciar ── */}
        <button
          onClick={handleStart}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "8px",
            border: `1.5px solid ${theme.accent}80`,
            background: `linear-gradient(135deg, ${theme.accentMid}, ${theme.accent}88)`,
            color: "#0a0a0a",
            fontFamily: theme.font,
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "2.5px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: `0 4px 20px ${theme.accent}33`,
          }}
        >
          INICIAR MESA
        </button>
      </div>
    </div>
  );
}

// ── Label de sección ──────────────────────────────────────────────────────
function SectionLabel({ theme, children }) {
  return (
    <div style={{
      fontSize: "10px",
      color: theme.textDim,
      letterSpacing: "2.5px",
      fontFamily: theme.font,
      fontWeight: "700",
      marginBottom: "10px",
    }}>
      {children}
    </div>
  );
}