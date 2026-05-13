import { useState } from "react";
import { createDeck, cardBaccaratValue } from "../utils/deck";
import { usePlayers } from "../context/PlayersContext";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/Card";
import GoldButton from "../components/GoldButton";
import TableFelt from "../components/TableFelt";
import ShuffleDeck from "../components/ShuffleDeck";

// ── Total de mano en Baccarat (solo unidades) ─────────────────────────────
function baccaratTotal(cards) {
  return cards.reduce((acc, c) => acc + cardBaccaratValue(c), 0) % 10;
}

// ── Regla de tercera carta: Jugador ──────────────────────────────────────
function playerDraws(cards) {
  return baccaratTotal(cards) <= 5;
}

// ── Regla de tercera carta: Banca ────────────────────────────────────────
function bancaDraws(bancaCards, playerThirdValue) {
  const t = baccaratTotal(bancaCards);
  if (t <= 2) return true;
  if (t === 3) return playerThirdValue !== 8;
  if (t === 4) return [2,3,4,5,6,7].includes(playerThirdValue);
  if (t === 5) return [4,5,6,7].includes(playerThirdValue);
  if (t === 6) return [6,7].includes(playerThirdValue);
  return false; // 7 → se planta siempre
}

export default function Baccarat({ onBack }) {
  const { theme }             = useTheme();
  const { players, getColor } = usePlayers();

  const [deck, setDeck]             = useState([]);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [phase, setPhase]           = useState("shuffle");
  // shuffle | deal | reveal | result | tiebet | tieresolve

  const [jCards, setJCards]         = useState([]); // cartas del lado Jugador
  const [bCards, setBCards]         = useState([]); // cartas del lado Banca
  const [revealed, setRevealed]     = useState(false);
  const [result, setResult]         = useState(null); // "jugador"|"banca"|"empate"
  const [tieBets, setTieBets]       = useState(      // apuesta de empate extra
    () => Object.fromEntries(players.map(p => [p.name, null]))
  );
  const [showBanner, setShowBanner] = useState(false);
  const [dealLog, setDealLog]       = useState([]);

  const addLog = (msg) => setDealLog(prev => [msg, ...prev]);

  // ── Barajar ───────────────────────────────────────────────────────────────
  const handleShuffle = () => {
    setDeck(createDeck());
    setShuffleCount(c => c + 1);
  };

  // ── Repartir 2 cartas a cada lado boca abajo ──────────────────────────────
  const handleDeal = () => {
    let d = [...deck];
    // Orden clásico: J → B → J → B
    const j1 = d.shift(); const b1 = d.shift();
    const j2 = d.shift(); const b2 = d.shift();
    setDeck(d);
    setJCards([j1, j2]);
    setBCards([b1, b2]);
    setRevealed(false);
    setResult(null);
    setShowBanner(false);
    setDealLog([]);
    setTieBets(Object.fromEntries(players.map(p => [p.name, null])));
    setPhase("deal");
  };

  // ── Revelar cartas y aplicar reglas de tercera carta ─────────────────────
  const handleReveal = () => {
    setRevealed(true);
    let d    = [...deck];
    let j    = [...jCards];
    let b    = [...bCards];
    const jT = baccaratTotal(j);
    const bT = baccaratTotal(b);

    addLog(`Jugador: ${j.map(c => `${c.value}${c.suit}`).join(" + ")} = ${jT}`);
    addLog(`Banca:   ${b.map(c => `${c.value}${c.suit}`).join(" + ")} = ${bT}`);

    let playerThirdVal = null;

    // Natural → no más cartas
    if (jT >= 8 || bT >= 8) {
      addLog("¡NATURAL! No se reparten más cartas.");
    } else {
      // Tercera carta del Jugador
      if (playerDraws(j)) {
        const c = d.shift();
        playerThirdVal = cardBaccaratValue(c);
        j = [...j, c];
        addLog(`Jugador pide 3ª: ${c.value}${c.suit} → total ${baccaratTotal(j)}`);
      }
      // Tercera carta de la Banca
      if (bancaDraws(b, playerThirdVal)) {
        const c = d.shift();
        b = [...b, c];
        addLog(`Banca pide 3ª: ${c.value}${c.suit} → total ${baccaratTotal(b)}`);
      }
    }

    setDeck(d);
    setJCards(j);
    setBCards(b);

    // Determinar resultado
    const fJ = baccaratTotal(j);
    const fB = baccaratTotal(b);
    let res  = fJ > fB ? "jugador" : fB > fJ ? "banca" : "empate";
    addLog(`RESULTADO → Jugador ${fJ} · Banca ${fB} → ${res.toUpperCase()}`);

    setResult(res);

    // Si hubo empate → abrir ronda de apuesta de empate
    if (res === "empate") {
      setTimeout(() => setPhase("tiebet"), 1200);
    } else {
      setPhase("result");
      setTimeout(() => setShowBanner(true), 1400);
    }
  };

  // ── Apostar en ronda de empate ────────────────────────────────────────────
  const handleTieBet = (playerName, side) => {
    setTieBets(prev => ({ ...prev, [playerName]: side }));
  };

  const allTieBetsPlaced = Object.values(tieBets).every(b => b !== null);

  // ── Resolver ronda de empate: carta extra a cada lado ─────────────────────
  const handleTieResolve = () => {
    let d = [...deck];
    const extraJ = d.shift();
    const extraB = d.shift();
    const newJ   = [...jCards, extraJ];
    const newB   = [...bCards, extraB];
    setDeck(d);
    setJCards(newJ);
    setBCards(newB);

    const fJ  = baccaratTotal(newJ);
    const fB  = baccaratTotal(newB);
    let res   = fJ > fB ? "jugador" : fB > fJ ? "banca" : "empate";
    addLog(`CARTA EXTRA → Jugador +${extraJ.value}${extraJ.suit} (${fJ}) · Banca +${extraB.value}${extraB.suit} (${fB}) → ${res.toUpperCase()}`);

    setResult(res);
    setPhase("tieresolve");
    setTimeout(() => setShowBanner(true), 1400);
  };

  // ── Nueva ronda ───────────────────────────────────────────────────────────
  const handleNewGame = () => {
    setDeck([]);
    setShuffleCount(0);
    setJCards([]);
    setBCards([]);
    setRevealed(false);
    setResult(null);
    setShowBanner(false);
    setDealLog([]);
    setTieBets(Object.fromEntries(players.map(p => [p.name, null])));
    setPhase("shuffle");
  };

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
        }}>♦ BACCARAT</h2>
        <p style={{
          color: theme.textDim, fontSize: "11px",
          letterSpacing: "2px", marginTop: "4px",
        }}>
          JUGADOR vs BANCA · SOLO CUENTAN LAS UNIDADES · 8 o 9 = NATURAL
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
            <ApuestaRecordatorio theme={theme} players={players} getColor={getColor} />

            {/* Mesa: Jugador vs Banca boca abajo */}
            <BaccaratTable
              jCards={jCards}
              bCards={bCards}
              revealed={false}
              result={null}
              theme={theme}
            />

            <GoldButton onClick={handleReveal} style={{ animation: "scaleIn 0.3s ease" }}>
              REVELAR CARTAS
            </GoldButton>
          </div>
        )}

        {/* ══ FASE: Resultado ══════════════════════════════════════════════ */}
        {(phase === "result" || phase === "tieresolve") && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "24px", width: "100%",
          }}>
            <BaccaratTable
              jCards={jCards}
              bCards={bCards}
              revealed={true}
              result={result}
              theme={theme}
            />
            <DealLog log={dealLog} theme={theme} />
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

        {/* ══ FASE: Apuesta de empate ═══════════════════════════════════════ */}
        {phase === "tiebet" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "24px", width: "100%",
          }}>

            {/* Aviso de empate */}
            <TieAlert theme={theme} jTotal={baccaratTotal(jCards)} bTotal={baccaratTotal(bCards)} />

            {/* Mesa con cartas reveladas del empate */}
            <BaccaratTable
              jCards={jCards}
              bCards={bCards}
              revealed={true}
              result="empate"
              theme={theme}
            />

            {/* Apuesta extra de cada jugador */}
            <div style={{
              display: "flex", flexDirection: "column",
              gap: "10px", width: "100%", maxWidth: "480px",
            }}>
              <div style={{
                fontSize: "10px", color: theme.textDim,
                letterSpacing: "2.5px", fontFamily: theme.font,
                textAlign: "center", marginBottom: "4px",
              }}>
                NUEVA APUESTA · ¿QUIÉN GANA LA CARTA EXTRA?
              </div>
              {players.map(p => {
                const color = getColor(p.colorId);
                return (
                  <TieBetRow
                    key={p.name}
                    player={p}
                    color={color}
                    currentBet={tieBets[p.name]}
                    onBet={(side) => handleTieBet(p.name, side)}
                    theme={theme}
                  />
                );
              })}
            </div>

            <GoldButton
              onClick={handleTieResolve}
              disabled={!allTieBetsPlaced}
            >
              {allTieBetsPlaced ? "REPARTIR CARTA EXTRA" : "ESPERANDO APUESTAS..."}
            </GoldButton>
          </div>
        )}

      </TableFelt>

      {/* ── Banner central ── */}
      {showBanner && (phase === "result" || phase === "tieresolve") && (
        <ResultBanner result={result} theme={theme} jTotal={baccaratTotal(jCards)} bTotal={baccaratTotal(bCards)} />
      )}
    </div>
  );
}

