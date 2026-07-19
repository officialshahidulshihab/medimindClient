'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Practice',
  'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
  'Pulmonology', 'Urology'
];

export default function AddDoctorPage() {
  return <AddDoctorContent />;
}

function AddDoctorContent() {
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: '',
    specialty: '',
    location: '',
    consultationMode: 'In-person' as 'In-person' | 'Video' | 'Both',
    imageUrl: '',
  });
  const [subInput, setSubInput] = useState('');
  const [subSpecialties, setSubSpecialties] = useState<string[]>([]);
  const [error, setError] = useState('');



  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/doctors', { ...form, subSpecialties });
    },
    onSuccess: () => router.push('/admin/doctors'),
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create doctor')
  });

  const addSub = () => {
    const trimmed = subInput.trim();
    if (trimmed && !subSpecialties.includes(trimmed)) {
      setSubSpecialties(prev => [...prev, trimmed]);
    }
    setSubInput('');
  };

  const handleSubKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addSub(); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.specialty || !form.location) {
      setError('Name, specialty, and location are required.');
      return;
    }
    createMutation.mutate();
  };

  if (!session) return null;

  const inputClass = "w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#0EA5A0] transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Add New Doctor</h1>
        <p className="text-[#64748B]">Fill in the details to add a doctor to the directory.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#64748B] mb-1">Full Name *</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#64748B] mb-1">Specialty *</label>
          <select value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} required className={inputClass}>
            <option value="">Select a specialty</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#64748B] mb-1">Sub-Specialties</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={subInput}
              onChange={e => setSubInput(e.target.value)}
              onKeyDown={handleSubKeyDown}
              placeholder="Add sub-specialty and press Enter"
              className={inputClass + " flex-grow"}
            />
            <button type="button" onClick={addSub} className="px-3 py-2 bg-[#64748B]/20 border border-[#64748B]/30 text-white rounded-md hover:bg-[#0EA5A0]/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {subSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subSpecialties.map(sub => (
                <div key={sub} className="flex items-center gap-1.5 px-3 py-1 bg-[#0F1A2E] border border-[#64748B]/30 rounded-full text-sm text-white">
                  {sub}
                  <button type="button" onClick={() => setSubSpecialties(s => s.filter(x => x !== sub))}>
                    <X className="w-3 h-3 text-[#64748B] hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#64748B] mb-1">Location *</label>
          <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required placeholder="e.g., New York, NY" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#64748B] mb-1">Consultation Mode</label>
          <select value={form.consultationMode} onChange={e => setForm(f => ({ ...f, consultationMode: e.target.value as any }))} className={inputClass}>
            <option value="In-person">In-person</option>
            <option value="Video">Video</option>
            <option value="Both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#64748B] mb-1">Image URL</label>
          <input type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://example.com/photo.jpg" className={inputClass} />
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-grow py-3 bg-[#0EA5A0] text-white font-semibold rounded-md hover:bg-[#0EA5A0]/90 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {createMutation.isPending ? <LoadingSpinner className="w-5 h-5 text-white" /> : 'Add Doctor'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/doctors')}
            className="px-6 py-3 border border-[#64748B]/30 text-white rounded-md hover:bg-[#64748B]/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
