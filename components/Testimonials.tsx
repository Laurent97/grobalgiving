'use client'

import { Star, ShieldCheck, Award, CheckCircle } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Regular Donor',
    location: 'New York, USA',
    initials: 'SJ',
    color: 'bg-blue-500',
    text: "I've been donating for 3 years and the transparency here is unmatched. I get real field updates with photos — I know exactly where every dollar goes.",
    rating: 5,
    project: 'Education in East Africa',
  },
  {
    name: 'Michael Chen',
    role: 'Monthly Donor',
    location: 'Singapore',
    initials: 'MC',
    color: 'bg-emerald-500',
    text: "The vetting process gives me total peace of mind. I recommend GlobalGiving to every friend who wants to donate responsibly. Outstanding platform.",
    rating: 5,
    project: 'Clean Water Initiative',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Impact Giver',
    location: 'Madrid, Spain',
    initials: 'ER',
    color: 'bg-purple-500',
    text: "Monthly giving let me support multiple causes sustainably. The impact reports are genuinely moving — you feel connected to the communities you're helping.",
    rating: 5,
    project: 'Healthcare for Children',
  },
]

const trustItems = [
  { icon: Star, label: '4.9 / 5 Rating', sub: 'From 8,000+ reviews' },
  { icon: ShieldCheck, label: 'SSL Secured', sub: 'Bank-level encryption' },
  { icon: Award, label: 'Verified Nonprofits', sub: 'Every org is checked' },
  { icon: CheckCircle, label: '100% Transparent', sub: 'See every dollar spent' },
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            Community Stories
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            What Our Donors Say
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Join thousands of satisfied donors making a real difference around the world.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-16">
          {testimonials.map((t, i) => (
            <div key={i} className="group bg-gray-50 hover:bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Big open quote */}
              <span className="text-7xl text-[#F08B1D]/15 leading-none font-serif select-none -mt-2 -mb-4">"</span>

              <p className="text-gray-700 leading-relaxed flex-1 mb-6 text-[15px]">{t.text}</p>

              <div className="border-t border-gray-100 pt-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-[#3E4B59] text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role} · {t.location}</p>
                  <p className="text-xs text-[#F08B1D] mt-0.5">Supported: {t.project}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="bg-[#f8f9fa] rounded-2xl border border-gray-100 px-8 py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="w-5 h-5 text-[#F08B1D]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3E4B59] text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
