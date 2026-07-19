'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, ShieldCheck, UserCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'admin' | 'doctor';
  createdAt: string;
  image?: string;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.data as AdminUser[];
    }
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await api.patch(`/admin/users/${id}/role`, { role });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 style={{
          fontFamily: 'var(--font-sora)',
          fontWeight: 700,
          fontSize: '28px',
          color: 'white'
        }}>
          User Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Manage user roles and access
        </p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-opacity)' }}>
              {['User', 'Email', 'Role', 'Joined', 'Action'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-opacity)' }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} style={{ padding: '16px' }}>
                        <div style={{
                          height: '14px',
                          width: '80px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              : users?.map((user, i) => (
                  <tr key={user._id}
                    style={{
                      borderBottom: i !== users.length - 1
                        ? '1px solid var(--border-opacity)' : 'none'
                    }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--bg-elevated)' }}>
                          {user.image
                            ? <img src={user.image} className="w-full h-full rounded-full object-cover" />
                            : <UserCircle size={18} color="var(--text-muted)" />}
                        </div>
                        <span style={{ fontSize: '14px', color: 'white', fontWeight: 500 }}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px',
                      color: 'var(--text-muted)' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {user.role === 'admin' ? (
                        <Badge variant="warning">⚡ Admin</Badge>
                      ) : user.role === 'doctor' ? (
                        <Badge variant="success">🩺 Doctor</Badge>
                      ) : (
                        <Badge variant="outline">Patient</Badge>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px',
                      color: 'var(--text-muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {user.role === 'doctor' ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Doctor Account</span>
                      ) : (
                        <button
                          onClick={() => roleMutation.mutate({
                            id: user._id,
                            role: user.role === 'admin' ? 'patient' : 'admin'
                          })}
                          disabled={roleMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-opacity)',
                            cursor: 'pointer',
                          }}
                        >
                          {roleMutation.isPending
                            ? <LoadingSpinner className="w-3 h-3" />
                            : user.role === 'admin'
                              ? 'Revoke Admin'
                              : '⚡ Make Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
