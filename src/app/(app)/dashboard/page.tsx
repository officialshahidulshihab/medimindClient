'use client';

import { useSession } from '@/lib/auth-client';
import Link from 'next/link';
import { Activity, FileText, Pill, Users, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AuthGuard from "@/components/auth-guard";
import { useDashboard } from "@/hooks/use-dashboard";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const iconMap = {
  symptom: <Activity size={18} />,
  document: <FileText size={18} />,
  drug: <Pill size={18} />,
  doctor: <Users size={18} />,
};

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace('/auth/login');
      return;
    }
    const user = session.user as any;
    if (user.role === 'admin') {
      router.replace('/admin');
    } else if (user.role === 'doctor') {
      router.replace('/doctor/dashboard');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <LoadingSpinner className="w-8 h-8" style={{ color: 'var(--teal)' }} />
      </div>
    );
  }

  const user = session?.user as any;
  if (!user || user.role === 'admin' || user.role === 'doctor') return null;

  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const { data, isLoading, error } = useDashboard();

  return (
    <div className="max-w-7xl mx-auto px-6 py-[32px] w-full">
      {/* Back to Website */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--teal)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
          }}
        >
          <ArrowLeft size={14} />
          Back to Website
        </Link>
      </div>
      
      {/* Greeting */}
      <div className="mb-[32px]">
        <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 300, fontSize: '28px', color: 'var(--text-muted)' }}>
          Good morning,
        </div>
        <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '36px', color: 'white' }}>
          {session?.user?.name || 'User'}
        </div>
      </div>

      {error && (
        <div style={{ 
          color: 'var(--danger)', 
          fontSize: '14px', 
          padding: '12px 16px',
          background: 'rgba(255,77,106,0.08)',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          Could not load dashboard data. Please refresh.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px]">
        {[
          { label: 'Symptom Sessions', value: data?.stats?.symptomSessions, icon: <Activity size={20} color="var(--teal)" />, border: 'var(--teal)' },
          { label: 'Documents Uploaded', value: data?.stats?.documentsUploaded, icon: <FileText size={20} color="var(--info)" />, border: 'var(--info)' },
          { label: 'Drug Checks', value: data?.stats?.drugChecks, icon: <Pill size={20} color="var(--warning)" />, border: 'var(--warning)' },
          { label: 'Saved Doctors', value: data?.stats?.savedDoctors, icon: <Users size={20} color="var(--success)" />, border: 'var(--success)' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="card" 
            style={{ padding: '20px', borderLeft: `3px solid ${stat.border}` }}
          >
            {stat.icon}
            <div className="mt-4" style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '32px', color: 'white', minHeight: '38px' }}>
              {isLoading ? (
                <div style={{ 
                  height: '32px', width: '60px', 
                  borderRadius: '6px', 
                  background: 'rgba(255,255,255,0.07)',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              ) : (
                stat.value !== undefined ? stat.value : 0
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: '13px', color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="mt-[32px] grid grid-cols-1 md:grid-cols-12 gap-[24px]">
        
        {/* LEFT - Charts Panel */}
        <div className="card md:col-span-8" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '18px', color: 'white', marginBottom: '24px' }}>
            Health Activity
          </h2>
          <div style={{ height: '280px', width: '100%' }}>
            {isLoading ? (
              <div style={{ 
                height: '100%', width: '100%', 
                borderRadius: '6px', 
                background: 'rgba(255,255,255,0.07)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.chartData || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(77,96,127,0.2)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-disabled)', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-disabled)', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-elevated)', 
                      borderColor: 'var(--border)', 
                      color: 'white',
                      borderRadius: '8px'
                    }} 
                    itemStyle={{ color: 'var(--teal)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="var(--teal)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--teal)', stroke: 'var(--bg-surface)', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RIGHT - Recent Activity */}
        <div className="card md:col-span-4 flex flex-col" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '18px', color: 'white', marginBottom: '16px' }}>
            Recent Activity
          </h2>
          <div className="flex flex-col flex-grow">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-[12px] py-[12px]" style={i !== 4 ? { borderBottom: '1px solid var(--border-opacity)' } : {}}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div className="flex-grow flex flex-col gap-2">
                    <div style={{ height: '14px', width: '80%', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: '12px', width: '40%', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                </div>
              ))
            ) : data?.recentActivity?.length ? (
              data.recentActivity.map((item, i) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-[12px] py-[12px]"
                  style={i !== data.recentActivity.length - 1 ? { borderBottom: '1px solid var(--border-opacity)' } : {}}
                >
                  <div 
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ 
                      width: '36px', height: '36px', 
                      borderRadius: '50%', 
                      background: 'var(--bg-elevated)',
                      color: 'var(--teal)'
                    }}
                  >
                    <div style={{ transform: 'scale(0.65)' }}>{iconMap[item.type]}</div>
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="truncate text-white" style={{ fontSize: '14px', fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.date}</div>
                  </div>

                  <div 
                    className="flex-shrink-0"
                    style={{
                      background: item.status === 'active' ? 'rgba(255,181,69,0.12)' : 'rgba(0,214,143,0.12)',
                      color: item.status === 'active' ? 'var(--warning)' : 'var(--success)',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  >
                    {item.status}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>
                No recent activity.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
