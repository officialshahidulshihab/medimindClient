'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Stethoscope, Activity, Pill, FileText,
  ShieldCheck, CheckCircle, Clock
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

interface AdminStats {
  stats: {
    totalDoctors: number;
    verifiedDoctors: number;
    totalSymptomSessions: number;
    totalDrugChecks: number;
    totalDocuments: number;
  };
  chartData: Array<{ day: string; sessions: number }>;
  recentDoctors: Array<{
    _id: string;
    name: string;
    specialty: string;
    location: string;
    verified: boolean;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data as AdminStats;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      await api.patch(`/admin/doctors/${id}/verify`, { verified });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
  });

  const statCards = data ? [
    {
      label: 'Total Doctors',
      value: data.stats.totalDoctors,
      sub: `${data.stats.verifiedDoctors} verified`,
      icon: <Stethoscope size={20} color="var(--teal)" />,
      border: 'var(--teal)'
    },
    {
      label: 'Symptom Sessions',
      value: data.stats.totalSymptomSessions,
      sub: 'All time',
      icon: <Activity size={20} color="var(--info)" />,
      border: 'var(--info)'
    },
    {
      label: 'Drug Checks',
      value: data.stats.totalDrugChecks,
      sub: 'All time',
      icon: <Pill size={20} color="var(--warning)" />,
      border: 'var(--warning)'
    },
    {
      label: 'Documents Analyzed',
      value: data.stats.totalDocuments,
      sub: 'All time',
      icon: <FileText size={20} color="var(--success)" />,
      border: 'var(--success)'
    },
  ] : [];

  const skeletonStyle = {
    height: '32px',
    width: '60px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.07)',
    animation: 'pulse 1.5s ease-in-out infinite'
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 style={{
          fontFamily: 'var(--font-sora)',
          fontWeight: 700,
          fontSize: '28px',
          color: 'white'
        }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Platform overview and management
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: '20px' }}>
                <div style={skeletonStyle} />
              </div>
            ))
          : statCards.map((stat, i) => (
              <div key={i} className="card"
                style={{ padding: '20px', borderLeft: `3px solid ${stat.border}` }}>
                {stat.icon}
                <div className="mt-3" style={{
                  fontFamily: 'var(--font-sora)',
                  fontWeight: 700,
                  fontSize: '32px',
                  color: 'white'
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-disabled)', marginTop: '2px' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
      </div>

      {/* Chart + Recent Doctors */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Activity Chart */}
        <div className="card xl:col-span-7" style={{ padding: '24px' }}>
          <h2 style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 600,
            fontSize: '16px',
            color: 'white',
            marginBottom: '24px'
          }}>
            Platform Activity — Last 7 Days
          </h2>
          {isLoading ? (
            <div style={{ ...skeletonStyle, height: '240px', width: '100%' }} />
          ) : (
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.chartData}
                  margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3"
                    stroke="rgba(77,96,127,0.2)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false}
                    tick={{ fill: 'var(--text-disabled)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fill: 'var(--text-disabled)', fontSize: 12 }} />
                  <Tooltip contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border)',
                    color: 'white',
                    borderRadius: '8px'
                  }} />
                  <Line type="monotone" dataKey="sessions" stroke="var(--teal)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--teal)', stroke: 'var(--bg-surface)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recently Added Doctors */}
        <div className="card xl:col-span-5" style={{ padding: '24px' }}>
          <h2 style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 600,
            fontSize: '16px',
            color: 'white',
            marginBottom: '16px'
          }}>
            Recently Added Doctors
          </h2>
          <div className="flex flex-col gap-0">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="py-3"
                    style={{ borderBottom: '1px solid var(--border-opacity)' }}>
                    <div style={{ ...skeletonStyle, height: '16px', width: '140px' }} />
                  </div>
                ))
              : data?.recentDoctors.map((doc, i) => (
                  <div key={doc._id}
                    className="flex items-center justify-between py-3"
                    style={i !== (data.recentDoctors.length - 1)
                      ? { borderBottom: '1px solid var(--border-opacity)' }
                      : {}}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {doc.specialty} · {doc.location}
                      </div>
                    </div>
                    <button
                      onClick={() => verifyMutation.mutate({
                        id: doc._id,
                        verified: !doc.verified
                      })}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-all"
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        background: doc.verified
                          ? 'rgba(0,214,143,0.12)'
                          : 'rgba(255,255,255,0.05)',
                        color: doc.verified ? 'var(--success)' : 'var(--text-disabled)',
                        border: doc.verified
                          ? '1px solid rgba(0,214,143,0.25)'
                          : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      {doc.verified
                        ? <><CheckCircle size={11} /> Verified</>
                        : <><Clock size={11} /> Verify</>}
                    </button>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
