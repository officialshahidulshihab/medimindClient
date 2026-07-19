'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, ScanLine, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIFeatures() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      title: 'Symptom Checker',
      desc: 'An interactive AI chat that analyzes symptoms, determines urgency from 1–10, and recommends the right specialist for your condition.',
      icon: <Brain size={28} color="#00C9B1" />,
      bgGradient: 'linear-gradient(135deg, rgba(0,201,177,0.2), rgba(77,148,255,0.2))',
      href: '/symptom-checker'
    },
    {
      title: 'Document Intelligence',
      desc: 'Upload lab results, MRI reports, or prescriptions. Gemini AI extracts abnormal flags, key findings, and clear action items instantly.',
      icon: <ScanLine size={28} color="#8250FF" />,
      bgGradient: 'linear-gradient(135deg, rgba(130,80,255,0.2), rgba(0,201,177,0.2))',
      href: '/health-records'
    },
    {
      title: 'Drug Checker',
      desc: 'Enter all your current medications and detect dangerous interactions, severity levels, and critical safety flags before they cause harm.',
      icon: <Shield size={28} color="#FFB545" />,
      bgGradient: 'linear-gradient(135deg, rgba(255,181,69,0.2), rgba(255,77,106,0.2))',
      href: '/drug-checker'
    }
  ];

  return (
    <section 
      style={{ background: 'var(--bg-surface)', paddingTop: '96px', paddingBottom: '96px' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-[48px]">
          <h2 className="text-white mb-2" style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '40px' }}>
            Three AI Engines. One Platform.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
            Advanced clinical AI models designed for different medical needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div 
              key={i}
              className={cn(
                "card flex flex-col p-[28px] h-full",
                hoveredCard === i ? "ai-glow-border" : ""
              )}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              
              <div 
                className="flex items-center justify-center mb-5"
                style={{ 
                  width: '64px', height: '64px', 
                  borderRadius: '12px',
                  background: feature.bgGradient
                }}
              >
                {feature.icon}
              </div>

              <h3 
                className="text-white mb-2"
                style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '18px' }}
              >
                {feature.title}
              </h3>

              <p 
                className="flex-grow"
                style={{ 
                  fontFamily: 'var(--font-inter)', 
                  fontWeight: 400, 
                  fontSize: '14px', 
                  color: 'var(--text-muted)', 
                  lineHeight: 1.6 
                }}
              >
                {feature.desc}
              </p>

              <Link 
                href={feature.href}
                className="mt-auto pt-5 hover:underline"
                style={{ color: 'var(--teal)', fontSize: '14px', fontWeight: 500 }}
              >
                Try Now →
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
