import { useEffect, useState } from "react";
import type { Task } from "../types/task";
import { getTasks, addTask, deleteTask, updateTaskStatus } from "../services/taskService";

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [deadline, setDeadline] = useState("");
  const [studyHours, setStudyHours] = useState(1);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) return alert("Title required");

    const newTask: Task = {
      title,
      subject: subject || "",
      priority,
      deadline: deadline || "",
      studyHours,
      status: "Pending",
    };

    try {
      await addTask(newTask);
      setTitle(""); setSubject(""); setPriority("Medium"); setDeadline(""); setStudyHours(1);
      loadTasks();
    } catch (err) {
      alert("Add failed");
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm("Delete?")) return;
    await deleteTask(id);
    loadTasks();
  };

  const handleDone = async (id?: number) => {
    if (!id) return;
    await updateTaskStatus(id, "Completed");
    loadTasks();
  };

  return (
    <div className="dashboard-card task-section">
      <h2>Manage Tasks</h2>

      <div className="task-input-box">
        <input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <input type="number" min="1" value={studyHours} onChange={(e) => setStudyHours(Number(e.target.value))} />
        <button onClick={handleAdd}>Add Task</button>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p>No tasks added.</p>
        ) : (
          tasks.map((task) => (
            <div className={`task-item ${task.status === "Completed" ? "bg-green-50" : ""}`} key={task.id}>
              <div>
                <h4>{task.title}</h4>
                <p>Subject: {task.subject || "—"}</p>
                <p>Priority: {task.priority}</p>
                <p>Deadline: {task.deadline || "No deadline"}</p>
                <p>Hours: {task.studyHours}h</p>
                <p>Status: {task.status}</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {task.status === "Pending" && (
                  <button className="complete-btn" onClick={() => handleDone(task.id)}>✅ Done</button>
                )}
                <button className="delete-btn" onClick={() => handleDelete(task.id)}>🗑 Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}