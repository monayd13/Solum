import Link from "next/link";
import { ShieldCheck, TriangleAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="landing-footer" style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg)",
      padding: "48px 40px 32px",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gap: "48px", marginBottom: "48px" }}>
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
            <p className="micro-trust" style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
              <ShieldCheck size={13} /> Authenticated access · no browser data storage
            </p>
          </div>

          {/* Companions */}
          <div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--muted)", marginBottom: "16px" }}>
              Companions
            </p>
            <a href="#companions" style={{ display: "block", fontSize: "13px", color: "var(--amber)", textDecoration: "none", marginBottom: "10px" }}>
              Browse the live catalog
            </a>
            <Link href="/signup" style={{ display: "block", fontSize: "13px", color: "var(--muted)", textDecoration: "none", marginBottom: "10px" }}>
              Choose after signup
            </Link>
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
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Safety", href: "/safety" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{
                display: "block", fontSize: "13px", color: "var(--muted)",
                marginBottom: "10px", textDecoration: "none",
              }}>
                {l.label}
              </Link>
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
          <p className="micro-trust" style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
            <TriangleAlert size={13} /> AI companion—not a crisis or mental-health service.
          </p>
        </div>
      </div>
    </footer>
  );
}
