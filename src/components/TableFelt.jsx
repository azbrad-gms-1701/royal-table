import { useTheme } from "../context/ThemeContext";

export default function TableFelt({ children }) {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.felt,
      borderRadius: "50%/20%",
      border: `8px solid ${theme.feltBorder}`,
      outline: `3px solid ${theme.accent}18`,
      boxShadow: `
        0 0 0 1px ${theme.accent}12,
        0 20px 60px rgba(0,0,0,0.8),
        inset 0 0 80px rgba(0,0,0,0.4),
        inset 0 0 20px ${theme.accent}05
      `,
      padding: "40px 60px",
      minWidth: "min(700px, 95vw)",
      maxWidth: "1100px",
      width: "90vw",
      minHeight: "420px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "24px",
      position: "relative",
    }}>
      {/* Textura de feltro */}
      <svg style={{
        position: "absolute", inset: 0, opacity: 0.04,
        pointerEvents: "none", borderRadius: "inherit",
      }} width="100%" height="100%">
        <defs>
          <pattern id="felt" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="4" y2="4" stroke={theme.accent} strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#felt)" />
      </svg>
      {children}
    </div>
  );
}