"use client"

import Link from 'next/link'
import Image from 'next/image'

const causes = [
  {
    id: 'kenya-water',
    title: 'Clean Water for Rural Kenya',
    country: 'Kenya',
    short: 'Build wells and provide safe drinking water to remote communities.',
    image: '/images/kenya.svg',
    raised: 42500,
    goal: 80000,
  },
  {
    id: 'uganda-school',
    title: 'School Supplies in Uganda',
    country: 'Uganda',
    short: 'Provide books, desks and teacher training for village schools.',
    image: '/images/uganda.svg',
    raised: 18000,
    goal: 30000,
  },
  {
    id: 'tanzania-health',
    title: 'Maternal Health Clinics in Tanzania',
    country: 'Tanzania',
    short: 'Support mobile clinics and midwife training to reduce maternal mortality.',
    image: '/images/tanzania.svg',
    raised: 62000,
    goal: 100000,
  },
  {
    id: 'rwanda-agriculture',
    title: 'Sustainable Farming in Rwanda',
    country: 'Rwanda',
    short: 'Train farmers on agroforestry and increase crop yields.',
    image: '/images/rwanda.svg',
    raised: 15000,
    goal: 25000,
  },
  {
    id: 'ethiopia-food',
    title: 'Food Security in Ethiopia',
    country: 'Ethiopia',
    short: 'Support drought resilience and community food programs.',
    image: '/images/ethiopia.svg',
    raised: 34000,
    goal: 60000,
  },
  {
    id: 'somalia-kits',
    title: 'Hygiene Kits for Somalia',
    country: 'Somalia',
    short: 'Distribute hygiene and sanitation kits to displaced families.',
    image: '/images/somalia.svg',
    raised: 9000,
    goal: 20000,
  },
  {
    id: 'south-sudan-nutrition',
    title: 'Child Nutrition in South Sudan',
    country: 'South Sudan',
    short: 'Provide therapeutic feeding and nutrition education programs.',
    image: '/images/south-sudan.svg',
    raised: 12000,
    goal: 45000,
  },
  {
    id: 'burundi-agri',
    title: 'Agricultural Training in Burundi',
    country: 'Burundi',
    short: 'Train smallholder farmers in sustainable practices to boost yields.',
    image: '/images/burundi.svg',
    raised: 7200,
    goal: 20000,
  },
]

export default function FeaturedCauses() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Causes — East Africa</h2>
        <Link href="/projects" className="text-gg-primary hover:underline">
          See all projects
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {causes.map((c) => (
          <article key={c.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="relative h-40 w-full bg-gray-100">
              {/* Images are optional; use placeholder color if not available */}
              {c.image && (
                // Image optimization not necessary for placeholder demo
                <Image src={c.image} alt={c.title} fill className="object-cover" sizes="(max-width: 768px) 100vw" />
              )}
            </div>

            <div className="p-4">
              <p className="text-xs font-semibold text-gg-primary mb-2">{c.country}</p>
              <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{c.short}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">${(c.raised).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">of ${c.goal.toLocaleString()} goal</p>
                </div>
                <Link href={`/projects/${c.id}`} className="bg-gg-primary text-white px-3 py-2 rounded hover:bg-gg-primary-700">
                  Give
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
