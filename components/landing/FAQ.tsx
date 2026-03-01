"use client";

import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is this a real person?",
      answer: "No — each companion is an AI with a carefully designed personality and backstory. They feel real because they remember you and respond naturally, but they're not human.",
    },
    {
      question: "How does memory work?",
      answer: "After each call, Solum extracts key details you shared — names, events, feelings — and saves them. Next time you call, your companion references these naturally. You can view, edit, or delete any memory anytime.",
    },
    {
      question: "Can I delete what it remembers?",
      answer: "Absolutely. You have full control. Delete individual memories, clear entire conversations, or wipe everything. We also offer a \"memory off\" mode for calls you don't want remembered.",
    },
    {
      question: "What if I don't want to share personal info?",
      answer: "That's completely fine. You can talk about anything — or nothing in particular. Your companions are happy to just chat, tell stories, or listen without you sharing details.",
    },
    {
      question: "Is this therapy?",
      answer: "No. Solum is a companion service, not a mental health treatment. Our companions are great for everyday conversation and feeling less alone, but they're not trained therapists. If you're struggling, please reach out to a professional.",
    },
    {
      question: "How much does it cost?",
      answer: "Solum offers a free tier with limited minutes. Upgrade to Pro for unlimited calls with all companions.",
    },
    {
      question: "Can I talk about anything?",
      answer: "Yes — life, work, relationships, random ideas, books, memories, fears, dreams. There's no wrong topic. Your companion will follow wherever you want to go.",
    },
  ];

  return (
    <section id="faq" style={{ padding: "80px 40px", background: "var(--bg)" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "3px", color: "var(--amber)", marginBottom: "12px" }}>
            Got questions?
          </p>
          <h2 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 300, margin: 0, color: "var(--text)",
          }}>
            Frequently Asked
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: `1px solid ${openIndex === i ? "var(--amber)" : "var(--border2)"}`,
                borderRadius: "14px", overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: "100%", padding: "18px 24px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "transparent", border: "none", cursor: "pointer",
                  textAlign: "left", fontFamily: "var(--font-dm-sans)",
                }}
              >
                <span style={{ fontSize: "15px", fontWeight: 500, color: "var(--text)" }}>
                  {faq.question}
                </span>
                <span style={{
                  fontSize: "20px", color: "var(--amber)",
                  transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.2s", flexShrink: 0, marginLeft: "12px",
                }}>
                  +
                </span>
              </button>
              {openIndex === i && (
                <div style={{
                  padding: "0 24px 20px",
                  fontSize: "14px", color: "var(--muted)", lineHeight: "1.8",
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
