import { useTheme } from "../context/ThemeContext";

// Botón de retroceso permanente que se muestra en la esquina superior izquierda
export default function BackButton({ onClick, label = "ATRÁS" }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        top: "16px",
        left: "16px",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(0,0,0,0.55)",
        border: `1px solid ${theme.accent}40`,
        borderRadius: "8px",
        padding: "8px 14px",
        color: theme.textDim,
        fontFamily: theme.font,
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1.5px",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = theme.accentLight;
        e.currentTarget.style.borderColor = `${theme.accent}80`;
        e.currentTarget.style.background = "rgba(0,0,0,0.75)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = theme.textDim;
        e.currentTarget.style.borderColor = `${theme.accent}40`;
        e.currentTarget.style.background = "rgba(0,0,0,0.55)";
      }}
    >
      ← {label}
    </button>
  );
}