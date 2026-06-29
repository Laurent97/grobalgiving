import Link from 'next/link'
import { Mail, MessageCircle, MapPin, Heart, ShoppingCart, User } from 'lucide-react'
import { CONTACT } from '@/lib/contact'

const navLinks = [
  { label: 'Projects', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Impact', href: '/impact' },
  { label: 'Contact', href: '/contact' },
]

const actionLinks = [
  { label: 'Donate', href: '/', icon: Heart },
  { label: 'My Account', href: '/account', icon: User },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="bg-[#2a3440] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#F08B1D] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                AG
              </div>
              <span className="font-bold text-lg text-white" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                AcaciaGiving
              </span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed mb-6">
              Rooted in Giving. Connecting donors with high-impact projects across Africa and beyond.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#F08B1D] flex items-center justify-center transition-colors text-white/60 hover:text-white text-xs font-bold">
                f
              </a>
              <a href={CONTACT.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter/X"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#F08B1D] flex items-center justify-center transition-colors text-white/60 hover:text-white text-xs font-bold">
                𝕏
              </a>
              <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#F08B1D] flex items-center justify-center transition-colors text-white/60 hover:text-white text-xs font-bold">
                IG
              </a>
              <a href={CONTACT.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#F08B1D] flex items-center justify-center transition-colors text-white/60 hover:text-white text-xs font-bold">
                in
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5 tracking-widest uppercase">Platform</h4>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/55 hover:text-[#F08B1D] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-white/10" />
              {legalLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/40 hover:text-white/70 text-xs transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5 tracking-widest uppercase">Quick Links</h4>
            <ul className="space-y-3">
              {actionLinks.map(({ label, href, icon: Icon }) => (
                <li key={href + label}>
                  <Link href={href} className="flex items-center gap-2 text-white/55 hover:text-[#F08B1D] text-sm transition-colors group">
                    <Icon className="w-3.5 h-3.5 group-hover:text-[#F08B1D] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5 tracking-widest uppercase">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href={`mailto:${CONTACT.primary.email}`} className="flex items-start gap-3 group">
                  <Mail className="w-4 h-4 text-[#F08B1D] mt-0.5 shrink-0" />
                  <span className="text-white/55 group-hover:text-white text-sm transition-colors break-all">
                    {CONTACT.primary.email}
                  </span>
                </a>
              </li>
              <li>
                <a href={CONTACT.primary.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                  <MessageCircle className="w-4 h-4 text-[#F08B1D] mt-0.5 shrink-0" />
                  <span className="text-white/55 group-hover:text-white text-sm transition-colors">
                    WhatsApp: {CONTACT.primary.whatsapp}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Offices */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5 tracking-widest uppercase">Our Offices</h4>
            <ul className="space-y-4">
              {CONTACT.offices.map(office => (
                <li key={office.country}>
                  <a href={office.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 group">
                    <MapPin className="w-4 h-4 text-[#F08B1D] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white/75 text-sm font-medium group-hover:text-[#F08B1D] transition-colors">
                        {office.flag} {office.country}{office.isHQ ? ' (HQ)' : ''}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">{office.locationCode}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <p>© {new Date().getFullYear()} AcaciaGiving. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {legalLinks.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-white/60 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
