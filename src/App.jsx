import { useState } from "react";
import { useTheme } from "./context/ThemeContext";
import { usePlayers } from "./context/PlayersContext";
import SetupModal from "./components/SetupModal";
import TableFelt from "./components/TableFelt";
import GoldButton from "./components/GoldButton";
import BackButton from "./components/BackButton";
import CartaMayor from "./games/CartaMayor";
import BlackJack from "./games/BlackJack";
import Baccarat from "./games/Baccarat";
import "./index.css";

const GAMES = [
  { id: "cartamayor", label: "Carta Mayor", symbol: "♠",
    desc: "Cada jugador elige una carta. La más alta gana." },
  { id: "blackjack",  label: "Black Jack",  symbol: "♥",
    desc: "Llega a 21 sin pasarte. As = 1 u 11." },
  { id: "baccarat",   label: "Baccarat",    symbol: "♦",
    desc: "Jugador vs Banca. Solo cuentan las unidades." },
];

export default function App() {
  const { theme, themeKey, setThemeKey, themes } = useTheme();
  const { players } = usePlayers();

  const [setupDone, setSetupDone]         = useState(false);
  const [activeGame, setActiveGame]       = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleStart = () => setSetupDone(true);
  const handleBack  = () => {
    if (activeGame) setActiveGame(null);
    else            setSetupDone(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px 80px",
      gap: "24px",
      fontFamily: theme.font,
      transition: "background 0.4s",
    }}>

      {!setupDone && <SetupModal onStart={handleStart} />}
      {setupDone  && <BackButton onClick={handleBack} />}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          fontSize: "clamp(20px, 3vw, 34px)",
          color: theme.accentLight,
          letterSpacing: "6px",
          fontFamily: theme.font,
          fontWeight: "800",
          margin: 0,
          textShadow: `0 0 30px ${theme.accent}88, 0 2px 4px rgba(0,0,0,0.5)`,
        }}>
          ♠ CARD'S AZ ♦
        </h1>

        <p style={{
          color: theme.textDim,
          fontSize: "10px",
          letterSpacing: "4px",
          marginTop: "6px",
          fontFamily: theme.font,
        }}>
          MESA PRIVADA DE CARTAS
        </p>

        {/* Marca personal */}
        <div style={{
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}>
          <div style={{
            width: "36px", height: "1px",
            background: `linear-gradient(90deg, transparent, ${theme.accent}50)`,
          }} />
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "10px",
            color: theme.accent,
            letterSpacing: "3px",
            fontStyle: "italic",
            opacity: 0.45,
            userSelect: "none",
          }}>
            A̶z̶ Brad
          </span>
          <div style={{
            width: "36px", height: "1px",
            background: `linear-gradient(90deg, ${theme.accent}50, transparent)`,
          }} />
        </div>
      </div>

      {/* ── Lobby ────────────────────────────────────────────────────────── */}
      {setupDone && !activeGame && (
        <TableFelt>

          {/* Badges de jugadores */}
          <div style={{
            display: "flex", flexWrap: "wrap",
            gap: "8px", justifyContent: "center",
          }}>
            {players.map(p => {
              const hex  = p.color?.hex  || theme.accent;
              const glow = p.color?.glow || `${theme.accent}66`;
              return (
                <div key={p.name} style={{
                  fontSize: "11px",
                  fontFamily: theme.font,
                  color: hex,
                  border: `1px solid ${hex}55`,
                  borderRadius: "20px",
                  padding: "3px 14px",
                  background: `${hex}12`,
                  boxShadow: `0 0 8px ${glow}`,
                  letterSpacing: "1px",
                }}>
                  {p.name}
                </div>
              );
            })}
          </div>

          <div style={{
            width: "60%", height: "1px",
            background: `linear-gradient(90deg, transparent, ${theme.accent}30, transparent)`,
          }} />

          <p style={{
            color: theme.textDim, fontSize: "11px",
            letterSpacing: "3px", fontFamily: theme.font,
          }}>
            SELECCIONA UN JUEGO
          </p>

          <div style={{
            display: "flex", gap: "20px",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            {GAMES.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => setActiveGame(game.id)}
                theme={theme}
              />
            ))}
          </div>

        </TableFelt>
      )}

      {/* ── Juegos ───────────────────────────────────────────────────────── */}
      {setupDone && activeGame === "cartamayor" && (
        <CartaMayor onBack={() => setActiveGame(null)} />
      )}
      {setupDone && activeGame === "blackjack" && (
        <BlackJack onBack={() => setActiveGame(null)} />
      )}
      {setupDone && activeGame === "baccarat" && (
        <Baccarat onBack={() => setActiveGame(null)} />
      )}

      {/* ── Botones flotantes ─────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: "16px", right: "16px",
        display: "flex", gap: "8px", zIndex: 500,
      }}>

        {/* Selector de tema */}
        <div style={{ position: "relative" }}>
          {showThemePicker && (
            <div style={{
              position: "absolute",
              bottom: "48px", right: 0,
              background: "rgba(0,0,0,0.88)",
              border: `1px solid ${theme.accent}35`,
              borderRadius: "10px",
              padding: "10px",
              display: "flex", flexDirection: "column", gap: "6px",
              backdropFilter: "blur(12px)",
              animation: "fadeUp 0.2s ease",
              minWidth: "130px",
              boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
            }}>
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => { setThemeKey(key); setShowThemePicker(false); }}
                  style={{
                    background: themeKey === key ? `${theme.accent}20` : "transparent",
                    border: `1px solid ${themeKey === key ? theme.accent : "transparent"}`,
                    borderRadius: "6px",
                    padding: "7px 14px",
                    color: themeKey === key ? theme.accentLight : theme.textDim,
                    fontFamily: theme.font,
                    fontSize: "11px", fontWeight: "700",
                    letterSpacing: "1.5px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
          <FloatingButton
            onClick={() => setShowThemePicker(p => !p)}
            theme={theme}
            title="Cambiar tema"
          >
            ◐
          </FloatingButton>
        </div>

        {/* Instrucciones */}
        <FloatingButton
          onClick={() => window.open("/royal-table/public/instrucciones.html", "_blank")}
          theme={theme}
          title="Instrucciones"
        >
          ?
        </FloatingButton>
      </div>

      {/* ── Firma fija inferior ───────────────────────────────────────────── */}
      <div style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        pointerEvents: "none",
        zIndex: 10,
      }}>
        <div style={{
          width: "24px", height: "1px",
          background: `linear-gradient(90deg, transparent, ${theme.accent}35)`,
        }} />
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "10px",
          color: theme.accent,
          letterSpacing: "3px",
          fontStyle: "italic",
          opacity: 0.3,
        }}>
          A̶z̶ Brad
        </span>
        <div style={{
          width: "24px", height: "1px",
          background: `linear-gradient(90deg, ${theme.accent}35, transparent)`,
        }} />
      </div>

    </div>
  );
}

