"use client"
import { useRequireAuth } from "@/hooks/use-auth"

export default function AuthGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { session, isPending } = useRequireAuth()

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] w-full">
        <div className="pulse-dot scale-150" />
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
