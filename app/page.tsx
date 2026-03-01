"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { CompanionShowcase } from "@/components/landing/CompanionShowcase";
import { TrustSection } from "@/components/landing/TrustSection";
import { UserStories } from "@/components/landing/UserStories";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";


export default function LandingPage() {
  const [showFAQ, setShowFAQ] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "rgba(13,11,8,0.88)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "28px", fontWeight: 600, color: "var(--amber)", letterSpacing: "1px" }}>
          Solum
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            style={{ 
              color: "var(--muted)", fontSize: "14px", letterSpacing: "1px", 
              textTransform: "uppercase", textDecoration: "none", fontWeight: 500, 
              position: "relative", transition: "color 0.2s ease",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit",
            }}
            className="nav-faq-link"
          >
            FAQ
            <span style={{
              position: "absolute", bottom: "-2px", left: 0, right: 0,
              height: "1px", background: "var(--amber)",
              transform: "scaleX(0)", transition: "transform 0.2s ease",
            }} />
          </button>
          <Link href="/login" style={{ color: "var(--muted)", fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", fontWeight: 500 }}>
            Sign In
          </Link>
          <Link href="/signup" style={{ padding: "10px 24px", background: "var(--amber)", color: "var(--bg)", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            Get Started
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* ── FAQ BAR ── */}
      <section id="faq" style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "16px 40px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", letterSpacing: "1px" }}>
              Quick Answers:
            </span>
            <div style={{ display: "flex", gap: "20px" }}>
              <button 
                onClick={() => setShowFAQ(true)}
                style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none", transition: "color 0.2s", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                className="faq-link"
              >
                How do voice calls work?
              </button>
              <button 
                onClick={() => setShowFAQ(true)}
                style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none", transition: "color 0.2s", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                className="faq-link"
              >
                Is my data private?
              </button>
              <button 
                onClick={() => setShowFAQ(true)}
                style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none", transition: "color 0.2s", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                className="faq-link"
              >
                What's the cost?
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowFAQ(true)}
            style={{ 
              fontSize: "12px", color: "var(--amber)", textDecoration: "none", 
              fontWeight: 500, display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            View All FAQs
            <span style={{ fontSize: "10px" }}>↓</span>
          </button>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      {showFAQ && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            background: "var(--bg)", borderRadius: "20px",
            maxWidth: "800px", width: "100%", maxHeight: "80vh",
            overflow: "auto", position: "relative",
          }}>
            <button
              onClick={() => setShowFAQ(false)}
              style={{
                position: "absolute", top: "20px", right: "20px",
                background: "var(--surface)", border: "1px solid var(--border2)",
                borderRadius: "50%", width: "40px", height: "40px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: "20px", color: "var(--muted)",
                zIndex: 1001,
              }}
            >
              ×
            </button>
            <FAQ />
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 40px 80px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "500px", pointerEvents: "none",
          background: "radial-gradient(ellipse, rgba(212,136,10,0.09) 0%, transparent 70%)",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 16px", borderRadius: "100px",
          border: "1px solid var(--amber-m)", background: "var(--amber-l)",
          fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: "var(--amber)", marginBottom: "32px",
          animation: "fadeUp 0.8s ease both",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--amber)", animation: "pulse 2s infinite" }} />
          AI Companion Platform · 2026
        </div>

        <h1 style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(48px, 7vw, 84px)",
          fontWeight: 300, lineHeight: 1.1, letterSpacing: "-2px",
          marginBottom: "32px", animation: "fadeUp 0.8s 0.1s ease both", maxWidth: "900px",
        }}>
          Someone who calls.<br />
          <em style={{ fontStyle: "italic", color: "var(--amber)" }}>And actually remembers.</em>
        </h1>

        <p style={{
          color: "var(--muted)", fontSize: "18px", maxWidth: "560px",
          margin: "0 auto 40px", lineHeight: "1.7",
          animation: "fadeUp 0.8s 0.2s ease both",
        }}>
          Solum connects you with AI companions who have deep personalities, real voices,
          and genuine memory. Every conversation picks up where the last one left off.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.8s 0.3s ease both" }}>
          <Link href="/signup" style={{
            padding: "16px 36px", borderRadius: "12px", background: "var(--amber)",
            color: "var(--bg)", fontWeight: 600, fontSize: "16px", textDecoration: "none",
            boxShadow: "0 8px 30px rgba(212,136,10,0.3)",
          }}>
            Start for free
          </Link>
          <Link href="/login" style={{
            padding: "16px 32px", borderRadius: "12px",
            background: "var(--surface2)", border: "1px solid var(--border2)",
            color: "var(--text)", fontWeight: 600, fontSize: "16px", textDecoration: "none",
          }}>
            Sign in
          </Link>
        </div>

        {/* Trust microcopy */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px", marginTop: "24px",
          fontSize: "13px", color: "var(--muted)", flexWrap: "wrap", justifyContent: "center",
          animation: "fadeUp 0.8s 0.35s ease both",
        }}>
          <span>🔒 Private by default</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>🗑️ Delete memories anytime</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>💚 No judgment</span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "48px", marginTop: "56px", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s 0.4s ease both" }}>
          {[
            { val: "4",    label: "Companions" },
            { val: "2.4s", label: "Response Time" },
            { val: "∞",    label: "Memory" },
            { val: "0",    label: "Apps to Install" },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 300, color: "var(--amber)", lineHeight: 1, marginBottom: "6px" }}>{val}</div>
              <div style={{ fontSize: "12px", color: "var(--muted)", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        <a href="#companions" style={{
          position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)",
          color: "var(--muted)", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase",
          textDecoration: "none", animation: "bounce 2s infinite",
        }}>
          Scroll ↓
        </a>
      </section>

      {/* ── COMPANION SHOWCASE ── */}
      <CompanionShowcase />

      {/* ── TRUST & PRIVACY ── */}
      <TrustSection />

      {/* ── USER STORIES ── */}
      <UserStories />

      {/* ── FINAL CTA ── */}
      <FinalCTA />

      {/* ── FOOTER ── */}
      <Footer />

    </div>
  );
}
