export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: "👤",
      title: "Choose a companion",
      description: "Pick someone whose personality resonates with you. Each has a deep backstory and distinct voice.",
    },
    {
      number: "2",
      icon: "🎙️",
      title: "Talk",
      description: "Have a real voice conversation. No typing needed — just speak naturally.",
    },
    {
      number: "3",
      icon: "🧠",
      title: "They remember",
      description: "Every detail carries to the next call. You control what gets saved.",
    },
  ];

  return (
    <section style={{ padding: "80px 40px", background: "var(--surface)" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "3px", color: "var(--amber)", marginBottom: "12px" }}>
            Simple by design
          </p>
          <h2 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 300, margin: 0, color: "var(--text)",
          }}>
            How Solum Works
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0", position: "relative" }}>
          {/* Connecting line */}
          <div style={{
            position: "absolute", top: "40px", left: "calc(16.5% + 20px)", right: "calc(16.5% + 20px)",
            height: "1px", background: "linear-gradient(90deg, var(--amber), var(--border2))",
            pointerEvents: "none",
          }} />

          {steps.map((step, i) => (
            <div key={step.number} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px", position: "relative" }}>
              {/* Icon circle */}
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "var(--surface2)",
                border: `2px solid ${i === 0 ? "var(--amber)" : "var(--border2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "36px", marginBottom: "20px", position: "relative", zIndex: 1,
                transition: "border-color 0.2s",
              }}>
                {step.icon}
              </div>

              {/* Step label */}
              <div style={{
                fontFamily: "var(--font-dm-mono)", fontSize: "11px",
                color: "var(--amber)", letterSpacing: "2px", marginBottom: "10px",
              }}>
                STEP {step.number}
              </div>

              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text)", marginBottom: "10px", margin: "0 0 10px" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.7", maxWidth: "220px", margin: 0 }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--muted)", marginTop: "56px" }}>
          🔒 You control what gets saved. Delete memories anytime.
        </p>
      </div>
    </section>
  );
}
