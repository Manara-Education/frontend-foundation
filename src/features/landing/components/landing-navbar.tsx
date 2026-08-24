import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Menu, X } from "lucide-react";
import { LandingWordmark } from "./landing-primitives";
import { PRIMARY, FONT, TEXT, TEXT_MUTED, BORDER } from "./theme";

const NAV_LINKS = [
  { label: "الرئيسية",  href: "#hero" },
  { label: "المميزات",  href: "#features" },
  { label: "كيف يعمل", href: "#how-it-works" },
  { label: "الدورات",   href: "#courses" },
  { label: "للمدرسين",  href: "#instructors" },
  { label: "عن منارة",  href: "#vision" },
];

export function LandingNavbar({ onSignIn }: { onSignIn: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav dir="rtl" style={{ position: "fixed", top: 0, right: 0, left: 0, zIndex: 1000, background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${scrolled ? BORDER : "transparent"}`, transition: "all 0.25s", boxShadow: scrolled ? "0 2px 20px rgba(78,91,146,0.08)" : "none" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <LandingWordmark size={32} />
        <div className="hidden lg:flex" style={{ alignItems: "center", gap: 4 }}>
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={() => scrollTo(l.href)} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: TEXT_MUTED, background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 8, transition: "color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = PRIMARY; }} onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_MUTED; }}>
              {l.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onSignIn} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT_MUTED, background: "none", border: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 8, transition: "color 0.15s", whiteSpace: "nowrap" }} onMouseEnter={(e) => { e.currentTarget.style.color = PRIMARY; }} onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_MUTED; }}>
            تسجيل الدخول
          </button>
          <a href="#hero-cta" onClick={(e) => { e.preventDefault(); scrollTo("#hero-cta"); }} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 40, paddingLeft: 20, paddingRight: 20, borderRadius: 11, background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, textDecoration: "none", whiteSpace: "nowrap" }}>
            ابدأ الآن <ArrowLeft size={13} />
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex lg:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: TEXT, padding: 6 }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} style={{ borderTop: `1px solid ${BORDER}`, background: "#fff", padding: "16px 28px 24px" }}>
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={() => scrollTo(l.href)} style={{ display: "block", width: "100%", textAlign: "right", fontFamily: FONT, fontSize: 15, fontWeight: 500, color: TEXT, background: "none", border: "none", cursor: "pointer", padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
              {l.label}
            </button>
          ))}
        </motion.div>
      )}
    </nav>
  );
}
