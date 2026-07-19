'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AuthGuard from '@/components/auth-guard';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Check, X, MapPin, Star, Calendar, Search, Stethoscope, ArrowLeft, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function DoctorDashboardPage() {
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
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user as any;

  // Check if doctor has a linked profile
  const { data: doctorProfile = null, isLoading: isProfileLoading } = useQuery({
    queryKey: ['my-doctor-profile'],
    queryFn: async () => {
      try {
        const res = await api.get('/doctors/my-profile');
        return res.data.data;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
  });

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner className="w-8 h-8" style={{ color: 'var(--teal)' }} />
      </div>
    );
  }

  // No profile linked yet — show setup flow
  if (doctorProfile === null) {
    return <DoctorSetupFlow onLinked={() => queryClient.invalidateQueries({ queryKey: ['my-doctor-profile'] })} />;
  }

  // Profile linked — show full dashboard
  return <AppointmentsDashboard doctorProfile={doctorProfile} />;
}

// ─────────────────────────────────────────────
// SETUP FLOW (embedded in dashboard)
// ─────────────────────────────────────────────
function DoctorSetupFlow({ onLinked }: { onLinked: () => void }) {
  const toast = useToast();
  const [mode, setMode] = useState<'choose' | 'search' | 'create'>('choose');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', specialty: '', location: '', consultationMode: 'Both', subSpecialties: '' });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['doctors', 'search', debouncedQuery],
    queryFn: async () => {
      const res = await api.get(`/doctors?search=${encodeURIComponent(debouncedQuery)}`);
      return res.data.data.doctors as any[];
    },
    enabled: debouncedQuery.length > 2,
  });

  const linkMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/appointments/link-profile', { doctorId: selectedDoctorId });
    },
    onSuccess: onLinked,
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to link profile'),
  });

  const createAndLinkMutation = useMutation({
    mutationFn: async () => {
      const createRes = await api.post('/doctors/self-register', {
        name: form.name,
        specialty: form.specialty,
        location: form.location,
        consultationMode: form.consultationMode,
        subSpecialties: form.subSpecialties
          ? form.subSpecialties.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      });
      // Do NOT call /appointments/link-profile here.
      // self-register already assigns the userId to the new document, so it's linked natively.
    },
    onSuccess: onLinked,
    onError: (err: any) => setCreateError(err.response?.data?.message || 'Failed to create profile'),
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[#0EA5A0]/10 border border-[#0EA5A0]/20 flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-[#0EA5A0]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome, Doctor!</h1>
        <p className="text-[#64748B]">Set up your doctor profile to start receiving appointments.</p>
      </div>

      {mode === 'choose' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('search')}
            className="p-6 rounded-xl border-2 border-[#64748B]/20 bg-[#1A2942] hover:border-[#0EA5A0] transition-colors text-left group"
          >
            <Search className="w-8 h-8 text-[#0EA5A0] mb-3" />
            <h3 className="text-white font-semibold text-lg mb-1">Link Existing Profile</h3>
            <p className="text-[#64748B] text-sm">Admin already added you? Search and link your profile.</p>
          </button>
          <button
            onClick={() => setMode('create')}
            className="p-6 rounded-xl border-2 border-[#64748B]/20 bg-[#1A2942] hover:border-[#0EA5A0] transition-colors text-left group"
          >
            <Stethoscope className="w-8 h-8 text-[#0EA5A0] mb-3" />
            <h3 className="text-white font-semibold text-lg mb-1">List Yourself</h3>
            <p className="text-[#64748B] text-sm">Not in the directory yet? Create your own doctor profile.</p>
          </button>
        </div>
      )}

      {mode === 'search' && (
        <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setMode('choose')} className="text-[#64748B] hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-white font-semibold text-lg">Search Your Profile</h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
            <input
              type="text"
              placeholder="Search your name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5A0]"
            />
          </div>
          {debouncedQuery.length > 2 && (
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-8"><LoadingSpinner className="mx-auto w-8 h-8 opacity-50" /></div>
              ) : searchResults?.length === 0 ? (
                <p className="text-center py-8 text-[#64748B]">No profiles found. Try "List Yourself" instead.</p>
              ) : (
                searchResults?.map((doc: any) => (
                  <div
                    key={doc._id}
                    onClick={() => setSelectedDoctorId(doc._id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors flex items-center gap-4 ${
                      selectedDoctorId === doc._id
                        ? 'border-[#0EA5A0] bg-[#0EA5A0]/5'
                        : 'border-[#64748B]/20 hover:border-[#64748B]/50 bg-[#0F1A2E]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1A2942] flex-shrink-0 flex items-center justify-center text-xl font-bold text-[#0EA5A0] overflow-hidden">
                      {doc.imageUrl ? <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover" /> : doc.name.charAt(0)}
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
          {selectedDoctorId && (
            <button
              onClick={() => linkMutation.mutate()}
              disabled={linkMutation.isPending}
              className="w-full mt-6 py-3 bg-[#0EA5A0] text-white font-medium rounded-lg hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {linkMutation.isPending && <LoadingSpinner className="w-4 h-4 text-white" />}
              This is me — Link My Account
            </button>
          )}
        </div>
      )}

      {mode === 'create' && (
        <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setMode('choose')} className="text-[#64748B] hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-white font-semibold text-lg">Create Your Profile</h2>
          </div>

          <div>
            <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Full Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. John Smith"
              className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5A0]" />
          </div>

          <div>
            <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Specialty *</label>
            <select value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}
              className="w-full rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#0EA5A0] border border-[#64748B]/30"
              style={{ background: '#0F1A2E', color: 'white' }}>
              <option value="" style={{ background: '#0F1A2E' }}>Select specialty...</option>
              {['General Practice','Cardiology','Dermatology','Neurology','Psychiatry','Orthopedics','Pulmonology',
                'Endocrinology','Gynecology','Oncology','Pediatrics','Rheumatology','Nephrology','ENT',
                'Hematology','Ophthalmology','Gastroenterology','Urology'].map(s => (
                <option key={s} value={s} style={{ background: '#0F1A2E' }}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Location *</label>
            <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Chittagong, Bangladesh"
              className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5A0]" />
          </div>

          <div>
            <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Consultation Mode *</label>
            <div className="flex gap-3">
              {['In-person', 'Video', 'Both'].map(mode => (
                <button key={mode} type="button" onClick={() => setForm(p => ({ ...p, consultationMode: mode }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    form.consultationMode === mode
                      ? 'border-[#0EA5A0] bg-[#0EA5A0]/10 text-[#0EA5A0]'
                      : 'border-[#64748B]/30 text-[#64748B] hover:border-[#64748B]'
                  }`}>
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#64748B] mb-1 font-medium uppercase tracking-wider">Sub-specialties <span className="normal-case">(comma separated, optional)</span></label>
            <input type="text" value={form.subSpecialties} onChange={e => setForm(p => ({ ...p, subSpecialties: e.target.value }))} placeholder="e.g. Diabetes, Thyroid Disorders"
              className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#0EA5A0]" />
          </div>

          {createError && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{createError}</div>
          )}

          <button
            onClick={() => {
              if (!form.name || !form.specialty || !form.location) { setCreateError('Name, specialty and location are required'); return; }
              setCreateError('');
              createAndLinkMutation.mutate();
            }}
            disabled={createAndLinkMutation.isPending}
            className="w-full py-3 bg-[#0EA5A0] text-white font-medium rounded-lg hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createAndLinkMutation.isPending && <LoadingSpinner className="w-4 h-4 text-white" />}
            Create Profile & Continue
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// FULL APPOINTMENTS DASHBOARD
// ─────────────────────────────────────────────
function AppointmentsDashboard({ doctorProfile }: { doctorProfile: any }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'All' | 'pending' | 'confirmed' | 'cancelled'>('All');
  const toast = useToast();

  const { data: allAppointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', 'All'],
    queryFn: async () => {
      const res = await api.get('/appointments/doctor-dashboard');
      return res.data.data as any[];
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/appointments/${id}/status`, { status });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      toast.success(vars.status === 'confirmed' ? 'Appointment confirmed' : 'Appointment cancelled');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update appointment status');
    }
  });

  const stats = useMemo(() => {
    if (!allAppointments) return { total: 0, pending: 0, confirmed: 0 };
    return {
      total: allAppointments.length,
      pending: allAppointments.filter(a => a.status === 'pending').length,
      confirmed: allAppointments.filter(a => a.status === 'confirmed').length,
    };
  }, [allAppointments]);

  const displayedAppointments = useMemo(() => {
    if (!allAppointments) return [];
    if (filter === 'All') return allAppointments;
    return allAppointments.filter(a => a.status === filter);
  }, [allAppointments, filter]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-[32px] w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Doctor Dashboard</h1>
        <p className="text-[#64748B]">Manage your appointments and patient requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Appointments */}
        <div className="lg:col-span-8">
          <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 overflow-hidden">
            <div className="p-6 border-b border-[#64748B]/20">
              <h2 className="text-xl font-bold text-white mb-4">My Appointments</h2>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {(['All', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap capitalize ${
                      filter === f
                        ? 'bg-[#0EA5A0] text-white'
                        : 'bg-[#0F1A2E] text-[#64748B] hover:text-white border border-[#64748B]/30'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 space-y-4">
              {isLoading ? (
                <div className="text-center py-10"><LoadingSpinner className="mx-auto w-8 h-8 opacity-50" /></div>
              ) : displayedAppointments.length === 0 ? (
                <div className="text-center py-10 text-[#64748B]">
                  <Calendar className="mx-auto w-12 h-12 mb-4 opacity-20" />
                  No appointments found for this filter.
                </div>
              ) : (
                displayedAppointments.map(appointment => (
                  <div key={appointment._id} className="bg-[#0F1A2E] rounded-lg p-5 border border-[#64748B]/20 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                      {appointment.patientId?.image ? (
                        <img src={appointment.patientId.image} alt={appointment.patientId.name} className="w-12 h-12 rounded-full object-cover bg-[#1A2942]" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#1A2942] flex items-center justify-center text-lg font-bold text-[#0EA5A0]">
                          {appointment.patientId?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-medium text-lg">{appointment.patientId?.name || 'Unknown Patient'}</h3>
                        <p className="text-[#64748B] text-sm mb-2">{appointment.patientId?.email}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white">
                          <span>{format(new Date(appointment.appointmentDate), 'EEEE, MMM d yyyy')}</span>
                          <span className="text-[#0EA5A0] font-medium">{appointment.timeSlot}</span>
                          <Badge variant="outline">{appointment.consultationType}</Badge>
                        </div>
                        <p className="text-[#64748B] text-sm mt-3 bg-[#1A2942] p-3 rounded-md">
                          "{appointment.reason.length > 80 ? appointment.reason.substring(0, 80) + '...' : appointment.reason}"
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 min-w-[120px]">
                      {appointment.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                      {appointment.status === 'confirmed' && <Badge variant="success">Confirmed</Badge>}
                      {appointment.status === 'cancelled' && <Badge variant="outline" className="text-[#64748B] border-[#64748B]">Cancelled</Badge>}
                      {appointment.status === 'pending' && (
                        <div className="flex gap-2 mt-auto">
                          <button onClick={() => statusMutation.mutate({ id: appointment._id, status: 'confirmed' })} disabled={statusMutation.isPending}
                            className="w-10 h-10 rounded-md bg-[#0EA5A0]/10 text-[#0EA5A0] hover:bg-[#0EA5A0] hover:text-white transition-colors flex items-center justify-center disabled:opacity-50" title="Confirm">
                            <Check size={18} />
                          </button>
                          <button onClick={() => statusMutation.mutate({ id: appointment._id, status: 'cancelled' })} disabled={statusMutation.isPending}
                            className="w-10 h-10 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-50" title="Cancel">
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0F1A2E] rounded-lg p-4 border border-[#64748B]/30 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider font-medium">Total</div>
              </div>
              <div className="bg-[#0F1A2E] rounded-lg p-4 border border-[#0EA5A0]/30 text-center">
                <div className="text-3xl font-bold text-[#0EA5A0] mb-1">{stats.pending}</div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider font-medium">Pending</div>
              </div>
              <div className="bg-[#0F1A2E] rounded-lg p-4 border border-green-500/30 text-center col-span-2">
                <div className="text-3xl font-bold text-green-500 mb-1">{stats.confirmed}</div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider font-medium">Confirmed</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6">
            <h2 className="text-lg font-bold text-white mb-4">My Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#0F1A2E]">
                {doctorProfile.imageUrl ? (
                  <img src={doctorProfile.imageUrl} alt={doctorProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#0EA5A0]">
                    {doctorProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-white font-bold">{doctorProfile.name}</h3>
                <p className="text-[#0EA5A0] text-sm">{doctorProfile.specialty}</p>
                {!doctorProfile.verified && (
                  <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-2 py-0.5 mt-1 inline-block">Pending Verification</span>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm text-[#64748B]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><MapPin size={14} /> Location</span>
                <span className="text-white">{doctorProfile.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Star size={14} /> Rating</span>
                <span className="text-white">{doctorProfile.rating} ({doctorProfile.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <Link
            href="/settings"
            className="flex items-center justify-between bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6 hover:border-[#0EA5A0] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0F1A2E] flex items-center justify-center text-[#64748B] group-hover:text-[#0EA5A0] transition-colors">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">Settings</h3>
                <p className="text-[#64748B] text-sm">Manage account and preferences</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
