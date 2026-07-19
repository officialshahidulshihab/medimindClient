"use client"
import { useState, useCallback, useRef } from "react"
import { createSymptomSession, sendSymptomMessage } from "@/lib/api/symptom"
import type { SessionTurn, SymptomSession } from "@/lib/api/symptom"
import { useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { useToast } from '@/components/ui/toast';

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type CheckerStatus = "idle" | "creating" | "chatting" | "thinking" | "completed" | "error"

export function useSymptomChecker() {
  const [status, setStatus] = useState<CheckerStatus>("idle")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [session, setSession] = useState<SymptomSession | null>(null)
  const [error, setError] = useState<string>("")
  const sessionIdRef = useRef<string | null>(null)
  const queryClient = useQueryClient()
  const toast = useToast()

  // Send message — creates session on first message automatically
  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || status === "thinking") return
    setError("")

    const userMessage: ChatMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // First message: create session
      if (!sessionIdRef.current) {
        setStatus("creating")
        const newSession = await createSymptomSession([userInput])
        sessionIdRef.current = newSession._id
        setSession(newSession)
      }

      setStatus("thinking")

      // Send to AI
      const aiResponse = await sendSymptomMessage(sessionIdRef.current!, userInput)

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setStatus("chatting")

      // Parse urgency from AI response to show in right panel
      // The AI agent embeds structured data — extract it
      tryParseReport(aiResponse)

    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to get AI response. Please try again.";
      toast.error(msg);
      setError(msg);
      setStatus("error");
    }
  }, [status])

  // Try to extract structured report from AI response text
  const [report, setReport] = useState<{
    urgencyScore?: number
    urgencyLabel?: string
    urgencyColor?: string
    recommendedSpecialty?: string
    differentials?: Array<{ condition: string; likelihood: string }>
    redFlags?: string[]
    nextSteps?: string[]
  }>({})

  async function tryParseReport(aiText: string) {
    // Check for urgency indicators in AI response
    const urgencyMatch = aiText.match(/Urgency[:\s*]+(\d+)\s*\/\s*10/i) || aiText.match(/urgency[:\s]+(\d+)/i)
    if (urgencyMatch) {
      const score = parseInt(urgencyMatch[1])
      setReport(prev => ({
        ...prev,
        urgencyScore: score,
        urgencyLabel: score >= 8 ? "High" : score >= 5 ? "Moderate" : "Low",
        urgencyColor: score >= 8 ? "var(--danger)" : score >= 5 ? "var(--warning)" : "var(--success)",
      }))
    }
    // Check for specialty recommendation
    const specialtyMatch = aiText.match(/See a[:\s]+\[?([A-Za-z\s]+)\]?/i);
    const specialty = specialtyMatch ? specialtyMatch[1].trim() : 'General Physician';
    setReport(prev => ({ ...prev, recommendedSpecialty: specialty }));

    // Call complete endpoint whenever urgency is detected (specialty is optional)
    const currentSessionId = sessionIdRef.current;
    if (urgencyMatch && currentSessionId) {
      const urgencyScore = parseInt(urgencyMatch[1]);
      const recommendedSpecialty = specialty;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:5000';

      try {
        const res = await fetch(`${API_BASE}/api/symptom-sessions/${currentSessionId}/complete`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            urgencyScore,
            recommendedSpecialty,
            finalReport: { summary: aiText }
          })
        });
        if (res.ok) {
          setStatus('completed');
          queryClient.invalidateQueries({ queryKey: ['symptom-sessions'] });
          queryClient.invalidateQueries({ queryKey: ['session', currentSessionId] });
        } else {
          console.error('completeSession failed:', res.status, await res.text());
        }
      } catch (err) {
        console.error('Failed to complete session', err);
      }
    }
  }

  const loadSession = useCallback((loadedSession: SymptomSession) => {
    setSession(loadedSession);
    sessionIdRef.current = loadedSession._id;
    
    if (loadedSession.turns && loadedSession.turns.length > 0) {
      setMessages(loadedSession.turns.map(turn => ({
        role: turn.role,
        content: turn.content,
        timestamp: new Date(turn.createdAt)
      })));
    } else {
      setMessages([{ role: 'user', content: loadedSession.initialSymptoms?.[0] || 'Unknown', timestamp: new Date(loadedSession.createdAt) }]);
    }
    
    setStatus(loadedSession.status === 'completed' ? 'completed' : 'chatting');
    setError("");

    if (loadedSession.urgencyScore) {
      const score = loadedSession.urgencyScore;
      setReport({
        urgencyScore: score,
        urgencyLabel: score >= 8 ? "High" : score >= 5 ? "Moderate" : "Low",
        urgencyColor: score >= 8 ? "var(--danger)" : score >= 5 ? "var(--warning)" : "var(--success)",
        recommendedSpecialty: loadedSession.recommendedSpecialty || 'General Physician',
      });
    } else {
      setReport({});
    }
  }, []);

  const resetChecker = useCallback(() => {
    setStatus("idle")
    setMessages([])
    setSession(null)
    setReport({})
    setError("")
    sessionIdRef.current = null
  }, [])

  return {
    status,
    messages,
    session,
    report,
    error,
    sendMessage,
    resetChecker,
    loadSession,
  }
}
