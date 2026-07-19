'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DoctorCard, DoctorCardSkeleton, DoctorType } from '@/components/ui/doctor-card';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useToast } from '@/components/ui/toast';

// Fetch function
const fetchDoctors = async (params: {
  search: string
  location: string  
  consultationMode: string
  page: number
}): Promise<DoctorsResponse> => {
  const { data } = await api.get("/doctors", { params })
  return data.data // { doctors: [], total: 0, page: 1 }
}

interface DoctorsResponse {
  doctors: DoctorType[];
  pagination: { total: number; page: number; pages: number };
}

export default function DoctorsDirectory() {
  const { data: session } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [location, setLocation] = useState("");
  const [consultationMode, setConsultationMode] = useState("");
  const [sort, setSort] = useState("Highest Rated");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: doctorsData, isLoading, isError, error } = useQuery({
    queryKey: ["doctors", debouncedSearch, location, consultationMode, page],
    queryFn: () => fetchDoctors({ 
      search: debouncedSearch, 
      location, 
      consultationMode, 
      page 
    })
  });
  
 

  const doctors = doctorsData?.doctors ?? [];
  const total = doctorsData?.pagination?.total ?? 0;

  const { data: bookmarksRes } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: async () => {
      const res = await api.get('/bookmarks');
      return res.data.data;
    },
    enabled: !!session
  });
  
  const bookmarkedIds = bookmarksRes?.map((b: any) => 
    typeof b.doctorId === 'object' ? b.doctorId._id : b.doctorId
  ) || [];

  const toggleBookmark = useMutation({
    mutationFn: async (doctorId: string) => {
      const res = await api.post('/bookmarks/toggle', { doctorId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookmarks'] });
      if (data.data.bookmarked) {
        toast.success('Doctor saved');
      } else {
        toast.success('Bookmark removed');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to toggle bookmark');
    }
  });

  const handleBookmarkToggle = (e: React.MouseEvent, doctorId: string) => {
    e.preventDefault();
    if (!session) {
      toast.info('Please log in to save doctors');
      return;
    }
    toggleBookmark.mutate(doctorId);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Page Header */}
      <div style={{ background: 'var(--bg-surface)', paddingTop: '48px', paddingBottom: '48px' }}>
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <h1 className="text-white" style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '40px', lineHeight: 1.2 }}>
            Doctor Directory
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            Find and book the right specialist for your needs.
          </p>

          {/* Filter Bar */}
          <div className="mt-[24px] flex flex-col md:flex-row gap-3 flex-wrap">
            
            {/* Search Input */}
            <div className="relative flex-grow min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} color="var(--text-disabled)" />
              <input
                type="text"
                className="input-field w-full pl-10"
                placeholder="Search by name or specialty..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Location Select */}
            <div className="w-full md:w-[200px]">
              <select 
                className="input-field w-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234D607F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                }}
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              >
                <option value="">All Locations</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
                <option value="Houston">Houston</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Consultation Select */}
            <div className="w-full md:w-[180px]">
              <select 
                className="input-field w-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234D607F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                }}
                value={consultationMode}
                onChange={(e) => { setConsultationMode(e.target.value); setPage(1); }}
              >
                <option value="">All Types</option>
                <option value="In-person">In-person</option>
                <option value="Video">Video</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="w-full md:w-[160px]">
              <select 
                className="input-field w-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234D607F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="Highest Rated">Highest Rated</option>
                <option value="Most Reviewed">Most Reviewed</option>
                <option value="Newest">Newest</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Doctor Grid Section */}
      <div className="max-w-7xl mx-auto px-6 w-full py-[48px]">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <XCircle size={48} color="var(--danger)" className="mb-4" />
            <p style={{ color: 'var(--danger)', fontSize: '18px' }}>Error loading doctors. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-[24px] justify-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => <DoctorCardSkeleton key={i} />)
              ) : doctors.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <Search size={48} color="var(--text-disabled)" className="mb-4" />
                  <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>No doctors found matching your criteria.</p>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <DoctorCard 
                    key={doctor._id} 
                    doctor={doctor} 
                    isBookmarked={bookmarkedIds.includes(doctor._id)}
                    onBookmarkToggle={(e) => handleBookmarkToggle(e, doctor._id)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {doctorsData && doctorsData.pagination.pages > 1 && (
              <div className="mt-[48px] flex items-center justify-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="btn-ghost"
                  style={{ height: '36px', padding: '0 16px', opacity: page === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                
                <div className="flex gap-2">
                  {[...Array(doctorsData.pagination.pages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === doctorsData.pagination.pages || Math.abs(page - p) <= 1) {
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={page === p ? "btn-primary" : "btn-ghost"}
                          style={{ height: '36px', width: '36px', padding: 0, justifyContent: 'center' }}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (Math.abs(page - p) === 2) {
                      return <span key={p} style={{ color: 'var(--text-disabled)', alignSelf: 'center' }}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  disabled={page === doctorsData.pagination.pages}
                  onClick={() => setPage(p => Math.min(doctorsData.pagination.pages, p + 1))}
                  className="btn-ghost"
                  style={{ height: '36px', padding: '0 16px', opacity: page === doctorsData.pagination.pages ? 0.5 : 1 }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
