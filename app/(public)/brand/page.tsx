import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Brand Guidelines",
  description: "GlobalGiving brand identity system — colors, typography, logos, and usage guidelines.",
};

const colors = [
  { name: "Primary Orange", hex: "#F08B1D", var: "--gg-primary", usage: "CTAs, highlights, primary actions", textClass: "text-white" },
  { name: "Primary Dark", hex: "#D97A16", var: "--gg-primary-hover", usage: "Hover states, active primary", textClass: "text-white" },
  { name: "Secondary Blue-Grey", hex: "#3E4B59", var: "--gg-secondary", usage: "Headings, nav, footers", textClass: "text-white" },
  { name: "Secondary Dark", hex: "#35404d", var: "--gg-secondary-hover", usage: "Hover states, active secondary", textClass: "text-white" },
  { name: "Text Primary", hex: "#32404E", var: "--text-primary", usage: "Body text, labels", textClass: "text-white" },
  { name: "Text Secondary", hex: "#5a6a7a", var: "--text-secondary", usage: "Descriptions, captions", textClass: "text-white" },
  { name: "Text Light", hex: "#7a8a9a", var: "--text-light", usage: "Placeholders, disabled", textClass: "text-white" },
  { name: "Background", hex: "#ffffff", var: "--background", usage: "Page background", textClass: "text-gray-800", border: true },
  { name: "Background Accent", hex: "#EBEEE", var: "--background-accent", usage: "Cards, section backgrounds", textClass: "text-gray-800", border: true },
  { name: "Background Light", hex: "#f8f9fa", var: "--background-light", usage: "Subtle sections, input bg", textClass: "text-gray-800", border: true },
  { name: "Success / Green", hex: "#10b981", var: "--success", usage: "Success states, progress, donations", textClass: "text-white" },
  { name: "Warning / Amber", hex: "#f59e0b", var: "--warning", usage: "Warnings, pending states", textClass: "text-white" },
  { name: "Error / Red", hex: "#ef4444", var: "--error", usage: "Errors, critical alerts", textClass: "text-white" },
];

const typography = [
  { name: "H1 — Page Title", font: "Aleo", weight: "Bold 700", size: "44px / 2.75rem", sample: "Making a Difference Together" },
  { name: "H2 — Section Title", font: "Aleo", weight: "Regular 400", size: "36px / 2.25rem", sample: "Our Featured Projects" },
  { name: "H3 — Card Title", font: "Aleo", weight: "Regular 400", size: "32px / 2rem", sample: "Education for All Children" },
  { name: "H4 — Sub-heading", font: "Aleo", weight: "Bold 700", size: "22.4px / 1.4rem", sample: "Clean Water Initiative" },
  { name: "Body — Default", font: "Open Sans", weight: "Regular 400", size: "16px / 1rem", sample: "We connect donors with vetted nonprofits to create measurable, lasting impact in communities around the world." },
  { name: "Body Small — Captions", font: "Open Sans", weight: "Regular 400", size: "14px / 0.875rem", sample: "Last updated June 2025 · 1,240 donors · 78% funded" },
  { name: "Label — Tags & Badges", font: "Open Sans", weight: "SemiBold 600", size: "12px / 0.75rem", sample: "EDUCATION · KENYA · URGENT" },
];

const logoVariants = [
  { file: "/images/logo/primary-logo-color.svg", label: "Primary (Color)", bg: "bg-white", border: true, w: 320, h: 80 },
  { file: "/images/logo/primary-logo-white.svg", label: "White (Dark Backgrounds)", bg: "bg-[#3E4B59]", border: false, w: 320, h: 80 },
  { file: "/images/logo/primary-logo-dark.svg", label: "Dark (Light Backgrounds)", bg: "bg-gray-100", border: true, w: 320, h: 80 },
  { file: "/images/logo/icon-only.svg", label: "Icon Only (Color)", bg: "bg-white", border: true, w: 80, h: 80 },
  { file: "/images/logo/icon-only-white.svg", label: "Icon Only (White)", bg: "bg-[#3E4B59]", border: false, w: 80, h: 80 },
];

const spacing = [
  { name: "4px", token: "space-1", usage: "Tight gaps (icon→text)" },
  { name: "8px", token: "space-2", usage: "Small internal padding" },
  { name: "16px", token: "space-4", usage: "Standard gap, button padding" },
  { name: "24px", token: "space-6", usage: "Card internal padding" },
  { name: "32px", token: "space-8", usage: "Section dividers" },
  { name: "48px", token: "space-12", usage: "Section top/bottom padding" },
  { name: "64px", token: "space-16", usage: "Hero / large section padding" },
  { name: "96px", token: "space-24", usage: "Page-level vertical rhythm" },
];

