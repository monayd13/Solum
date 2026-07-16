import { BriefcaseBusiness, HeartHandshake, HouseWifi } from "lucide-react";

const useCases = [
  { icon: BriefcaseBusiness, title: "Untangling work pressure", description: "Talk through the tradeoffs behind a hard goal without being pushed toward a predetermined answer." },
  { icon: HouseWifi, title: "Breaking up remote-work isolation", description: "Create a consistent, conversational check-in that remembers the context from last time." },
  { icon: HeartHandshake, title: "Making room for a hard day", description: "Say what is on your mind and keep full control over which memories remain afterward." },
];

export function UserStories() {
  return (
    <section className="section-shell" style={{ background: "var(--surface)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p className="eyebrow" style={{ color: "var(--rose)" }}>Built for real moments</p>
          <h2 className="section-title">A thoughtful place to talk.</h2>
          <p className="section-copy">Common ways people can use Solum—without invented testimonials or outcome promises.</p>
        </div>
        <div className="three-column-grid">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return <article className="use-case-card" key={useCase.title}><Icon size={26} /><h3>{useCase.title}</h3><p>{useCase.description}</p></article>;
          })}
        </div>
      </div>
    </section>
  );
}
