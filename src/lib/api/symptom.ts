import api from "@/lib/axios"

export interface SessionTurn {
  _id: string
  sessionId: string
  role: "user" | "assistant"
  content: string
  turnIndex: number
  createdAt: string
}

export interface SymptomSession {
  _id: string
  userId: string
  status: "active" | "completed"
  initialSymptoms: string[]
  urgencyScore?: number
  recommendedSpecialty?: string
  finalReport?: {
    summary?: string
    differentials?: Array<{ condition: string; likelihood: string; reasoning: string }>
    redFlags?: string[]
    nextSteps?: string[]
  }
  turns?: SessionTurn[]
  createdAt: string
}

// Create a new symptom session
export async function createSymptomSession(initialSymptoms: string[]): Promise<SymptomSession> {
  const { data } = await api.post("/api/symptom-sessions", { initialSymptoms })
  return data.data
}

// Send a message and get AI response
export async function sendSymptomMessage(sessionId: string, userMessage: string): Promise<string> {
  const { data } = await api.post("/api/ai/symptom-chat", { sessionId, userMessage })
  return data.data
}

// Get full session with turns
export async function getSessionById(id: string): Promise<SymptomSession> {
  const { data } = await api.get(`/api/symptom-sessions/${id}`)
  return data.data
}

// Get all sessions for history
export async function getSessions(): Promise<SymptomSession[]> {
  const { data } = await api.get("/api/symptom-sessions")
  return data.data
}

// Complete a session with final report
export async function completeSession(
  id: string,
  payload: { finalReport: object; urgencyScore: number; recommendedSpecialty: string }
): Promise<SymptomSession> {
  const { data } = await api.patch(`/api/symptom-sessions/${id}/complete`, payload)
  return data.data
}
