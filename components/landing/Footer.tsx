import Link from "next/link";

export function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg)",
      padding: "48px 40px 32px",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: "var(--font-cormorant)", fontSize: "26px",
              fontWeight: 600, color: "var(--amber)", letterSpacing: "1px", marginBottom: "12px",
            }}>
              Solum
            </div>
            <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.7", maxWidth: "240px", margin: "0 0 20px" }}>
              AI companions with deep personalities, real voices, and genuine memory.
            </p>
            <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
              🔒 Private by default &nbsp;•&nbsp; No ads &nbsp;•&nbsp; No data sales
            </p>
          </div>

          {/* Companions */}
          <div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--muted)", marginBottom: "16px" }}>
              Companions
            </p>
            {[
              { name: "Maya Thompson",  color: "#c06800" },
              { name: "Mateo Rivera",   color: "#0a6878" },
              { name: "Claire Donovan", color: "#126838" },
              { name: "Daniel Mercer",  color: "#5018a0" },
            ].map((c) => (
              <Link key={c.name} href="/signup" style={{
                display: "block", fontSize: "13px", color: c.color,
                textDecoration: "none", marginBottom: "10px",
              }}>
                {c.name}
              </Link>
            ))}
          </div>

          {/* Product */}
          <div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--muted)", marginBottom: "16px" }}>
              Product
            </p>
            {[
              { label: "Sign Up", href: "/signup" },
              { label: "Sign In", href: "/login" },
              { label: "Dashboard", href: "/dashboard" },
            ].map((l) => (
              <Link key={l.label} href={l.href} style={{
                display: "block", fontSize: "13px", color: "var(--muted)",
                textDecoration: "none", marginBottom: "10px",
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--muted)", marginBottom: "16px" }}>
              Legal
            </p>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <span key={l} style={{
                display: "block", fontSize: "13px", color: "var(--muted)",
                marginBottom: "10px", cursor: "pointer",
              }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0, letterSpacing: "1px" }}>
            © 2026 Solum · Built for connection
          </p>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
            ⚠️ Not a substitute for professional mental health care.
          </p>
        </div>
      </div>
    </footer>
  );
}
