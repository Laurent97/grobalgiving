'use client'

import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'New York, USA',
    text: 'I\'ve been donating for 3 years and love seeing the direct impact of my contributions. The transparency and regular updates keep me engaged.',
    rating: 5,
    project: 'Education in East Africa',
  },
  {
    name: 'Michael Chen',
    location: 'Singapore',
    text: 'The platform makes it so easy to find causes I care about. I especially appreciate the vetting process for organizations.',
    rating: 5,
    project: 'Clean Water Initiative',
  },
  {
    name: 'Emma Rodriguez',
    location: 'Madrid, Spain',
    text: 'Monthly giving has allowed me to support multiple causes sustainably. The impact reports show exactly where my money goes.',
    rating: 5,
    project: 'Healthcare for Children',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Donors Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied donors making a real difference around the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-gg-primary/20 mb-4" />
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="border-t border-gray-100 pt-4">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
                <p className="text-sm text-gg-primary mt-1">Supported: {testimonial.project}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
