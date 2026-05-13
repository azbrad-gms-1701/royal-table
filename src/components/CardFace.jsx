import SuitGrid from "./SuitGrid";
import { RED_SUITS } from "../utils/deck";

export default function CardFace({ suit, value }) {
  const isRed = RED_SUITS.includes(suit);
  const color = isRed ? "#c0392b" : "#0a0a0a";
  const isSpecial = ["J", "Q", "K"].includes(value);

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(145deg, #fefefe 0%, #f0ece0 100%)",
      borderRadius: "10px",
      padding: "6px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      fontFamily: "'Playfair Display', serif",
    }}>
      {/* Índice superior izquierdo */}
      <div style={{ color, lineHeight: 1 }}>
        <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.5px" }}>{value}</div>
        <div style={{ fontSize: "14px", marginTop: "-2px" }}>{suit}</div>
      </div>

      {/* Centro */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}>
        {isSpecial ? (
          <div style={{
            fontSize: "36px",
            background: `linear-gradient(135deg, ${color} 0%, ${isRed ? "#e74c3c" : "#2c2c2c"} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
          }}>
            {value === "J" ? "♟" : value === "Q" ? "♛" : "♚"}
          </div>
        ) : value === "A" ? (
          <div style={{ fontSize: "44px", color, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}>
            {suit}
          </div>
        ) : (
          <SuitGrid suit={suit} value={parseInt(value)} color={color} />
        )}
      </div>

      {/* Índice inferior derecho (rotado) */}
      <div style={{ color, lineHeight: 1, alignSelf: "flex-end", transform: "rotate(180deg)" }}>
        <div style={{ fontSize: "18px", fontWeight: "800" }}>{value}</div>
        <div style={{ fontSize: "14px", marginTop: "-2px" }}>{suit}</div>
      </div>

      {/* Borde sutil */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "10px",
        border: `1px solid ${isRed ? "rgba(192,57,43,0.15)" : "rgba(0,0,0,0.08)"}`,
        pointerEvents: "none",
      }} />
    </div>
  );
}