// ── Mesa Jugador vs Banca ─────────────────────────────────────────────────
function BaccaratTable({ jCards, bCards, revealed, result, theme }) {
  const jTotal  = baccaratTotal(jCards);
  const bTotal  = baccaratTotal(bCards);
  const jWins   = result === "jugador";
  const bWins   = result === "banca";
  const isTie   = result === "empate";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "32px",
      justifyContent: "center",
      flexWrap: "wrap",
      width: "100%",
    }}>
      {/* Lado Jugador */}
      <SidePanel
        label="JUGADOR"
        cards={jCards}
        total={jTotal}
        revealed={revealed}
        isWinner={jWins}
        isTie={isTie}
        accentColor="#3b82f6"
        theme={theme}
      />

      {/* VS central */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "6px",
      }}>
        <div style={{
          fontFamily: theme.font,
          fontSize: "20px",
          color: `${theme.accent}40`,
          fontWeight: "800",
          letterSpacing: "2px",
        }}>VS</div>
        {isTie && revealed && (
          <div style={{
            fontSize: "10px",
            color: "#2ecc71",
            fontFamily: theme.font,
            letterSpacing: "2px",
            fontWeight: "700",
            border: "1px solid #2ecc7155",
            borderRadius: "4px",
            padding: "2px 8px",
            background: "#2ecc7110",
            animation: "scaleIn 0.3s ease",
          }}>
            EMPATE
          </div>
        )}
      </div>

      {/* Lado Banca */}
      <SidePanel
        label="BANCA"
        cards={bCards}
        total={bTotal}
        revealed={revealed}
        isWinner={bWins}
        isTie={isTie}
        accentColor="#ef4444"
        theme={theme}
      />
    </div>
  );
}

