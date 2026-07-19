'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from '@/lib/auth-client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Bell, X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, isPending } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toast = useToast();

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    toast.success('Signed out successfully');
    router.push('/');
    router.refresh();
  };

  const loggedOutLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'Blog', href: '/blog' },
  ];

  const loggedInLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Symptom Checker', href: '/symptom-checker' },
    { name: 'Drug Checker', href: '/drug-checker' },
    { name: 'Doctors', href: '/doctors' },
    { name: (user as any)?.role === 'admin' ? '⚡ Admin Panel' : 'Dashboard', href: (user as any)?.role === 'admin' ? '/admin' : '/dashboard' },
    { name: 'My Records', href: '/health-records' },
  ];

  const links = isLoggedIn ? loggedInLinks : loggedOutLinks;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href) && href !== '/';

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50 h-[64px]"
        style={{ 
          background: 'rgba(11, 20, 38, 0.8)', 
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(77, 96, 127, 0.3)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="pulse-dot" />
            <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '20px' }} className="text-white">
              MediMind <span style={{ color: 'var(--teal)' }}>AI</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-[14px] font-medium transition-all duration-200",
                    active 
                      ? "text-teal border-b-2 border-teal pb-[2px]" 
                      : "text-muted hover:text-white"
                  )}
                  style={active ? { color: 'var(--teal)', borderColor: 'var(--teal)' } : {}}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">
            {!isPending && !isLoggedIn ? (
              <>
                <Link href="/auth/login" className="btn-ghost" style={{ height: '36px', padding: '0 16px' }}>
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary" style={{ height: '36px', padding: '0 16px' }}>
                  Get Started
                </Link>
              </>
            ) : !isPending && isLoggedIn ? (
              <div className="flex items-center gap-5">
                {user?.role === 'admin' && (
                  <Link href="/admin" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '14px', marginRight: '16px' }}>
                    ⚡ Admin
                  </Link>
                )}
                <button className="text-muted hover:text-white transition-colors">
                  <Bell size={20} />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ background: 'var(--teal)' }}
                  >
                    {userInitials}
                  </button>
                  
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50 bg-surface border border-border">
                        <Link 
                          href="/dashboard" 
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-muted hover:text-white hover:bg-elevated"
                        >
                          My Dashboard
                        </Link>
                        <Link 
                          href="/health-records" 
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-muted hover:text-white hover:bg-elevated"
                        >
                          My Records
                        </Link>
                        <Link 
                          href="/settings" 
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-muted hover:text-white hover:bg-elevated"
                        >
                          Settings
                        </Link>
                        <div className="h-px bg-border-opacity my-1" style={{ background: 'var(--border-opacity)' }} />
                        <button 
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10"
                          style={{ color: 'var(--danger)' }}
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0B1426' }}>
          <div className="flex justify-end p-6">
            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
              <X size={32} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-6 pb-20">
            {links.map(link => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="text-[24px] font-medium text-white hover:text-teal transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {!isPending && !isLoggedIn ? (
              <div className="flex flex-col gap-4 mt-8 w-64">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="btn-ghost justify-center">Sign In</Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary justify-center">Get Started</Link>
              </div>
            ) : !isPending && isLoggedIn ? (
              <div className="flex flex-col items-center gap-4 mt-8">
                {user?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '20px' }}>
                    ⚡ Admin
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="text-[20px] font-medium text-danger"
                  style={{ color: 'var(--danger)' }}
                >
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
