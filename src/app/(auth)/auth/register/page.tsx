"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp, signIn } from "@/lib/auth-client"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { User, Stethoscope, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'patient' | 'doctor'>('patient')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Name is required")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await signUp.email({
        name,
        email,
        password,
        callbackURL: '/doctor/dashboard',
        role,
      } as any)

      if (authError) {
        setError(authError.message ?? "Registration failed")
        return
      }

      router.push(role === 'doctor' ? '/doctor/dashboard' : '/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000/dashboard",
    })
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: 'var(--bg-page)' }}
    >
      <div 
        className="card ai-glow-border w-full flex flex-col"
        style={{ width: '440px', maxWidth: 'calc(100vw - 32px)', padding: '40px' }}
      >
        
        {/* Top Logo */}
        <div className="flex flex-col items-center justify-center mb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="pulse-dot" />
            <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '20px', color: 'white' }}>
              MediMind <span style={{ color: 'var(--teal)' }}>AI</span>
            </span>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Clinical intelligence for everyone
          </div>
        </div>

        {/* Divider */}
        <div className="my-[24px] w-full" style={{ height: '1px', background: 'var(--border-opacity)' }} />

        {step === 1 ? (
          <>
            <h1 
              className="text-center text-white" 
              style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '24px' }}
            >
              Join as...
            </h1>
            
            <div className="flex gap-4 mt-8 mb-4">
              <button
                onClick={() => {
                  setRole('patient');
                  setStep(2);
                }}
                className="flex-1 p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center group"
                style={{
                  background: '#1A2942',
                  borderColor: role === 'patient' ? 'var(--teal)' : 'rgba(100, 116, 139, 0.2)'
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors group-hover:text-[var(--teal)] text-white" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <User size={24} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">I&apos;m a Patient</h3>
                <p className="text-[#64748B] text-sm">Book appointments and track my health</p>
              </button>

              <button
                onClick={() => {
                  setRole('doctor');
                  setStep(2);
                }}
                className="flex-1 p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center group"
                style={{
                  background: '#1A2942',
                  borderColor: role === 'doctor' ? 'var(--teal)' : 'rgba(100, 116, 139, 0.2)'
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors group-hover:text-[var(--teal)] text-white" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Stethoscope size={24} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">I&apos;m a Doctor</h3>
                <p className="text-[#64748B] text-sm">Manage appointments and help patients</p>
              </button>
            </div>
            
            <div className="mt-4 text-center" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--teal)' }} className="hover:underline">
                Sign in →
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setStep(1)} 
                className="text-[#64748B] hover:text-white transition-colors"
                title="Back to role selection"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 
                className="flex-1 text-center text-white flex items-center justify-center gap-3" 
                style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '24px' }}
              >
                Create your account
                <span className="text-[11px] uppercase tracking-wider font-bold py-1 px-2 rounded bg-[#0EA5A0]/10 text-[#0EA5A0] border border-[#0EA5A0]/20">
                  {role}
                </span>
              </h1>
              <div className="w-5" /> {/* Spacer for centering */}
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-[10px] transition-colors"
              style={{ 
                height: '48px', 
                borderRadius: '8px', 
                background: 'white', 
                color: '#1F2937', 
                border: 'none',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Text Divider */}
            <div className="flex flex-row items-center mt-[24px]">
              <div className="flex-1" style={{ height: '1px', background: 'var(--border-opacity)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-disabled)', padding: '0 12px' }}>or continue with email</span>
              <div className="flex-1" style={{ height: '1px', background: 'var(--border-opacity)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col w-full">
              <div className="mt-[16px]">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Full name
                </label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mt-[16px]">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Email address
                </label>
                <input 
                  type="email" 
                  required
                  className="input-field" 
                  style={error ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 2px rgba(255,77,106,0.1)' } : {}}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mt-[16px]">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Password
                </label>
                <input 
                  type="password" 
                  required
                  className="input-field"
                  style={error ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 2px rgba(255,77,106,0.1)' } : {}}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mt-[16px]">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  required
                  className="input-field"
                  style={error ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 2px rgba(255,77,106,0.1)' } : {}}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                
                {error && (
                  <div style={{ fontSize: '13px', color: 'var(--danger)', marginTop: '4px' }}>
                    {error}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full mt-[24px] justify-center" 
                style={{ height: '48px', fontSize: '16px' }}
              >
                {loading ? <LoadingSpinner className="w-5 h-5 text-navy" /> : 'Create Account'}
              </button>
            </form>

            <div className="mt-[20px] text-center" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--teal)' }} className="hover:underline">
                Sign in →
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