// ── Panel de un lado (Jugador o Banca) ────────────────────────────────────
function SidePanel({ label, cards, total, revealed, isWinner, isTie, accentColor, theme }) {
  const isNatural = revealed && (total === 8 || total === 9);
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "12px",
      padding: "18px 24px",
      borderRadius: "14px",
      border: isWinner
        ? `2px solid ${accentColor}`
        : isTie
          ? `1.5px solid #2ecc7166`
          : `1px solid ${accentColor}28`,
      background: isWinner
        ? `${accentColor}12`
        : isTie
          ? "#2ecc7108"
          : `${accentColor}06`,
      boxShadow: isWinner
        ? `0 0 28px ${accentColor}44`
        : isTie
          ? "0 0 16px rgba(46,204,113,0.2)"
          : "none",
      transition: "all 0.4s",
      minWidth: "190px",
    }}>

      {/* Label */}
      <div style={{
        fontFamily: theme.font,
        fontSize: "12px",
        fontWeight: "700",
        color: isWinner ? accentColor : isTie ? "#2ecc71" : `${accentColor}80`,
        letterSpacing: "3px",
        textTransform: "uppercase",
      }}>
        {isWinner && "▶ "}{label}
      </div>

      {/* Cartas */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        {cards.map((card, i) => (
          <Card
            key={`${card.id}-${i}`}
            card={card}
            faceUp={revealed}
            index={i}
            isDealing={true}
            disabled={true}
            style={{
              transform: isWinner ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.4s ease",
              filter: isWinner
                ? `drop-shadow(0 0 10px ${accentColor})`
                : "none",
            }}
          />
        ))}
      </div>

      {/* Total */}
      {revealed && (
        <div style={{
          fontFamily: theme.font,
          fontSize: "42px",
          fontWeight: "800",
          color: isWinner ? accentColor : isTie ? "#2ecc71" : `${accentColor}55`,
          letterSpacing: "2px",
          lineHeight: 1,
          textShadow: isWinner ? `0 0 20px ${accentColor}88` : "none",
          transition: "all 0.4s",
        }}>
          {total}
        </div>
      )}

      {/* Badge Natural */}
      {isNatural && (
        <div style={{
          fontSize: "10px",
          color: accentColor,
          fontFamily: theme.font,
          fontWeight: "700",
          letterSpacing: "2px",
          border: `1px solid ${accentColor}66`,
          borderRadius: "4px",
          padding: "2px 10px",
          background: `${accentColor}15`,
          animation: "scaleIn 0.3s ease",
        }}>
          NATURAL {total}
        </div>
      )}
    </div>
  );
}

