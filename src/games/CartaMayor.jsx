import { useState } from "react";
import { createDeck, cardMayorValue } from "../utils/deck";
import { usePlayers } from "../context/PlayersContext";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/Card";
import GoldButton from "../components/GoldButton";
import TableFelt from "../components/TableFelt";
import ShuffleDeck from "../components/ShuffleDeck";

const POSITIONS = [
  { x: -200, y: -60,  rot: -15 },
  { x: -120, y: -80,  rot: -5  },
  { x: -30,  y: -90,  rot: 3   },
  { x:  60,  y: -75,  rot: 12  },
  { x:  150, y: -55,  rot: -8  },
  { x: -170, y:  30,  rot: 8   },
  { x: -80,  y:  50,  rot: -12 },
  { x:  20,  y:  60,  rot: 5   },
  { x:  110, y:  45,  rot: -6  },
  { x:  190, y:  20,  rot: 14  },
  { x: -50,  y: -20,  rot: -3  },
  { x:  70,  y:  10,  rot: 9   },
  { x: -140, y:  10,  rot: -10 },
];

export default function CartaMayor({ onBack }) {
  const { theme }             = useTheme();
  const { players, getColor } = usePlayers();

  const [deck, setDeck]                     = useState([]);
  const [shuffleCount, setShuffleCount]     = useState(0);
  const [phase, setPhase]                   = useState("shuffle");
  const [tableCards, setTableCards]         = useState([]);
  const [picks, setPicks]                   = useState({});
  const [currentTurn, setCurrentTurn]       = useState(0);
  const [revealed, setRevealed]             = useState(false);
  const [winners, setWinners]               = useState([]);
  const [showBanner, setShowBanner]         = useState(false);
  const [revanchaPlayers, setRevanchaPlayers] = useState(null);
  const [roundKey, setRoundKey]             = useState(0);

  const activePlayers = revanchaPlayers || players;
  const currentPlayer = activePlayers[currentTurn];

  const handleShuffle = () => {
    setDeck(createDeck());
    setShuffleCount(c => c + 1);
  };

  const handleDeal = () => {
    const total = activePlayers.length + 5;
    const newCards = deck.slice(0, total).map((card, i) => ({
      ...card,
      uniqueKey: `r${roundKey}-i${i}-${card.id}`,
      tableIndex: i,
      owner: null,
    }));
    setTableCards(newCards);
    setPicks({});
    setCurrentTurn(0);
    setRevealed(false);
    setWinners([]);
    setShowBanner(false);
    setPhase("pick");
  };

  const handlePickCard = (tableIndex) => {
    if (!currentPlayer) return;
    if (tableCards[tableIndex].owner !== null) return;

    setTableCards(prev =>
      prev.map((c, i) =>
        i === tableIndex ? { ...c, owner: currentPlayer.name } : c
      )
    );
    setPicks(prev => ({ ...prev, [currentPlayer.name]: tableIndex }));

    if (currentTurn + 1 < activePlayers.length) {
      setCurrentTurn(t => t + 1);
    } else {
      setPhase("reveal");
    }
  };

  const handleReveal = () => {
    setRevealed(true);
    setPhase("winner");

    const scored = activePlayers.map(p => {
      const cardIdx = picks[p.name];
      const card    = tableCards[cardIdx];
      return {
        name:  p.name,
        card,
        value: card ? cardMayorValue(card) : 0,
      };
    });

    const maxVal = Math.max(...scored.map(s => s.value));
    const w      = scored.filter(s => s.value === maxVal).map(s => s.name);
    setWinners(w);
    setTimeout(() => setShowBanner(true), 1800);
  };

  const handleRevancha = () => {
    const revPlayers = players.filter(p => winners.includes(p.name));
    setRevanchaPlayers(revPlayers);
    setDeck(createDeck());
    setShuffleCount(0);
    setRoundKey(k => k + 1);
    setTableCards([]);
    setPicks({});
    setCurrentTurn(0);
    setRevealed(false);
    setWinners([]);
    setShowBanner(false);
    setPhase("shuffle");
  };

  const handleNewGame = () => {
    setRevanchaPlayers(null);
    setDeck([]);
    setShuffleCount(0);
    setRoundKey(k => k + 1);
    setTableCards([]);
    setPicks({});
    setCurrentTurn(0);
    setRevealed(false);
    setWinners([]);
    setShowBanner(false);
    setPhase("shuffle");
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "20px", width: "100%",
      fontFamily: theme.font,
    }}>

      <div style={{ textAlign: "center" }}>
        <h2 style={{
          fontFamily: theme.font, fontSize: "22px",
          color: theme.accentLight,
          letterSpacing: "4px", margin: 0,
        }}>
          ♠ CARTA MAYOR
        </h2>
        {revanchaPlayers && (
          <p style={{
            color: theme.textDim, fontSize: "10px",
            letterSpacing: "2.5px", marginTop: "4px",
            fontFamily: theme.font,
          }}>
            REVANCHA · {revanchaPlayers.map(p => p.name).join(" vs ")}
          </p>
        )}
      </div>

      <TableFelt>

        {/* ══ Barajar ══════════════════════════════════════════════════════ */}
        {phase === "shuffle" && (
          <ShuffleDeck
            onShuffle={handleShuffle}
            onDeal={handleDeal}
          />
        )}

        {/* ══ Elegir cartas ════════════════════════════════════════════════ */}
        {(phase === "pick" || phase === "reveal") && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "28px", width: "100%",
          }}>

            {phase === "pick" && currentPlayer && (
              <div style={{
                background: `${getColor(currentPlayer.colorId).hex}12`,
                border: `1.5px solid ${getColor(currentPlayer.colorId).hex}66`,
                borderRadius: "10px",
                padding: "12px 32px",
                textAlign: "center",
                boxShadow: `0 0 20px ${getColor(currentPlayer.colorId).glow}`,
                animation: "scaleIn 0.3s ease",
              }}>
                <div style={{
                  fontSize: "10px", color: theme.textDim,
                  letterSpacing: "3px", fontFamily: theme.font,
                  marginBottom: "4px",
                }}>
                  ELIGE UNA CARTA · {currentTurn + 1} DE {activePlayers.length}
                </div>
                <div style={{
                  fontSize: "20px",
                  color: getColor(currentPlayer.colorId).hex,
                  fontFamily: theme.font, fontWeight: "800",
                  letterSpacing: "2px",
                  textShadow: `0 0 12px ${getColor(currentPlayer.colorId).glow}`,
                }}>
                  {currentPlayer.name}
                </div>
              </div>
            )}

            <MesaCartas
              key={`mesa-${roundKey}-${phase}`}
              cards={tableCards}
              activePlayers={activePlayers}
              phase={phase}
              revealed={revealed}
              onPick={handlePickCard}
              getColor={getColor}
              theme={theme}
              winners={[]}
            />

            {phase === "reveal" && (
              <GoldButton
                onClick={handleReveal}
                style={{ animation: "scaleIn 0.4s ease" }}
              >
                REVELAR CARTAS
              </GoldButton>
            )}
          </div>
        )}

        {/* ══ Ganador ══════════════════════════════════════════════════════ */}
        {phase === "winner" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "28px", width: "100%",
          }}>

            <MesaCartas
              key={`mesa-winner-${roundKey}`}
              cards={tableCards}
              activePlayers={activePlayers}
              phase="winner"
              revealed={true}
              onPick={() => {}}
              getColor={getColor}
              theme={theme}
              winners={winners}
            />

            {showBanner && (
              <BannerGanador
                winners={winners}
                players={activePlayers}
                tableCards={tableCards}
                picks={picks}
                theme={theme}
                getColor={getColor}
              />
            )}

            {showBanner && (
              <div style={{
                display: "flex", gap: "12px",
                flexWrap: "wrap", justifyContent: "center",
                animation: "fadeUp 0.4s ease",
              }}>
                {winners.length > 1 && (
                  <GoldButton onClick={handleRevancha}>
                    REVANCHA ({winners.join(" vs ")})
                  </GoldButton>
                )}
                <GoldButton
                  variant={winners.length > 1 ? "secondary" : "primary"}
                  onClick={handleNewGame}
                >
                  NUEVA PARTIDA
                </GoldButton>
                <GoldButton variant="secondary" onClick={onBack}>
                  CAMBIAR JUEGO
                </GoldButton>
              </div>
            )}
          </div>
        )}

      </TableFelt>
    </div>
  );
}

