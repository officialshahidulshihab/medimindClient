'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { DoctorCard, DoctorType } from '@/components/ui/doctor-card';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MapPin, Video, Users, User, Calendar, Star, CheckCircle, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

interface ReviewType {
  _id: string;
  userId: { _id: string; name: string; image?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

type ExtendedDoctor = DoctorType & {
  reviews: ReviewType[];
  subSpecialties: string[];
};

export default function DoctorDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const toast = useToast();

  const { data: doctor, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const res = await api.get(`/doctors/${id}`);
      return res.data.data as ExtendedDoctor;
    }
  });

  const { data: relatedRes, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['doctors', 'related', doctor?.specialty],
    queryFn: async () => {
      const res = await api.get(`/doctors?search=${doctor?.specialty}&limit=4`);
      return res.data.data as { doctors: DoctorType[] };
    },
    enabled: !!doctor?.specialty
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      await api.post('/reviews', { doctorId: id, rating, comment });
    },
    onSuccess: async () => {
      setComment('');
      setRating(5);
      toast.success('Review submitted successfully');
      // Small delay before refetch so DB has time to update
      await new Promise(resolve => setTimeout(resolve, 300));
      queryClient.invalidateQueries({ queryKey: ['doctor', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  });

  const { data: bookmarksRes } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: async () => {
      const res = await api.get('/bookmarks');
      return res.data.data;
    },
    enabled: !!session
  });
  
  const isBookmarked = bookmarksRes?.some((b: any) => 
    (typeof b.doctorId === 'object' ? b.doctorId._id : b.doctorId) === id
  );

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      const res = await api.post('/bookmarks/toggle', { doctorId: id });
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

  const handleBookmarkToggle = () => {
    if (!session) {
      toast.info('Please log in to save doctors');
      return;
    }
    toggleBookmark.mutate();
  };

  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('');
  const [bookingType, setBookingType] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (doctor?.consultationMode) {
      if (doctor.consultationMode === 'Both') setBookingType('In-person');
      else setBookingType(doctor.consultationMode);
    }
  }, [doctor?.consultationMode]);

  const { data: bookedSlotsRes } = useQuery({
    queryKey: ['booked-slots', id, bookingDate],
    queryFn: async () => {
      const res = await api.get(`/appointments/doctor/${id}?date=${bookingDate}`);
      return res.data.data as { timeSlot: string, status: string }[];
    },
    enabled: !!bookingDate
  });

  const bookedSlots = bookedSlotsRes?.map(a => a.timeSlot) || [];

  const bookMutation = useMutation({
    mutationFn: async () => {
      await api.post('/appointments', {
        doctorId: id,
        appointmentDate: bookingDate,
        timeSlot: bookingTimeSlot,
        consultationType: bookingType,
        reason: bookingReason
      });
    },
    onSuccess: () => {
      setBookingSuccess(true);
      setBookingDate('');
      setBookingTimeSlot('');
      setBookingReason('');
      queryClient.invalidateQueries({ queryKey: ['booked-slots', id] });
      toast.success('Appointment requested successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  });

  const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '02:00 PM', '03:00 PM', '04:00 PM', 
    '05:00 PM', '06:00 PM'
  ];

  if (isLoadingDoctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-10" />
        <Skeleton className="h-40 w-full mb-8" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Doctor Not Found</h1>
        <p className="text-[#64748B]">The doctor you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 overflow-hidden mb-10">
        <div className="md:flex">
          <div className="md:w-1/3 h-64 md:h-auto bg-[#0F1A2E] relative flex-shrink-0">
            {doctor.imageUrl ? (
              <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                <Users size={64} />
              </div>
            )}
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white leading-tight">{doctor.name}</h1>
                  <button 
                    onClick={handleBookmarkToggle}
                    disabled={toggleBookmark.isPending}
                    className="p-2 rounded-full border border-[#64748B]/30 hover:bg-[#64748B]/10 transition-colors disabled:opacity-50"
                    aria-label="Toggle bookmark"
                  >
                    <Bookmark 
                      size={22} 
                      className={isBookmarked ? 'text-teal-500 fill-teal-500' : 'text-[#64748B] hover:text-white'} 
                    />
                  </button>
                </div>
                <p className="text-xl text-[#0EA5A0] font-medium">{doctor.specialty}</p>
              </div>
              {doctor.verified && (
                <Badge variant="success" className="text-sm px-3 py-1">Verified Professional</Badge>
              )}
            </div>

            <div className="flex items-center space-x-6 text-[#64748B] my-4">
              <div className="flex items-center">
                <MapPin size={18} className="mr-2" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center">
                <Video size={18} className="mr-2" />
                <span>{doctor.consultationMode} Consultations</span>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="bg-[#0F1A2E] px-4 py-2 rounded-lg inline-flex items-center border border-[#64748B]/30">
                <span className="text-2xl font-bold text-white mr-3">{doctor.rating}</span>
                <StarRating rating={doctor.rating} count={doctor.reviewCount} />
              </div>
            </div>

            {doctor.subSpecialties && doctor.subSpecialties.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#64748B] mb-2 uppercase tracking-wider">Sub-Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.subSpecialties.map((sub, i) => (
                    <Badge key={i} variant="outline">{sub}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6">Patient Reviews</h2>
          
          {session ? (
            <div className="bg-[#1A2942] rounded-xl p-6 border border-[#64748B]/20 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Leave a Review</h3>
              <div className="mb-4 flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} type="button" className="focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-[#64748B]'}`} />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] min-h-[100px] mb-4"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                onClick={() => submitReview.mutate()}
                disabled={submitReview.isPending || !comment.trim()}
                className="px-6 py-2 bg-[#0EA5A0] text-white font-medium rounded-md hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center"
              >
                {submitReview.isPending ? <LoadingSpinner className="mr-2 w-4 h-4 text-white" /> : null}
                Submit Review
              </button>
            </div>
          ) : (
            <div className="bg-[#1A2942] rounded-xl p-6 border border-[#64748B]/20 mb-8 text-center">
              <p className="text-[#64748B] mb-4">Please log in to leave a review.</p>
              <a href="/auth/login" className="text-[#0EA5A0] font-medium hover:underline">Log In</a>
            </div>
          )}

          <div className="space-y-4">
            {doctor.reviews && doctor.reviews.length > 0 ? (
              doctor.reviews.map((review) => (
                <div key={review._id} className="bg-[#0F1A2E] rounded-xl p-6 border border-[#64748B]/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {review.userId?.image ? (
                        <img src={review.userId.image} alt={review.userId.name} className="w-10 h-10 rounded-full mr-3 object-cover border border-[#64748B]/30" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1A2942] flex items-center justify-center text-white mr-3 border border-[#64748B]/30">
                          <User size={20} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-white">{review.userId?.name || 'Anonymous User'}</h4>
                        <div className="flex items-center text-xs text-[#64748B] mt-1">
                          <Calendar size={12} className="mr-1" />
                          {format(new Date(review.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-white/90 leading-relaxed">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-[#64748B] italic">No reviews yet for this doctor.</p>
            )}
          </div>
        </div>

        <div>
          {session?.user?.role !== 'admin' && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
                <Calendar className="w-6 h-6 text-[#64748B]" />
              </div>
              
              <div className="bg-[#1A2942] rounded-xl p-6 border border-[#64748B]/20">
                {bookingSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-[#0EA5A0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-[#0EA5A0]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Appointment Requested!</h3>
                    <p className="text-[#64748B] mb-6">You will be contacted to confirm your appointment.</p>
                    <button
                      onClick={() => setBookingSuccess(false)}
                      className="px-6 py-2 bg-transparent border border-[#0EA5A0] text-[#0EA5A0] font-medium rounded-md hover:bg-[#0EA5A0]/10 transition-colors"
                    >
                      Book Another
                    </button>
                  </div>
                ) : !session ? (
                  <div className="text-center py-6">
                    <p className="text-[#64748B] mb-4">Please log in to book an appointment.</p>
                    <a href="/auth/login" className="text-[#0EA5A0] font-medium hover:underline">Log In</a>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Select Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0]"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Time Slot</label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          const isSelected = bookingTimeSlot === slot;
                          
                          let btnClass = "py-2 text-sm rounded-md transition-colors border ";
                          if (isBooked) {
                            btnClass += "bg-[#0F1A2E]/50 border-[#64748B]/10 text-[#64748B] line-through opacity-50 cursor-not-allowed";
                          } else if (isSelected) {
                            btnClass += "bg-[#0EA5A0] border-[#0EA5A0] text-[#0F1A2E] font-medium";
                          } else {
                            btnClass += "bg-transparent border-[#64748B]/30 text-[#64748B] hover:border-[#0EA5A0] hover:text-[#0EA5A0]";
                          }
                          
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setBookingTimeSlot(slot)}
                              className={btnClass}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Consultation Type</label>
                      <div className="flex gap-2">
                        {doctor?.consultationMode === 'Both' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setBookingType('In-person')}
                              className={`flex-1 py-2 text-sm rounded-md transition-colors border ${bookingType === 'In-person' ? 'bg-[#0EA5A0] border-[#0EA5A0] text-[#0F1A2E] font-medium' : 'bg-transparent border-[#64748B]/30 text-[#64748B] hover:border-[#0EA5A0] hover:text-[#0EA5A0]'}`}
                            >
                              In-person
                            </button>
                            <button
                              type="button"
                              onClick={() => setBookingType('Video')}
                              className={`flex-1 py-2 text-sm rounded-md transition-colors border ${bookingType === 'Video' ? 'bg-[#0EA5A0] border-[#0EA5A0] text-[#0F1A2E] font-medium' : 'bg-transparent border-[#64748B]/30 text-[#64748B] hover:border-[#0EA5A0] hover:text-[#0EA5A0]'}`}
                            >
                              Video
                            </button>
                          </>
                        ) : (
                          <div className="px-4 py-2 bg-[#0F1A2E] border border-[#64748B]/30 text-[#0EA5A0] rounded-md text-sm font-medium inline-block">
                            {doctor?.consultationMode}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Reason for Visit</label>
                      <textarea
                        className="w-full bg-[#0F1A2E] border border-[#64748B]/30 rounded-md p-3 text-white focus:outline-none focus:border-[#0EA5A0] min-h-[80px]"
                        placeholder="Briefly describe your symptoms or reason for this appointment"
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={() => bookMutation.mutate()}
                      disabled={bookMutation.isPending || !bookingDate || !bookingTimeSlot || !bookingType || !bookingReason.trim()}
                      className="w-full py-3 bg-[#0EA5A0] text-white font-medium rounded-md hover:bg-[#0EA5A0]/90 transition-colors disabled:opacity-50 flex items-center justify-center mt-2"
                    >
                      {bookMutation.isPending ? <LoadingSpinner className="mr-2 w-4 h-4 text-white" /> : null}
                      Request Appointment
                    </button>
                    
                    <p className="text-center text-[#64748B] text-[11px] mt-3">
                      Booking requests are subject to doctor availability confirmation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-6">Related Doctors</h2>
          <div className="space-y-6">
            {isLoadingRelated ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : relatedRes?.doctors && relatedRes.doctors.length > 0 ? (
              relatedRes.doctors.filter(d => String(d._id) !== String(id)).slice(0, 4).map(related => (
                <DoctorCard key={String(related._id)} doctor={related} />
              ))
            ) : (
              <p className="text-[#64748B]">No related doctors found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
