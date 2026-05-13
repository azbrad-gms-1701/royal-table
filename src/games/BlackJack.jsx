import { useState } from "react";
import { createDeck, cardNumericValue } from "../utils/deck";
import { usePlayers } from "../context/PlayersContext";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/Card";
import GoldButton from "../components/GoldButton";
import TableFelt from "../components/TableFelt";
import ShuffleDeck from "../components/ShuffleDeck";

// ── Valor de mano en Black Jack ───────────────────────────────────────────
function handValue(cards) {
  let total = 0;
  let aces  = 0;
  cards.forEach(c => {
    if (c.value === "A")                        { total += 11; aces++; }
    else if (["J","Q","K"].includes(c.value))     total += 10;
    else                                          total += parseInt(c.value);
  });
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

// Estado inicial de cada jugador
function initPlayerState(p) {
  return {
    name:   p.name,
    colorId: p.colorId,
    cards:  [],
    status: "waiting", // waiting | playing | standing | bust | blackjack
  };
}

export default function BlackJack({ onBack }) {
  const { theme }             = useTheme();
  const { players, getColor } = usePlayers();

  const [deck, setDeck]               = useState([]);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [phase, setPhase]             = useState("shuffle");
  // shuffle | deal | playing | result
  const [states, setStates]           = useState([]);
  const [revealed, setRevealed]       = useState(false);
  const [activeIdx, setActiveIdx]     = useState(null);
  const [winners, setWinners]         = useState([]);
  const [showBanner, setShowBanner]   = useState(false);

  const isTwoPlayer = players.length === 2;

  // ── Barajar ───────────────────────────────────────────────────────────────
  const handleShuffle = () => {
    setDeck(createDeck());
    setShuffleCount(c => c + 1);
  };

  // ── Repartir 2 cartas a cada jugador ─────────────────────────────────────
  const handleDeal = () => {
    let d = [...deck];
    const newStates = players.map(p => {
      const cards = [d.shift(), d.shift()];
      return { ...initPlayerState(p), cards, status: "playing" };
    });
    setDeck(d);
    setStates(newStates);
    setRevealed(false);
    setActiveIdx(null);
    setWinners([]);
    setShowBanner(false);
    setPhase("deal");
  };

  // ── Revelar todas las cartas ──────────────────────────────────────────────
  const handleReveal = () => {
    setRevealed(true);

    // Detectar Black Jacks naturales
    const next = states.map(s => {
      const val = handValue(s.cards);
      return { ...s, status: val === 21 ? "blackjack" : "playing" };
    });
    setStates(next);

    // Si alguien tiene BJ → resolver inmediatamente
    const bjPlayers = next.filter(s => s.status === "blackjack");
    if (bjPlayers.length > 0) {
      resolveGame(next);
      return;
    }

    setPhase("playing");
    // En modo 2 jugadores no hay turno fijo,
    // el anfitrión toca la casilla del jugador que quiere actuar
    // En 3+ jugadores tampoco hay orden fijo, igual sistema
    setActiveIdx(null);
  };

  // ── Seleccionar jugador activo al tocar su casilla ────────────────────────
  const handleSelectPlayer = (idx) => {
    if (phase !== "playing") return;
    const s = states[idx];
    if (s.status !== "playing") return;
    setActiveIdx(idx);
  };

  // ── Pedir carta (Hit) ─────────────────────────────────────────────────────
  const handleHit = () => {
    if (activeIdx === null) return;
    const d = [...deck];
    const card = d.shift();
    setDeck(d);

    setStates(prev => {
      const next = prev.map((s, i) => {
        if (i !== activeIdx) return s;
        const newCards = [...s.cards, card];
        const val      = handValue(newCards);
        let status     = "playing";
        if (val > 21) status = "bust";
        if (val === 21) status = "standing";
        return { ...s, cards: newCards, status };
      });

      checkAutoResolve(next);
      return next;
    });

    setActiveIdx(null);
  };

  // ── Plantarse (Stand) ─────────────────────────────────────────────────────
  const handleStand = () => {
    if (activeIdx === null) return;
    setStates(prev => {
      const next = prev.map((s, i) =>
        i === activeIdx ? { ...s, status: "standing" } : s
      );
      checkAutoResolve(next);
      return next;
    });
    setActiveIdx(null);
  };

  // ── Verificar si se debe resolver automáticamente ─────────────────────────
  const checkAutoResolve = (currentStates) => {
    const stillPlaying = currentStates.filter(s => s.status === "playing");
    const activePlayers = currentStates.filter(s => s.status !== "bust");

    if (isTwoPlayer) {
      // En 2 jugadores: si uno llega a 21 gana inmediatamente
      // o si uno se pasa de 21, el otro gana automáticamente
      const bust    = currentStates.filter(s => s.status === "bust");
      const bj      = currentStates.filter(s => s.status === "blackjack" || s.status === "standing");

      if (bust.length === 1 && currentStates.length === 2) {
        // Uno se pasó → el otro gana
        resolveGame(currentStates);
        return;
      }
      if (bj.some(s => handValue(s.cards) === 21)) {
        // Alguien llegó exactamente a 21 → gana
        resolveGame(currentStates);
        return;
      }
    } else {
      // 3+ jugadores: si solo queda 1 jugador activo → gana
      if (stillPlaying.length === 0) {
        resolveGame(currentStates);
        return;
      }
      if (activePlayers.length === 1 && stillPlaying.length === 0) {
        resolveGame(currentStates);
        return;
      }
    }
  };

  // ── Resolver la partida y calcular ganadores ──────────────────────────────
  const resolveGame = (finalStates) => {
    const valid = finalStates.filter(s =>
      s.status !== "bust"
    );

    let w = [];
    if (valid.length === 0) {
      // Todos se pasaron → nadie gana
      w = [];
    } else {
      // Blackjack tiene prioridad
      const bjWinners = valid.filter(s => s.status === "blackjack");
      if (bjWinners.length > 0) {
        w = bjWinners.map(s => s.name);
      } else {
        const maxVal = Math.max(...valid.map(s => handValue(s.cards)));
        w = valid
          .filter(s => handValue(s.cards) === maxVal)
          .map(s => s.name);
      }
    }

    setWinners(w);
    setPhase("result");
    setTimeout(() => setShowBanner(true), 1500);
  };

  // ── Nueva ronda ───────────────────────────────────────────────────────────
  const handleNewGame = () => {
    setDeck([]);
    setShuffleCount(0);
    setStates([]);
    setRevealed(false);
    setActiveIdx(null);
    setWinners([]);
    setShowBanner(false);
    setPhase("shuffle");
  };

  // Jugadores aún en juego (no bust)
  const inGameCount = states.filter(s => s.status === "playing").length;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "20px", width: "100%",
      fontFamily: theme.font,
    }}>

      {/* Título */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{
          fontFamily: theme.font, fontSize: "22px",
          background: `linear-gradient(135deg, ${theme.accentMid}, ${theme.accentLight})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: "4px", margin: 0,
        }}>♥ BLACK JACK</h2>
        <p style={{
          color: theme.textDim, fontSize: "11px",
          letterSpacing: "2px", marginTop: "4px", fontFamily: theme.font,
        }}>
          LLEGA A 21 · AS = 1 u 11 · J Q K = 10
        </p>
      </div>

      <TableFelt>

        {/* ══ FASE: Barajar ════════════════════════════════════════════════ */}
        {phase === "shuffle" && (
          <ShuffleDeck
            onShuffle={handleShuffle}
            onDeal={handleDeal}
          />
        )}

        {/* ══ FASE: Cartas repartidas boca abajo ═══════════════════════════ */}
        {phase === "deal" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "32px", width: "100%",
          }}>
            <HandsGrid
              states={states}
              activeIdx={null}
              revealed={false}
              phase={phase}
              winners={[]}
              getColor={getColor}
              theme={theme}
              onSelectPlayer={() => {}}
            />
            <GoldButton onClick={handleReveal} style={{ animation: "scaleIn 0.3s ease" }}>
              REVELAR CARTAS
            </GoldButton>
          </div>
        )}

        {/* ══ FASE: Jugando ════════════════════════════════════════════════ */}
        {phase === "playing" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "24px", width: "100%",
          }}>

            {/* Instrucción contextual */}
            <ContextHint
              activeIdx={activeIdx}
              states={states}
              theme={theme}
              getColor={getColor}
              isTwoPlayer={isTwoPlayer}
            />

            {/* Manos */}
            <HandsGrid
              states={states}
              activeIdx={activeIdx}
              revealed={true}
              phase={phase}
              winners={[]}
              getColor={getColor}
              theme={theme}
              onSelectPlayer={handleSelectPlayer}
            />

            {/* Controles Hit / Stand */}
            {activeIdx !== null && states[activeIdx]?.status === "playing" && (
              <div style={{
                display: "flex", gap: "12px",
                animation: "scaleIn 0.25s ease",
              }}>
                <GoldButton onClick={handleHit}>
                  PEDIR CARTA
                </GoldButton>
                <GoldButton variant="secondary" onClick={handleStand}>
                  PLANTARSE
                </GoldButton>
              </div>
            )}

            {/* Botón resolver manualmente si todos decidieron */}
            {inGameCount === 0 && (
              <GoldButton
                onClick={() => resolveGame(states)}
                style={{ animation: "scaleIn 0.3s ease" }}
              >
                VER RESULTADO
              </GoldButton>
            )}
          </div>
        )}

        {/* ══ FASE: Resultado ══════════════════════════════════════════════ */}
        {phase === "result" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "28px", width: "100%",
          }}>
            <HandsGrid
              states={states}
              activeIdx={null}
              revealed={true}
              phase="result"
              winners={winners}
              getColor={getColor}
              theme={theme}
              onSelectPlayer={() => {}}
            />

            {/* Tabla resumen */}
            <BJScoreTable states={states} winners={winners} theme={theme} />

            {/* Botones */}
            {showBanner && (
              <div style={{
                display: "flex", gap: "12px",
                flexWrap: "wrap", justifyContent: "center",
                animation: "fadeUp 0.4s ease",
              }}>
                <GoldButton onClick={handleNewGame}>NUEVA RONDA</GoldButton>
                <GoldButton variant="secondary" onClick={onBack}>
                  CAMBIAR JUEGO
                </GoldButton>
              </div>
            )}
          </div>
        )}

      </TableFelt>

      {/* Banner central de ganador */}
      {showBanner && phase === "result" && (
        <WinnerBanner
          winners={winners}
          states={states}
          theme={theme}
          getColor={getColor}
        />
      )}
    </div>
  );
}

// ── Grid de manos ─────────────────────────────────────────────────────────
function HandsGrid({ states, activeIdx, revealed, phase,
  winners, getColor, theme, onSelectPlayer }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      gap: "20px", justifyContent: "center", width: "100%",
    }}>
      {states.map((s, idx) => {
        const color    = getColor(s.colorId);
        const isActive = activeIdx === idx;
        const isWinner = winners.includes(s.name);
        const isBust   = s.status === "bust";
        const isBJ     = s.status === "blackjack";
        const val      = handValue(s.cards);
        const overlap  = Math.max(-8, 16 - s.cards.length * 2);
        const canSelect = phase === "playing" && s.status === "playing";

        return (
          <div
            key={s.name}
            onClick={() => canSelect && onSelectPlayer(idx)}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "8px",
              padding: "14px 18px",
              borderRadius: "14px",
              border: isActive
                ? `2px solid ${color.hex}`
                : isWinner
                  ? `2px solid ${color.hex}88`
                  : `1.5px solid ${color.hex}28`,
              background: isActive
                ? `${color.hex}10`
                : isWinner
                  ? `${color.hex}08`
                  : "transparent",
              boxShadow: isActive
                ? `0 0 24px ${color.glow}`
                : isWinner
                  ? `0 0 16px ${color.glow}55`
                  : "none",
              cursor: canSelect ? "pointer" : "default",
              transition: "all 0.3s",
              opacity: isBust && phase === "playing" ? 0.45 : 1,
              transform: isBJ && phase === "result" ? "scale(1.06)" : "scale(1)",
            }}
          >
            {/* Nombre */}
            <div style={{
              fontFamily: theme.font,
              fontSize: "12px",
              color: isActive ? color.hex : isWinner ? color.hex : theme.text,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: isActive || isWinner ? "700" : "400",
              textShadow: isActive ? `0 0 10px ${color.glow}` : "none",
            }}>
              {isWinner && "🏆 "}{s.name}
            </div>

            {/* Etiqueta de estado */}
            <StatusBadge status={s.status} theme={theme} />

            {/* Cartas */}
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              {s.cards.length === 0 ? (
                <EmptySlot theme={theme} />
              ) : (
                s.cards.map((card, ci) => (
                  <div key={card.id} style={{
                    marginLeft: ci === 0 ? 0 : `${overlap}px`,
                    transform: isBJ && phase === "result"
                      ? "scale(1.05)"
                      : "scale(1)",
                    transition: "transform 0.4s ease",
                    filter: isBJ
                      ? `drop-shadow(0 0 10px ${color.hex})`
                      : "none",
                  }}>
                    <Card
                      card={card}
                      faceUp={revealed}
                      index={ci}
                      isDealing={true}
                      playerColor={color}
                      disabled={true}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Total de puntos */}
            {revealed && s.cards.length > 0 && (
              <div style={{
                fontFamily: theme.font,
                fontSize: "22px",
                fontWeight: "800",
                color: isBust      ? "#e74c3c"
                     : isBJ        ? "#2ecc71"
                     : val === 21  ? "#f5d98b"
                     : color.hex,
                letterSpacing: "1px",
                textShadow: isBJ
                  ? "0 0 14px rgba(46,204,113,0.6)"
                  : val === 21
                    ? `0 0 10px rgba(245,217,139,0.5)`
                    : "none",
                transition: "color 0.3s",
              }}>
                {val}
                {isBJ && <span style={{ fontSize: "13px", marginLeft: "5px" }}>✦</span>}
              </div>
            )}

            {/* Toca para actuar */}
            {canSelect && !isActive && (
              <div style={{
                fontSize: "9px",
                color: `${color.hex}80`,
                fontFamily: theme.font,
                letterSpacing: "1.5px",
                animation: "neonPulse 1.8s ease-in-out infinite",
              }}>
                TOCA PARA ACTUAR
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Hint contextual ───────────────────────────────────────────────────────
function ContextHint({ activeIdx, states, theme, getColor, isTwoPlayer }) {
  if (activeIdx !== null) {
    const s     = states[activeIdx];
    const color = getColor(s.colorId);
    return (
      <div style={{
        background: `${color.hex}12`,
        border: `1.5px solid ${color.hex}55`,
        borderRadius: "8px",
        padding: "10px 24px",
        textAlign: "center",
        fontFamily: theme.font,
        fontSize: "12px",
        color: color.hex,
        letterSpacing: "1.5px",
        boxShadow: `0 0 16px ${color.glow}`,
        animation: "scaleIn 0.25s ease",
      }}>
        TURNO DE <span style={{ fontWeight: "800" }}>{s.name}</span>
        {" · "}PIDE CARTA O PLÁNTATE
      </div>
    );
  }
  return (
    <div style={{
      background: `${theme.accent}0d`,
      border: `1px solid ${theme.accent}25`,
      borderRadius: "8px",
      padding: "10px 24px",
      textAlign: "center",
      fontFamily: theme.font,
      fontSize: "11px",
      color: theme.textDim,
      letterSpacing: "1.5px",
    }}>
      {isTwoPlayer
        ? "TOCA LA CASILLA DEL JUGADOR QUE QUIERE ACTUAR"
        : "TOCA LA CASILLA DEL JUGADOR QUE QUIERE ACTUAR"}
    </div>
  );
}

// ── Badge de estado del jugador ───────────────────────────────────────────
function StatusBadge({ status, theme }) {
  const config = {
    playing:   { label: "JUGANDO",     color: theme.accent },
    standing:  { label: "PLANTADO",    color: "#a0a8c0"    },
    bust:      { label: "BUST",        color: "#e74c3c"    },
    blackjack: { label: "BLACKJACK ✦", color: "#2ecc71"    },
    waiting:   { label: "ESPERANDO",   color: theme.textDim},
  };
  const c = config[status] || config.waiting;
  return (
    <div style={{
      fontSize: "9px",
      color: c.color,
      fontFamily: theme.font,
      fontWeight: "700",
      letterSpacing: "1.5px",
      border: `1px solid ${c.color}44`,
      borderRadius: "4px",
      padding: "2px 8px",
      background: `${c.color}10`,
    }}>
      {c.label}
    </div>
  );
}

// ── Tabla de resultados ───────────────────────────────────────────────────
function BJScoreTable({ states, winners, theme }) {
  const sorted = [...states].sort((a, b) => {
    if (a.status === "bust" && b.status !== "bust") return 1;
    if (b.status === "bust" && a.status !== "bust") return -1;
    return handValue(b.cards) - handValue(a.cards);
  });

  return (
    <div style={{
      background: "rgba(0,0,0,0.3)",
      border: `1px solid ${theme.accent}28`,
      borderRadius: "10px",
      overflow: "hidden",
      minWidth: "300px",
    }}>
      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "20px 1fr 70px 110px",
        padding: "8px 16px",
        borderBottom: `1px solid ${theme.accent}18`,
        background: `${theme.accent}0a`,
      }}>
        {["#", "JUGADOR", "PUNTOS", "ESTADO"].map((h, i) => (
          <div key={h} style={{
            fontSize: "9px", color: theme.textDim,
            letterSpacing: "1.5px", fontFamily: theme.font,
            textAlign: i > 1 ? "center" : "left",
          }}>{h}</div>
        ))}
      </div>
      {/* Filas */}
      {sorted.map((s, i) => {
        const val      = handValue(s.cards);
        const isBust   = s.status === "bust";
        const isBJ     = s.status === "blackjack";
        const isWinner = winners.includes(s.name);
        return (
          <div key={s.name} style={{
            display: "grid",
            gridTemplateColumns: "20px 1fr 70px 110px",
            padding: "9px 16px",
            borderBottom: i < sorted.length - 1
              ? `1px solid ${theme.accent}0d` : "none",
            background: isWinner ? `${theme.accent}0a` : "transparent",
          }}>
            <div style={{
              fontSize: "11px", fontFamily: theme.font,
              color: isWinner ? theme.accentLight : theme.textDim,
            }}>{i + 1}</div>
            <div style={{
              fontSize: "12px", fontFamily: theme.font,
              color: isWinner ? theme.accentLight : theme.text,
              fontWeight: isWinner ? "700" : "400",
            }}>
              {isWinner && "🏆 "}{s.name}
            </div>
            <div style={{
              fontSize: "14px", fontFamily: theme.font,
              fontWeight: "700", textAlign: "center",
              color: isBust ? "#e74c3c" : isBJ ? "#2ecc71" : theme.accent,
            }}>{val}</div>
            <div style={{
              fontSize: "9px", fontFamily: theme.font,
              letterSpacing: "0.5px", textAlign: "center",
              color: isBust ? "#e74c3c" : isBJ ? "#2ecc71" : theme.textDim,
            }}>
              {isBJ ? "BLACKJACK ✦" : isBust ? "BUST" : s.status === "standing" ? "PLANTADO" : "-"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Banner central de ganador ─────────────────────────────────────────────
function WinnerBanner({ winners, states, theme, getColor }) {
  const allBust  = states.every(s => s.status === "bust");
  const isEmpate = winners.length > 1;

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(12px)",
        borderRadius: "20px",
        padding: "40px 64px",
        textAlign: "center",
        animation: "bannerDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        border: `1.5px solid ${allBust ? "rgba(231,76,60,0.4)" : `${theme.accent}44`}`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
        maxWidth: "90vw",
      }}>
        {allBust ? (
          <>
            <div style={{
              fontSize: "13px", letterSpacing: "4px",
              color: "rgba(231,76,60,0.6)",
              fontFamily: theme.font, marginBottom: "10px",
            }}>RESULTADO</div>
            <div style={{
              fontSize: "28px", fontFamily: theme.font,
              fontWeight: "800", color: "#e74c3c", letterSpacing: "2px",
            }}>¡TODOS SE PASARON!</div>
          </>
        ) : isEmpate ? (
          <>
            <div style={{
              fontSize: "13px", letterSpacing: "4px",
              color: theme.textDim, fontFamily: theme.font, marginBottom: "12px",
            }}>¡EMPATE!</div>
            <div style={{
              display: "flex", gap: "16px",
              justifyContent: "center", flexWrap: "wrap",
            }}>
              {winners.map(name => {
                const s     = states.find(st => st.name === name);
                const color = getColor(s?.colorId);
                return (
                  <div key={name} style={{
                    fontSize: "clamp(18px, 3vw, 28px)",
                    fontFamily: theme.font, fontWeight: "800",
                    color: color.hex, textShadow: `0 0 20px ${color.glow}`,
                    letterSpacing: "2px",
                  }}>{name}</div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {winners.map(name => {
              const s     = states.find(st => st.name === name);
              const color = getColor(s?.colorId);
              const isBJ  = s?.status === "blackjack";
              return (
                <div key={name}>
                  <div style={{
                    fontSize: "13px", letterSpacing: "4px",
                    color: theme.textDim,
                    fontFamily: theme.font, marginBottom: "8px",
                  }}>
                    {isBJ ? "¡BLACK JACK!" : "GANADOR"}
                  </div>
                  <div style={{
                    fontSize: "clamp(24px, 4vw, 42px)",
                    fontFamily: theme.font, fontWeight: "800",
                    color: color.hex,
                    textShadow: `0 0 30px ${color.glow}`,
                    letterSpacing: "3px",
                  }}>
                    🏆 {name}
                  </div>
                  <div style={{
                    fontSize: "14px", color: theme.textDim,
                    marginTop: "8px", fontFamily: theme.font,
                    letterSpacing: "1px",
                  }}>
                    {isBJ ? "21 NATURAL" : `${handValue(s.cards)} puntos`}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ── Slot vacío ────────────────────────────────────────────────────────────
function EmptySlot({ theme }) {
  return (
    <div style={{
      width: "80px", height: "115px",
      border: `2px dashed ${theme.accent}22`,
      borderRadius: "10px",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ color: `${theme.accent}22`, fontSize: "20px" }}>—</span>
    </div>
  );
}