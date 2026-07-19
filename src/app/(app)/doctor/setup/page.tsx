'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AuthGuard from '@/components/auth-guard';
import { Search, MapPin, Star } from 'lucide-react';

export default function DoctorSetupPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace('/auth/login');
      return;
    }
    const user = session.user as any;
    if (user.role !== 'doctor') {
      router.replace('/dashboard');
    }
  }, [session, isPending, router]);

  if (isPending) return null;

  const user = session?.user as any;
  if (!user || user.role !== 'doctor') return null;

  return (
    <AuthGuard>
      <SetupContent />
    </AuthGuard>
  );
}

function SetupContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    location: '',
    consultationMode: 'Both',
    subSpecialties: '',
  });
  const [createError, setCreateError] = useState('');

  // Check on mount whether this doctor already has a linked profile
  const { isLoading: isCheckingProfile, isSuccess: alreadyLinked } = useQuery({
    queryKey: ['check-doctor-profile'],
    queryFn: async () => {
      const res = await api.get('/appointments/doctor-dashboard');
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (alreadyLinked) {
      router.replace('/doctor/dashboard');
    }
  }, [alreadyLinked, router]);

  // Debounce search — must be declared before any early return (Rules of Hooks)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['doctors', 'search', debouncedQuery],
    queryFn: async () => {
      const res = await api.get(`/doctors?search=${encodeURIComponent(debouncedQuery)}`);
      return res.data.data.doctors;
    },
    enabled: debouncedQuery.length > 2,
  });

  // Early return AFTER all hooks
  if (isCheckingProfile || alreadyLinked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8" style={{ color: '#0EA5A0' }} />
      </div>
    );
  }

  const linkMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/appointments/link-profile', { doctorId: selectedDoctor });
    },
    onSuccess: () => {
      router.push('/doctor/dashboard');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to link profile');
    }
  });

  const createAndLinkMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Create the doctor document
      const createRes = await api.post('/doctors/self-register', {
        name: form.name,
        specialty: form.specialty,
        location: form.location,
        consultationMode: form.consultationMode,
        subSpecialties: form.subSpecialties
          ? form.subSpecialties.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      });
      // Step 2: Not needed! selfRegisterDoctor natively links the user by assigning userId at creation.
      // Do NOT call /appointments/link-profile here.
    },
    onSuccess: () => {
      router.push('/doctor/dashboard');
    },
    onError: (error: any) => {
      setCreateError(error.response?.data?.message || 'Failed to create profile');
    }
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Complete Your Doctor Profile</h1>
        <p className="text-[#64748B]">Search for your name in our directory to link your account</p>
      </div>

      <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
          <input
            type="text"
            placeholder="Search your name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5A0]"
          />
        </div>

        {debouncedQuery.length > 2 && (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {isSearching ? (
              <div className="text-center py-8">
                <LoadingSpinner className="mx-auto w-8 h-8 opacity-50" />
              </div>
            ) : searchResults?.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                <p className="mb-4">No doctors found matching "{debouncedQuery}"</p>
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setForm(prev => ({ ...prev, name: debouncedQuery }));
                  }}
                  className="px-5 py-2 rounded-lg border border-[#0EA5A0] text-[#0EA5A0] text-sm font-medium hover:bg-[#0EA5A0]/10 transition-colors"
                >
                  + List yourself as a new doctor
                </button>
              </div>
            ) : (
              searchResults?.map((doc: any) => (
                <div
                  key={doc._id}
                  onClick={() => setSelectedDoctor(doc._id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors flex items-center gap-4 ${
                    selectedDoctor === doc._id 
                      ? 'border-[#0EA5A0] bg-[#0EA5A0]/5' 
                      : 'border-[#64748B]/20 hover:border-[#64748B]/50 bg-[#0F1A2E]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#1A2942] flex-shrink-0 flex items-center justify-center text-xl font-bold text-[#0EA5A0] overflow-hidden">
                    {doc.imageUrl ? (
                      <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover" />
                    ) : (
                      doc.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{doc.name}</h3>
                    <p className="text-[#0EA5A0] text-sm">{doc.specialty}</p>
                    <div className="flex items-center gap-3 mt-1 text-[#64748B] text-xs">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {doc.location}</span>
                      <span className="flex items-center gap-1"><Star size={12} className="text-[#F59E0B]" /> {doc.rating}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showCreateForm && (
          <div className="mt-6 border-t border-[#64748B]/20 pt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-lg">Create Your Profile</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-[#64748B] hover:text-white text-sm"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Dr. John Smith"
                className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5A0]"
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Specialty *</label>
              <select
                value={form.specialty}
                onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}
                className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#0EA5A0]"
                style={{ background: '#0F1A2E', color: 'white' }}
              >
                <option value="" style={{ background: '#0F1A2E', color: 'white' }}>Select specialty...</option>
                {[
                  'General Practice','Cardiology','Dermatology','Neurology','Psychiatry',
                  'Orthopedics','Pulmonology','Endocrinology','Gynecology','Oncology',
                  'Pediatrics','Rheumatology','Nephrology','ENT','Hematology',
                  'Ophthalmology','Gastroenterology','Urology'
                ].map(s => (
                  <option key={s} value={s} style={{ background: '#0F1A2E', color: 'white' }}>{s}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Chittagong, Bangladesh"
                className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5A0]"
              />
            </div>

            {/* Consultation Mode */}
            <div>
              <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Consultation Mode *</label>
              <div className="flex gap-3">
                {['In-person', 'Video', 'Both'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, consultationMode: mode }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      form.consultationMode === mode
                        ? 'border-[#0EA5A0] bg-[#0EA5A0]/10 text-[#0EA5A0]'
                        : 'border-[#64748B]/30 text-[#64748B] hover:border-[#64748B]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Specialties */}
            <div>
              <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Sub-specialties <span className="normal-case">(comma separated, optional)</span></label>
              <input
                type="text"
                value={form.subSpecialties}
                onChange={e => setForm(p => ({ ...p, subSpecialties: e.target.value }))}
                placeholder="e.g. Diabetes, Thyroid Disorders"
                className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5A0]"
              />
            </div>

            {createError && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {createError}
              </div>
            )}

            <button
              onClick={() => {
                if (!form.name || !form.specialty || !form.location) {
                  setCreateError('Name, specialty and location are required');
                  return;
                }
                setCreateError('');
                createAndLinkMutation.mutate();
              }}
              disabled={createAndLinkMutation.isPending}
              className="w-full py-3 bg-[#0EA5A0] text-white font-medium rounded-lg hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createAndLinkMutation.isPending ? <LoadingSpinner className="w-4 h-4 text-white" /> : null}
              Create Profile & Continue
            </button>
          </div>
        )}

        {selectedDoctor && !showCreateForm && (
          <button
            onClick={() => linkMutation.mutate()}
            disabled={linkMutation.isPending}
            className="w-full mt-6 py-3 bg-[#0EA5A0] text-white font-medium rounded-md hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {linkMutation.isPending ? <LoadingSpinner className="mr-2 w-4 h-4 text-white" /> : null}
            This is me — Link My Account
          </button>
        )}
      </div>
    </div>
  );
}