const categories = [
  { icon: "📚", name: "Education", color: "#2563EB" },
  { icon: "🏥", name: "Health", color: "#10b981" },
  { icon: "🌳", name: "Environment", color: "#16a34a" },
  { icon: "🚨", name: "Disaster Relief", color: "#ef4444" },
  { icon: "💼", name: "Economic Dev.", color: "#7c3aed" },
  { icon: "⚖️", name: "Gender Equality", color: "#db2777" },
  { icon: "💧", name: "Water & Sanitation", color: "#0284c7" },
  { icon: "🎨", name: "Arts & Culture", color: "#d97706" },
];

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#3E4B59] text-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-[#F08B1D] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
            Brand Guidelines
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "Aleo, Georgia, serif" }}>
            GlobalGiving Identity System
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            The complete reference for GlobalGiving&apos;s visual language — logos, colors, typography, and usage guidelines for a cohesive, trustworthy brand presence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/60">
            <span>Version 1.0</span>
            <span>·</span>
            <span>June 2025</span>
            <span>·</span>
            <span>globalgiving.online</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* ── LOGO ── */}
        <section id="logos">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>Logo</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            The GlobalGiving logo combines a globe with a heart symbol — representing global reach with human compassion. Use the color version on white/light backgrounds; white version on dark/colored backgrounds.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {logoVariants.map((v) => (
              <div key={v.file} className="rounded-xl overflow-hidden shadow-sm">
                <div className={`${v.bg} ${v.border ? "border border-gray-200" : ""} flex items-center justify-center p-8 min-h-[140px]`}>
                  <Image src={v.file} alt={v.label} width={v.w} height={v.h} unoptimized />
                </div>
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-[#3E4B59]">{v.label}</p>
                  <p className="text-xs text-[#7a8a9a] mt-0.5 font-mono">{v.file.split("/").pop()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-amber-900 mb-3">Logo Usage Rules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-amber-800">
              <div className="flex gap-2"><span className="text-green-600 font-bold">✓</span> Maintain clear space equal to the height of the &ldquo;G&rdquo; on all sides</div>
              <div className="flex gap-2"><span className="text-green-600 font-bold">✓</span> Use SVG files for all digital use — scale freely without quality loss</div>
              <div className="flex gap-2"><span className="text-red-500 font-bold">✗</span> Do not stretch, skew, or rotate the logo</div>
              <div className="flex gap-2"><span className="text-red-500 font-bold">✗</span> Do not change the brand colors or add drop shadows</div>
              <div className="flex gap-2"><span className="text-red-500 font-bold">✗</span> Do not place the color logo on busy photographs without a solid background</div>
              <div className="flex gap-2"><span className="text-red-500 font-bold">✗</span> Minimum display size: 120px wide (full logo), 24px (icon only)</div>
            </div>
          </div>
        </section>

        {/* ── COLORS ── */}
        <section id="colors">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>Color Palette</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            Built for warmth, trust, and accessibility. Primary orange communicates energy and generosity; secondary blue-grey conveys stability and professionalism.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {colors.map((c) => (
              <div key={c.hex} className={`rounded-xl overflow-hidden shadow-sm ${c.border ? "border border-gray-200" : ""}`}>
                <div className={`h-20 flex items-end px-3 pb-2 ${c.textClass}`} style={{ backgroundColor: c.hex }}>
                  <span className="font-mono text-xs font-bold opacity-80">{c.hex}</span>
                </div>
                <div className="bg-white px-3 py-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-[#32404E]">{c.name}</p>
                  <p className="text-xs text-[#7a8a9a] mt-0.5 font-mono">{c.var}</p>
                  <p className="text-xs text-[#5a6a7a] mt-1">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#3E4B59] rounded-xl p-6 text-white">
              <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Approved Combination</p>
              <p className="text-lg font-bold">Dark Background + White Text</p>
              <p className="text-sm opacity-70 mt-1">Use for headers, footers, hero sections, admin sidebar</p>
            </div>
            <div className="bg-[#F08B1D] rounded-xl p-6 text-white">
              <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Approved Combination</p>
              <p className="text-lg font-bold">Orange + White Text</p>
              <p className="text-sm opacity-80 mt-1">CTAs, buttons, banners, highlight elements</p>
            </div>
            <div className="bg-white border-2 border-[#F08B1D] rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-[#7a8a9a] mb-2">Approved Combination</p>
              <p className="text-lg font-bold text-[#3E4B59]">White + Orange Accent</p>
              <p className="text-sm text-[#5a6a7a] mt-1">Cards, inputs, content areas with branded accents</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-[#7a8a9a] mb-2">Approved Combination</p>
              <p className="text-lg font-bold text-[#32404E]">Light Grey + Dark Text</p>
              <p className="text-sm text-[#5a6a7a] mt-1">Section backgrounds, table rows, form containers</p>
            </div>
          </div>
        </section>

        {/* ── TYPOGRAPHY ── */}
        <section id="typography">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>Typography</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            <strong>Aleo</strong> (serif) for headlines — warm and approachable with personality. <strong>Open Sans</strong> (sans-serif) for body — highly legible across all screen sizes.
          </p>
          <div className="space-y-4">
            {typography.map((t) => (
              <div key={t.name} className="border border-gray-100 rounded-xl p-6 bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-[#3E4B59] bg-white border border-gray-200 px-2 py-0.5 rounded">{t.name}</span>
                  <span className="text-xs text-[#7a8a9a] font-mono">{t.font} · {t.weight}</span>
                  <span className="text-xs text-[#7a8a9a] font-mono">{t.size}</span>
                </div>
                <p
                  className="text-[#32404E]"
                  style={{
                    fontFamily: t.font === "Aleo" ? "Aleo, Georgia, serif" : "Open Sans, Arial, sans-serif",
                    fontSize: t.size.split(" / ")[1],
                    fontWeight: t.weight.includes("700") ? 700 : t.weight.includes("600") ? 600 : 400,
                    lineHeight: 1.4,
                  }}
                >
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SPACING ── */}
        <section id="spacing">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>Spacing Scale</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            Based on a 4px base unit. Use Tailwind tokens consistently to maintain visual rhythm across pages.
          </p>
          <div className="space-y-2">
            {spacing.map((s) => (
              <div key={s.token} className="flex items-center gap-4">
                <div className="w-24 text-right font-mono text-xs text-[#5a6a7a]">{s.token}</div>
                <div className="bg-[#F08B1D] rounded" style={{ width: s.name, height: "24px", minWidth: s.name }} />
                <div className="font-mono text-xs text-[#32404E]">{s.name}</div>
                <div className="text-xs text-[#7a8a9a]">{s.usage}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORY ICONS ── */}
        <section id="categories">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>Category System</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            Each cause category has a distinct accent color for quick visual identification. Used in tags, filters, and category grid components.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.name} className="rounded-xl border border-gray-100 p-4 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-3" style={{ backgroundColor: `${cat.color}18` }}>
                  {cat.icon}
                </div>
                <p className="font-semibold text-sm text-[#32404E]">{cat.name}</p>
                <p className="font-mono text-xs mt-1" style={{ color: cat.color }}>{cat.color}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMPONENT EXAMPLES ── */}
        <section id="components">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>UI Components</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            Core interactive elements with their brand-correct styling.
          </p>

          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#7a8a9a] mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4 items-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <button className="btn btn-primary">Donate Now</button>
              <button className="btn btn-secondary">Learn More</button>
              <button className="btn btn-outline">Explore Projects</button>
              <button className="btn btn-simple">Cancel</button>
              <button className="btn btn-danger">Delete</button>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#7a8a9a] mb-4">Status Badges</h3>
            <div className="flex flex-wrap gap-3 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Active</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Draft</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Urgent</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Completed</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#7a8a9a] mb-4">Donation Progress Bar</h3>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
              {[{ label: "Education for All", pct: 68, raised: "$68,000", goal: "$100,000" },
                { label: "Clean Water Initiative", pct: 34, raised: "$17,000", goal: "$50,000" },
                { label: "Emergency Food Relief", pct: 91, raised: "$91,000", goal: "$100,000" }].map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#32404E]">{p.label}</span>
                    <span className="text-[#5a6a7a]">{p.raised} of {p.goal}</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.pct}%`, backgroundColor: p.pct >= 80 ? "#10b981" : "#F08B1D" }}
                    />
                  </div>
                  <p className="text-xs text-[#7a8a9a] mt-1">{p.pct}% funded</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ASSET DOWNLOADS ── */}
        <section id="assets">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>Asset Downloads</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            All logo files are SVG vector format — scalable to any size without quality loss.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { file: "/images/logo/primary-logo-color.svg", label: "Primary Logo — Color", desc: "For white/light backgrounds" },
              { file: "/images/logo/primary-logo-white.svg", label: "Primary Logo — White", desc: "For dark backgrounds" },
              { file: "/images/logo/primary-logo-dark.svg", label: "Primary Logo — Dark", desc: "For print, monochrome" },
              { file: "/images/logo/icon-only.svg", label: "Icon Only — Color", desc: "Favicon, app icon, avatar" },
              { file: "/images/logo/icon-only-white.svg", label: "Icon Only — White", desc: "On dark backgrounds" },
              { file: "/images/og-default.svg", label: "OG / Social Share Image", desc: "1200×630px — Twitter, Facebook, LinkedIn" },
              { file: "/favicon.svg", label: "Favicon SVG", desc: "Browser tab, bookmarks" },
              { file: "/apple-touch-icon.svg", label: "Apple Touch Icon", desc: "iOS home screen icon" },
            ].map((a) => (
              <a
                key={a.file}
                href={a.file}
                download
                className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:border-[#F08B1D] hover:bg-orange-50/30 transition-colors group"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-[#F08B1D] font-bold text-xs shrink-0">
                  SVG
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#32404E] group-hover:text-[#F08B1D] transition-colors">{a.label}</p>
                  <p className="text-xs text-[#7a8a9a] mt-0.5">{a.desc}</p>
                </div>
                <svg className="w-4 h-4 text-[#7a8a9a] group-hover:text-[#F08B1D] shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            ))}
          </div>
        </section>

        {/* ── TONE OF VOICE ── */}
        <section id="voice">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>Tone of Voice</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            How we write matters as much as how we look. Our voice reflects our values.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { trait: "Inspirational but Grounded", desc: "We celebrate impact with real stories — no empty promises or exaggerated claims." },
              { trait: "Professional yet Warm", desc: "Trustworthy language that feels human, never cold or corporate." },
              { trait: "Transparent", desc: "We share how funds are used, who benefits, and what accountability looks like." },
              { trait: "Empowering", desc: "Our language empowers donors and beneficiaries alike — everyone plays a role." },
              { trait: "Action-Oriented", desc: "Every piece of content has a clear, simple call to action." },
              { trait: "Inclusive", desc: "We represent all cultures, genders, ages and backgrounds authentically." },
            ].map((v) => (
              <div key={v.trait} className="border border-gray-100 rounded-xl p-5">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#F08B1D]" />
                </div>
                <h4 className="font-bold text-sm text-[#3E4B59] mb-1">{v.trait}</h4>
                <p className="text-xs text-[#5a6a7a] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SOCIAL MEDIA ── */}
        <section id="social">
          <h2 className="text-3xl font-bold text-[#3E4B59] mb-2" style={{ fontFamily: "Aleo, Georgia, serif" }}>Social Media Specs</h2>
          <p className="text-[#5a6a7a] mb-8 max-w-2xl">
            Reference dimensions for each platform. Use the brand color palette and logo consistently.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-[#32404E]">Platform</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#32404E]">Profile Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#32404E]">Cover Photo</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#32404E]">Post</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#32404E]">Story</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Facebook", "180×180px", "820×312px", "1200×630px", "1080×1920px"],
                  ["Twitter / X", "400×400px", "1500×500px", "1200×628px", "1080×1920px"],
                  ["Instagram", "320×320px", "—", "1080×1080px", "1080×1920px"],
                  ["LinkedIn", "300×300px", "1584×396px", "1200×627px", "—"],
                  ["YouTube", "800×800px", "2560×1440px", "1280×720px", "1080×1920px"],
                  ["TikTok", "200×200px", "—", "1080×1920px", "1080×1920px"],
                ].map(([platform, ...rest]) => (
                  <tr key={platform} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-[#3E4B59]">{platform}</td>
                    {rest.map((v, i) => (
                      <td key={i} className="py-3 px-4 font-mono text-xs text-[#5a6a7a]">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>Hashtag Strategy:</strong> Primary: <code>#GlobalGiving #Donate #MakeADifference</code> · Category: <code>#Education #Health #Environment</code> · Impact: <code>#ChangeMakers #Impact #Community</code>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 text-sm text-[#7a8a9a] text-center">
          <p>GlobalGiving Brand Guidelines v1.0 · <a href="/" className="text-[#F08B1D] hover:underline">globalgiving.online</a></p>
        </footer>
      </div>
    </main>
  );
}