// ── Recordatorio de apuestas ──────────────────────────────────────────────
function ApuestaRecordatorio({ theme, players, getColor }) {
  return (
    <div style={{
      background: `${theme.accent}08`,
      border: `1px solid ${theme.accent}20`,
      borderRadius: "10px",
      padding: "14px 24px",
      textAlign: "center",
      maxWidth: "420px",
    }}>
      <div style={{
        fontSize: "10px", color: theme.textDim,
        letterSpacing: "2.5px", fontFamily: theme.font,
        marginBottom: "8px",
      }}>
        APUESTAS REGISTRADAS A VOZ
      </div>
      <div style={{
        display: "flex", gap: "8px",
        justifyContent: "center", flexWrap: "wrap",
      }}>
        {players.map(p => {
          const color = getColor(p.colorId);
          return (
            <div key={p.name} style={{
              fontSize: "11px", fontFamily: theme.font,
              color: color.hex,
              border: `1px solid ${color.hex}44`,
              borderRadius: "20px",
              padding: "3px 12px",
              background: `${color.hex}10`,
              boxShadow: `0 0 6px ${color.glow}`,
            }}>
              {p.name}
            </div>
          );
        })}
      </div>
      <div style={{
        fontSize: "10px", color: theme.textDim,
        fontFamily: theme.font, marginTop: "8px",
        letterSpacing: "1px",
      }}>
        Cuando estén listos, presiona REVELAR CARTAS
      </div>
    </div>
  );
}

