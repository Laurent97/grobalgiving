import Link from 'next/link'
import { Heart, Globe, ShieldCheck, Users, Award, Target, ArrowRight, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'About Us | AcaciaGiving',
  description: 'Learn about AcaciaGiving\'s mission to connect donors with high-impact nonprofit projects across Africa and the world.',
}

const values = [
  {
    icon: ShieldCheck,
    title: 'Radical Transparency',
    description: 'Every dollar is tracked. Every project gets regular updates. You always know exactly where your money goes and what it achieves.',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'We partner with vetted nonprofits across 45+ countries, ensuring that communities everywhere have access to the support they need.',
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Heart,
    title: 'Donor First',
    description: 'We exist to serve donors and the communities they support. Our platform is designed around your giving experience, not our bottom line.',
    color: 'bg-orange-50',
    iconColor: 'text-[#F08B1D]',
  },
  {
    icon: Award,
    title: 'Rigorous Vetting',
    description: 'Every nonprofit on our platform undergoes a thorough review of its finances, governance, and impact before receiving a single donation.',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
]

const team = [
  { name: 'Amara Diallo', role: 'Chief Executive Officer', initials: 'AD', color: 'bg-blue-500' },
  { name: 'Yuki Tanaka', role: 'Head of Impact', initials: 'YT', color: 'bg-emerald-500' },
  { name: 'Carlos Méndez', role: 'Chief Technology Officer', initials: 'CM', color: 'bg-purple-500' },
  { name: 'Fatima Al-Rashid', role: 'Director of Partnerships', initials: 'FA', color: 'bg-rose-500' },
  { name: 'James Osei', role: 'Head of Community', initials: 'JO', color: 'bg-amber-500' },
  { name: 'Priya Sharma', role: 'Lead Engineer', initials: 'PS', color: 'bg-cyan-500' },
]

const milestones = [
  { year: '2019', event: 'AcaciaGiving founded with a mission to connect donors and nonprofits worldwide.' },
  { year: '2020', event: 'Launched our first vetted projects across Africa. Established offices in Nairobi and Wau.' },
  { year: '2021', event: 'Expanded operations to DR Congo and Morocco. Introduced monthly recurring giving.' },
  { year: '2022', event: 'Launched mobile-optimized donor portal and mobile money payment support.' },
  { year: '2023', event: 'Added crypto payment options and impact tracking for all active projects.' },
  { year: '2024', event: 'Growing across Africa with active projects in health, education, and environment.' },
]

export default function AboutPage() {
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
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-[#F08B1D]/20 border border-[#F08B1D]/30 text-[#F8C07A] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Heart className="w-4 h-4 fill-[#F8C07A]" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            We Connect Generosity
            <span className="block text-[#F08B1D]">to Real Impact</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            AcaciaGiving was built on a simple belief: that ordinary people, given the right tools and information, can change the world. We exist to make that possible.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60L720 20L1440 60V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-[#F08B1D] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-widest uppercase">
                <Target className="w-3.5 h-3.5" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-6" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                Democratizing Access to Global Philanthropy
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We believe that the desire to do good is universal — but access to trusted, transparent giving opportunities is not. AcaciaGiving bridges that gap by rigorously vetting nonprofits and providing donors with the information they need to give with confidence.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Whether you give $10 or $10,000, you deserve to know your donation is making a real difference. We track every project, publish regular updates from the field, and ensure every organization on our platform meets our strict standards for governance and impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="inline-flex items-center gap-2 bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  Explore Projects
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/impact" className="inline-flex items-center gap-2 border-2 border-[#3E4B59] text-[#3E4B59] hover:bg-[#3E4B59] hover:text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200">
                  See Our Impact
                </Link>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-5">
              {[
                { value: '$1M+', label: 'Total Raised', sub: 'and growing every day' },
                { value: '45+', label: 'Countries', sub: 'across 6 continents' },
                { value: '200+', label: 'Active Projects', sub: 'verified and vetted' },
                { value: '50K+', label: 'Donors', sub: 'trusting us globally' },
              ].map((s, i) => (
                <div key={i} className="bg-[#f8f9fa] rounded-2xl p-7 border border-gray-100">
                  <p className="text-4xl font-bold text-[#F08B1D] mb-1" style={{ fontFamily: 'Aleo, Georgia, serif' }}>{s.value}</p>
                  <p className="font-semibold text-[#3E4B59] text-sm">{s.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#3E4B59] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase shadow-sm">
              What We Stand For
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              Our Core Values
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Every decision we make is guided by four principles that put donors and communities first.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${v.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-[#3E4B59] text-lg mb-3" style={{ fontFamily: 'Aleo, Georgia, serif' }}>{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-[#F08B1D] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
              Our Journey
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              How We Got Here
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={i} className="relative flex gap-8 items-start">
                  <div className="relative z-10 shrink-0 w-16 h-16 bg-[#F08B1D] rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                    {m.year}
                  </div>
                  <div className="flex-1 bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100 mt-1">
                    <p className="text-gray-700 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#3E4B59] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase shadow-sm">
              <Users className="w-3.5 h-3.5" />
              The Team
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E4B59] mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
              The People Behind AcaciaGiving
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              A passionate, globally distributed team committed to making philanthropy work better for everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${member.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {member.initials}
                </div>
                <div>
                  <p className="font-bold text-[#3E4B59]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>{member.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="py-20 bg-[#3E4B59]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F08B1D]/20 border border-[#F08B1D]/30 text-[#F8C07A] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <CheckCircle className="w-4 h-4" />
            Join the Movement
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-white/65 mb-10 max-w-xl mx-auto">
            Whether you're a donor, a nonprofit, or a corporate partner — there's a place for you in the AcaciaGiving community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="inline-flex items-center gap-2 bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Explore Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
