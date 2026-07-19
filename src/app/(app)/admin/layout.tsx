'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Stethoscope,
  PlusCircle, ChevronRight, ExternalLink, Calendar
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
  { href: '/admin/doctors/add', label: 'Add Doctor', icon: PlusCircle },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace('/auth/login');
      return;
    }
    const user = session.user as any;
    if (user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-page)' }}>
        <LoadingSpinner className="w-8 h-8 text-teal-500" />
      </div>
    );
  }

  const user = session?.user as any;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>

      {/* Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col"
        style={{
          width: '260px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-opacity)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Sidebar Logo */}
        <div className="flex items-center gap-2 px-6 py-5"
          style={{ borderBottom: '1px solid var(--border-opacity)' }}>
          <div className="pulse-dot" />
          <span style={{
            fontFamily: 'var(--font-sora)',
            fontWeight: 700,
            fontSize: '16px',
            color: 'white'
          }}>
            MediMind <span style={{ color: 'var(--teal)' }}>Admin</span>
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 p-4 flex-grow">
          {NAV_ITEMS.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== '/admin';
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                style={{
                  background: isActive ? 'rgba(0,201,177,0.12)' : 'transparent',
                  color: isActive ? 'var(--teal)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  border: isActive
                    ? '1px solid rgba(0,201,177,0.2)'
                    : '1px solid transparent',
                }}
              >
                <item.icon size={16} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* View Website */}
        <div className="px-4 pb-3">
          <Link
            href="/"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg transition-all"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              border: '1px solid var(--border-opacity)',
              background: 'rgba(255,255,255,0.03)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
          >
            <ExternalLink size={14} />
            View Website
          </Link>
        </div>

        {/* Admin User Info */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-opacity)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--teal)', color: 'var(--navy)' }}>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--teal)' }}>Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto">
        {children}
      </main>
    </div>
  );
}