// ── Tarjeta de juego ──────────────────────────────────────────────────────
function GameCard({ game, onClick, theme }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "170px", height: "210px",
        border: hov
          ? `1.5px solid ${theme.accent}bb`
          : `1.5px solid ${theme.accent}28`,
        borderRadius: "14px",
        background: hov
          ? `linear-gradient(145deg, ${theme.accent}18, ${theme.accent}08)`
          : `linear-gradient(145deg, ${theme.accent}08, transparent)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "14px",
        cursor: "pointer",
        transition: "all 0.25s",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov
          ? `0 14px 32px rgba(0,0,0,0.5), 0 0 20px ${theme.accent}18`
          : "none",
        padding: "16px",
      }}
    >
      <div style={{
        fontSize: "56px",
        color: theme.accentLight,
        filter: hov
          ? `drop-shadow(0 0 14px ${theme.accent})`
          : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
        transition: "filter 0.25s",
        lineHeight: 1,
      }}>
        {game.symbol}
      </div>
      <div style={{
        color: hov ? theme.accentLight : theme.text,
        fontFamily: theme.font,
        fontSize: "14px", fontWeight: "700",
        letterSpacing: "2px", textAlign: "center",
        transition: "color 0.25s",
      }}>
        {game.label.toUpperCase()}
      </div>
      <div style={{
        color: theme.textDim,
        fontFamily: theme.font,
        fontSize: "10px", letterSpacing: "0.5px",
        textAlign: "center", lineHeight: "1.5",
        opacity: hov ? 1 : 0.6,
        transition: "opacity 0.25s",
      }}>
        {game.desc}
      </div>
    </div>
  );
}

// ── Botón flotante ────────────────────────────────────────────────────────
function FloatingButton({ children, onClick, theme, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "38px", height: "38px",
        borderRadius: "50%",
        border: `1px solid ${theme.accent}${hov ? "80" : "35"}`,
        background: hov ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
        color: hov ? theme.accentLight : theme.textDim,
        fontFamily: theme.font,
        fontSize: "15px", fontWeight: "700",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}