import React from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ShieldCheck } from 'lucide-react'
import Logo from '../ui/Logo'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white py-16 border-t border-white/10 select-none">
      <div className="max-w-[1200px] mx-auto px-6 tablet:px-10">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <Logo size={28} variant="light" showText={true} />
            <p className="font-body text-[14px] text-slate-light opacity-80 leading-relaxed max-w-[240px]">
              Nigeria\'s trust-first artisan marketplace. Connecting urban residents to vetted, insured professionals through secure escrow.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck size={18} className="text-teal" />
              <span className="font-mono text-[11px] text-teal font-semibold">
                Central Bank Insured Escrow
              </span>
            </div>
          </div>

          {/* Col 2: For Customers */}
          <div>
            <h4 className="font-display font-bold text-[15px] mb-4 text-white">
              For Customers
            </h4>
            <ul className="flex flex-col gap-2.5 font-display text-[13px] text-white/75">
              <li>
                <Link href="/search" className="hover:text-orange transition-colors">
                  Find an Artisan
                </Link>
              </li>
              <li>
                <Link href="/price-estimator" className="hover:text-orange transition-colors">
                  Price Estimator
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-orange transition-colors">
                  Emergency Booking
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-orange transition-colors">
                  How Escrow Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Artisans */}
          <div>
            <h4 className="font-display font-bold text-[15px] mb-4 text-white">
              For Artisans
            </h4>
            <ul className="flex flex-col gap-2.5 font-display text-[13px] text-white/75">
              <li>
                <Link href="/join-as-artisan" className="hover:text-orange transition-colors">
                  Join as an Artisan
                </Link>
              </li>
              <li>
                <Link href="/artisan/finance" className="hover:text-orange transition-colors">
                  Artisan Finance Portal
                </Link>
              </li>
              <li>
                <Link href="/join-as-artisan#benefits" className="hover:text-orange transition-colors">
                  Benefits & Incentives
                </Link>
              </li>
              <li>
                <Link href="/supplier/register" className="hover:text-orange transition-colors">
                  Register as Material Supplier
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h4 className="font-display font-bold text-[15px] mb-4 text-white">
              Support
            </h4>
            <ul className="flex flex-col gap-2.5 font-display text-[13px] text-white/75">
              <li className="font-mono text-[12px]">
                📞 Help Desk: <a href="tel:08008090890" className="hover:text-orange">0800-NEXPLUMB</a>
              </li>
              <li className="font-mono text-[12px]">
                ✉️ Email: <a href="mailto:support@nexplumb.com" className="hover:text-orange">support@nexplumb.com</a>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-orange transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/disputes" className="hover:text-orange transition-colors">
                  Dispute Resolution Policies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Row */}
        <div className="flex items-center justify-between border-t border-white/10 mt-12 pt-8 flex-col sm:flex-row gap-4">
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-orange hover:text-white transition-colors" aria-label="Facebook">
              <Facebook size={16} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-orange hover:text-white transition-colors" aria-label="Twitter">
              <Twitter size={16} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-orange hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-orange hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-orange hover:text-white transition-colors" aria-label="YouTube">
              <Youtube size={16} />
            </a>
          </div>

          <div className="flex gap-6 font-mono text-[11px] text-slate-light opacity-70 flex-wrap justify-center">
            <a href="#" className="hover:underline">Terms & Conditions</a>
            <span>|</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:underline">Escrow Policy</a>
            <span>|</span>
            <a href="#" className="hover:underline">NDPA 2024 Compliance</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-4 border-t border-white/5 text-[11px] font-mono text-slate-light opacity-60">
          © 2026 Nexplumb Technology Ltd. All rights reserved. Lagos, Nigeria.
        </div>
      </div>
    </footer>
  )
}
export default Footer
