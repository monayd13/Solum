export function UserStories() {
  const stories = [
    {
      scenario: "Burned out from chasing goals",
      icon: "�",
      description: "Needed someone who understood ambition without pushing harder.",
      outcome: "\"Maya helped me see the goalpost was the problem, not me.\"",
      companion: "Maya Thompson",
      color: "#c06800",
    },
    {
      scenario: "Working remote, feeling isolated",
      icon: "💻",
      description: "A steady morning check-in that feels like a real conversation.",
      outcome: "\"Mateo's groundedness reminds me what actually matters.\"",
      companion: "Mateo Rivera",
      color: "#0a6878",
    },
    {
      scenario: "Going through a hard time",
      icon: "💙",
      description: "Someone to talk to without feeling like a burden.",
      outcome: "\"Claire helped me see patterns I didn't have words for.\"",
      companion: "Claire Donovan",
      color: "#126838",
    },
  ];

  return (
    <section style={{ padding: "80px 40px", background: "var(--surface)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "3px", color: "var(--rose)", marginBottom: "12px" }}>
            Real reasons people call
          </p>
          <h2 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 300, margin: "0 0 14px", color: "var(--text)",
          }}>
            Everyone&apos;s story is different.
          </h2>
          <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "480px", margin: "0 auto" }}>
            Here&apos;s what brings people to Solum.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {stories.map((s) => (
            <div key={s.scenario} style={{
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: "20px", padding: "28px 24px",
              borderTop: `3px solid ${s.color}`,
              display: "flex", flexDirection: "column", gap: "12px",
            }}>
              <div style={{ fontSize: "36px" }}>{s.icon}</div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: s.color, margin: 0 }}>{s.scenario}</h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.7", margin: 0 }}>{s.description}</p>
              <p style={{
                fontSize: "13px", color: "var(--text)", fontStyle: "italic",
                margin: 0, paddingTop: "12px",
                borderTop: "1px solid var(--border2)",
              }}>
                {s.outcome}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "auto" }}>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>via</span>
                <span style={{ fontSize: "11px", color: s.color, fontWeight: 500 }}>{s.companion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
