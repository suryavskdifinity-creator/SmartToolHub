"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Copy,
  Download,
  Star,
  RotateCcw,
  Info,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { tools, translateLanguages } from "@/lib/tools";
import { AdSense } from "@/components/AdSense";

export function ToolWorkspace({ slug }: { slug: string }) {
  const tool = tools.find((t) => t.slug === slug);

  const [favorite, setFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [extra, setExtra] = useState("");
  const [notice, setNotice] = useState("");
  const [fromLang, setFromLang] = useState("en");
  const [toLang, setToLang] = useState("hi");
  const [translating, setTranslating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [timerSec, setTimerSec] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!tool) return;
    try {
      const fav = JSON.parse(localStorage.getItem("sth-favorites") || "[]");
      setFavorite(fav.includes(slug));
      const recent = JSON.parse(localStorage.getItem("sth-recent") || "[]");
      localStorage.setItem(
        "sth-recent",
        JSON.stringify(
          [slug, ...recent.filter((x: string) => x !== slug)].slice(0, 8)
        )
      );
      if (slug === "notes") {
        setInput(localStorage.getItem("sth-notes") || "");
      }
      if (slug === "todo") {
        setInput(localStorage.getItem("sth-tasks") || "");
      }
    } catch {
      setFavorite(false);
    }
  }, [slug, tool]);

  // Pomodoro timer
  useEffect(() => {
    if (!timerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimerSec((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          if (timerMode === "focus") {
            setTimerMode("break");
            setTimerSec(5 * 60);
            setNotice("Focus session complete! Take a short break.");
          } else {
            setTimerMode("focus");
            setTimerSec(25 * 60);
            setNotice("Break over. Ready for another focus session?");
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerMode]);

  function toggleFav() {
    try {
      const items = JSON.parse(localStorage.getItem("sth-favorites") || "[]");
      const updated = items.includes(slug)
        ? items.filter((x: string) => x !== slug)
        : [...items, slug];
      localStorage.setItem("sth-favorites", JSON.stringify(updated));
      setFavorite(updated.includes(slug));
    } catch {
      setNotice("Could not update favorites.");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setNotice("Could not copy the result.");
    }
  }

  function download() {
    const a = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([output], { type: "text/plain" })
    );
    a.href = url;
    a.download = `${slug}-result.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function translateText() {
    if (!input.trim()) {
      setNotice("Enter text to translate.");
      return;
    }
    setTranslating(true);
    setNotice("");
    setOutput("");
    try {
      const customUrl = process.env.NEXT_PUBLIC_TRANSLATE_URL?.trim();
      let translated = "";

      if (customUrl) {
        // LibreTranslate-compatible endpoint
        const res = await fetch(customUrl.replace(/\/$/, "") + "/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: input,
            source: fromLang,
            target: toLang,
            format: "text",
          }),
        });
        if (!res.ok) throw new Error("Translation service error");
        const data = await res.json();
        translated = data.translatedText || data.translation || "";
      } else {
        // Free MyMemory API (no key required, rate-limited)
        const langpair = `${fromLang}|${toLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          input.slice(0, 500)
        )}&langpair=${encodeURIComponent(langpair)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Translation request failed");
        const data = await res.json();
        if (data.responseStatus !== 200 && data.responseStatus !== "200") {
          throw new Error(
            data.responseDetails || "Translation service unavailable"
          );
        }
        translated =
          data.responseData?.translatedText ||
          "No translation returned. Try shorter text or different languages.";
      }

      setOutput(translated);
      setNotice("Translated with free public API · Results may vary in quality.");
    } catch (e) {
      setOutput("");
      setNotice(
        e instanceof Error
          ? e.message
          : "Translation failed. Try again later or configure NEXT_PUBLIC_TRANSLATE_URL."
      );
    } finally {
      setTranslating(false);
    }
  }

  async function generateQr() {
    if (!input.trim()) {
      setNotice("Enter text or a URL for the QR code.");
      return;
    }
    setNotice("");
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(input, {
        width: 280,
        margin: 2,
        color: { dark: "#1d2340", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
      setOutput(input);
      setNotice("QR code generated.");
    } catch {
      setNotice("Could not generate QR code.");
      setQrDataUrl("");
    }
  }

  function run() {
    setNotice("");
    setQrDataUrl("");

    if (slug === "translator") {
      translateText();
      return;
    }
    if (slug === "qr") {
      generateQr();
      return;
    }
    if (slug === "pomodoro") {
      setOutput(
        `Mode: ${timerMode === "focus" ? "Focus (25 min)" : "Break (5 min)"}\nRemaining: ${Math.floor(timerSec / 60)}:${String(timerSec % 60).padStart(2, "0")}\n\nUse the controls below to start, pause or reset the timer.`
      );
      return;
    }

    try {
      let o = "";
      const n = Number(input);
      const p = Number(extra);

      switch (slug) {
        case "word-counter": {
          const words = input.trim().match(/\S+/g) || [];
          o = `Words: ${words.length}
Characters: ${input.length}
Characters (no spaces): ${input.replace(/\s/g, "").length}
Sentences: ${(input.match(/[.!?]+/g) || []).length}
Paragraphs: ${input.trim() ? input.trim().split(/\n\s*\n/).length : 0}
Reading time: ${Math.max(1, Math.ceil(words.length / 200))} min`;
          break;
        }
        case "case-converter":
          o =
            extra === "upper"
              ? input.toUpperCase()
              : extra === "lower"
              ? input.toLowerCase()
              : extra === "title"
              ? input.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
              : input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
          break;
        case "text-diff":
          o = extra
            ? `Text A: ${input.split(/\s+/).filter(Boolean).length} words
Text B: ${extra.split(/\s+/).filter(Boolean).length} words
${
  input === extra
    ? "Texts are identical."
    : "Texts differ. Review both inputs side by side."
}`
            : "Enter comparison text in the second field.";
          break;
        case "writing-helper":
          o = `CLARITY CHECK
${input
  .replace(/\b(utilize)\b/gi, "use")
  .replace(/\b(in order to)\b/gi, "to")
  .replace(/\b(due to the fact that)\b/gi, "because")}

SUGGESTED STRUCTURE
${
  input.trim()
    ? `1. Lead with your main point.
2. Add the essential context.
3. End with a clear next step.`
    : "Add some text to get started."
}

Note: These are local text suggestions, not AI-generated content.`;
          break;
        case "lorem-ipsum": {
          const count = Math.min(20, Math.max(1, Number(extra) || n || 3));
          o = Array.from(
            { length: count },
            () =>
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante."
          ).join("\n\n");
          break;
        }
        case "word-scrambler":
          o =
            extra === "words"
              ? input.split(/\s+/).reverse().join(" ")
              : input.split("").reverse().join("");
          break;
        case "percentage":
          o = `${p}% of ${n} = ${((n * p) / 100).toFixed(2)}
${n} increased by ${p}% = ${(n * (1 + p / 100)).toFixed(2)}
${n} decreased by ${p}% = ${(n * (1 - p / 100)).toFixed(2)}`;
          break;
        case "gst":
          o = `GST amount: ${((n * p) / 100).toFixed(2)}
Total including GST: ${(n * (1 + p / 100)).toFixed(2)}
Base amount from GST-inclusive price: ${(n / (1 + p / 100)).toFixed(2)}`;
          break;
        case "discount":
          o = `Discount amount: ${((n * p) / 100).toFixed(2)}
Sale price: ${(n * (1 - p / 100)).toFixed(2)}
You save: ${((n * p) / 100).toFixed(2)}`;
          break;
        case "tip": {
          const people = Math.max(1, Number(extra) || 1);
          const tipPct = n || 15;
          const bill = Number(input) || 0;
          const tipAmt = (bill * tipPct) / 100;
          o = `Tip (${tipPct}%): ${tipAmt.toFixed(2)}
Total: ${(bill + tipAmt).toFixed(2)}
Per person (${people}): ${((bill + tipAmt) / people).toFixed(2)}`;
          break;
        }
        case "loan": {
          const months = 12;
          const rate = p / 100 / 12;
          const emi = rate
            ? (n * rate * Math.pow(1 + rate, months)) /
              (Math.pow(1 + rate, months) - 1)
            : n / months;
          o = `Monthly payment: ${emi.toFixed(2)}
Total payment: ${(emi * months).toFixed(2)}
Total interest: ${(emi * months - n).toFixed(2)}
Loan term: ${months} months`;
          break;
        }
        case "bmi": {
          const height = p / 100;
          if (height <= 0 || n <= 0) {
            throw new Error("Enter a valid weight and height.");
          }
          const bmi = n / (height * height);
          o = `BMI: ${bmi.toFixed(1)}
Category: ${
            bmi < 18.5
              ? "Underweight"
              : bmi < 25
              ? "Normal range"
              : bmi < 30
              ? "Overweight"
              : "Obesity range"
          }
This is a general screening estimate, not medical advice.`;
          break;
        }
        case "unit-converter":
          o = `${n} km = ${(n * 1000).toFixed(2)} m
${n} kg = ${(n * 2.20462).toFixed(2)} lb
${n} °C = ${((n * 9) / 5 + 32).toFixed(2)} °F
${n} m = ${(n / 1000).toFixed(4)} km
${n} lb = ${(n / 2.20462).toFixed(2)} kg
${n} °F = ${(((n - 32) * 5) / 9).toFixed(2)} °C`;
          break;
        case "date-difference": {
          const d1 = new Date(input);
          const d2 = new Date(extra);
          if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
            throw new Error("Enter two valid dates.");
          }
          o = `Difference: ${Math.abs(
            Math.round((d2.getTime() - d1.getTime()) / 86400000)
          )} days`;
          break;
        }
        case "age-calculator": {
          const d = new Date(input);
          const now = new Date();
          if (Number.isNaN(d.getTime()) || d > now) {
            throw new Error("Enter a valid date of birth.");
          }
          let years = now.getFullYear() - d.getFullYear();
          if (
            now < new Date(now.getFullYear(), d.getMonth(), d.getDate())
          ) {
            years--;
          }
          o = `Approximate age: ${years} years`;
          break;
        }
        case "json-formatter": {
          const j = JSON.parse(input);
          o =
            extra === "minify"
              ? JSON.stringify(j)
              : JSON.stringify(j, null, 2);
          break;
        }
        case "base64":
          o =
            extra === "decode"
              ? decodeURIComponent(escape(atob(input)))
              : btoa(unescape(encodeURIComponent(input)));
          break;
        case "url-encoder":
          o =
            extra === "decode"
              ? decodeURIComponent(input)
              : encodeURIComponent(input);
          break;
        case "html-encoder":
          o =
            extra === "decode"
              ? input
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&amp;/g, "&")
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")
              : input
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#39;");
          break;
        case "jwt-decoder": {
          const parts = input.split(".");
          if (parts.length < 2) {
            throw new Error("This does not look like a JWT.");
          }
          const decodePart = (part: string) => {
            const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(normalized));
          };
          o = `HEADER
${JSON.stringify(decodePart(parts[0]), null, 2)}

PAYLOAD
${JSON.stringify(decodePart(parts[1]), null, 2)}

Signature is not verified.`;
          break;
        }
        case "uuid":
          o = Array.from(
            { length: Math.min(100, Math.max(1, n || 1)) },
            () => crypto.randomUUID()
          ).join("\n");
          break;
        case "timestamp": {
          const d = input
            ? new Date(input)
            : new Date(Number(n) * 1000);
          if (Number.isNaN(d.getTime())) {
            throw new Error("Enter a valid date or Unix timestamp.");
          }
          o = `Unix seconds: ${Math.floor(d.getTime() / 1000)}
ISO: ${d.toISOString()}
Local: ${d.toLocaleString()}`;
          break;
        }
        case "password": {
          const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-+";
          const len = Math.min(128, Math.max(8, n || 20));
          const randomValues = new Uint32Array(len);
          crypto.getRandomValues(randomValues);
          o = Array.from(
            randomValues,
            (x) => chars[x % chars.length]
          ).join("");
          break;
        }
        case "password-strength": {
          const score = [
            input.length >= 8,
            input.length >= 12,
            /[a-z]/.test(input),
            /[A-Z]/.test(input),
            /[0-9]/.test(input),
            /[^A-Za-z0-9]/.test(input),
          ].filter(Boolean).length;
          o = `Strength estimate: ${
            ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"][
              Math.min(score, 5)
            ]
          } (${score}/6)
${input.length < 12 ? "Try 12+ characters." : "Good length."}
Use a unique password for every account.`;
          break;
        }
        case "hash": {
          setOutput("Generating SHA-256…");
          crypto.subtle
            .digest("SHA-256", new TextEncoder().encode(input))
            .then((buffer) => {
              setOutput(
                Array.from(new Uint8Array(buffer))
                  .map((b) => b.toString(16).padStart(2, "0"))
                  .join("")
              );
            })
            .catch(() => {
              setOutput("");
              setNotice("Could not generate the hash.");
            });
          return;
        }
        case "regex-tester": {
          const match = input.match(/^\/(.*)\/([gimsuy]*)$/);
          const regex = match
            ? new RegExp(match[1], match[2])
            : new RegExp(input);
          o = (extra.match(regex) || []).join("\n") || "No matches";
          break;
        }
        case "markdown":
          o = input;
          break;
        case "color": {
          const hex = input.replace("#", "");
          if (!/^[0-9a-f]{6}$/i.test(hex)) {
            throw new Error("Enter a 6-digit HEX color, e.g. #6658e8");
          }
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          const hsl = (() => {
            const R = r / 255;
            const G = g / 255;
            const B = b / 255;
            const max = Math.max(R, G, B);
            const min = Math.min(R, G, B);
            let h = 0;
            let s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                case R:
                  h = (G - B) / d + (G < B ? 6 : 0);
                  break;
                case G:
                  h = (B - R) / d + 2;
                  break;
                default:
                  h = (R - G) / d + 4;
              }
              h /= 6;
            }
            return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
              l * 100
            )}%`;
          })();
          o = `HEX: #${hex.toUpperCase()}
RGB: rgb(${r}, ${g}, ${b})
HSL: ${hsl}`;
          break;
        }
        case "gradient":
          o = `background: linear-gradient(135deg, ${
            input || "#6658e8"
          }, ${extra || "#27c6a5"});`;
          break;
        case "notes":
          localStorage.setItem("sth-notes", input);
          o = `Note saved in this browser.\n\n${input}`;
          break;
        case "todo":
          localStorage.setItem("sth-tasks", input);
          o = `Checklist text saved in this browser.\n\n${input}`;
          break;
        default:
          o = "This tool is in the starter collection. Add input to get started.";
      }

      setOutput(o);
      if (slug === "json-formatter") {
        setNotice("Valid JSON ✓");
      }
    } catch (e) {
      setOutput("");
      setNotice(
        e instanceof Error ? e.message : "Could not process this input."
      );
    }
  }

  if (!tool) {
    return (
      <div className="not-found">
        <h1>Tool not found</h1>
        <Link href="/">Back to SmartToolHub</Link>
      </div>
    );
  }

  const inputLabel: Record<string, string> = {
    percentage: "Amount",
    gst: "Amount",
    discount: "Original price",
    tip: "Bill amount",
    loan: "Loan principal",
    bmi: "Weight (kg)",
    "unit-converter": "Value",
    "age-calculator": "Date of birth",
    "date-difference": "Start date",
    timestamp: "Date or Unix seconds",
    color: "HEX color",
    gradient: "Start color",
    qr: "Text or URL",
    notes: "Your note",
    todo: "Task or note",
    "regex-tester": "Regular expression",
    "jwt-decoder": "JWT token",
    "text-diff": "First text",
    translator: "Text to translate",
    password: "Length (optional)",
    uuid: "How many UUIDs",
  };

  const secondLabel: Record<string, string> = {
    percentage: "Percentage (%)",
    gst: "GST rate (%)",
    discount: "Discount (%)",
    tip: "Tip % (and people in mode if needed)",
    loan: "Annual interest rate (%)",
    bmi: "Height (cm)",
    "date-difference": "End date",
    "regex-tester": "Text to test",
    gradient: "End color",
    "text-diff": "Second text",
  };

  const isTextTool = [
    "case-converter",
    "writing-helper",
    "word-counter",
    "json-formatter",
    "base64",
    "url-encoder",
    "html-encoder",
    "password-strength",
    "hash",
    "markdown",
    "word-scrambler",
    "text-diff",
    "translator",
  ].includes(slug);

  const mm = String(Math.floor(timerSec / 60)).padStart(2, "0");
  const ss = String(timerSec % 60).padStart(2, "0");

  return (
    <div className="workspace">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Back to all tools
      </Link>

      <div className="workspace-heading">
        <div>
          <div className="section-kicker">{tool.category.toUpperCase()} TOOL</div>
          <h1>{tool.name}</h1>
          <p>{tool.description}</p>
        </div>
        <button
          className={`favorite-large ${favorite ? "is-favorite" : ""}`}
          onClick={toggleFav}
        >
          <Star size={16} fill={favorite ? "currentColor" : "none"} />
          {favorite ? "Saved" : "Add favorite"}
        </button>
      </div>

      <div className="ad-incontent">
        <AdSense format="auto" className="ad-in-tool" />
      </div>

      <div className="workspace-layout">
        <section className="tool-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-step">01</span>
              <b>Enter your content</b>
            </div>
            <button
              className="text-action"
              onClick={() => {
                setInput("");
                setExtra("");
                setOutput("");
                setNotice("");
                setQrDataUrl("");
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          {slug === "translator" && (
            <div className="lang-row">
              <label className="field-label">
                From
                <select
                  value={fromLang}
                  onChange={(e) => setFromLang(e.target.value)}
                >
                  {translateLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="lang-swap"
                onClick={() => {
                  setFromLang(toLang);
                  setToLang(fromLang);
                }}
                title="Swap languages"
              >
                <Languages size={16} />
              </button>
              <label className="field-label">
                To
                <select
                  value={toLang}
                  onChange={(e) => setToLang(e.target.value)}
                >
                  {translateLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {slug === "pomodoro" ? (
            <div className="pomodoro-panel">
              <div className="timer-display">
                <span className="timer-mode">
                  {timerMode === "focus" ? "Focus" : "Break"}
                </span>
                <span className="timer-digits">
                  {mm}:{ss}
                </span>
              </div>
              <div className="timer-controls">
                <button
                  className="primary-btn"
                  onClick={() => setTimerRunning((r) => !r)}
                >
                  {timerRunning ? "Pause" : "Start"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerMode("focus");
                    setTimerSec(25 * 60);
                    setNotice("");
                  }}
                >
                  Reset
                </button>
                <button
                  className="text-action"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerMode("break");
                    setTimerSec(5 * 60);
                  }}
                >
                  Short break
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="field-label">
                {inputLabel[slug] || (isTextTool ? "Your text" : "Input")}
              </label>
              <textarea
                className="tool-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  slug === "json-formatter"
                    ? '{"hello":"world"}'
                    : slug === "jwt-decoder"
                    ? "Paste a JWT token…"
                    : slug === "translator"
                    ? "Type or paste text to translate…"
                    : slug === "qr"
                    ? "https://example.com or any text"
                    : "Type or paste here…"
                }
                rows={
                  slug === "word-counter" ||
                  slug === "json-formatter" ||
                  slug === "markdown" ||
                  slug === "text-diff" ||
                  slug === "translator"
                    ? 8
                    : 4
                }
              />
            </>
          )}

          {[
            "case-converter",
            "word-scrambler",
            "base64",
            "url-encoder",
            "html-encoder",
            "json-formatter",
            "writing-helper",
            "lorem-ipsum",
            "regex-tester",
            "gradient",
          ].includes(slug) && (
            <div className="option-row">
              <label className="field-label">
                {slug === "case-converter"
                  ? "Convert to"
                  : slug === "json-formatter"
                  ? "Output format"
                  : "Mode"}
              </label>
              <select
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
              >
                <option value="">
                  {slug === "case-converter" ? "Sentence case" : "Default"}
                </option>
                {(
                  slug === "case-converter"
                    ? ["upper", "lower", "title", "sentence"]
                    : slug === "json-formatter"
                    ? ["minify", "pretty"]
                    : ["base64", "url-encoder", "html-encoder"].includes(slug)
                    ? ["encode", "decode"]
                    : slug === "word-scrambler"
                    ? ["chars", "words"]
                    : slug === "lorem-ipsum"
                    ? ["3", "5", "10"]
                    : slug === "gradient"
                    ? ["#27c6a5"]
                    : slug === "regex-tester"
                    ? ["g", "i", "gi"]
                    : ["clarity"]
                ).map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          )}

          {secondLabel[slug] && slug !== "pomodoro" && (
            <>
              <label className="field-label second-field">
                {secondLabel[slug]}
              </label>
              <input
                className="tool-input"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Enter value"
                type={slug.includes("date") ? "date" : "text"}
              />
            </>
          )}

          {["percentage", "gst", "discount", "tip", "loan", "bmi"].includes(
            slug
          ) && (
            <div className="field-hint">
              {slug === "loan"
                ? "This estimate uses a 12-month loan term."
                : "Use numbers only for accurate results."}
            </div>
          )}

          {slug !== "pomodoro" && (
            <button
              className="primary-btn run-btn"
              onClick={run}
              disabled={translating}
            >
              {translating
                ? "Translating…"
                : slug === "translator"
                ? "Translate"
                : slug === "qr"
                ? "Generate QR"
                : "Run tool"}
              <ArrowUpRight size={16} />
            </button>
          )}

          {notice && (
            <div
              className={`notice ${
                notice.includes("✓") || notice.includes("generated") || notice.includes("complete")
                  ? "success"
                  : "error"
              }`}
            >
              {notice}
            </div>
          )}
        </section>

        <section className="tool-panel output-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-step">02</span>
              <b>Your result</b>
            </div>
            <div className="output-actions">
              <button
                className="text-action"
                onClick={copy}
                disabled={!output}
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                className="text-action"
                onClick={download}
                disabled={!output}
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {qrDataUrl ? (
            <div className="qr-result">
              <img src={qrDataUrl} alt="Generated QR code" width={280} height={280} />
              <a
                href={qrDataUrl}
                download="qrcode.png"
                className="secondary-btn"
              >
                Download PNG
              </a>
            </div>
          ) : output ? (
            <pre className="output-content">{output}</pre>
          ) : (
            <div className="output-empty">
              <div className="output-empty-icon">✧</div>
              <b>Nothing here yet</b>
              <span>
                Your result will appear here after you run the tool.
              </span>
            </div>
          )}

          <div className="privacy-note">
            <Info size={14} />
            {slug === "translator"
              ? "Translation uses a free public API. Do not submit confidential text."
              : "Your input is processed in this browser unless an optional external service is enabled."}
          </div>
        </section>
      </div>

      <div className="workspace-footnote">
        <ShieldCheck size={16} />
        <span>
          <b>Built with privacy in mind.</b> Avoid entering passwords,
          confidential business data or sensitive personal information into
          third-party services.
        </span>
      </div>
    </div>
  );
}
