'use client';

import { Activity, Brain, FileText } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section 
      id="how-it-works"
      style={{ background: 'var(--bg-page)', paddingTop: '96px', paddingBottom: '96px' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-[64px]">
          <div 
            style={{ 
              color: 'var(--teal)', 
              fontSize: '14px', 
              fontWeight: 600, 
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}
          >
            The Process
          </div>
          <h2 
            className="text-white"
            style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '48px', lineHeight: 1.1 }}
          >
            How MediMind Works
          </h2>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connector Line (Desktop only) */}
          <div 
            className="hidden md:block absolute" 
            style={{ 
              top: '32px', // half of icon container 64px
              left: '16.5%', 
              right: '16.5%', 
              height: '1px',
              borderTop: '1px dashed var(--teal)', 
              opacity: 0.4 
            }} 
          />

          {/* 3 Steps */}
          <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-0 relative z-10">
            {[
              { 
                icon: <Activity size={28} color="var(--teal)" />, 
                title: 'Input Symptoms', 
                desc: 'Describe your symptoms in natural language. The AI will ask clarifying questions.' 
              },
              { 
                icon: <Brain size={28} color="var(--teal)" />, 
                title: 'AI Analysis', 
                desc: 'Our clinical models process your input against thousands of medical data points.' 
              },
              { 
                icon: <FileText size={28} color="var(--teal)" />, 
                title: 'Receive Report', 
                desc: 'Get an urgency score and possible conditions, plus right specialist recommendations.' 
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div 
                  className="flex items-center justify-center"
                  style={{ 
                    width: '64px', height: '64px', 
                    borderRadius: '12px',
                    background: 'rgba(0,201,177,0.1)',
                    border: '1px solid rgba(0,201,177,0.2)'
                  }}
                >
                  {step.icon}
                </div>
                
                <h3 
                  className="text-white text-center"
                  style={{ 
                    fontFamily: 'var(--font-inter)', 
                    fontWeight: 600, 
                    fontSize: '18px', 
                    marginTop: '20px' 
                  }}
                >
                  {step.title}
                </h3>
                
                <p 
                  className="text-center"
                  style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-muted)',
                    maxWidth: '200px',
                    marginTop: '8px', 
                    lineHeight: 1.6
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
