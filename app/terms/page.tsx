import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read GlobalGiving's Terms of Service — the rules and guidelines that govern your use of our donation platform.",
};

const LAST_UPDATED = "June 27, 2026";
const EFFECTIVE_DATE = "June 27, 2026";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      {
        subtitle: "",
        text: "By accessing or using AcaciaGiving (acaciagiving.org), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our platform. We reserve the right to update these Terms at any time; continued use after changes constitutes acceptance.",
      },
    ],
  },
  {
    id: "platform-description",
    title: "2. About the Platform",
    content: [
      {
        subtitle: "",
        text: "GlobalGiving is a nonprofit donation facilitation platform that connects donors with vetted nonprofit organizations and community projects. We provide technology infrastructure for fundraising campaigns but are not ourselves a nonprofit and do not directly manage or control the programs funded.",
      },
    ],
  },
  {
    id: "eligibility",
    title: "3. Eligibility",
    content: [
      {
        subtitle: "Age Requirement",
        text: "You must be at least 18 years old to create an account or make donations on this platform. By using the platform, you represent that you meet this requirement.",
      },
      {
        subtitle: "Accurate Information",
        text: "You agree to provide accurate, current, and complete information when registering or making a donation. You are responsible for keeping your account credentials confidential.",
      },
    ],
  },
  {
    id: "donations",
    title: "4. Donations",
    content: [
      {
        subtitle: "Donation Processing",
        text: "Donations made through GlobalGiving are subject to manual verification by our team. A donation is considered complete only after payment has been verified and confirmed. We reserve the right to reject or refund donations that cannot be verified.",
      },
      {
        subtitle: "No Refund Policy",
        text: "All donations are final once verified and disbursed to the recipient nonprofit. In exceptional cases (e.g., fraud, project cancellation), we may issue refunds at our sole discretion. Refund requests must be submitted within 14 days of the original transaction.",
      },
      {
        subtitle: "Currency and Fees",
        text: "Donations are accepted in the currency specified for each payment method. GlobalGiving does not charge platform fees to donors; however, third-party transaction fees (bank transfer fees, mobile money charges) may apply and are the donor's responsibility.",
      },
      {
        subtitle: "Tax Deductibility",
        text: "GlobalGiving does not guarantee the tax-deductibility of any donation. Donors are responsible for consulting their local tax advisors regarding applicable deductions.",
      },
      {
        subtitle: "Recurring Donations",
        text: "Any recurring donation commitment is subject to the availability of the project and the donor's continued authorization. Either party may cancel a recurring arrangement at any time with reasonable notice.",
      },
    ],
  },
  {
    id: "nonprofits",
    title: "5. Nonprofit Partners",
    content: [
      {
        subtitle: "Vetting",
        text: "GlobalGiving makes reasonable efforts to vet nonprofit partners for legitimacy. However, we do not guarantee the accuracy of information provided by nonprofits, nor the outcomes of funded projects.",
      },
      {
        subtitle: "Accountability",
        text: "Nonprofit partners are required to provide regular project updates and financial reporting. Failure to comply may result in suspension or removal from the platform.",
      },
      {
        subtitle: "Independent Operations",
        text: "Nonprofits listed on GlobalGiving operate independently. GlobalGiving is not liable for the actions, decisions, or outcomes of any nonprofit organization on the platform.",
      },
    ],
  },
  {
    id: "prohibited",
    title: "6. Prohibited Conduct",
    content: [
      {
        subtitle: "",
        text: "You agree not to: (a) use the platform for any unlawful purpose or in violation of any regulations; (b) make fraudulent donations or misrepresent your identity; (c) attempt to circumvent security measures; (d) use the platform to launder money or finance terrorism; (e) scrape, copy, or redistribute content without permission; (f) upload malicious code, viruses, or any content that could harm the platform or its users; (g) harass, threaten, or abuse any user or staff member.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property",
    content: [
      {
        subtitle: "Our Content",
        text: "All content on GlobalGiving, including logos, text, graphics, and software, is the property of GlobalGiving or its licensors and is protected by applicable intellectual property laws. You may not reproduce or distribute our content without written permission.",
      },
      {
        subtitle: "Your Content",
        text: "By submitting content (such as comments or donation messages), you grant GlobalGiving a non-exclusive, royalty-free license to use, display, and distribute that content in connection with our services.",
      },
    ],
  },
  {
    id: "disclaimers",
    title: "8. Disclaimers",
    content: [
      {
        subtitle: "As-Is Basis",
        text: "The platform is provided on an \"as is\" and \"as available\" basis without warranties of any kind, express or implied. GlobalGiving does not warrant that the service will be uninterrupted, error-free, or free of viruses.",
      },
      {
        subtitle: "Third-Party Links",
        text: "Our platform may contain links to third-party websites. GlobalGiving is not responsible for the content, privacy practices, or availability of those sites.",
      },
    ],
  },
  {
    id: "limitation",
    title: "9. Limitation of Liability",
    content: [
      {
        subtitle: "",
        text: "To the maximum extent permitted by law, GlobalGiving and its officers, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to loss of data, loss of donations, or project outcomes — even if we have been advised of the possibility of such damages.",
      },
    ],
  },
  {
    id: "indemnification",
    title: "10. Indemnification",
    content: [
      {
        subtitle: "",
        text: "You agree to indemnify and hold harmless GlobalGiving, its affiliates, officers, agents, and employees from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, violation of these Terms, or infringement of any third-party rights.",
      },
    ],
  },
  {
    id: "termination",
    title: "11. Termination",
    content: [
      {
        subtitle: "",
        text: "We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or if your account poses a risk to the platform or other users. Upon termination, your right to use the platform ceases immediately. Provisions that by their nature should survive termination (including sections on donations, intellectual property, disclaimers, and limitation of liability) will remain in effect.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "12. Governing Law",
    content: [
      {
        subtitle: "",
        text: "These Terms shall be governed by and construed in accordance with the applicable laws of the jurisdiction in which GlobalGiving operates. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in that jurisdiction.",
      },
    ],
  },
  {
    id: "contact",
    title: "13. Contact",
    content: [
      {
        subtitle: "",
        text: "For questions about these Terms of Service, please contact us at support@acaciagiving.org. We will respond within 30 business days.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#3E4B59] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-[#F08B1D] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "Aleo, Georgia, serif" }}>
            Terms of Service
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Please read these terms carefully before using the GlobalGiving platform.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/50">
            <span>Effective: {EFFECTIVE_DATE}</span>
            <span>·</span>
            <span>Last Updated: {LAST_UPDATED}</span>
          </div>
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
              <strong className="text-[#32404E]">Summary:</strong> By using GlobalGiving, you agree to donate in good faith, provide accurate information, and not misuse the platform. Donations are final once verified. We are not liable for nonprofit operations or project outcomes.
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
                <Link href="/privacy" className="text-[#F08B1D] hover:underline">Privacy Policy</Link>
                <Link href="/" className="hover:text-[#F08B1D] transition-colors">Home</Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
