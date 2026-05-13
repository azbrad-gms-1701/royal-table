import { useState } from "react";
import CardBack from "./CardBack";

export default function DeckStack({ count, onDeal }) {
  const [pressed, setPressed] = useState(false);
  const layers = Math.min(5, Math.ceil(count / 10));

  return (
    <div
      style={{ position: "relative", width: "80px", height: "115px", cursor: count > 0 ? "pointer" : "not-allowed" }}
      onClick={() => count > 0 && onDeal()}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {Array.from({ length: layers }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${-i * 1.5}px`, left: `${i * 0.5}px`,
          width: "80px", height: "115px",
          borderRadius: "10px", overflow: "hidden",
        }}>
          <CardBack />
        </div>
      ))}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: "10px",
        background: "rgba(201,168,76,0.12)",
        border: "1.5px solid rgba(201,168,76,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(2px)",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "transform 0.1s",
        zIndex: 10,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#c9a84c", fontFamily: "'Playfair Display', serif", fontWeight: "600" }}>
            MAZO
          </div>
          <div style={{ fontSize: "18px", color: "#f5d98b", fontWeight: "800", fontFamily: "'Playfair Display', serif" }}>
            {count}
          </div>
        </div>
      </div>
    </div>
  );
}