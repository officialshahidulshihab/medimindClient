'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Plus, Eye, Trash2, Users } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/components/ui/toast';

interface DoctorRow {
  _id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
}

export default function ManageDoctorsPage() {
  return <ManageDoctorsContent />;
}

function ManageDoctorsContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const toast = useToast();



  const { data: doctorsRes, isLoading } = useQuery({
    queryKey: ['doctors', 'all'],
    queryFn: async () => {
      const res = await api.get('/doctors?limit=100');
      return res.data.data as { doctors: DoctorRow[] };
    },
    enabled: !!session
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setConfirmId(null);
      toast.success('Doctor deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
      setConfirmId(null);
    }
  });

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Doctors</h1>
          <p className="text-[#64748B]">Doctors you have added to the directory.</p>
        </div>
        <Link
          href="/admin/doctors/add"
          className="px-4 py-2 bg-[#0EA5A0] text-white rounded-md hover:bg-[#0EA5A0]/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </Link>
      </div>

      {/* Confirm dialog */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Confirm Deletion</h3>
            <p className="text-[#64748B] mb-6">This action is irreversible. Are you sure you want to delete this doctor?</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(confirmId)}
                disabled={deleteMutation.isPending}
                className="flex-grow py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                {deleteMutation.isPending ? <LoadingSpinner className="w-4 h-4 text-white" /> : 'Delete'}
              </button>
              <button onClick={() => setConfirmId(null)} className="flex-grow py-2 border border-[#64748B]/30 text-white rounded-md hover:bg-[#64748B]/10 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1A2E] border-b border-[#64748B]/30">
                <th className="p-4 text-sm font-medium text-[#64748B]">Doctor</th>
                <th className="p-4 text-sm font-medium text-[#64748B]">Specialty</th>
                <th className="p-4 text-sm font-medium text-[#64748B]">Location</th>
                <th className="p-4 text-sm font-medium text-[#64748B]">Rating</th>
                <th className="p-4 text-sm font-medium text-[#64748B] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#64748B]/20">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5].map(j => (
                      <td key={j} className="p-4"><Skeleton className="h-5 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : !doctorsRes?.doctors || doctorsRes.doctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Users className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                    <p className="text-[#64748B]">You haven't added any doctors yet.</p>
                    <Link href="/admin/doctors/add" className="inline-block mt-4 text-[#0EA5A0] hover:underline">
                      Add your first doctor
                    </Link>
                  </td>
                </tr>
              ) : (
                doctorsRes.doctors.map(doctor => (
                  <tr key={doctor._id} className="hover:bg-[#64748B]/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0F1A2E] border border-[#64748B]/30 overflow-hidden flex-shrink-0">
                          {doctor.imageUrl ? (
                            <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                              <Users className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-white">{doctor.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#64748B]">{doctor.specialty}</td>
                    <td className="p-4 text-sm text-[#64748B]">{doctor.location}</td>
                    <td className="p-4">
                      <StarRating rating={doctor.rating} count={doctor.reviewCount} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="p-2 text-[#64748B] hover:text-[#0EA5A0] hover:bg-[#0EA5A0]/10 rounded-md transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmId(doctor._id)}
                          className="p-2 text-[#64748B] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
