"use client"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useRequireAuth() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login")
    }
  }, [session, isPending, router])

  return { session, isPending }
}

export function useAuth() {
  // NOTE: Never wrap hook calls in try/catch — violates React Rules of Hooks.
  // useSession() returns gracefully with data=null on error; it does not throw.
  const { data: session, isPending } = useSession()
  return {
    user: session?.user || null,
    isPending,
    isLoggedIn: !!session,
  }
}
