'use client';

export default function StatsBar() {
  const stats = [
    { value: '250,000+', label: 'Medical errors prevented annually' },
    { value: '3', label: 'AI models working together' },
    { value: '12,000+', label: 'Patients helped' },
    { value: '98.2%', label: 'Symptom match accuracy' },
  ];

  return (
    <div 
      className="w-full" 
      style={{ 
        background: '#0B1426', 
        paddingTop: '48px', 
        paddingBottom: '48px',
        borderTop: '1px solid rgba(77,96,127,0.3)',
        borderBottom: '1px solid rgba(77,96,127,0.3)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 text-center md:text-left">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-row items-center w-full md:w-auto justify-center md:justify-start">
            
            <div className="flex flex-col items-center md:items-start">
              <div 
                style={{ 
                  fontFamily: 'var(--font-sora)', 
                  fontWeight: 700, 
                  fontSize: '36px', 
                  color: 'var(--teal)',
                  lineHeight: 1
                }}
              >
                {stat.value}
              </div>
              <div 
                style={{ 
                  fontFamily: 'var(--font-inter)', 
                  fontSize: '14px', 
                  color: 'var(--text-muted)', 
                  marginTop: '4px' 
                }}
              >
                {stat.label}
              </div>
            </div>

            {index < stats.length - 1 && (
              <div 
                className="hidden md:block mx-12 self-center" 
                style={{ 
                  height: '48px', 
                  borderLeft: '1px solid rgba(77,96,127,0.5)' 
                }} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
