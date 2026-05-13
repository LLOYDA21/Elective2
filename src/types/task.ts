export interface Task {
  id?: number;
  user_id?: string;
  title: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  studyHours: number;
  // ✅ Add In Progress + Overdue
  status: "Pending" | "Completed" | "In Progress" | "Overdue";
}