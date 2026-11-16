"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("University Data / Cutoff Correction");
  const [message, setMessage] = useState("");

  // Submission & interactive UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("debojyoti.roy062007@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText("+91 8013600616");
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitError(null);
    setIsSuccess(false);

    if (!name.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!message.trim()) {
      setFormError("Please write a message before sending.");
      return;
    }

    setIsSubmitting(true);

    try {
      const accessKey =
        process.env.NEXT_PUBLIC_WEB3FORMS_KEY ||
        "904bbffc-4980-4e7b-8769-b9d710e1245c";

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `[FindMyCampus Contact] ${topic} — from ${name.trim()}`,
          from_name: "FindMyCampus Admissions Engine",
          name: name.trim(),
          email: email.trim(),
          topic,
          message: message.trim(),
          replyto: email.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
        setTopic("University Data / Cutoff Correction");
      } else {
        setSubmitError(
          result.message ||
            "Failed to deliver message via Web3Forms. Please try again or copy the email directly."
        );
      }
    } catch (err: unknown) {
      console.error("Web3Forms dispatch error:", err);
      setSubmitError(
        "Network connection error. You can copy the email directly to reach Debojyoti."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#0d0e12]/90 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-8">
        {/* Left Column — Creator Channels */}
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-[11px] font-mono tracking-wider font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>DIRECT ARCHITECT &amp; ADMISSIONS ENGINE SUPPORT</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Get in Touch with the Creator
            </h2>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Have questions about institutional cutoffs, sovereign vault encryption, or custom university additions? Reach out directly.
            </p>
          </div>

          {/* Profile Card & Communication Channels */}
          <div className="rounded-xl p-5 sm:p-6 bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 flex-1 flex flex-col justify-between mt-6">
            <div className="space-y-3.5">
              {/* Identity & Status */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-md shrink-0 tracking-wider">
                  DR
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                      Debojyoti Roy
                    </h3>
                    <span
                      className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-[0_0_8px_#10b981]"
                      title="Active Node Maintainer"
                    />
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                    Lead Architect &amp; Developer, FindMyCampus
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <span>Chennai, Tamil Nadu, India</span>
              </div>

              <div className="h-px bg-slate-200 dark:bg-zinc-800" />

              {/* Email with Gmail Web Compose link and one-click copy */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <a
                    href="https://mail.google.com/mail/?view=cm&to=debojyoti.roy062007@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors"
                    title="Compose in Gmail Web (avoids desktop Outlook)"
                  >
                    debojyoti.roy062007@gmail.com
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Phone with tel and one-click copy */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <a
                    href="tel:+918013600616"
                    className="font-mono text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 truncate transition-colors"
                  >
                    +91 8013600616
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  title="Copy phone number"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* LinkedIn Connection - anchored at bottom */}
            <div className="mt-auto pt-4">
              <a
                href="https://www.linkedin.com/in/debojyoti-roy-380010357"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer group"
              >
                <LinkedInIcon className="w-4 h-4 text-white shrink-0" />
                <span>Connect on LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column — Quick Direct Message Form */}
        <div className="rounded-xl p-5 sm:p-6 bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono mb-1">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Quick Direct Message</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Send an inquiry, institutional data correction, or feature suggestion directly to the lead architect.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm">
                <div className="flex items-start gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="leading-snug">{submitError}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-semibold text-[11px] flex items-center gap-1 shrink-0 transition-colors hover:bg-rose-50 dark:hover:bg-zinc-700 cursor-pointer self-end sm:self-auto"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-rose-400" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {isSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-start gap-2.5 shadow-sm">
                <Check className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">Message Delivered!</p>
                  <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                    Message delivered directly to debojyoti.roy062007@gmail.com! I&apos;ll get back to you soon.
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-3.5 mt-2">
            <div className="space-y-3.5 flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-sm text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-1">
                    Your Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-sm text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-1">
                  Topic
                </label>
                <select
                  disabled={isSubmitting}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <option value="University Data / Cutoff Correction">
                    University Data / Cutoff Correction
                  </option>
                  <option value="Document Vault / Auto-Pilot Support">
                    Document Vault / Auto-Pilot Support
                  </option>
                  <option value="Collaboration / Internship Inquiry">
                    Collaboration / Internship Inquiry
                  </option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block mb-1">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  disabled={isSubmitting}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message, inquiry, or correction here..."
                  className="w-full flex-1 min-h-[110px] resize-none px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-sm text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-60"
                />
              </div>
            </div>

            <div className="pt-4 mt-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group ${
                  isSubmitting
                    ? "bg-indigo-400 dark:bg-indigo-700 cursor-not-allowed opacity-80"
                    : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-[0.99]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending to Debojyoti...</span>
                  </>
                ) : (
                  <>
                    <span>Send Direct Message</span>
                    <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
