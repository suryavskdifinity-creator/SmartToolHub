import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Zap, Globe2, Heart, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about SmartToolHub — a free, privacy-first collection of online tools for writing, development, calculations and productivity.",
};

export default function AboutPage() {
  return (
    <div className="page-content about-page">
      <section className="page-hero">
        <div className="eyebrow">
          <span className="pulse" /> ABOUT SMARTTOOLHUB
        </div>
        <h1>
          Tools that respect your time
          <br />
          <span>and your privacy.</span>
        </h1>
        <p className="lead">
          SmartToolHub is a carefully curated collection of free online
          utilities designed for everyday work. No accounts, no tracking
          walls, and most tools run entirely in your browser.
        </p>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <div className="about-icon purple">
            <Zap size={22} />
          </div>
          <h3>Fast & focused</h3>
          <p>
            Every tool is built to solve one job well. Open it, get the
            result, and move on — without clutter or forced sign-ups.
          </p>
        </article>
        <article className="about-card">
          <div className="about-icon green">
            <ShieldCheck size={22} />
          </div>
          <h3>Privacy by default</h3>
          <p>
            Word counts, passwords, JSON, hashes and most calculators never
            leave your device. When an optional external service is used
            (e.g. translation), we tell you clearly.
          </p>
        </article>
        <article className="about-card">
          <div className="about-icon orange">
            <Globe2 size={22} />
          </div>
          <h3>Free for everyone</h3>
          <p>
            Core tools stay free. We keep the product sustainable with
            carefully placed advertising and optional future premium features
            that never block essential utilities.
          </p>
        </article>
        <article className="about-card">
          <div className="about-icon blue">
            <Heart size={22} />
          </div>
          <h3>Built for real work</h3>
          <p>
            From writers and students to developers and freelancers —
            SmartToolHub aims to remove friction from the small tasks that
            fill a day.
          </p>
        </article>
      </section>

      <section className="about-mission content-section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">OUR MISSION</div>
            <h2>Make useful tools accessible</h2>
          </div>
        </div>
        <div className="mission-body">
          <p>
            The internet is full of single-purpose sites that bury simple
            utilities behind pop-ups, accounts and aggressive tracking.
            SmartToolHub brings dozens of practical tools into one calm,
            professional workspace with a consistent design and a strong
            privacy stance.
          </p>
          <p>
            We continuously improve the catalogue — adding language support,
            better calculators, developer helpers and productivity features —
            while keeping the experience fast and respectful of your data.
          </p>
          <ul className="mission-list">
            <li>40+ tools across writing, language, calculators, developer, security, productivity, design, images and PDF</li>
            <li>Dark & light themes with preference saved locally</li>
            <li>Command search (⌘K) and category filters</li>
            <li>Favorites and recent history stored only on your device</li>
            <li>Free multi-language translator with clear source/target selection</li>
          </ul>
        </div>
      </section>

      <section className="about-cta content-section">
        <div className="cta-box">
          <Sparkles size={28} />
          <div>
            <h3>Ready to get started?</h3>
            <p>Browse the full toolkit or reach out if you have feedback or a tool idea.</p>
          </div>
          <div className="cta-actions">
            <Link href="/#tools" className="primary-btn">
              Explore tools <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="secondary-btn">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
