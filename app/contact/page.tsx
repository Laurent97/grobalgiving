import { Mail, Phone, MessageCircle, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { CONTACT } from '@/lib/contact'

export const metadata = {
  title: 'Contact Us',
  description: 'Reach out to AcaciaGiving via email, phone, or WhatsApp. We have offices in Kenya, South Sudan, DR Congo, and Morocco.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#3E4B59] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a3440] via-[#3E4B59] to-[#4a3828]" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#F08B1D]/10 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Get in Touch
          </h1>
          <p className="text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            We're here to help. Reach out to us through email, phone, or WhatsApp — or visit one of our offices across Africa.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60L720 20L1440 60V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Primary Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#3E4B59] mb-8 text-center" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Primary Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <a
              href={`mailto:${CONTACT.primary.email}`}
              className="group flex flex-col items-center text-center bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#F08B1D]/30 hover:shadow-lg rounded-2xl p-8 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-[#F08B1D]" />
              </div>
              <p className="font-semibold text-[#3E4B59] mb-1">Email Support</p>
              <p className="text-sm text-gray-500 break-all">{CONTACT.primary.email}</p>
            </a>

            <a
              href={`tel:${CONTACT.primary.phone.replace(/\s/g, '')}`}
              className="group flex flex-col items-center text-center bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#F08B1D]/30 hover:shadow-lg rounded-2xl p-8 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-[#F08B1D]" />
              </div>
              <p className="font-semibold text-[#3E4B59] mb-1">Phone</p>
              <p className="text-sm text-gray-500">{CONTACT.primary.phone}</p>
            </a>

            <a
              href={CONTACT.primary.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#F08B1D]/30 hover:shadow-lg rounded-2xl p-8 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-[#F08B1D]" />
              </div>
              <p className="font-semibold text-[#3E4B59] mb-1">WhatsApp</p>
              <p className="text-sm text-gray-500">{CONTACT.primary.whatsapp}</p>
            </a>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-[#f8f9fa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#3E4B59] mb-2 text-center" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Our Offices
          </h2>
          <p className="text-gray-500 text-center mb-10">Rooted in the communities we serve across Africa.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {CONTACT.offices.map(office => (
              <div key={office.country} className="bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xl font-bold text-[#3E4B59]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                      {office.flag} {office.country}
                    </p>
                    {office.isHQ && (
                      <span className="inline-block text-xs font-semibold text-[#F08B1D] bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-full mt-1">
                        Headquarters
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700">{office.address}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{office.locationCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`mailto:${office.email}`} className="text-sm text-[#F08B1D] hover:underline">
                      {office.email}
                    </a>
                  </div>
                </div>
                <a
                  href={office.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-5 text-xs font-semibold text-[#3E4B59] hover:text-[#F08B1D] transition-colors"
                >
                  View on Google Maps
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#3E4B59] mb-2 text-center" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Send Us a Message
          </h2>
          <p className="text-gray-500 text-center mb-10">
            For general enquiries, project support, or partnership proposals.
          </p>
          <form
            action={`mailto:${CONTACT.primary.email}`}
            method="get"
            encType="text/plain"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F08B1D]/40 focus:border-[#F08B1D] text-sm transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F08B1D]/40 focus:border-[#F08B1D] text-sm transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
              <input
                type="text"
                name="subject"
                required
                placeholder="How can we help?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F08B1D]/40 focus:border-[#F08B1D] text-sm transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                name="body"
                required
                rows={5}
                placeholder="Tell us more about your enquiry..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F08B1D]/40 focus:border-[#F08B1D] text-sm transition resize-none"
              />
            </div>
            <p className="text-xs text-gray-400">
              This will open your email client pre-filled. Alternatively, email us directly at{' '}
              <a href={`mailto:${CONTACT.primary.email}`} className="text-[#F08B1D] hover:underline">
                {CONTACT.primary.email}
              </a>
            </p>
            <button
              type="submit"
              className="w-full bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
