"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Languages, UserRound } from "lucide-react";

interface PublicCompanion {
  id: string;
  name: string;
  tagline: string | null;
  backstory: string;
  languages: string[] | null;
  accent_color: string | null;
}

export function CompanionShowcase() {
  const [companions, setCompanions] = useState<PublicCompanion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/companions", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("request failed");
        const payload = await response.json();
        setCompanions(payload.companions ?? []);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <section id="companions" className="section-shell" style={{ background: "var(--bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          <p className="eyebrow">Meet the companions</p>
          <h2 className="section-title">
            Distinct voices. <em>Built to remember.</em>
          </h2>
          <p className="section-copy">The live companion catalog comes directly from Solum&apos;s database, including every configured language and personality.</p>
        </div>

        {loading && <div className="companion-skeleton" aria-label="Loading companions" />}
        {error && (
          <div className="inline-state" role="status">
            The companion catalog is temporarily unavailable. Please try again shortly.
          </div>
        )}
        {!loading && !error && companions.length === 0 && (
          <div className="inline-state">New companions are being prepared. Check back soon.</div>
        )}

        <div className="companion-grid">
          {companions.map((companion) => {
            const color = companion.accent_color || "var(--amber)";
            const initials = companion.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
            return (
              <article key={companion.id} className="companion-card reveal" style={{ borderTopColor: color }}>
                <div className="companion-avatar" style={{ color, borderColor: `${color}55`, background: `${color}16` }} aria-hidden="true">
                  <UserRound size={22} />
                  <span>{initials}</span>
                </div>
                <h3 style={{ color }}>{companion.name}</h3>
                <p className="companion-tagline">{companion.tagline}</p>
                <p className="companion-bio">{companion.backstory.split("\n")[0]}</p>
                {Boolean(companion.languages?.length) && (
                  <div className="language-row"><Languages size={14} /> {companion.languages?.join(" · ")}</div>
                )}
                <Link href={`/signup?companion=${encodeURIComponent(companion.id)}`} className="companion-cta" style={{ color, borderColor: `${color}55`, background: `${color}12` }}>
                  Choose {companion.name.split(" ")[0]} <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
