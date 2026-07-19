'use client';

import { useSession } from '@/lib/auth-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Calendar, Check, X, Clock, Video, Users } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface AppointmentRow {
  _id: string;
  patientId: { _id: string; name: string; email: string };
  doctorId: { _id: string; name: string; specialty: string };
  appointmentDate: string;
  timeSlot: string;
  consultationType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export default function AdminAppointmentsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: appointmentsRes, isLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const res = await api.get('/admin/appointments');
      return res.data.data as AppointmentRow[];
    },
    enabled: !!session
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/appointments/${id}/status`, { status });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success(vars.status === 'confirmed' ? 'Appointment confirmed' : 'Appointment cancelled');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  });

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Appointments</h1>
        <p className="text-[#64748B]">Manage all appointments across the platform.</p>
      </div>

      <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1A2E] border-b border-[#64748B]/30">
                <th className="p-4 text-sm font-medium text-[#64748B]">Patient</th>
                <th className="p-4 text-sm font-medium text-[#64748B]">Doctor</th>
                <th className="p-4 text-sm font-medium text-[#64748B]">Date & Time</th>
                <th className="p-4 text-sm font-medium text-[#64748B]">Type</th>
                <th className="p-4 text-sm font-medium text-[#64748B]">Status</th>
                <th className="p-4 text-sm font-medium text-[#64748B] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#64748B]/20">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map(j => (
                      <td key={j} className="p-4"><Skeleton className="h-5 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : !appointmentsRes || appointmentsRes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                    <p className="text-[#64748B]">No appointments found.</p>
                  </td>
                </tr>
              ) : (
                appointmentsRes.map(appointment => (
                  <tr key={appointment._id} className="hover:bg-[#64748B]/5 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{appointment.patientId?.name || 'Unknown Patient'}</span>
                        <span className="text-xs text-[#64748B]">{appointment.patientId?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">Dr. {appointment.doctorId?.name || 'Unknown Doctor'}</span>
                        <span className="text-xs text-[#64748B]">{appointment.doctorId?.specialty || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white">{format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}</span>
                        <span className="text-xs text-[#64748B] flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {appointment.timeSlot}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <Badge variant="outline" className="flex items-center gap-1 w-fit bg-[#0F1A2E]">
                        {appointment.consultationType === 'Video' ? <Video size={12} /> : <Users size={12} />}
                        {appointment.consultationType}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={appointment.status === 'confirmed' ? 'success' : appointment.status === 'pending' ? 'warning' : 'outline'}
                        className="capitalize"
                      >
                        {appointment.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {appointment.status !== 'cancelled' && appointment.status !== 'confirmed' && (
                          <button
                            onClick={() => statusMutation.mutate({ id: appointment._id, status: 'confirmed' })}
                            disabled={statusMutation.isPending}
                            className="px-3 py-1.5 bg-[#0EA5A0]/10 text-[#0EA5A0] hover:bg-[#0EA5A0] hover:text-white rounded-md transition-colors text-xs font-medium flex items-center"
                          >
                            <Check className="w-3 h-3 mr-1" /> Confirm
                          </button>
                        )}
                        {appointment.status !== 'cancelled' && (
                          <button
                            onClick={() => statusMutation.mutate({ id: appointment._id, status: 'cancelled' })}
                            disabled={statusMutation.isPending}
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors text-xs font-medium flex items-center"
                          >
                            <X className="w-3 h-3 mr-1" /> Cancel
                          </button>
                        )}
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
