import { Brain, MessagesSquare, UserRoundSearch } from "lucide-react";

const steps = [
  { icon: UserRoundSearch, title: "Choose a companion", description: "Pick a live companion whose personality and language fit the conversation you want." },
  { icon: MessagesSquare, title: "Talk naturally", description: "Allow microphone access and have a low-latency voice conversation—no scripts or typing." },
  { icon: Brain, title: "Stay in control", description: "Useful details can carry forward, and every saved memory can be reviewed or deleted." },
];

export function HowItWorks() {
  return (
    <section className="section-shell" style={{ background: "var(--surface)" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p className="eyebrow">Simple by design</p>
          <h2 className="section-title">How Solum works</h2>
        </div>
        <div className="three-column-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="process-card">
                <div className="process-icon"><Icon size={24} /></div>
                <span className="process-step">Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
