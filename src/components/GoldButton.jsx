import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function GoldButton({
  children,
  onClick,
  variant = "primary",  // primary | secondary | danger
  disabled = false,
  fullWidth = false,
  style = {},
}) {
  const { theme } = useTheme();
  const [hov, setHov] = useState(false);

  const configs = {
    primary: {
      bg: hov
        ? `linear-gradient(135deg, ${theme.accentLight}, ${theme.accent}, ${theme.accentMid})`
        : `linear-gradient(135deg, ${theme.accent}, ${theme.accentMid}, #8a6d2e)`,
      border: `${theme.accent}99`,
      color: "#0a0a0a",
      shadow: hov ? `0 6px 20px ${theme.accent}44` : `0 3px 10px ${theme.accent}28`,
    },
    secondary: {
      bg: hov ? `${theme.accent}20` : `${theme.accent}0d`,
      border: `${theme.accent}55`,
      color: theme.accent,
      shadow: "none",
    },
    danger: {
      bg: hov ? "rgba(192,57,43,0.25)" : "rgba(192,57,43,0.12)",
      border: "rgba(192,57,43,0.6)",
      color: "#e74c3c",
      shadow: hov ? "0 4px 14px rgba(192,57,43,0.3)" : "none",
    },
  };

  const c = configs[variant] || configs.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        color: c.color,
        borderRadius: "7px",
        padding: "10px 22px",
        fontSize: "11px",
        fontFamily: theme.font,
        fontWeight: "700",
        letterSpacing: "1.8px",
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        transition: "all 0.2s",
        transform: hov && !disabled ? "translateY(-1px)" : "none",
        boxShadow: disabled ? "none" : c.shadow,
        width: fullWidth ? "100%" : "auto",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}