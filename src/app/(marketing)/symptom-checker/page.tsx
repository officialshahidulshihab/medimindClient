"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Activity } from "lucide-react"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"
import { useSymptomChecker } from "@/hooks/use-symptom-checker"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { getSessions, getSessionById } from "@/lib/api/symptom"

const SPECIALTY_MAP: Record<string, string> = {
  'General Physician': 'General Practice',
  'General Practice': 'General Practice',
  'General Practitioner': 'General Practice',
  'Dermatologist': 'Dermatology',
  'Cardiologist': 'Cardiology',
  'Neurologist': 'Neurology',
  'Orthopedist': 'Orthopedics',
  'Psychiatrist': 'Psychiatry',
  'Pulmonologist': 'Pulmonology',
  'Gastroenterologist': 'Gastroenterology',
  'Endocrinologist': 'Endocrinology',
  'Ophthalmologist': 'Ophthalmology',
  'Oncologist': 'Oncology',
  'Urologist': 'Urology',
  'Gynecologist': 'Gynecology',
  'ENT': 'ENT',
  'Pediatrician': 'Pediatrics',
  'Rheumatologist': 'Rheumatology',
  'Nephrologist': 'Nephrology',
  'Hematologist': 'Hematology',
};

function mapSpecialtyForSearch(aiSpecialty: string): string {
  if (!aiSpecialty) return 'General Practice';
  // Try exact match first
  if (SPECIALTY_MAP[aiSpecialty]) return SPECIALTY_MAP[aiSpecialty];
  // Try case-insensitive match
  const key = Object.keys(SPECIALTY_MAP).find(
    k => k.toLowerCase() === aiSpecialty.toLowerCase()
  );
  return key ? SPECIALTY_MAP[key] : aiSpecialty;
}