// ── Fila de apuesta en ronda de empate ────────────────────────────────────
function TieBetRow({ player, color, currentBet, onBet, theme }) {
  const sides = [
    { id: "jugador", label: "JUGADOR", color: "#3b82f6" },
    { id: "banca",   label: "BANCA",   color: "#ef4444" },
    { id: "empate",  label: "EMPATE",  color: "#2ecc71" },
  ];
  return (
    <div style={{
      display: "flex", alignItems: "center",
      gap: "10px",
      background: "rgba(0,0,0,0.25)",
      border: currentBet
        ? `1px solid ${color.hex}50`
        : `1px solid ${theme.accent}15`,
      borderRadius: "10px",
      padding: "10px 14px",
      transition: "border 0.2s",
    }}>
      {/* Nombre */}
      <div style={{
        fontFamily: theme.font, fontSize: "12px",
        color: color.hex, letterSpacing: "1px",
        minWidth: "90px", textTransform: "uppercase",
        textShadow: `0 0 8px ${color.glow}`,
      }}>
        {player.name}
      </div>

      {/* Botones */}
      <div style={{ display: "flex", gap: "6px", flex: 1 }}>
        {sides.map(side => (
          <button key={side.id} onClick={() => onBet(side.id)} style={{
            flex: 1, padding: "7px 0",
            borderRadius: "6px",
            border: currentBet === side.id
              ? `2px solid ${side.color}`
              : `1px solid rgba(255,255,255,0.08)`,
            background: currentBet === side.id
              ? `${side.color}22` : "rgba(255,255,255,0.03)",
            color: currentBet === side.id ? side.color : theme.textDim,
            fontFamily: theme.font, fontSize: "10px",
            fontWeight: "700", letterSpacing: "1px",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            {side.label}
          </button>
        ))}
      </div>

      {/* Check */}
      <div style={{
        fontSize: "14px",
        color: color.hex,
        minWidth: "18px",
        opacity: currentBet ? 1 : 0,
        transition: "opacity 0.2s",
      }}>✓</div>
    </div>
  );
}

// ── Aviso de empate ───────────────────────────────────────────────────────
function TieAlert({ theme, jTotal, bTotal }) {
  return (
    <div style={{
      background: "rgba(46,204,113,0.08)",
      border: "1.5px solid rgba(46,204,113,0.4)",
      borderRadius: "12px",
      padding: "16px 32px",
      textAlign: "center",
      animation: "scaleIn 0.4s ease",
      boxShadow: "0 0 20px rgba(46,204,113,0.15)",
    }}>
      <div style={{
        fontSize: "10px", color: "rgba(46,204,113,0.6)",
        letterSpacing: "3px", fontFamily: theme.font,
        marginBottom: "6px",
      }}>
        ¡EMPATE!
      </div>
      <div style={{
        fontSize: "18px", fontFamily: theme.font,
        fontWeight: "800", color: "#2ecc71",
        letterSpacing: "2px",
      }}>
        Jugador {jTotal} · Banca {bTotal}
      </div>
      <div style={{
        fontSize: "11px", color: "rgba(46,204,113,0.5)",
        fontFamily: theme.font, marginTop: "6px",
        letterSpacing: "1px",
      }}>
        Se reparte una carta extra. Hagan sus apuestas.
      </div>
    </div>
  );
}

// ── Log de cartas repartidas ──────────────────────────────────────────────
function DealLog({ log, theme }) {
  if (log.length === 0) return null;
  return (
    <div style={{
      background: "rgba(0,0,0,0.35)",
      border: `1px solid ${theme.accent}18`,
      borderRadius: "8px",
      padding: "12px 18px",
      width: "100%", maxWidth: "480px",
    }}>
      <div style={{
        fontSize: "9px", color: theme.textDim,
        letterSpacing: "2px", fontFamily: theme.font,
        marginBottom: "8px",
      }}>
        REGISTRO
      </div>
      {log.map((entry, i) => (
        <div key={i} style={{
          fontSize: "11px",
          color: `rgba(${i === 0 ? "201,168,76" : "160,168,192"},${0.7 - i * 0.08})`,
          fontFamily: theme.font,
          lineHeight: "1.8",
          letterSpacing: "0.3px",
        }}>
          {entry}
        </div>
      ))}
    </div>
  );
}

// ── Banner central de resultado ───────────────────────────────────────────
function ResultBanner({ result, theme, jTotal, bTotal }) {
  const config = {
    jugador: { label: "GANA EL JUGADOR", color: "#3b82f6", emoji: "♠" },
    banca:   { label: "GANA LA BANCA",   color: "#ef4444", emoji: "♦" },
    empate:  { label: "¡EMPATE!",         color: "#2ecc71", emoji: "♣" },
  };
  const c = config[result] || config.empate;

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
        border: `1.5px solid ${c.color}55`,
        boxShadow: `0 30px 60px rgba(0,0,0,0.7), 0 0 40px ${c.color}22`,
        maxWidth: "90vw",
      }}>
        <div style={{
          fontSize: "12px", letterSpacing: "4px",
          color: `${c.color}80`,
          fontFamily: theme.font, marginBottom: "10px",
        }}>
          RESULTADO FINAL
        </div>
        <div style={{
          fontSize: "clamp(22px, 4vw, 38px)",
          fontFamily: theme.font, fontWeight: "800",
          color: c.color,
          textShadow: `0 0 30px ${c.color}88`,
          letterSpacing: "3px",
        }}>
          {c.emoji} {c.label}
        </div>
        <div style={{
          fontSize: "14px", color: theme.textDim,
          marginTop: "10px", fontFamily: theme.font,
          letterSpacing: "1.5px",
        }}>
          Jugador {jTotal} · Banca {bTotal}
        </div>
      </div>
    </div>
  );
}