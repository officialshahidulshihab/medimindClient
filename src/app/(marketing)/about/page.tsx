import { Activity, FileText, Pill, Users, Brain, Heart, Shield } from 'lucide-react';
import Link from 'next/link';

const team = [
  { 
    name: 'Shahidul Islam Shihab', 
    role: 'Founder & Builder', 
    image: '/photo_2026-07-15_16-04-41.jpg',
    bio: 'Visionary engineer dedicated to bridging the gap between clinical expertise and cutting-edge artificial intelligence to revolutionize healthcare.' 
  }
];

const stats = [
  { label: 'Medical Errors Prevented Annually', value: '250k+' },
  { label: 'Medical Specialists in Network', value: '12+' },
  { label: 'AI-Powered Clinical Tools', value: '3' },
  { label: 'Cost to Users', value: '$0' },
];

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0EA5A0]/20 text-[#0EA5A0] mb-6">
          <Brain className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-6">About MediMind AI</h1>
        <p className="text-xl text-[#64748B] max-w-3xl mx-auto">
          We are building the future of clinical decision support — putting the power of AI in the hands of patients and clinicians to reduce diagnostic errors and improve health outcomes worldwide.
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20 items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-[#64748B] leading-relaxed mb-4">
            Every year, over 250,000 people in the US alone die from preventable medical errors. Many of these tragedies stem from delayed diagnoses, drug interaction oversights, and insufficient access to specialist knowledge.
          </p>
          <p className="text-[#64748B] leading-relaxed mb-4">
            MediMind AI bridges this critical gap by combining the clinical knowledge of world-class medical professionals with the processing power of modern AI — making intelligent clinical decision support accessible to everyone.
          </p>
          <p className="text-[#64748B] leading-relaxed">
            We are not a replacement for doctors. We are a powerful tool that empowers patients to have more informed conversations with their healthcare providers and helps clinicians make more confident decisions faster.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <Activity className="w-8 h-8 text-[#0EA5A0]" />, title: 'Symptom Intelligence', desc: 'AI-guided symptom assessment with urgency scoring' },
            { icon: <FileText className="w-8 h-8 text-[#0EA5A0]" />, title: 'Document Analysis', desc: 'Extract insights from medical records instantly' },
            { icon: <Pill className="w-8 h-8 text-[#0EA5A0]" />, title: 'Drug Safety', desc: 'Detect dangerous drug interactions automatically' },
            { icon: <Users className="w-8 h-8 text-[#0EA5A0]" />, title: 'Specialist Network', desc: 'Connect with verified medical professionals' },
          ].map((item, i) => (
            <div key={i} className="bg-[#1A2942] rounded-xl p-5 border border-[#64748B]/20">
              <div className="mb-3">{item.icon}</div>
              <h3 className="font-bold text-white mb-1">{item.title}</h3>
              <p className="text-[#64748B] text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-8 mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Why It Matters</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-extrabold text-[#0EA5A0] mb-2">{stat.value}</div>
              <div className="text-[#64748B] text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How AI helps */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How AI Transforms Healthcare</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Shield className="w-10 h-10 text-[#0EA5A0]" />, title: 'Reduces Diagnostic Errors', desc: 'AI cross-references thousands of conditions to suggest the most likely diagnoses, reducing the 1-in-3 misdiagnosis rate seen in traditional settings.' },
            { icon: <Heart className="w-10 h-10 text-[#0EA5A0]" />, title: 'Improves Patient Safety', desc: 'Drug interaction analysis catches dangerous combinations that are easy to miss when managing complex medication regimens for elderly or multi-condition patients.' },
            { icon: <Brain className="w-10 h-10 text-[#0EA5A0]" />, title: 'Democratizes Expertise', desc: 'Patients in underserved areas gain access to the equivalent of a specialist\'s second opinion, leveling the healthcare playing field globally.' },
          ].map((item, i) => (
            <div key={i} className="bg-[#1A2942] rounded-xl p-8 border border-[#64748B]/20 text-center">
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-[#64748B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Meet the Founder</h2>
        <p className="text-[#64748B] text-center max-w-2xl mx-auto mb-12">
          Dedicated to pushing the boundaries of AI in medicine.
        </p>
        <div className="flex justify-center">
          {team.map((member, i) => (
            <div key={i} className="bg-[#1A2942] rounded-xl p-8 border border-[#64748B]/20 text-center max-w-md w-full">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-[#0EA5A0]/20">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
              <p className="text-[#0EA5A0] font-medium mb-4">{member.role}</p>
              <p className="text-[#64748B] leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#0F1A2E] via-[#0EA5A0]/20 to-[#0F1A2E] rounded-xl border border-[#0EA5A0]/30 p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to experience the future of healthcare?</h2>
        <p className="text-[#64748B] mb-8 max-w-xl mx-auto">Start with a free symptom assessment or explore our verified specialist network today.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/symptom-checker" className="px-8 py-3 bg-[#0EA5A0] text-white font-semibold rounded-md hover:bg-[#0EA5A0]/90 transition-colors">
            Try Symptom Checker
          </Link>
          <Link href="/doctors" className="px-8 py-3 border border-[#64748B] text-white font-semibold rounded-md hover:bg-[#64748B]/20 transition-colors">
            Browse Doctors
          </Link>
        </div>
      </div>
    </div>
  );
}
