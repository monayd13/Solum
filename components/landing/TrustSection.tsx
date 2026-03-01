export function TrustSection() {
  const controls = [
    { icon: "👁️", title: "View your memories", description: "See exactly what each companion remembers about you." },
    { icon: "✏️", title: "Edit anytime", description: "Correct or update any memory with one tap." },
    { icon: "🗑️", title: "Delete instantly", description: "Remove any memory or entire conversation history." },
    { icon: "⏸️", title: "Turn memory off", description: "Have calls that don't get remembered at all." },
    { icon: "📤", title: "Export your data", description: "Download everything. Your data belongs to you." },
    { icon: "🔐", title: "Private by default", description: "Encrypted at rest. We never sell your data." },
  ];

  return (
    <section style={{ padding: "80px 40px", background: "var(--bg)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "3px", color: "var(--teal)", marginBottom: "12px" }}>
            Privacy & control
          </p>
          <h2 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 300, margin: "0 0 14px", color: "var(--text)",
          }}>
            You&apos;re in control.{" "}
            <em style={{ fontStyle: "italic", color: "var(--amber)" }}>Always.</em>
          </h2>
          <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "480px", margin: "0 auto" }}>
            Your conversations are yours. We built Solum with privacy at the core.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {controls.map((c) => (
            <div key={c.title} style={{
              background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: "16px", padding: "24px",
              transition: "border-color 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--teal)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{c.icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>{c.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.6", margin: 0 }}>{c.description}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: "40px", padding: "16px 24px",
          background: "var(--surface)", border: "1px solid var(--border2)",
          borderRadius: "12px", textAlign: "center",
        }}>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, lineHeight: "1.8" }}>
            ⚠️ Solum is not a crisis service or substitute for professional mental health care.
            <br />
            <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber)" }}>
              If you&apos;re in crisis, find help here →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
