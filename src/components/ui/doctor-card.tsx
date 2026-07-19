'use client';

import { MapPin, Star, Bookmark } from "lucide-react";
import Link from "next/link";

export interface DoctorType {
  _id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviewCount: number;
  consultationMode: "In-person" | "Video" | "Both";
  verified: boolean;
  imageUrl?: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= Math.round(rating) ? "fill-warning text-warning" : "text-border"}
          style={{ 
            fill: s <= Math.round(rating) ? 'var(--warning)' : 'transparent',
            color: s <= Math.round(rating) ? 'var(--warning)' : 'var(--border)'
          }}
        />
      ))}
    </div>
  );
}

export function DoctorCard({ 
  doctor, 
  isBookmarked, 
  onBookmarkToggle 
}: { 
  doctor: DoctorType; 
  isBookmarked?: boolean; 
  onBookmarkToggle?: (e: React.MouseEvent) => void; 
}) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const consultationBadgeStyle = {
    'In-person': { bg: 'rgba(77,148,255,0.12)', text: '#4D94FF' },
    'Video': { bg: 'rgba(0,201,177,0.12)', text: 'var(--teal)' },
    'Both': { bg: 'rgba(0,214,143,0.12)', text: 'var(--success)' },
  };

  const badgeStyle = consultationBadgeStyle[doctor.consultationMode] || consultationBadgeStyle['In-person'];

  return (
    <div 
      className="card flex-shrink-0 flex flex-col overflow-hidden"
      style={{ width: '280px', height: '340px' }}
    >
      {/* Image Section */}
      <div 
        className="w-full relative" 
        style={{ height: '140px', background: 'var(--bg-elevated)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
      >
        {doctor.imageUrl ? (
          <img 
            src={doctor.imageUrl} 
            alt={doctor.name} 
            className="w-full h-full object-cover" 
            style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ fontSize: '32px', fontWeight: 600, color: 'var(--teal)' }}>
              {getInitials(doctor.name)}
            </span>
          </div>
        )}
        
        {onBookmarkToggle && (
          <button
            onClick={onBookmarkToggle}
            className="absolute top-3 right-3 p-2 rounded-full z-10 transition-colors"
            style={{ 
              background: 'rgba(15, 26, 46, 0.6)', 
              backdropFilter: 'blur(4px)' 
            }}
            aria-label="Toggle bookmark"
          >
            <Bookmark 
              size={18} 
              className={isBookmarked ? "text-teal-500 fill-teal-500" : "text-slate-400"} 
              style={{
                color: isBookmarked ? 'var(--teal)' : 'var(--text-muted)',
                fill: isBookmarked ? 'var(--teal)' : 'transparent'
              }}
            />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-[16px]" style={{ height: '200px' }}>
        
        {/* Row 1: Name + Verified badge */}
        <div className="flex items-center gap-2 w-full">
          <h3 
            className="text-white truncate" 
            style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '15px' }}
          >
            {doctor.name}
          </h3>
          {doctor.verified && (
            <span 
              className="flex-shrink-0"
              style={{ 
                background: 'rgba(0,214,143,0.15)', 
                color: 'var(--success)', 
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 500
              }}
            >
              ✓ Verified
            </span>
          )}
        </div>

        {/* Row 2: Specialty badge */}
        <div className="mt-[6px]">
          <span 
            style={{
              display: 'inline-block',
              background: 'rgba(0,201,177,0.12)',
              color: 'var(--teal)',
              fontSize: '12px',
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: '9999px'
            }}
          >
            {doctor.specialty}
          </span>
        </div>

        {/* Row 3: Location */}
        <div className="flex items-center gap-1 mt-[8px]">
          <MapPin size={12} color="var(--text-disabled)" />
          <span className="truncate" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {doctor.location}
          </span>
        </div>

        {/* Row 4: Rating + Consultation mode */}
        <div className="flex justify-between items-center mt-[8px]">
          <div className="flex items-center gap-1">
            <StarRow rating={doctor.rating} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ({doctor.reviewCount})
            </span>
          </div>
          <span 
            style={{
              background: badgeStyle.bg,
              color: badgeStyle.text,
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 500
            }}
          >
            {doctor.consultationMode}
          </span>
        </div>

        {/* Button */}
        <Link 
          href={`/doctors/${doctor._id}`}
          className="mt-auto w-full flex items-center justify-center transition-colors duration-200"
          style={{
            height: '36px',
            borderRadius: '8px',
            border: '1px solid rgba(77,96,127,0.5)',
            color: 'var(--text-muted)',
            background: 'transparent',
            fontSize: '14px',
            fontWeight: 500
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--teal)';
            e.currentTarget.style.color = 'var(--teal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(77,96,127,0.5)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

export function DoctorCardSkeleton() {
  return (
    <div 
      className="card flex-shrink-0 flex flex-col overflow-hidden"
      style={{ width: '280px', height: '340px' }}
    >
      {/* Image Area Skeleton */}
      <div className="skeleton w-full" style={{ height: '140px', borderRadius: '12px 12px 0 0' }} />
      
      {/* Content Skeleton */}
      <div className="flex flex-col p-[16px]" style={{ height: '200px' }}>
        <div className="skeleton" style={{ width: '60%', height: '14px', marginTop: '12px' }} />
        <div className="skeleton" style={{ width: '40%', height: '12px', marginTop: '6px' }} />
        
        <div className="skeleton mt-auto" style={{ width: '100%', height: '36px' }} />
      </div>
    </div>
  );
}
