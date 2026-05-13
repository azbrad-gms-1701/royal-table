export default function CardBack() {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
      borderRadius: "10px",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", position: "relative",
    }}>
      <svg width="100%" height="100%" style={{
        position: "absolute", inset: 0, opacity: 0.25,
      }}>
        <defs>
          {/* ID único para evitar colisiones entre múltiples cartas */}
          <pattern id="cb-diamonds" x="0" y="0" width="14" height="14"
            patternUnits="userSpaceOnUse">
            <polygon points="7,0 14,7 7,14 0,7"
              fill="none" stroke="#c9a84c" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cb-diamonds)" />
      </svg>
      <div style={{
        position: "absolute", inset: "5px", borderRadius: "6px",
        border: "1.5px solid rgba(201,168,76,0.6)",
      }} />
      <div style={{
        position: "absolute", inset: "8px", borderRadius: "4px",
        border: "0.5px solid rgba(201,168,76,0.3)",
      }} />
      <div style={{
        fontSize: "22px",
        background: "linear-gradient(135deg, #c9a84c, #f5d98b, #c9a84c)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        filter: "drop-shadow(0 0 6px rgba(201,168,76,0.4))",
        zIndex: 1,
      }}>♦</div>
    </div>
  );
}