import { useState, useEffect } from "react";
import CardFace from "./CardFace";
import CardBack from "./CardBack";
import { useTheme } from "../context/ThemeContext";

export default function Card({
  card,
  faceUp = false,
  index = 0,
  isDealing = false,
  playerColor = null,
  selected = false,
  onClick = null,
  disabled = false,
  style = {},
}) {
  const { theme }             = useTheme();
  const [hovered, setHovered] = useState(false);
  const [dealt, setDealt]     = useState(false);

  useEffect(() => {
    let t;
    if (isDealing) {
      t = setTimeout(() => setDealt(true), index * 130);
    } else {
      setDealt(true);
    }
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  const borderColor = playerColor?.hex || theme.accent;
  const glowColor   = playerColor?.glow || `${theme.accent}66`;

  return (
    // Capa exterior: maneja opacidad de entrada, hover lift y el FILTER
    // El filter está AQUÍ, separado del contexto 3D para no romperlo
    <div
      onClick={handleClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "80px",
        height: "115px",
        flexShrink: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: dealt ? 1 : 0,
        transform: dealt
          ? (hovered && !disabled ? "translateY(-7px)" : "translateY(0)")
          : "translateY(-40px)",
        transition: "opacity 0.35s ease, transform 0.35s ease, filter 0.3s ease",
        // Filter en esta capa exterior, NO dentro del contexto 3D
        filter: selected
          ? `drop-shadow(0 0 10px ${borderColor}) drop-shadow(0 0 22px ${glowColor})`
          : hovered && !disabled
            ? `drop-shadow(0 14px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 8px ${glowColor})`
            : playerColor
              ? `drop-shadow(0 4px 10px rgba(0,0,0,0.5)) drop-shadow(0 0 5px ${glowColor})`
              : "drop-shadow(0 4px 10px rgba(0,0,0,0.5))",
        ...style,
      }}
    >
      {/* Capa intermedia: solo perspective, sin filter, sin transform propio */}
      <div style={{
        width: "100%",
        height: "100%",
        perspective: "1000px",
        perspectiveOrigin: "50% 50%",
      }}>
        {/* Capa 3D: solo maneja el flip — sin filter aquí */}
        <div style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          // faceUp controla directamente el ángulo — sin estado intermedio
          transform: `rotateY(${faceUp ? "0deg" : "180deg"})`,
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>

          {/* ── Frente ── */}
          <div style={{
            position: "absolute",
            width: "100%", height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "10px",
            overflow: "hidden",
            outline: playerColor ? `2px solid ${borderColor}` : "none",
            outlineOffset: "1px",
            boxShadow: playerColor
              ? `0 0 0 2px ${borderColor}, 0 0 10px ${glowColor}`
              : "none",
          }}>
            {card && <CardFace suit={card.suit} value={card.value} />}
          </div>

          {/* ── Dorso ── */}
          <div style={{
            position: "absolute",
            width: "100%", height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: "10px",
            overflow: "hidden",
            outline: playerColor ? `2px solid ${borderColor}` : "none",
            outlineOffset: "1px",
            boxShadow: playerColor
              ? `0 0 0 2px ${borderColor}, 0 0 10px ${glowColor}`
              : "none",
          }}>
            <CardBack />
          </div>

        </div>
      </div>
    </div>
  );
}