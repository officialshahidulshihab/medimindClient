'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [typingDots, setTypingDots] = useState([0, 1, 2]);

  return (
    <section 
      className="w-full flex items-center" 
      style={{ minHeight: '600px', height: '70vh', background: 'var(--bg-page)' }}
    >
      <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* LEFT COLUMN */}
        <div className="w-full md:w-[60%] flex flex-col items-start pt-16 md:pt-0">
          
          <div 
            className="flex items-center gap-2 mb-6"
            style={{ 
              background: 'rgba(0,201,177,0.1)', 
              border: '1px solid rgba(0,201,177,0.3)',
              color: 'var(--teal)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            <span style={{ color: 'var(--teal)' }}>●</span> AI-Powered Clinical Intelligence
          </div>

          <h1 
            className="mb-6 tracking-tight text-white" 
            style={{ 
              fontFamily: 'var(--font-sora)', 
              fontWeight: 700,
              fontSize: 'clamp(40px, 5vw, 64px)',
              lineHeight: 1.1
            }}
          >
            Understand Your Health.<br />
            <span style={{
              background: 'linear-gradient(135deg, #00C9B1, #4D94FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Before It's Too Late.
            </span>
          </h1>

          <p 
            className="mb-8"
            style={{ 
              fontSize: '16px', 
              color: 'var(--text-muted)',
              maxWidth: '480px',
              lineHeight: 1.6
            }}
          >
            MediMind analyzes your symptoms, reads your lab reports, 
            and checks drug interactions — powered by clinical AI 
            trained for real diagnosis support.
          </p>

          <div className="flex flex-row items-center gap-3">
            <Link href="/symptom-checker" className="btn-primary">
              Check My Symptoms →
            </Link>
            <Link href="#how-it-works" className="btn-ghost">
              See How It Works
            </Link>
          </div>

          <div 
            className="flex flex-row flex-wrap gap-5 mt-6"
            style={{ fontSize: '13px', color: 'var(--text-muted)' }}
          >
            <span>✓ Not a replacement for doctors</span>
            <span>✓ HIPAA-aware design</span>
            <span>✓ 12,000+ patients helped</span>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full md:w-[40%] relative flex justify-center md:justify-end">
          
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              background: 'radial-gradient(circle at 50% 50%, rgba(0,201,177,0.08) 0%, transparent 70%)' 
            }} 
          />

          <div 
            className="ai-glow-border relative z-10 w-full"
            style={{ 
              background: 'var(--bg-surface)', 
              padding: '20px', 
              maxWidth: '420px' 
            }}
          >
            <div className="flex items-center gap-2 mb-6 border-b pb-4" style={{ borderColor: 'var(--border-opacity)' }}>
              <div className="pulse-dot" />
              <span className="text-white text-sm font-semibold">AI Symptom Analysis</span>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              
              <div 
                className="self-end max-w-[85%]" 
                style={{ 
                  background: 'var(--bg-elevated)', 
                  borderRadius: '12px 12px 4px 12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: 'white'
                }}
              >
                I have had a headache for 3 days and mild fever
              </div>

              <div 
                className="self-start max-w-[85%]" 
                style={{ 
                  background: 'var(--bg-page)', 
                  borderLeft: '3px solid var(--teal)',
                  borderRadius: '12px 12px 12px 4px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: 'white'
                }}
              >
                I understand. Is the headache on one side or both sides?
              </div>

              <div 
                className="self-start"
                style={{ 
                  background: 'var(--bg-page)', 
                  borderLeft: '3px solid var(--teal)',
                  borderRadius: '12px 12px 12px 4px',
                  padding: '16px',
                  display: 'flex',
                  gap: '4px'
                }}
              >
                {typingDots.map(i => (
                  <div 
                    key={i}
                    style={{
                      width: '6px', height: '6px',
                      background: 'var(--teal)',
                      borderRadius: '50%',
                      animation: 'translateY 0.6s infinite',
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>

            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-opacity)' }}>
              <div className="h-1.5 w-full bg-elevated rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-full bg-teal rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ background: 'var(--teal)', width: '70%', transition: 'width 2s' }} />
              </div>
              <div style={{ color: 'var(--teal)', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                Analyzing symptoms...
              </div>
            </div>

          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes translateY {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}} />
        </div>
        
      </div>
    </section>
  );
}
