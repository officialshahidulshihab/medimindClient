import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import Navbar from '@/components/navbar';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock the Auth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    isPending: false,
  }),
}));

// Mock Toast
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock Auth Client
vi.mock('@/lib/auth-client', () => ({
  signOut: vi.fn(),
}));

describe('Navbar Component', () => {
  test('renders the logo correctly', () => {
    render(<Navbar />);
    const logoElement = screen.getByText(/MediMind/i);
    expect(logoElement).toBeInTheDocument();
  });

  test('shows Sign In and Get Started buttons when logged out', () => {
    render(<Navbar />);
    const signInButton = screen.getByText(/Sign In/i);
    const getStartedButton = screen.getByText(/Get Started/i);
    
    expect(signInButton).toBeInTheDocument();
    expect(getStartedButton).toBeInTheDocument();
  });
});
