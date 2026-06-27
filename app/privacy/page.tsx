import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how GlobalGiving collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "June 27, 2026";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Information You Provide",
        text: "When you create an account, make a donation, or contact us, we collect information such as your name, email address, mailing address, and payment details. Donation dedications (e.g., in memory of / in honor of) and personal messages you include are also stored.",
      },
      {
        subtitle: "Information Collected Automatically",
        text: "When you visit our website, we automatically collect certain technical information including your IP address, browser type, device identifiers, pages visited, and referring URLs. We use cookies and similar technologies to improve your experience and analyze usage patterns.",
      },
      {
        subtitle: "Payment Information",
        text: "Payment details such as bank transfer receipts, mobile money transaction references, and cryptocurrency transaction hashes are collected solely for donation verification purposes. We do not store full credit card or debit card numbers on our servers.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "To Process Donations",
        text: "We use your information to process and verify your donations, generate donation references, and send you confirmation and receipts.",
      },
      {
        subtitle: "To Communicate With You",
        text: "We may send you transactional emails (donation confirmations, updates), newsletters if you opt in, and important service notices. You may unsubscribe from marketing emails at any time.",
      },
      {
        subtitle: "To Improve Our Services",
        text: "Aggregated, anonymized data helps us understand how donors use our platform, which projects receive support, and how we can improve the experience for all users.",
      },
      {
        subtitle: "To Comply With Legal Obligations",
        text: "We may process your data to comply with applicable laws, regulations, or legal processes, including anti-money laundering (AML) and know-your-customer (KYC) requirements.",
      },
    ],
  },
  {
    id: "sharing",
    title: "3. How We Share Your Information",
    content: [
      {
        subtitle: "With Nonprofits You Support",
        text: "When you donate to a project, the recipient nonprofit may receive your name and donation amount to acknowledge your contribution. If you choose to donate anonymously, we will honor that preference and only share aggregate totals.",
      },
      {
        subtitle: "With Service Providers",
        text: "We work with trusted third-party providers for hosting (Supabase, Vercel), email delivery, and analytics. These providers are contractually obligated to protect your data and use it only for the services they provide to us.",
      },
      {
        subtitle: "For Legal Reasons",
        text: "We may disclose your information if required by law, court order, or government authority, or if we believe disclosure is necessary to protect the rights, property, or safety of GlobalGiving, our users, or the public.",
      },
      {
        subtitle: "We Do Not Sell Your Data",
        text: "GlobalGiving does not sell, rent, or trade your personal information to third parties for their marketing purposes.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "4. Data Retention",
    content: [
      {
        subtitle: "Account Data",
        text: "We retain your account information for as long as your account is active, or as needed to provide services. You may request deletion of your account at any time by contacting us.",
      },
      {
        subtitle: "Donation Records",
        text: "Donation transaction records may be retained for up to seven (7) years to comply with financial reporting and audit requirements, even after account deletion.",
      },
    ],
  },
  {
    id: "security",
    title: "5. Security",
    content: [
      {
        subtitle: "Technical Safeguards",
        text: "We use industry-standard security measures including HTTPS encryption in transit, row-level security (RLS) on our database, and access control policies to protect your data.",
      },
      {
        subtitle: "No Guarantee",
        text: "While we take reasonable precautions, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: [
      {
        subtitle: "Access and Correction",
        text: "You have the right to access the personal information we hold about you and to request corrections if it is inaccurate or incomplete.",
      },
      {
        subtitle: "Deletion",
        text: "You may request deletion of your personal data. Note that some data may be retained for legal or financial compliance reasons as described above.",
      },
      {
        subtitle: "Opt-Out",
        text: "You may opt out of marketing communications at any time by clicking the unsubscribe link in any email or contacting us directly.",
      },
      {
        subtitle: "Data Portability",
        text: "You may request a copy of your personal data in a structured, machine-readable format.",
      },
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "We use essential cookies to maintain your session and authentication state. These cannot be disabled as they are required for the platform to function.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "With your consent, we use analytics cookies to understand how visitors interact with our website. You may disable these through your browser settings.",
      },
    ],
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: [
      {
        subtitle: "",
        text: "GlobalGiving is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately so we can delete it.",
      },
    ],
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: [
      {
        subtitle: "",
        text: "We may update this Privacy Policy from time to time. When we do, we will revise the \"Last Updated\" date at the top of this page. Continued use of our services after changes take effect constitutes your acceptance of the revised policy. We encourage you to review this page periodically.",
      },
    ],
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: [
      {
        subtitle: "",
        text: "If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at privacy@globalgiving.online. We aim to respond to all requests within 30 days.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#3E4B59] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-[#F08B1D] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "Aleo, Georgia, serif" }}>
            Privacy Policy
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            We are committed to protecting your personal information and being transparent about how we use it.
          </p>
          <p className="mt-4 text-sm text-white/50">Last Updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">

          {/* Table of Contents — sticky sidebar on large screens */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 bg-gray-50 rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7a8a9a] mb-4">Contents</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-[#5a6a7a] hover:text-[#F08B1D] py-1 transition-colors leading-snug"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="space-y-10">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-sm text-[#5a6a7a]">
              <strong className="text-[#32404E]">Summary:</strong> GlobalGiving collects only the data necessary to process your donations and improve our services. We do not sell your data. You may request access, correction, or deletion of your information at any time.
            </div>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-8">
                <h2 className="text-xl font-bold text-[#3E4B59] mb-4 pb-2 border-b border-gray-100" style={{ fontFamily: "Aleo, Georgia, serif" }}>
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((item, i) => (
                    <div key={i}>
                      {item.subtitle && (
                        <h3 className="font-semibold text-[#32404E] mb-1">{item.subtitle}</h3>
                      )}
                      <p className="text-[#5a6a7a] leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-[#7a8a9a]">
              <span>© {new Date().getFullYear()} GlobalGiving. All rights reserved.</span>
              <div className="flex gap-4">
                <Link href="/terms" className="text-[#F08B1D] hover:underline">Terms of Service</Link>
                <Link href="/" className="hover:text-[#F08B1D] transition-colors">Home</Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
