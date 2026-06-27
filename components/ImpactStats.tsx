'use client'

import { useState, useEffect } from 'react'
import { Globe, Heart, ShieldCheck, Award, Users, TrendingUp, Loader2 } from 'lucide-react'

const trustBadges = [
  { icon: ShieldCheck, text: '100% Secure Donations', description: 'SSL encrypted transactions' },
  { icon: Award, text: 'Vetted Organizations', description: 'Every nonprofit verified' },
  { icon: Heart, text: 'Transparent Impact', description: 'Regular project updates' },
]

export default function ImpactStats() {
  const [stats, setStats] = useState({
    totalRaised: 0,
    projectsFunded: 0,
    donors: 0,
    countries: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`
    return num.toString()
  }

  const statItems = [
    { icon: TrendingUp, value: formatNumber(stats.totalRaised), label: 'Total Raised' },
    { icon: Globe, value: `${stats.countries}+`, label: 'Countries' },
    { icon: Users, value: formatNumber(stats.donors), label: 'Donors' },
    { icon: Heart, value: stats.projectsFunded.toString(), label: 'Projects Funded' },
  ]

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gg-primary" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {statItems.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gg-primary/10 rounded-2xl mb-4">
                  <Icon className="w-8 h-8 text-gg-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Donors Trust Us
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-4">
                    <Icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{badge.text}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