// ── Cartas dispersas en la mesa ───────────────────────────────────────────
function MesaCartas({ cards, activePlayers, phase, revealed,
  onPick, getColor, theme, winners }) {

  return (
    <div style={{
      position: "relative", width: "100%", height: "280px",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {cards.map((card, i) => {
        const pos      = POSITIONS[i] || { x: 0, y: 0, rot: 0 };
        const owner    = card.owner;
        const ownerP   = owner ? activePlayers.find(p => p.name === owner) : null;
        const color    = ownerP ? getColor(ownerP.colorId) : null;
        const isWinner = !!(owner && winners.includes(owner));
        const canPick  = phase === "pick" && owner === null;

        return (
          <div
            key={card.uniqueKey}
            onClick={() => canPick && onPick(i)}
            style={{
              position: "absolute",
              left: "50%", top: "50%",
              transform: `
                translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))
                rotate(${pos.rot}deg)
                scale(${isWinner ? 1.15 : 1})
              `,
              transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              cursor: canPick ? "pointer" : "default",
              zIndex: isWinner ? 10 : owner ? 5 : 1,
              filter: isWinner
                ? `drop-shadow(0 0 16px ${color?.hex}) drop-shadow(0 0 30px ${color?.glow})`
                : "none",
              animation: isWinner ? "winnerPulse 0.9s ease-in-out infinite" : "none",
            }}
          >
            <Card
              card={card}
              faceUp={revealed}
              index={i}
              isDealing={true}
              playerColor={color}
              selected={owner !== null}
              disabled={!canPick}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Banner central de ganador ─────────────────────────────────────────────
function BannerGanador({ winners, players, tableCards, picks, theme, getColor }) {
  const isEmpate = winners.length > 1;
  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: "20px",
        padding: "40px 64px",
        textAlign: "center",
        animation: "bannerDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        border: `1.5px solid ${isEmpate ? "rgba(200,200,200,0.3)" : "rgba(201,168,76,0.4)"}`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
        maxWidth: "90vw",
      }}>
        {isEmpate ? (
          <>
            <div style={{
              fontSize: "13px", letterSpacing: "4px",
              color: "rgba(200,200,200,0.6)",
              fontFamily: theme.font, marginBottom: "12px",
            }}>
              ¡EMPATE!
            </div>
            <div style={{
              display: "flex", gap: "16px",
              justifyContent: "center", flexWrap: "wrap",
            }}>
              {winners.map(name => {
                const p     = players.find(pl => pl.name === name);
                const color = getColor(p?.colorId);
                return (
                  <div key={name} style={{
                    fontSize: "clamp(18px, 3vw, 28px)",
                    fontFamily: theme.font, fontWeight: "800",
                    color: color.hex,
                    textShadow: `0 0 20px ${color.glow}`,
                    letterSpacing: "2px",
                  }}>
                    {name}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          winners.map(name => {
            const p       = players.find(pl => pl.name === name);
            const color   = getColor(p?.colorId);
            const card    = tableCards[picks[name]];
            return (
              <div key={name}>
                <div style={{
                  fontSize: "13px", letterSpacing: "4px",
                  color: "rgba(201,168,76,0.5)",
                  fontFamily: theme.font, marginBottom: "8px",
                }}>
                  GANADOR
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
                {card && (
                  <div style={{
                    fontSize: "14px", color: theme.textDim,
                    marginTop: "8px", fontFamily: theme.font,
                    letterSpacing: "1px",
                  }}>
                    {card.value}{card.suit} · {cardMayorValue(card)} puntos
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}