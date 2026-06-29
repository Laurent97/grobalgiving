'use client'

import { Search, Heart, BarChart2 } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Find a Cause',
    description: 'Browse hundreds of vetted projects across causes and regions. Filter by category, location, or urgency to find what moves you.',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accent: 'border-blue-200',
  },
  {
    number: '02',
    icon: Heart,
    title: 'Donate Securely',
    description: 'Give once or set up recurring monthly donations via bank transfer, mobile money, or crypto. Every transaction is encrypted.',
    color: 'bg-orange-50',
    iconColor: 'text-[#F08B1D]',
    accent: 'border-orange-200',
  },
  {
    number: '03',
    icon: BarChart2,
    title: 'Track Your Impact',
    description: 'Receive regular updates from the field. See photos, reports, and milestones showing exactly how your gift is being used.',
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    accent: 'border-emerald-200',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            How It Works
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Three simple steps to start making a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-[3.5rem] left-[16.5%] right-[16.5%] h-px border-t-2 border-dashed border-gray-300 z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative z-10 group">
                <div className={`bg-white rounded-2xl p-7 h-full border ${step.accent} border-opacity-60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  {/* Step number + icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 ${step.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${step.iconColor}`} />
                    </div>
                    <span className="text-5xl font-bold text-gray-100 select-none" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#3E4B59] mb-3" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </section>
  )
}