function SymptomCheckerContent() {
  const {
    session,
    status,
    messages,
    report,
    error,
    sendMessage,
    resetChecker,
    loadSession
  } = useSymptomChecker()

  const specialty = report.recommendedSpecialty;
  const mappedSpecialty = mapSpecialtyForSearch(specialty || '');

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors', mappedSpecialty],
    queryFn: async () => {
      const res = await api.get(`/doctors?specialty=${encodeURIComponent(mappedSpecialty)}&limit=3`);
      return res.data.data.doctors;
    },
    enabled: !!mappedSpecialty && !!report.urgencyScore,
  });

  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['symptom-sessions'],
    queryFn: getSessions,
  });

  const [input, setInput] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const chips = ["Headache", "Fever", "Chest pain", "Fatigue", "Nausea", "Shortness of breath"];

  async function loadSessionWithTurns(id: string) {
    try {
      const fullSession = await getSessionById(id);
      loadSession(fullSession);
    } catch (e) {
      console.error(e);
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [messages, status])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || status === "thinking") return
    setInput("")
    await sendMessage(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChipClick(symptom: string) {
    sendMessage(symptom)
  }

  const hasStarted = messages.length > 0;

  const statusConfig = {
    idle: { label: 'Ready', color: 'var(--success)' },
    creating: { label: 'Starting...', color: 'var(--warning)' },
    thinking: { label: 'Analyzing', color: 'var(--teal)' },
    chatting: { label: 'Active', color: 'var(--teal)' },
    completed: { label: 'Completed', color: 'var(--info)' },
    error: { label: 'Error', color: 'var(--danger)' },
  }

  return (
    <div 
      className="flex flex-col md:flex-row w-full gap-6 p-6 mx-auto max-w-7xl"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* HISTORY PANEL */}
      <div className="hidden md:flex w-[280px] flex-shrink-0 flex-col gap-4" style={{ background: 'var(--bg-page)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-opacity)', overflowY: 'auto' }}>
        <button onClick={resetChecker} className="btn-primary w-full" style={{ padding: '10px', fontSize: '14px' }}>+ New Session</button>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '12px' }}>Previous Sessions</div>
        {isLoadingSessions ? (
          <div className="animate-pulse flex flex-col gap-3">
             <div className="h-16 bg-white/5 rounded-lg w-full"></div>
             <div className="h-16 bg-white/5 rounded-lg w-full"></div>
          </div>
        ) : (sessions?.length ?? 0) > 0 ? (
          <div className="flex flex-col gap-2">
            {(sessions ?? []).map((s: any) => (
              <div key={s._id} onClick={() => loadSessionWithTurns(s._id)} className="card cursor-pointer hover:bg-white/5 p-3 flex flex-col gap-1 transition-colors" style={{ border: session?._id === s._id ? '1px solid var(--teal)' : '1px solid var(--border-opacity)' }}>
                <div className="text-white text-sm font-medium truncate">{s.initialSymptoms?.[0] || 'Symptom Check'}</div>
                <div className="flex justify-between items-center mt-1">
                   <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                   <div className="flex items-center gap-2">
                     {s.urgencyScore && (
                       <span className="text-xs font-bold" style={{
                         color: s.urgencyScore >= 7 ? '#ef4444' : s.urgencyScore >= 4 ? '#f59e0b' : '#22c55e'
                       }}>
                         {s.urgencyScore}/10
                       </span>
                     )}
                     <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: s.status === 'completed' ? 'rgba(0,214,143,0.1)' : 'rgba(255,181,69,0.1)', color: s.status === 'completed' ? 'var(--success)' : 'var(--warning)' }}>{s.status}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-white/40 text-center mt-4">No past sessions found.</div>
        )}
      </div>

      {/* LEFT PANEL - Chat */}
      <div 
        className="ai-glow-border flex-1 flex flex-col overflow-hidden relative"
        style={{ background: 'var(--bg-surface)', borderRadius: '12px' }}
      >
        {/* Header */}
        <div 
          className="flex flex-row justify-between items-center p-[20px]"
          style={{ borderBottom: '1px solid var(--border-opacity)' }}
        >
          <div className="flex items-center gap-[8px]">
            <div className="pulse-dot" />
            <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '16px', color: 'white' }}>
              AI Symptom Analysis
            </span>
          </div>
          <div 
            style={{ 
              background: `${statusConfig[status].color}20`, 
              color: statusConfig[status].color,
              fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', fontWeight: 500 
            }}
          >
            {statusConfig[status].label}
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[16px]">
          {/* Empty state — only when no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-disabled)' }}>
              <Activity size={48} color="var(--border)" className="mb-4" />
              <p style={{ fontSize: '15px' }}>How can I help you today? Describe your symptoms below.</p>
            </div>
          )}

          {/* Message thread */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' 
                    ? 'var(--teal)' 
                    : 'var(--bg-elevated)',
                  color: msg.role === 'user' ? 'var(--navy)' : 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  fontWeight: msg.role === 'user' ? 600 : 400,
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* AI thinking indicator */}
          {status === "thinking" && (
            <div className="flex justify-start mb-3">
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--bg-elevated)',
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: 'var(--teal)',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Quick Chips */}
        <div 
          className="flex flex-wrap gap-[8px]"
          style={{ padding: '12px 20px', borderTop: '1px solid var(--border-opacity)' }}
        >
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-opacity)',
                color: 'var(--text-muted)',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-opacity)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        {status === 'completed' ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', borderTop: '1px solid var(--border-opacity)' }}>
            This session is completed. Start a new session to chat again.
          </div>
        ) : (
          <div 
            className="flex flex-row items-end gap-[8px]"
            style={{ padding: '16px 20px' }}
          >
            <textarea
              className="input-field flex-1"
              style={{ borderRadius: '24px', resize: 'none', minHeight: '48px', paddingTop: '12px' }}
              rows={1}
              placeholder="Type your symptoms here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === "thinking" || status === "creating"}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || status === "thinking"}
              type="button"
              className="flex-shrink-0 flex items-center justify-center transition-colors"
              style={{
                width: '48px', height: '48px',
                background: input.trim() && status !== "thinking" ? 'var(--teal)' : 'var(--bg-elevated)',
                borderRadius: '50%',
                cursor: input.trim() && status !== "thinking" ? 'pointer' : 'not-allowed'
              }}
            >
              <Send size={20} color={input.trim() && status !== "thinking" ? '#0B1426' : 'var(--text-disabled)'} />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - Results */}
      <div 
        className="w-full md:w-[400px] flex-shrink-0 flex flex-col"
        style={{ background: 'var(--bg-page)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-opacity)' }}
      >
        {/* Empty state */}
        {!report.urgencyScore && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-disabled)' }}>
            <Activity size={48} color="var(--text-muted)" className="mb-4" />
            <p style={{ fontSize: '14px' }}>Start describing your symptoms</p>
          </div>
        )}

        {/* Waiting — messages started but no report yet */}
        {messages.length > 0 && !report.urgencyScore && status !== "idle" && (
          <div className="flex flex-col gap-3 p-4">
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', paddingTop: '40px' }}>
              Analyzing your symptoms...
            </div>
            {/* Skeleton cards */}
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: '60px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ))}
          </div>
        )}

        {/* Real report — shown when AI starts returning structured data */}
        {report.urgencyScore && (
          <div className="flex flex-col gap-4 p-4 overflow-y-auto">
            
            {/* Urgency Score */}
            <div className="card" style={{ padding: '16px', borderLeft: `3px solid ${report.urgencyColor}` }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Urgency Level
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: report.urgencyColor, fontFamily: 'var(--font-sora)' }}>
                  {report.urgencyScore}/10
                </span>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: `${report.urgencyColor}18`,
                  color: report.urgencyColor
                }}>
                  {report.urgencyLabel}
                </span>
              </div>
            </div>

            {/* Recommended Specialty */}
            {report.recommendedSpecialty && (
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  See a Specialist
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
                  {report.recommendedSpecialty}
                </div>
              </div>
            )}

            {/* Matching Doctors */}
            {report.recommendedSpecialty && (
              <div className="mt-2">
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available Specialists
                </div>
                {isLoadingDoctors ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2].map(i => (
                      <div key={i} style={{ height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                  </div>
                ) : doctors?.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {doctors.map((doc: any) => (
                      <div key={doc._id} className="card flex items-center justify-between" style={{ padding: '12px', border: '1px solid var(--border-opacity)' }}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,214,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', fontWeight: 600 }}>
                            {doc.name?.replace('Dr. ', '').charAt(0) || 'D'}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{doc.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.specialty} • {doc.rating ? `⭐ ${doc.rating}` : 'New'}</div>
                          </div>
                        </div>
                        <Link href={`/doctors/${doc._id}`} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto', height: 'auto', borderRadius: '6px' }}>
                          Book
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-disabled)', padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    No specialists found matching this category right now.
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              fontSize: '11px',
              color: 'var(--text-disabled)',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              lineHeight: 1.6
            }}>
              ⚠️ This is AI-generated analysis for informational purposes only. Always consult a qualified healthcare professional for diagnosis and treatment.
            </div>

            {/* New Session button */}
            <button
              onClick={resetChecker}
              className="btn-primary w-full justify-center"
              style={{ height: '44px', fontSize: '14px' }}
            >
              Start New Session
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default function SymptomCheckerPage() {
  return (
    <AuthGuard>
      <SymptomCheckerContent />
    </AuthGuard>
  )
}
