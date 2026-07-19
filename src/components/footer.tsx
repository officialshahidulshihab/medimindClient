import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F1A2E] border-t border-[#64748B]/30 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[#0EA5A0]" />
              <span className="text-lg font-bold text-white">MediMind <span className="text-[#0EA5A0]">AI</span></span>
            </Link>
            <p className="text-sm text-[#64748B] max-w-xs leading-relaxed">
              AI-powered clinical decision support for patients and clinicians. Reducing diagnostic errors one insight at a time.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li><Link href="/symptom-checker" className="hover:text-[#0EA5A0] transition-colors">Symptom Checker</Link></li>
              <li><Link href="/drug-checker" className="hover:text-[#0EA5A0] transition-colors">Drug Interaction Checker</Link></li>
              <li><Link href="/health-records" className="hover:text-[#0EA5A0] transition-colors">Health Records</Link></li>
              <li><Link href="/doctors" className="hover:text-[#0EA5A0] transition-colors">Find a Doctor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li><Link href="/about" className="hover:text-[#0EA5A0] transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-[#0EA5A0] transition-colors">Blog</Link></li>
              <li><Link href="/auth/login" className="hover:text-[#0EA5A0] transition-colors">Login</Link></li>
              <li><Link href="/auth/register" className="hover:text-[#0EA5A0] transition-colors">Register</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#64748B]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#64748B]">
            &copy; {new Date().getFullYear()} MediMind AI. All rights reserved. Not a substitute for professional medical advice.
          </p>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
