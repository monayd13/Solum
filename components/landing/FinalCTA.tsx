import Link from "next/link";

export function FinalCTA() {
  return (
    <section style={{ padding: "80px 40px 100px", background: "var(--surface)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        {/* Quote card */}
        <div style={{
          padding: "48px", marginBottom: "48px",
          background: "var(--surface2)",
          border: "1px solid var(--border2)",
          borderRadius: "24px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, var(--amber), var(--teal), var(--rose))",
          }} />
          <p style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(20px, 3vw, 28px)",
            fontStyle: "italic", fontWeight: 300,
            lineHeight: 1.6, color: "var(--text)", margin: "0 0 20px",
          }}>
            &ldquo;Every person has a story worth telling.{" "}
            <em style={{ color: "var(--amber)", fontStyle: "normal", fontWeight: 500 }}>
              Solum is here to listen.
            </em>
            &rdquo;
          </p>
          <p style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>
            — Daniel, The Steady Mentor
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          <Link href="/signup" style={{
            padding: "16px 36px", borderRadius: "12px",
            background: "var(--amber)", color: "var(--bg)",
            fontWeight: 600, fontSize: "15px", textDecoration: "none",
            boxShadow: "0 8px 30px rgba(212,136,10,0.3)",
          }}>
            Begin your first conversation
          </Link>
          <a href="#companions" style={{
            padding: "16px 28px", borderRadius: "12px",
            background: "transparent",
            border: "1px solid var(--border2)",
            color: "var(--muted)", fontSize: "15px", textDecoration: "none",
          }}>
            Meet the companions
          </a>
        </div>

        {/* Trust microcopy */}
        <p style={{ fontSize: "12px", color: "var(--muted)" }}>
          🔒 Private by default &nbsp;•&nbsp; 🗑️ Delete memories anytime &nbsp;•&nbsp; 💚 No judgment
        </p>
      </div>
    </section>
  );
}
