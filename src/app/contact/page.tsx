"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, MapPin, Clock } from "lucide-react";

const CONTACT_EMAIL = "surajsoftware01@gmail.com";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      return;
    }
    setStatus("sending");

    try {
      // FormSubmit.co — free form → email service (no API key required)
      const res = await fetch(
        `https://formsubmit.co/ajax/${CONTACT_EMAIL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            subject: form.subject || "SmartToolHub contact",
            message: form.message,
            _captcha: false,
            _template: "table",
          }),
        }
      );

      if (!res.ok) throw new Error("Submit failed");
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      // Fallback: open native mailto so the message still reaches you
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
      );
      const subject = encodeURIComponent(
        form.subject || "SmartToolHub contact"
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setStatus("sent");
    }
  }

  return (
    <div className="page-content contact-page">
      <section className="page-hero">
        <div className="eyebrow">
          <span className="pulse" /> GET IN TOUCH
        </div>
        <h1>
          We would love to
          <br />
          <span>hear from you.</span>
        </h1>
        <p className="lead">
          Questions, feedback, partnership ideas or tool requests — send a
          message and it will be delivered directly to{" "}
          <strong>{CONTACT_EMAIL}</strong>.
        </p>
      </section>

      <div className="contact-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Your name
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Jane Doe"
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label>
            Subject
            <input
              type="text"
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              placeholder="Feature idea, bug report, partnership…"
            />
          </label>

          <label>
            Message
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              placeholder="Tell us how we can help…"
            />
          </label>

          {status === "sent" && (
            <div className="form-success">
              <CheckCircle2 size={18} />
              Message sent. We will reply to your email as soon as possible.
            </div>
          )}
          {status === "error" && (
            <div className="form-error">
              Please fill in name, email and message.
            </div>
          )}

          <button
            type="submit"
            className="primary-btn run-btn"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Send message"}
            <Send size={16} />
          </button>

          <p className="form-privacy">
            Your message is sent to {CONTACT_EMAIL}. We do not share your
            contact details with third parties.
          </p>
        </form>

        <aside className="contact-info">
          <div className="info-card">
            <Mail size={20} />
            <div>
              <b>Email</b>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </div>
          </div>
          <div className="info-card">
            <Clock size={20} />
            <div>
              <b>Response time</b>
              <span>Usually within 1–2 business days</span>
            </div>
          </div>
          <div className="info-card">
            <MapPin size={20} />
            <div>
              <b>Support</b>
              <span>Available worldwide · English & Hindi welcome</span>
            </div>
          </div>

          <div className="info-note">
            Prefer email directly? Write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we
            will respond from the same address.
          </div>
        </aside>
      </div>
    </div>
  );
}
