import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import CardBack from "./CardBack";
import GoldButton from "./GoldButton";

export default function ShuffleDeck({ onDeal, onShuffle }) {
  const { theme }  = useTheme();
  const [count, setCount]   = useState(0);
  const [phase, setPhase]   = useState("idle"); // idle | fan | stack

  const animating = phase !== "idle";

  const handleShuffle = () => {
    if (animating) return;
    setPhase("fan");
    setTimeout(() => setPhase("stack"), 520);
    setTimeout(() => {
      setPhase("idle");
      const newCount = count + 1;
      setCount(newCount);
      onShuffle?.();          // notifica al juego que barajó
    }, 1050);
  };

  const handleDeal = () => {
    onDeal?.();               // notifica al juego que reparte
  };

  const cardAngles = [-32, -20, -10, 0, 10, 20, 32];

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "20px",
    }}>
      {/* Mazo animado */}
      <div
        onClick={handleShuffle}
        style={{
          position: "relative", width: "80px", height: "115px",
          cursor: animating ? "default" : "pointer",
          marginTop: "44px",
        }}
      >
        {cardAngles.map((angle, i) => {
          const isFan = phase === "fan";
          const tx  = isFan ? (i - 3) * 24 : 0;
          const ty  = isFan ? -Math.abs(i - 3) * 10 : i * -1.5;
          const rot = isFan ? angle : 0;
          return (
            <div key={i} style={{
              position: "absolute",
              width: "80px", height: "115px",
              borderRadius: "10px", overflow: "hidden",
              transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`,
              transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
              transformOrigin: "bottom center",
              zIndex: i,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
            }}>
              <CardBack />
            </div>
          );
        })}

        {/* Overlay */}
        {!animating && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "10px",
            background: `${theme.accent}18`,
            border: `1.5px solid ${theme.accent}70`,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 20, backdropFilter: "blur(1px)",
          }}>
            <div style={{
              textAlign: "center", fontFamily: theme.font,
              fontSize: "10px", color: theme.accent,
              fontWeight: "700", letterSpacing: "1.5px",
              lineHeight: "1.4",
            }}>
              {count > 0 ? "BARAJAR\nDE NUEVO" : "BARAJAR"}
            </div>
          </div>
        )}
      </div>

      {/* Estado */}
      <div style={{
        fontSize: "10px", color: theme.textDim,
        fontFamily: theme.font, letterSpacing: "2px", minHeight: "14px",
      }}>
        {animating
          ? "BARAJANDO..."
          : count > 0
            ? `BARAJADO ${count} ${count === 1 ? "VEZ" : "VECES"}`
            : "TOCA EL MAZO PARA BARAJAR"}
      </div>

      {/* Botón repartir — solo aparece tras al menos 1 barajeo */}
      {count > 0 && !animating && (
        <GoldButton onClick={handleDeal} style={{ animation: "scaleIn 0.3s ease" }}>
          REPARTIR CARTAS
        </GoldButton>
      )}
    </div>
  );
}