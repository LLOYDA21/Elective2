import { supabase } from "../supabaseClient";
import type { Task } from "../types/task";

// ✅ GET ALL TASKS FOR LOGGED USER
export const getTasks = async (): Promise<Task[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("deadline", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    throw err;
  }
};

// ✅ ADD TASK — FIXED: includes user_id
export const addTask = async (task: Task) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert([task])
    .select();

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  return data;
};

// ✅ UPDATE TASK - NEW FUNCTION FOR EDITING
export const updateTask = async (id: number, task: Partial<Task>): Promise<void> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({
        title: task.title,
        subject: task.subject,
        priority: task.priority,
        deadline: task.deadline,
        study_hours: task.studyHours,
      })
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    throw err;
  }
};

// ✅ UPDATE STATUS
export const updateTaskStatus = async (id: number, status: "Pending" | "Completed"): Promise<void> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    throw err;
  }
};

// ✅ DELETE TASK
export const deleteTask = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.error("DELETE ERROR:", err);
    throw err;
  }
};