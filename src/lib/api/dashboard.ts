import api from "@/lib/axios";

export interface DashboardStats {
  symptomSessions: number;
  documentsUploaded: number;
  drugChecks: number;
  savedDoctors: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  date: string; // human-readable relative string e.g. "2 hours ago"
  status: "completed" | "active";
  type: "symptom" | "document" | "drug" | "doctor";
}

export interface ChartPoint {
  day: string; // e.g. "Mon"
  sessions: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  chartData: ChartPoint[];
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/dashboard");
  return data;
}
