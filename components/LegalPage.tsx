import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <main className="legal-shell">
      <div className="legal-page">
        <Link href="/" className="legal-back"><ArrowLeft size={14} /> Back to Solum</Link>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-updated">Effective July 10, 2026</p>
        <div className="legal-content">{children}</div>
      </div>
    </main>
  );
}
