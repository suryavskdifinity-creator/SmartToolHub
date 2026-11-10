"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  Info,
  Mail,
  Home,
  Wrench,
  Heart,
} from "lucide-react";
import { tools } from "@/lib/tools";
import { AdSense } from "@/components/AdSense";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [theme, setTheme] = useState("dark");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sth-theme") || "dark";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    setMobile(false);
  }, [path]);

  const results = useMemo(
    () =>
      tools
        .filter((t) =>
          (t.name + " " + t.description + " " + t.category)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .slice(0, 8),
    [query]
  );

  function toggleTheme() {
    const n = theme === "dark" ? "light" : "dark";
    setTheme(n);
    document.documentElement.dataset.theme = n;
    localStorage.setItem("sth-theme", n);
  }

  const year = new Date().getFullYear();

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>
            SmartTool<span className="brand-accent">Hub</span>
          </span>
        </Link>

        <nav className="header-nav">
          <Link href="/" className={`header-link ${path === "/" ? "active" : ""}`}>
            <Home size={15} /> Home
          </Link>
          <Link href="/#tools" className="header-link">
            <Wrench size={15} /> Tools
          </Link>
          <Link
            href="/about"
            className={`header-link ${path === "/about" ? "active" : ""}`}
          >
            <Info size={15} /> About
          </Link>
          <Link
            href="/contact"
            className={`header-link ${path === "/contact" ? "active" : ""}`}
          >
            <Mail size={15} /> Contact
          </Link>
        </nav>

        <button className="search-trigger" onClick={() => setOpen(true)}>
          <Search size={16} />
          <span>Search tools...</span>
          <kbd>⌘ K</kbd>
        </button>

        <div className="top-actions">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobile(!mobile)}
            aria-label="Menu"
          >
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link className="top-cta" href="/#tools">
            Explore tools <span>↗</span>
          </Link>
        </div>
      </header>

      {/* Mobile menu drawer (replaces sidebar) */}
      <div className={`mobile-drawer ${mobile ? "open" : ""}`}>
        <div className="side-label">NAVIGATION</div>
        <Link href="/" className={`nav-link ${path === "/" ? "active" : ""}`}>
          <Home size={17} /> Home
        </Link>
        <Link href="/#tools" className="nav-link">
          <Wrench size={17} /> All tools
        </Link>
        <Link href="/#favorites" className="nav-link">
          <Heart size={17} /> Favorites
        </Link>
        <Link
          href="/about"
          className={`nav-link ${path === "/about" ? "active" : ""}`}
        >
          <Info size={17} /> About
        </Link>
        <Link
          href="/contact"
          className={`nav-link ${path === "/contact" ? "active" : ""}`}
        >
          <Mail size={17} /> Contact
        </Link>
        <div className="side-label">CATEGORIES</div>
        {[
          "Writing",
          "Language",
          "Calculators",
          "Developer",
          "Security",
          "Productivity",
          "Design",
          "Images",
          "PDF",
        ].map((c) => (
          <Link
            key={c}
            href={`/?category=${encodeURIComponent(c)}#tools`}
            className="nav-link"
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="page-wrap">
        <div className="ad-strip">
          <AdSense format="auto" className="ad-top" />
        </div>

        <main className="main-content">{children}</main>

        <div className="ad-strip">
          <AdSense format="auto" className="ad-footer" />
        </div>

        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-grid">
              <div className="footer-brand">
                <Link href="/" className="brand">
                  <span className="brand-mark">
                    <Sparkles size={16} />
                  </span>
                  <span>
                    SmartTool<span className="brand-accent">Hub</span>
                  </span>
                </Link>
                <p>
                  Free, privacy-focused online tools for writing, development,
                  calculations and everyday productivity. No account required.
                </p>
              </div>
              <div className="footer-col">
                <h4>Product</h4>
                <Link href="/#tools">All tools</Link>
                <Link href="/#favorites">Favorites</Link>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
              </div>
              <div className="footer-col">
                <h4>Categories</h4>
                <Link href="/?category=Writing#tools">Writing</Link>
                <Link href="/?category=Developer#tools">Developer</Link>
                <Link href="/?category=Calculators#tools">Calculators</Link>
                <Link href="/?category=Images#tools">Images</Link>
              </div>
              <div className="footer-col">
                <h4>Contact</h4>
                <a href="mailto:surajsoftware01@gmail.com">
                  surajsoftware01@gmail.com
                </a>
                <Link href="/contact">Send a message</Link>
                <p className="footer-note">
                  We read every message. Typical reply within 1–2 business days.
                </p>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {year} SmartToolHub. All rights reserved.</span>
              <span>Useful tools. Less friction. Privacy first.</span>
            </div>
          </div>
        </footer>
      </div>

      {open && (
        <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
          <div
            className="command-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="command-input">
              <Search size={19} />
              <input
                autoFocus
                placeholder="Search for a tool..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd>ESC</kbd>
            </div>
            <div className="command-results">
              {results.map((t) => (
                <Link
                  href={`/tools/${t.slug}`}
                  key={t.slug}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="result-icon">✦</span>
                  <span>
                    <b>{t.name}</b>
                    <small>
                      {t.category} · {t.description}
                    </small>
                  </span>
                  <span className="result-arrow">↗</span>
                </Link>
              ))}
              {!results.length && (
                <p className="empty-state">No tools found. Try another search.</p>
              )}
            </div>
            <div className="command-hint">
              <span>
                <kbd>↵</kbd> Open
              </span>
              <span>
                <kbd>ESC</kbd> Close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
