import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--ec-surface-0)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 16px", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient dots */}
      <div style={{ position: "absolute", top: "25%", left: "25%", width: 4, height: 4, background: "var(--ec-brand)", borderRadius: "50%", opacity: 0.4 }} />
      <div style={{ position: "absolute", top: "33%", right: "33%", width: 3, height: 3, background: "var(--ec-brand)", borderRadius: "50%", opacity: 0.3 }} />
      <div style={{ position: "absolute", bottom: "25%", left: "33%", width: 3, height: 3, background: "var(--ec-brand)", borderRadius: "50%", opacity: 0.3 }} />
      <div style={{ position: "absolute", bottom: "33%", right: "25%", width: 4, height: 4, background: "var(--ec-brand)", borderRadius: "50%", opacity: 0.2 }} />

      <div style={{ maxWidth: 480, width: "100%", textAlign: "center", position: "relative", zIndex: 10 }}>
        <div className="h-eyebrow" style={{ marginBottom: 20 }}>⎯⎯⎯&nbsp;&nbsp;ERROR</div>

        <h1 className="font-serif" style={{
          fontSize: "clamp(80px, 20vw, 140px)", fontWeight: 400,
          letterSpacing: "-0.04em", lineHeight: 1,
          color: "var(--ec-brand)", marginBottom: 8,
        }}>
          4<span style={{ display: "inline-block", transform: "rotate(12deg)", margin: "0 4px" }}>0</span>4
        </h1>

        <div style={{ width: 40, height: 2, background: "var(--ec-brand)", margin: "0 auto 24px", opacity: 0.6 }} />

        <p style={{ color: "var(--ec-text-muted)", fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
          Esta página se ha perdido en el espacio
        </p>

        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 32px", background: "var(--ec-brand)",
            color: "white", borderRadius: 12, fontSize: 14, fontWeight: 600,
            textDecoration: "none", letterSpacing: "0.06em",
          }}
        >
          REGRESAR
        </Link>

        <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 6, height: 6, background: "var(--ec-hairline-strong)", borderRadius: "50%" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
