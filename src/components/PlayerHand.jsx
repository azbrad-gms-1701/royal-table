import { useState, useEffect } from "react";
import Card from "./Card";

export default function PlayerHand({ player, cards, isHost }) {
  const [revealed, setRevealed] = useState(isHost);
  const overlap = Math.max(-5, 20 - cards.length * 2);

  // Si es host, siempre visible
  useEffect(() => { if (isHost) setRevealed(true); }, [isHost]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      {/* Etiqueta del jugador */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isHost ? "14px" : "12px",
          color: isHost ? "#f5d98b" : "#a89060",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          fontWeight: "600",
        }}>
          {player}
        </div>
        {!isHost && cards.length > 0 && (
          <button onClick={() => setRevealed(r => !r)} style={{
            background: revealed ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.3)",
            border: "1px solid rgba(201,168,76,0.4)",
            color: "#c9a84c",
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "10px",
            cursor: "pointer",
            fontFamily: "'Playfair Display', serif",
            letterSpacing: "0.5px",
            transition: "all 0.2s",
          }}>
            {revealed ? "OCULTAR" : "REVELAR"}
          </button>
        )}
      </div>

      {/* Cartas */}
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        {cards.length === 0 ? (
          <div style={{
            width: "80px", height: "115px",
            border: "2px dashed rgba(201,168,76,0.2)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "rgba(201,168,76,0.3)", fontSize: "24px" }}>+</span>
          </div>
        ) : (
          cards.map((card, i) => (
            <div key={card.id} style={{ marginLeft: i === 0 ? 0 : `${overlap}px` }}>
              <Card card={card} faceUp={revealed} index={i} isDealing={true} />
            </div>
          ))
        )}
      </div>

      {/* Contador */}
      {cards.length > 0 && (
        <div style={{
          fontSize: "10px", color: "rgba(201,168,76,0.5)",
          fontFamily: "'Playfair Display', serif", letterSpacing: "1px",
        }}>
          {cards.length} {cards.length === 1 ? "CARTA" : "CARTAS"}
        </div>
      )}
    </div>
  );
}