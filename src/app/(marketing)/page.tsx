'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DoctorCard, DoctorType } from '@/components/ui/doctor-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight, Activity, FileText, Pill,
  Stethoscope, ChevronDown, Users, Star
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ['doctors', 'preview'],
    queryFn: async () => {
      const res = await api.get('/doctors?limit=4');
      return res.data.data as { doctors: DoctorType[] };
    }
  });

  console.log("doctorsData:", doctorsData);
  const doctors = doctorsData?.doctors ?? [];

  return (
    <div className="flex flex-col w-full">

      {/* ── SECTION 1: HERO ── */}
      <section className="relative min-h-[65vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Animated gradient orb */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#0EA5A0]/10 blur-[120px] animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0EA5A0]/30 bg-[#0EA5A0]/10 text-[#0EA5A0] text-sm font-medium mb-8">
            <Activity className="w-4 h-4" />
            AI-powered clinical support — 100% free
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
            AI-Powered{' '}
            <span className="text-[#0EA5A0]">Clinical</span>{' '}
            Intelligence
          </h1>

          <p className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Reduce diagnostic errors with intelligent symptom analysis, medical document
            understanding, and drug interaction detection.
          </p>

          <div className="flex flex-row items-center justify-center gap-4">
            <Link
              href="/symptom-checker"
              className="px-6 py-3 bg-[#0EA5A0] hover:bg-[#0D9490] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#0EA5A0]/20 hover:shadow-[#0EA5A0]/30 flex items-center gap-2"
            >
              Start Symptom Check <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/doctors"
              className="px-6 py-3 border border-[#1E3A5F] hover:border-[#0EA5A0]/50 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-white/5"
            >
              Explore Doctors
            </Link>
          </div>
        </div>

        <a href="#how-it-works" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#475569] hover:text-[#94A3B8] transition-colors animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* ── SECTION 2: HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-[#1A2744]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#0EA5A0] text-sm font-semibold tracking-wider uppercase mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
          </div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-center gap-8 md:gap-0">
            {/* Connecting dashed line — desktop only */}
            <div className="hidden md:block absolute top-8 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px border-t border-dashed border-[#0EA5A0]/30 z-0" />

            {[
              { step: 1, icon: <Activity className="w-5 h-5" />, title: 'Input Symptoms', desc: 'Describe what you are feeling in natural language.' },
              { step: 2, icon: <Stethoscope className="w-5 h-5" />, title: 'AI Analysis', desc: 'Our Groq-powered AI processes your clinical context.' },
              { step: 3, icon: <FileText className="w-5 h-5" />, title: 'Get Report', desc: 'Receive urgency score and recommended specialty.' },
              { step: 4, icon: <Users className="w-5 h-5" />, title: 'See Doctor', desc: 'Connect with a verified specialist in our directory.' },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center flex-1 z-10 px-4">
                <div className="w-16 h-16 rounded-full bg-[#0F1A2E] border-2 border-[#0EA5A0]/50 flex items-center justify-center text-[#0EA5A0] mb-4 relative">
                  {item.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0EA5A0] text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed max-w-[180px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: AI FEATURES ── */}
      <section className="py-24 bg-[#0F1A2E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#0EA5A0] text-sm font-semibold tracking-wider uppercase mb-3">Powered by AI</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Three Powerful Tools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Activity className="w-6 h-6 text-[#0EA5A0]" />,
                title: 'Symptom Intelligence Engine',
                desc: 'An interactive AI chat that analyzes symptoms, determines urgency from 1–10, and recommends the right specialist for your condition.',
                href: '/symptom-checker',
              },
              {
                icon: <FileText className="w-6 h-6 text-[#0EA5A0]" />,
                title: 'Medical Document Analysis',
                desc: 'Upload lab results, MRI reports, or prescriptions. Gemini AI extracts abnormal flags, key findings, and clear action items instantly.',
                href: '/health-records',
              },
              {
                icon: <Pill className="w-6 h-6 text-[#0EA5A0]" />,
                title: 'Drug Interaction Checker',
                desc: 'Enter all your current medications and detect dangerous interactions, severity levels, and critical safety flags before they cause harm.',
                href: '/drug-checker',
              },
            ].map((card, i) => (
              <div key={i} className="bg-[#1A2744] border border-[#1E3A5F] rounded-xl p-7 flex flex-col hover:border-[#0EA5A0]/40 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-xl bg-[#0EA5A0]/10 flex items-center justify-center mb-5 group-hover:bg-[#0EA5A0]/20 transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed flex-grow">{card.desc}</p>
                <Link href={card.href} className="inline-flex items-center gap-2 text-[#0EA5A0] text-sm font-medium mt-6 hover:gap-3 transition-all">
                  Try Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: DOCTOR PREVIEW ── */}
      <section className="py-24 bg-[#1A2744]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[#0EA5A0] text-sm font-semibold tracking-wider uppercase mb-3">Specialist Network</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Find the Right Specialist</h2>
            </div>
            <Link
              href="/doctors"
              className="self-start sm:self-auto px-5 py-2.5 border border-[#0EA5A0] text-[#0EA5A0] rounded-lg hover:bg-[#0EA5A0]/10 transition-colors text-sm font-medium flex items-center gap-2"
            >
              View All Doctors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {isLoading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-[#1A2744] rounded-xl border border-[#1E3A5F] p-6">
                    <Skeleton className="h-14 w-14 rounded-full mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-8 w-24 mt-4" />
                  </div>
                ))
              : doctors?.map((doctor: any) => (
                  <DoctorCard key={doctor._id} doctor={doctor} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── SECTION 5: STATS ── */}
      <section className="py-20 bg-[#0F1A2E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { value: '250k+', label: 'Medical Errors/Year Preventable' },
              { value: '12+', label: 'Verified Specialists' },
              { value: '3', label: 'AI Clinical Tools' },
              { value: '$0', label: 'Cost to You' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1A2744] border border-[#1E3A5F] rounded-xl p-6 text-center">
                <div className="text-4xl font-extrabold text-[#0EA5A0] mb-2">{stat.value}</div>
                <div className="text-[#94A3B8] text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: TESTIMONIALS ── */}
      <section className="py-24 bg-[#1A2744]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#0EA5A0] text-sm font-semibold tracking-wider uppercase mb-3">User Stories</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">What People Are Saying</h2>
          </div>

          <div className="flex overflow-x-auto gap-5 pb-4 sm:grid sm:grid-cols-3 scrollbar-none">
            {[
              { name: 'Sarah J.', role: 'Patient', quote: 'The symptom checker accurately flagged my thyroid issue and suggested an endocrinologist weeks before my GP would have referred me.', rating: 5 },
              { name: 'Michael T.', role: 'Family Caregiver', quote: 'Uploading my father\'s complex medical history and getting a clean AI-generated summary was genuinely life-changing for managing his care.', rating: 5 },
              { name: 'Elena R.', role: 'Chronic Illness Patient', quote: 'The drug interaction checker caught a moderate risk between two of my new prescriptions that both my doctor and pharmacist had missed.', rating: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-[#1A2744] border border-[#1E3A5F] rounded-xl p-7 min-w-[280px] sm:min-w-0 flex flex-col">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white leading-relaxed mb-6 flex-grow text-sm">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-[#1E3A5F]">
                  <div className="w-9 h-9 rounded-full bg-[#0EA5A0]/20 flex items-center justify-center text-[#0EA5A0] font-bold text-sm flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-[#475569]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FAQ ── */}
      <section className="py-24 bg-[#0F1A2E]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#0EA5A0] text-sm font-semibold tracking-wider uppercase mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Common Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'Is MediMind AI a replacement for a real doctor?', a: 'No. MediMind AI is a clinical decision support tool. It helps you understand symptoms and prepare for doctor visits, but all medical decisions must be made by a licensed healthcare professional.' },
              { q: 'How accurate is the Document Intelligence feature?', a: 'It uses Gemini 1.5 Flash to analyze uploaded lab results, MRI reports, and other documents. It highlights abnormal values and action items, but clinical validation is always recommended.' },
              { q: 'Is my health data private and secure?', a: 'Yes. Your data is stored in encrypted cloud databases and is never sold or shared with third parties. You have full control to delete your records at any time.' },
              { q: 'Can I book appointments through MediMind AI?', a: 'Currently we act as a specialist directory. You can view profiles, locations, and consultation modes to contact doctors directly. In-app booking is on our roadmap.' },
              { q: 'How does the Drug Interaction Checker work?', a: 'Enter your medications and our Groq-powered AI analyzes them against pharmacological knowledge to identify severity levels, interaction descriptions, and danger flags.' },
            ].map((faq, i) => (
              <div key={i} className="bg-[#1A2744] border border-[#1E3A5F] rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left group focus:outline-none"
                >
                  <span className="font-medium text-white text-sm leading-snug pr-4">{faq.q}</span>
                  <ChevronDown className={cn("w-5 h-5 text-[#0EA5A0] flex-shrink-0 transition-transform duration-200", activeFaq === i ? "rotate-180" : "")} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-[#94A3B8] text-sm leading-relaxed border-t border-[#1E3A5F] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: CTA BANNER ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1A2E] via-[#0EA5A0]/15 to-[#0F1A2E]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%230EA5A0%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to take control<br />of your health?
          </h2>
          <p className="text-[#94A3B8] text-lg mb-10">
            Join thousands of users who use MediMind AI for smarter clinical decisions every day.
          </p>
          <div className="flex flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-3.5 bg-[#0EA5A0] hover:bg-[#0D9490] text-white font-bold rounded-lg transition-all hover:scale-105 shadow-lg shadow-[#0EA5A0]/20"
            >
              Get Started Free
            </Link>
            <Link
              href="/about"
              className="px-8 py-3.5 border border-[#1E3A5F] hover:border-[#0EA5A0]/50 text-[#94A3B8] hover:text-white font-medium rounded-lg transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
