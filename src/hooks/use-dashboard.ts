import { useQuery } from "@tanstack/react-query"
import { fetchDashboardData } from "@/lib/api/dashboard"

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 2,   // 2 minutes
    retry: 2,
  })
}
