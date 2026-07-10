import Link from "next/link";
import { Brain, KeyRound, LockKeyhole, ShieldCheck, Trash2, UserCheck } from "lucide-react";

const controls = [
  { icon: Brain, title: "Review memories", description: "See the details each companion has saved from your conversations." },
  { icon: Trash2, title: "Delete permanently", description: "Remove one memory, one companion's memories, or your complete memory history." },
  { icon: UserCheck, title: "Account isolation", description: "Database policies restrict profiles, calls, and memories to their owner." },
  { icon: KeyRound, title: "Protected integrations", description: "Twilio and ElevenLabs requests are verified before private data is accessed." },
  { icon: ShieldCheck, title: "No browser storage", description: "Sensitive product data is persisted in Supabase—not localStorage or sessionStorage." },
  { icon: LockKeyhole, title: "Private service keys", description: "Provider credentials stay on the server and never ship to the browser." },
];

export function TrustSection() {
  return (
    <section className="section-shell" style={{ background: "var(--bg)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p className="eyebrow" style={{ color: "var(--teal)" }}>Privacy & control</p>
          <h2 className="section-title">You&apos;re in control. <em>Always.</em></h2>
          <p className="section-copy">Solum is built around authenticated access, explicit controls, and verifiable provider requests.</p>
        </div>
        <div className="three-column-grid">
          {controls.map((control) => {
            const Icon = control.icon;
            return (
              <article key={control.title} className="trust-card">
                <Icon size={22} color="var(--teal)" />
                <h3>{control.title}</h3>
                <p>{control.description}</p>
              </article>
            );
          })}
        </div>
        <div className="safety-note">
          <ShieldCheck size={18} />
          <p>Solum is an AI companion, not a human, crisis service, or substitute for professional care. If you may be in immediate danger, contact local emergency services. In the U.S., call or text 988. <Link href="/safety">Read the safety guide.</Link></p>
        </div>
      </div>
    </section>
  );
}
