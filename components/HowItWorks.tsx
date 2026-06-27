'use client'

import { Search, Heart, ArrowRight, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Discover Projects',
    description: 'Browse thousands of vetted projects across causes and regions that match your passion.',
  },
  {
    icon: Heart,
    title: 'Make a Donation',
    description: 'Give once or set up monthly recurring donations to create lasting impact.',
  },
  {
    icon: CheckCircle,
    title: 'Track Your Impact',
    description: 'Receive regular updates and see exactly how your donation is making a difference.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Making a difference is simple. Start changing lives in three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 h-full border border-orange-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gg-primary rounded-xl">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gg-primary border-2 border-gg-primary">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      <ArrowRight className="w-4 h-4 text-gg-primary" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button className="bg-gg-primary hover:bg-gg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl">
            Start Making a Difference
          </button>
        </div>
      </div>
    </section>
  )
}
