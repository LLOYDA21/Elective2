import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./../supabaseClient";
import type { Task } from "./../types/task";

import { 
  FiHome, 
  FiList, 
  FiCheckCircle, 
  FiPlusCircle, 
  FiCpu,
  FiCalendar,
  FiUser,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';

import {
  getTasks,
  addTask,
  deleteTask,
  updateTaskStatus,
  updateTask,
} from "./../services/taskService";

export default function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [userName, setUserName] = useState("");

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] =
    useState<"High" | "Medium" | "Low">("Medium");

  const [deadline, setDeadline] = useState("");
  const [studyHours, setStudyHours] = useState(1);

  const [loading, setLoading] = useState(false);

  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [studyPlan, setStudyPlan] = useState<any[]>([]);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const [taskFilter, setTaskFilter] = useState<"all" | "today" | "next7" | "priority" | "subject">("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("");
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const [dailyAvailableHours, setDailyAvailableHours] = useState(3);

  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set());

  // EDIT MODAL STATE
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editPriority, setEditPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editDeadline, setEditDeadline] = useState("");
  const [editStudyHours, setEditStudyHours] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);

  // Calendar state
const [currentDate, setCurrentDate] = useState(new Date());
const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
const [showDateModal, setShowDateModal] = useState(false);
const [showTaskModal, setShowTaskModal] = useState(false);

const [activePlanTab, setActivePlanTab] = useState<'plan' | 'analytics' | 'tips'>('plan');

// Profile state
const [showEditProfile, setShowEditProfile] = useState(false);
const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editBio, setEditBio] = useState("");
const [userEmail, setUserEmail] = useState("");

// Settings state
const [activeSettingsTab, setActiveSettingsTab] = useState('general');
const [defaultView, setDefaultView] = useState('dashboard');
const [language, setLanguage] = useState('en');
const [timezone, setTimezone] = useState('America/New_York');
const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
const [emailNotifications, setEmailNotifications] = useState(true);
const [dailyReminders, setDailyReminders] = useState(true);
const [deadlineAlerts, setDeadlineAlerts] = useState(true);
const [browserNotifications, setBrowserNotifications] = useState(false);
const [reminderTime, setReminderTime] = useState('09:00');
const [darkMode, setDarkMode] = useState(false);
const [accentColor, setAccentColor] = useState('purple');
const [fontSize, setFontSize] = useState('medium');
const [cardLayout, setCardLayout] = useState('grid');
const [defaultPriority, setDefaultPriority] = useState('Medium');
const [defaultStudyHours, setDefaultStudyHours] = useState(1);
const [autoSave, setAutoSave] = useState(true);
const [showCompleted, setShowCompleted] = useState(false);
const [aiPriority, setAiPriority] = useState('balanced');
const [backupFrequency, setBackupFrequency] = useState('weekly');

  // =========================
  // AUTH
  // =========================
  useEffect(() => {
  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    setUserName(user.user_metadata?.full_name || "Student");
    setUserEmail(user.email || "");  // ADD THIS LINE

    loadTasks();
  };

  checkUser();
}, [navigate]);

  // =========================
  // LOAD TASKS
  // =========================
  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // =========================
  // ADD TASK
  // =========================
  const handleAdd = async () => {
    if (!title.trim()) {
      alert("Please enter task title");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User not found");
        return;
      }

      const newTask = {
        title,
        subject,
        priority,
        deadline,
        study_hours: studyHours,
        status: "Pending",
        user_id: user.id,
      };

      await addTask(newTask as any);

      setTitle("");
      setSubject("");
      setPriority("Medium");
      setDeadline("");
      setStudyHours(1);

      loadTasks();
    } catch (err: any) {
      console.error(err);
      alert("Add failed: " + err.message);
    }
  };

  // =========================
  // UPDATE TASK (EDIT)
  // =========================
const handleUpdateTask = async () => {
  if (!editingTask) return;
  if (!editingTask.id) {
    alert("Invalid task ID");
    return;
  }
  if (!editTitle.trim()) {
    alert("Please enter task title");
    return;
  }

  try {
    const updatedTask = {
      ...editingTask,
      title: editTitle,
      subject: editSubject,
      priority: editPriority,
      deadline: editDeadline,
      study_hours: editStudyHours,
    };

    await updateTask(editingTask.id, updatedTask);
    
    setShowEditModal(false);
    setEditingTask(null);
    loadTasks();
    alert("Task updated successfully!");
  } catch (err: any) {
    alert("Update failed: " + err.message);
  }
};

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditSubject(task.subject || "");
    setEditPriority(task.priority as "High" | "Medium" | "Low");
    setEditDeadline(task.deadline || "");
    setEditStudyHours(task.studyHours || task.studyHours || 1);
    setShowEditModal(true);
  };

  // =========================
  // DELETE TASK
  // =========================
  const handleDelete = async (id: number) => {  // Changed: removed | undefined
  if (!id) return;

  if (!window.confirm("Delete this task?")) return;

  try {
    await deleteTask(id);
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    loadTasks();
    alert("Task deleted successfully!");
  } catch (err: any) {
    alert("Delete failed: " + err.message);
  }
};


  // =========================
  // COMPLETE TASK (BANISH - moves to completed)
  // =========================
  const handleMarkDone = async (id: number | undefined) => {
    if (!id) return;

    if (!window.confirm("Mark this task as completed?")) return;

    try {
      await updateTaskStatus(id, "Completed");
      setExpandedTaskId(null);
      loadTasks();
      alert("✅ Task marked as completed and moved to Completed Tasks!");
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  // =========================
  // RESTORE TASK (from completed back to pending)
  // =========================
  const handleRestoreTask = async (id: number | undefined) => {
    if (!id) return;

    if (!window.confirm("Restore this task to pending?")) return;

    try {
      await updateTaskStatus(id, "Pending");
      loadTasks();
      alert("Task restored to pending tasks!");
    } catch (err: any) {
      alert("Restore failed: " + err.message);
    }
  };

  // =========================
  // PERMANENT DELETE FROM COMPLETED
  // =========================
  const handleDeleteCompleted = async (id: number | undefined) => {
    if (!id) return;

    if (!window.confirm("Permanently delete this completed task?")) return;

    try {
      await deleteTask(id);
      loadTasks();
      alert("Task permanently deleted!");
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  // =========================
  // CHECKBOX TOGGLE
  // =========================
  const handleCheckToggle = (id: number) => {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // =========================
  // AI GENERATE
  // =========================
  const handleGenerateAI = async () => {
    try {
      setLoading(true);

      if (tasks.length === 0) {
        alert("No tasks available.");
        return;
      }

      let filteredTasks =
        selectedSubjects.length > 0
          ? tasks.filter((task: any) =>
              selectedSubjects.includes(task.subject) && task.status !== "Completed"
            )
          : tasks.filter((task: any) => task.status !== "Completed");

      if (filteredTasks.length === 0) {
        alert("No pending tasks in selected subjects.");
        return;
      }

      const priorityOrder: any = { High: 1, Medium: 2, Low: 3 };

      const sortedTasks = [...filteredTasks].sort((a: any, b: any) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (dateA !== dateB) return dateA - dateB;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      let plan: any[] = [];
      let currentDayIndex = 0;
      let remainingHoursToday = dailyAvailableHours;

      for (const task of sortedTasks) {
        let totalHoursNeeded = Number(task.studyHours || 1);
        let taskRemaining = totalHoursNeeded;

        while (taskRemaining > 0) {
          if (remainingHoursToday <= 0) {
            currentDayIndex = (currentDayIndex + 1) % days.length;
            remainingHoursToday = dailyAvailableHours;
          }

          const assignHours = Math.min(taskRemaining, remainingHoursToday);

          plan.push({
            day: days[currentDayIndex],
            title: task.title,
            subject: task.subject,
            priority: task.priority,
            deadline: task.deadline || "No deadline",
            hours: assignHours,
            totalHoursNeeded: totalHoursNeeded,
            note: `${assignHours}h assigned / ${totalHoursNeeded}h total`,
          });

          taskRemaining -= assignHours;
          remainingHoursToday -= assignHours;
        }
      }

      setStudyPlan(plan);
      alert("✅ AI Study Plan Generated Successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // =========================
  // STATS
  // =========================
  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const totalSubjects = new Set(
    tasks.map((task) => task.subject)
  ).size;

  const uniqueSubjects = [
    ...new Set(tasks.map((task) => task.subject)),
  ];

  const totalStudyHours = tasks.reduce(
    (sum, task: any) =>
      sum + Number(task.study_hours || task.studyHours || 0),
    0
  );

  // =========================
  // FILTER TASKS LOGIC
  // =========================
  const filteredTasks = tasks.filter((task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = task.deadline ? new Date(task.deadline) : null;

    switch (taskFilter) {
      case "today":
        return taskDate?.toDateString() === today.toDateString();

      case "next7": {
        const next7 = new Date();
        next7.setDate(today.getDate() + 7);
        return taskDate && taskDate >= today && taskDate <= next7;
      }

      case "priority":
        return task.priority === "High";

      case "subject":
        return selectedSubjectFilter ? task.subject === selectedSubjectFilter : true;

      default:
        return true;
    }
  });

  // Pending tasks (not completed)
  const pendingTasksList = filteredTasks.filter(task => task.status !== "Completed");
  
  // Completed tasks only
  const completedTasksList = tasks.filter(task => task.status === "Completed");

  // Calendar Helper Functions
const getMonthDays = () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthLastDay - i));
  }
  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  // Add days from next month to complete 42 days (6 weeks)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  return days;
};

const getWeekDays = () => {
  const today = new Date(currentDate);
  const day = today.getDay();
  const diff = today.getDate() - day;
  const weekStart = new Date(today.setDate(diff));
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    weekDays.push(date);
  }
  return weekDays;
};

const getDayHours = () => {
  return Array.from({ length: 24 }, (_, i) => i);
};

const getTasksForDate = (date: Date) => {
  return tasks.filter(task => {
    if (!task.deadline || task.status === "Completed") return false;
    const taskDate = new Date(task.deadline);
    return isSameDay(taskDate, date);
  });
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
};

const navigateCalendar = (direction: number) => {
  const newDate = new Date(currentDate);
  if (calendarView === 'month') {
    newDate.setMonth(newDate.getMonth() + direction);
  } else if (calendarView === 'week') {
    newDate.setDate(newDate.getDate() + (direction * 7));
  } else {
    newDate.setDate(newDate.getDate() + direction);
  }
  setCurrentDate(newDate);
};

// =========================
// EXPORT PLAN FUNCTIONS
// =========================
const exportPlan = (format: 'csv' | 'pdf' | 'ical') => {
  if (studyPlan.length === 0) {
    alert("No plan to export. Generate a plan first!");
    return;
  }

  if (format === 'csv') {
    // Create CSV data
    const headers = ['Day', 'Subject', 'Task Title', 'Hours', 'Priority', 'Deadline'];
    const rows = studyPlan.map(item => [
      item.day,
      item.subject,
      item.title,
      item.hours,
      item.priority,
      item.deadline
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-plan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ Plan exported as CSV!");
  } 
  else if (format === 'ical') {
    // Create iCal format for calendar import
    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//StudyPlanner AI//Study Plan//EN
`;
    studyPlan.forEach((item, index) => {
      const startDate = new Date();
      const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(item.day);
      const today = new Date();
      const currentDay = today.getDay();
      const daysToAdd = (dayIndex + 1 - currentDay + 7) % 7;
      startDate.setDate(today.getDate() + daysToAdd);
      
      icalContent += `BEGIN:VEVENT
UID:${index}@studyplanner.ai
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${item.subject}: ${item.title}
DESCRIPTION:Priority: ${item.priority}\\nHours: ${item.hours}
END:VEVENT
`;
    });
    icalContent += `END:VCALENDAR`;
    
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-plan-${new Date().toISOString().split('T')[0]}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ Plan exported as iCalendar file!");
  }
  else {
    alert("PDF export coming soon!");
  }
};

// =========================
// SYNC WITH CALENDAR
// =========================
const syncWithCalendar = async () => {
  if (studyPlan.length === 0) {
    alert("No plan to sync. Generate a plan first!");
    return;
  }

  try {
    const exportFormat = window.confirm("Would you like to download an iCal file to import into your calendar?");
    if (exportFormat) {
      exportPlan('ical');
    } else {
      // Copy to clipboard as text
      const planText = studyPlan.map(item => 
        `${item.day}: ${item.subject} - ${item.title} (${item.hours}h) [${item.priority} priority]`
      ).join('\n');
      
      await navigator.clipboard.writeText(planText);
      alert("✅ Plan copied to clipboard! You can paste it into your calendar app.");
    }
  } catch (err) {
    alert("Failed to sync: " + (err as Error).message);
  }
};

// =========================
// AUTO-RESCHEDULE PLAN
// =========================
const autoReschedule = () => {
  if (studyPlan.length === 0) {
    alert("No plan to optimize. Generate a plan first!");
    return;
  }

  try {
    // Smart algorithm to redistribute tasks based on priorities and deadlines
    const rescheduledPlan = [...studyPlan];
    
    // Sort by priority and deadline
    const priorityOrder: any = { High: 1, Medium: 2, Low: 3 };
    rescheduledPlan.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by deadline
      const dateA = a.deadline !== "No deadline" ? new Date(a.deadline).getTime() : Infinity;
      const dateB = b.deadline !== "No deadline" ? new Date(b.deadline).getTime() : Infinity;
      return dateA - dateB;
    });
    
    // Redistribute hours more evenly across days
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const optimizedPlan: any[] = [];
    let currentDayIndex = 0;
    let remainingHours = dailyAvailableHours;
    
    for (const task of rescheduledPlan) {
      let hoursRemaining = task.totalHoursNeeded || task.hours;
      
      while (hoursRemaining > 0) {
        if (remainingHours <= 0) {
          currentDayIndex = (currentDayIndex + 1) % days.length;
          remainingHours = dailyAvailableHours;
        }
        
        const assignHours = Math.min(hoursRemaining, remainingHours);
        optimizedPlan.push({
          ...task,
          day: days[currentDayIndex],
          hours: assignHours,
          note: `${assignHours}h assigned / ${task.totalHoursNeeded || task.hours}h total (Optimized)`
        });
        
        hoursRemaining -= assignHours;
        remainingHours -= assignHours;
      }
    }
    
    setStudyPlan(optimizedPlan);
    alert("✅ Plan has been optimized based on priorities and deadlines!");
  } catch (err) {
    alert("Failed to optimize plan: " + (err as Error).message);
  }
};

// =========================
// UPDATE PROFILE
// =========================
const handleUpdateProfile = async () => {
  if (!editName.trim()) {
    alert("Please enter your name");
    return;
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: editName, bio: editBio }
      });
      
      if (error) throw error;
      
      setUserName(editName);
      alert("✅ Profile updated successfully!");
      setShowEditProfile(false);
    }
  } catch (err: any) {
    alert("Update failed: " + err.message);
  }
};

// Load user data when profile opens
useEffect(() => {
  if (activeMenu === "profile") {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEditName(user.user_metadata?.full_name || "");
        setEditEmail(user.email || "");
        setEditBio(user.user_metadata?.bio || "");
      }
    };
    loadUserData();
  }
}, [activeMenu]);

// =========================
// SETTINGS FUNCTIONS
// =========================
const saveAllSettings = () => {
  // Save settings to localStorage
  const settings = {
    defaultView, language, timezone, dateFormat,
    emailNotifications, dailyReminders, deadlineAlerts, browserNotifications, reminderTime,
    darkMode, accentColor, fontSize, cardLayout,
    defaultPriority, defaultStudyHours, autoSave, showCompleted, aiPriority, backupFrequency
  };
  localStorage.setItem('studyPlannerSettings', JSON.stringify(settings));
  alert("✅ Settings saved successfully!");
  
  // Apply dark mode if enabled
  if (darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
};

const exportAllData = () => {
  const data = {
    tasks,
    settings: {
      defaultView, language, timezone, dateFormat,
      emailNotifications, dailyReminders, deadlineAlerts, browserNotifications, reminderTime,
      darkMode, accentColor, fontSize, cardLayout,
      defaultPriority, defaultStudyHours, autoSave, showCompleted, aiPriority, backupFrequency
    },
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studyplanner-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  alert("✅ Data exported successfully!");
};

const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (data.tasks) {
        // Import tasks (you'd need to implement this with your backend)
        alert("Data imported successfully! Please refresh the page.");
      }
    } catch (err) {
      alert("Invalid file format");
    }
  };
  reader.readAsText(file);
};

const clearAllData = () => {
  if (window.confirm("⚠️ WARNING: This will permanently delete ALL your tasks. This action cannot be undone. Are you sure?")) {
    if (window.confirm("LAST WARNING: Type 'DELETE' to confirm")) {
      const confirmText = prompt('Type "DELETE" to confirm:');
      if (confirmText === 'DELETE') {
        // Implement delete all tasks logic
        alert("All data has been cleared.");
      }
    }
  }
};

// Load settings from localStorage on mount
useEffect(() => {
  const savedSettings = localStorage.getItem('studyPlannerSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    setDefaultView(settings.defaultView || 'dashboard');
    setLanguage(settings.language || 'en');
    setTimezone(settings.timezone || 'America/New_York');
    setDateFormat(settings.dateFormat || 'MM/DD/YYYY');
    setEmailNotifications(settings.emailNotifications ?? true);
    setDailyReminders(settings.dailyReminders ?? true);
    setDeadlineAlerts(settings.deadlineAlerts ?? true);
    setBrowserNotifications(settings.browserNotifications ?? false);
    setReminderTime(settings.reminderTime || '09:00');
    setDarkMode(settings.darkMode || false);
    setAccentColor(settings.accentColor || 'purple');
    setFontSize(settings.fontSize || 'medium');
    setCardLayout(settings.cardLayout || 'grid');
    setDefaultPriority(settings.defaultPriority || 'Medium');
    setDefaultStudyHours(settings.defaultStudyHours || 1);
    setAutoSave(settings.autoSave ?? true);
    setShowCompleted(settings.showCompleted ?? false);
    setAiPriority(settings.aiPriority || 'balanced');
    setBackupFrequency(settings.backupFrequency || 'weekly');
  }
}, []);

  return (
    <div className="dashboard-layout">
      {/* EDIT MODAL */}
      {showEditModal && editingTask && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Task</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className="task-row">
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estimated Time (hrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={editStudyHours}
                    onChange={(e) => setEditStudyHours(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleUpdateTask}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* SIDEBAR */}
      {/* ========================= */}
      <aside className="sidebar">
        <div>
          <div className="logo-box">
            <h2>StudyPlanner AI</h2>
          </div>

          <div className="menu-items">
            <button
              className={`menu-btn ${activeMenu === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveMenu("dashboard")}
            >
              <FiHome size={20} />
              <p>Dashboard</p>
            </button>

            <button
              className={`menu-btn ${activeMenu === "tasks" ? "active" : ""}`}
              onClick={() => setActiveMenu("tasks")}
            >
              <FiList size={20} />
              <p>My Tasks</p>
            </button>

            <button
              className={`menu-btn ${activeMenu === "completed" ? "active" : ""}`}
              onClick={() => setActiveMenu("completed")}
            >
              <FiCheckCircle size={20} />
              <p>Completed</p>
            </button>

            <button
              className={`menu-btn ${activeMenu === "addtask" ? "active" : ""}`}
              onClick={() => setActiveMenu("addtask")}
            >
              <FiPlusCircle size={20} />
              <p>Add Task</p>
            </button>

            <button
              className={`menu-btn ${activeMenu === "ai" ? "active" : ""}`}
              onClick={() => setActiveMenu("ai")}
            >
              <FiCpu size={20} />
              <p>AI Planner</p>
            </button>

            <button
              className={`menu-btn ${activeMenu === "calendar" ? "active" : ""}`}
              onClick={() => setActiveMenu("calendar")}
            >
              <FiCalendar size={20} />
              <p>Calendar</p>
            </button>

            <button
              className={`menu-btn ${activeMenu === "profile" ? "active" : ""}`}
              onClick={() => setActiveMenu("profile")}
            >
              <FiUser size={20} />
              <p>Profile</p>
            </button>

            <button
              className={`menu-btn ${activeMenu === "settings" ? "active" : ""}`}
              onClick={() => setActiveMenu("settings")}
            >
              <FiSettings size={20} />
              <p>Settings</p>
            </button>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut size={20} />
          Logout
        </button>
      </aside>
      
      {/* ========================= */}
      {/* MAIN */}
      {/* ========================= */}
      <main className="dashboard-main">

        {/* ========================= */}
        {/* DASHBOARD */}
        {/* ========================= */}
        {activeMenu === "dashboard" && (
          <>
            <div className="top-header">
              <div>
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-subtitle">
                  Here's your study overview for today
                </p>
              </div>
              <div className="user-box">
                <span>Hello, {userName} 👋</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div>
                  <p>Pending Tasks</p>
                  <h2>{pendingTasks}</h2>
                </div>
                <div className="stat-icon purple">📋</div>
              </div>

              <div className="stat-card">
                <div>
                  <p>Completed Tasks</p>
                  <h2>{completedTasks}</h2>
                </div>
                <div className="stat-icon green">✅</div>
              </div>

              <div className="stat-card">
                <div>
                  <p>Subjects</p>
                  <h2>{totalSubjects}</h2>
                </div>
                <div className="stat-icon blue">📚</div>
              </div>

              <div className="stat-card">
                <div>
                  <p>Study Hours</p>
                  <h2>{totalStudyHours}h</h2>
                </div>
                <div className="stat-icon orange">⏰</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Upcoming Deadlines</h3>
                </div>
                {pendingTasksList.length === 0 ? (
                  <p>No pending tasks available.</p>
                ) : (
                  pendingTasksList.slice(0, 4).map((task: any) => (
                    <div className="deadline-item" key={task.id}>
                      <div>
                        <h4>{task.title}</h4>
                        <p>{task.deadline || "No deadline"}</p>
                      </div>
                      <span className={`deadline-badge ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="dashboard-card">
                <h3>Tasks Overview</h3>
                <div className="overview-center">
                  <div className="circle-chart">
                    <div className="circle-inner">
                      <h2>{tasks.length}</h2>
                      <p>Total</p>
                    </div>
                  </div>
                  <div className="overview-legend">
                    <div>
                      <span className="dot purple"></span>
                      Pending ({pendingTasks})
                    </div>
                    <div>
                      <span className="dot green"></span>
                      Completed ({completedTasks})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-banner">
              <div>
                <h3>✨ AI Recommendation</h3>
                <p>
                  Study your highest priority tasks first and focus on upcoming deadlines.
                </p>
              </div>
              <button className="primary-btn" onClick={handleGenerateAI}>
                {loading ? "Generating..." : "View AI Plan"}
              </button>
            </div>
          </>
        )}

        {/* ========================= */}
        {/* ADD TASK */}
        {/* ========================= */}
        {activeMenu === "addtask" && (
          <div className="addtask-page">
            <div className="top-header">
              <div>
                <h1 className="dashboard-title">Add New Task</h1>
                <p className="dashboard-subtitle">
                  Add your study task and stay on track.
                </p>
              </div>
              <div className="user-box">Hello, {userName} 👋</div>
            </div>

            <div className="addtask-card">
              <h3 className="section-title">Task Details</h3>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject (e.g. Mathematics)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="task-row">
                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estimated Time (hrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="task-actions">
                <button className="cancel-btn">Cancel</button>
                <button className="addtask-btn" onClick={handleAdd}>
                  + Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* MY TASKS (PENDING ONLY) */}
        {/* ========================= */}
        {activeMenu === "tasks" && (
          <div
            className="dashboard-card task-section"
            style={{ width: "100%", maxWidth: "900px" }}
          >
            <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 20px 0" }}>
              My Tasks - Pending
            </h2>

            {/* TASK INBOX & OVERVIEW */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "20px",
                backgroundColor: "#ffffff",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 12px 0" }}>
                TASK INBOX & OVERVIEW
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                  textAlign: "left",
                }}
              >
                <div>
                  <span style={{ fontSize: "17px" }}>Total Tasks:</span>
                  <span style={{ fontSize: "17px", fontWeight: "500", marginLeft: "4px" }}>
                    {tasks.length}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "17px" }}>In Progress:</span>
                  <span style={{ fontSize: "17px", fontWeight: "500", marginLeft: "4px" }}>
                    {pendingTasks}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "17px" }}>Overdue:</span>
                  <span
                    style={{
                      fontSize: "17px",
                      fontWeight: "500",
                      color: "#d32f2f",
                      marginLeft: "4px",
                    }}
                  >
                    {
                      pendingTasksList.filter((t) => {
                        const today = new Date().toISOString().split("T")[0];
                        return (
                          t.deadline &&
                          t.deadline < today &&
                          t.status !== "Completed"
                        );
                      }).length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* FILTER BUTTONS */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              {(
                [
                  { key: "all", label: "All Tasks" },
                  { key: "today", label: "Today" },
                  { key: "next7", label: "Next 7 Days" },
                  { key: "priority", label: "Priority" },
                  { key: "subject", label: "By Subject" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTaskFilter(key)}
                  style={{
                    backgroundColor: taskFilter === key ? "#6a5acd" : "#e5e7eb",
                    color: taskFilter === key ? "white" : "#1f2937",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* SUBJECT DROPDOWN */}
            {taskFilter === "subject" && (
              <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">Select subject</option>
                  {uniqueSubjects.map((sub, i) => (
                    <option key={i} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* TASK LIST */}
            <div
              className="task-list"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
              }}
            >
              {pendingTasksList.length === 0 ? (
                <p style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                  🎉 No pending tasks! Great job!
                </p>
              ) : (
                pendingTasksList.map((task: any) => {
                  const priorityDotColor =
                    task.priority === "High"
                      ? "#d32f2f"
                      : task.priority === "Medium"
                      ? "#f59e0b"
                      : "#3b82f6";

                  const isChecked = checkedTasks.has(task.id);
                  const isExpanded = expandedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: isExpanded ? "#f9f7ff" : "white",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                      }}
                    >
                      {/* MAIN ROW */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto auto 1fr auto auto",
                          alignItems: "center",
                          gap: "12px",
                          padding: "14px 20px",
                        }}
                        onClick={() =>
                          setExpandedTaskId(isExpanded ? null : task.id)
                        }
                      >
                        {/* CHECKBOX */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckToggle(task.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: "pointer" }}
                        />

                        {/* PRIORITY DOT */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            minWidth: "70px",
                          }}
                        >
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: priorityDotColor,
                              display: "inline-block",
                            }}
                          />
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {task.priority}
                          </span>
                        </div>

                        {/* TASK INFO */}
                        <div>
                          <div style={{ fontSize: "15px", marginBottom: "2px" }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            {task.subject}
                          </div>
                        </div>

                        {/* DEADLINE */}
                        <div style={{ textAlign: "right", fontSize: "14px" }}>
                          {task.deadline ? (
                            <span>Due: {task.deadline}</span>
                          ) : (
                            <span style={{ color: "#6b7280" }}>No deadline</span>
                          )}
                        </div>

                        {/* DELETE — only visible when checkbox is checked */}
                        {isChecked ? (
  <button
    onClick={(e) => {
      e.stopPropagation();
      if (task.id) handleDelete(task.id);  // Add check for task.id
    }}
    style={{
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "4px 10px",
      fontSize: "13px",
      cursor: "pointer",
    }}
  >
    Delete
  </button>
) : (
  <div style={{ width: "58px" }} />
)}
                      </div>

                      {/* EXPANDED ROW — Edit & Complete buttons */}
                      {isExpanded && (
                        <div
                          style={{
                            padding: "0 20px 14px 52px",
                            display: "flex",
                            gap: "10px",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* EDIT BUTTON */}
                          <button
                            style={{
                              backgroundColor: "white",
                              color: "#374151",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              padding: "5px 16px",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                            onClick={() => openEditModal(task)}
                          >
                            ✏️ Edit
                          </button>

                          {/* COMPLETE BUTTON */}
                          <button
                            onClick={() => handleMarkDone(task.id)}
                            style={{
                              backgroundColor: "#1D9E75",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              padding: "5px 16px",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            ✅ Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

{activeMenu === "completed" && (
  <div
    className="dashboard-card task-section"
    style={{ width: "100%", maxWidth: "900px" }}
  >
    <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 20px 0" }}>
      ✅ Completed Tasks
    </h2>

    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "20px",
        backgroundColor: "#f0fdf4",
      }}
    >
      <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 12px 0", color: "#166534" }}>
        Completed Tasks Summary
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          textAlign: "left",
        }}
      >
        <div>
          <span style={{ fontSize: "17px" }}>Total Completed:</span>
          <span style={{ fontSize: "17px", fontWeight: "500", marginLeft: "4px", color: "#166534" }}>
            {completedTasks}
          </span>
        </div>
        <div>
          <span style={{ fontSize: "17px" }}>Total Study Hours Completed:</span>
          <span style={{ fontSize: "17px", fontWeight: "500", marginLeft: "4px", color: "#166534" }}>
            {completedTasksList.reduce((sum, task: any) => 
              sum + Number(task.study_hours || task.studyHours || 0), 0
            )} hrs
          </span>
        </div>
      </div>
    </div>

    {/* COMPLETED TASKS LIST */}
    <div
      className="task-list"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
      }}
    >
      {completedTasksList.length === 0 ? (
        <p style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          🎯 No completed tasks yet. Complete some tasks to see them here!
        </p>
      ) : (
        completedTasksList.map((task: any) => {
          const priorityDotColor =
            task.priority === "High"
              ? "#d32f2f"
              : task.priority === "Medium"
              ? "#f59e0b"
              : "#3b82f6";

          return (
            <div
              key={task.id}
              style={{
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: "#f9f9f9",
                padding: "14px 20px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {/* PRIORITY DOT */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "70px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: priorityDotColor,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    {task.priority}
                  </span>
                </div>

                {/* TASK INFO */}
                <div>
                  <div style={{ fontSize: "15px", marginBottom: "2px", textDecoration: "line-through", color: "#6b7280" }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>
                    {task.subject}
                  </div>
                </div>

                {/* DEADLINE */}
                <div style={{ textAlign: "right", fontSize: "14px", color: "#6b7280" }}>
                  {task.deadline ? (
                    <span>Due: {task.deadline}</span>
                  ) : (
                    <span>No deadline</span>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleRestoreTask(task.id)}
                    style={{
                      backgroundColor: "#f59e0b",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 10px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    🔄 Restore
                  </button>
                  <button
                    onClick={() => handleDeleteCompleted(task.id)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 10px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
)}

{/* ========================= */}
{/* CALENDAR */}
{/* ========================= */}
{activeMenu === "calendar" && (
  <div className="calendar-container">
    <div className="calendar-header">
      <div className="calendar-nav">
        <button onClick={() => navigateCalendar(-1)} className="nav-btn">
          ←
        </button>
        <h2>
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h2>
        <button onClick={() => navigateCalendar(1)} className="nav-btn">
          →
        </button>
        <button onClick={() => setCurrentDate(new Date())} className="today-btn">
          Today
        </button>
      </div>
      <div className="calendar-view-buttons">
        <button 
          className={`view-btn ${calendarView === 'month' ? 'active' : ''}`}
          onClick={() => setCalendarView('month')}
        >
          Month
        </button>
        <button 
          className={`view-btn ${calendarView === 'week' ? 'active' : ''}`}
          onClick={() => setCalendarView('week')}
        >
          Week
        </button>
        <button 
          className={`view-btn ${calendarView === 'day' ? 'active' : ''}`}
          onClick={() => setCalendarView('day')}
        >
          Day
        </button>
      </div>
    </div>

    {/* Month View */}
    {calendarView === 'month' && (
      <>
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {getMonthDays().map((date, index) => {
            const dateTasks = getTasksForDate(date);
            const isToday = isSameDay(date, new Date());
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => {
                  setSelectedDate(date);
                  setShowDateModal(true);
                }}
              >
                <div className="day-number">{date.getDate()}</div>
                <div className="day-tasks">
                  {dateTasks.slice(0, 3).map(task => (
                    <div key={task.id} className={`task-badge ${task.priority?.toLowerCase()}`}>
                      {task.title}
                    </div>
                  ))}
                  {dateTasks.length > 3 && (
                    <div className="more-tasks">+{dateTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    )}

    {/* Week View */}
    {calendarView === 'week' && (
      <div className="week-view">
        <div className="week-header">
          {getWeekDays().map(day => (
            <div key={day.toISOString()} className="week-day-header">
              <div className="week-day-name">
                {day.toLocaleString('default', { weekday: 'short' })}
              </div>
              <div className={`week-day-date ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="week-grid">
          {getWeekDays().map(day => {
            const dayTasks = getTasksForDate(day);
            return (
              <div key={day.toISOString()} className="week-day-column">
                <div className="week-day-tasks">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`week-task-item ${task.priority?.toLowerCase()}`}
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                    >
                      <div className="task-title">{task.title}</div>
                      <div className="task-subject">{task.subject}</div>
                      <div className="task-hours">⏱ {task.studyHours || task.studyHours}h</div>
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="no-tasks">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

   {/* Day View */}
{calendarView === 'day' && selectedDate && (
  <div className="day-view">
    <div className="day-view-header">
      <h3>
        {selectedDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </h3>
    </div>
    <div className="day-timeline">
      {getDayHours().map(hour => {
        const tasksAtHour = getTasksForDate(selectedDate);
        
        return (
          <div key={hour} className="timeline-hour">
            <div className="hour-label">{hour}:00</div>
            <div className="hour-tasks">
              {tasksAtHour.length > 0 && hour === 9 && tasksAtHour.map(task => (
                <div key={task.id} className={`day-task-item ${task.priority?.toLowerCase()}`}>
                  <strong>{task.title}</strong> - {task.subject}
                  <span className="task-hours">({task.studyHours}h)</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

    {/* Task Details Modal */}
    {showTaskModal && selectedTask && (
      <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
        <div className="task-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{selectedTask.title}</h3>
            <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <p><strong>Subject:</strong> {selectedTask.subject}</p>
            <p><strong>Priority:</strong> 
              <span className={`priority-badge ${selectedTask.priority?.toLowerCase()}`}>
                {selectedTask.priority}
              </span>
            </p>
            <p><strong>Deadline:</strong> {selectedTask.deadline || 'No deadline'}</p>
            <p><strong>Study Hours:</strong> {selectedTask.studyHours || selectedTask.studyHours}h</p>
            <p><strong>Status:</strong> {selectedTask.status}</p>
          </div>
          <div className="modal-footer">
            <button className="edit-btn" onClick={() => {
              setShowTaskModal(false);
              openEditModal(selectedTask);
            }}>
              Edit Task
            </button>
            <button className="close-btn" onClick={() => setShowTaskModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Date Tasks Modal */}
    {showDateModal && selectedDate && (
      <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
        <div className="tasks-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              {selectedDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button className="modal-close" onClick={() => setShowDateModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {getTasksForDate(selectedDate).length === 0 ? (
              <p>No tasks for this day</p>
            ) : (
              getTasksForDate(selectedDate).map(task => (
                <div key={task.id} className="date-task-item">
                  <div className="task-info">
                    <strong>{task.title}</strong>
                    <span className={`priority-dot ${task.priority?.toLowerCase()}`}></span>
                  </div>
                  <div className="task-details">
                    <span>{task.subject}</span>
                    <span>⏱ {task.studyHours || task.studyHours}h</span>
                  </div>
                  <button 
                    className="view-task-btn"
                    onClick={() => {
                      setShowDateModal(false);
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)}

        {/* ========================= */}
        {/* AI PLANNER */}
        {/* ========================= */}
        {activeMenu === "ai" && (
  <div className="ai-page">
    <div className="top-header">
      <div>
        <h1 className="dashboard-title">🤖 AI Study Planner</h1>
        <p className="dashboard-subtitle">
          Let AI create the best study plan for you with smart recommendations
        </p>
      </div>
      <div className="action-buttons">
        <button className="export-btn" onClick={() => exportPlan('csv')}>
          📥 Export Plan
        </button>
        <button className="sync-btn" onClick={syncWithCalendar}>
          📅 Sync Calendar
        </button>
      </div>
    </div>

    <div className="ai-grid">
      {/* LEFT PANEL - Study Preferences */}
      <div className="ai-card">
        <h3 className="section-title">Study Preferences</h3>
        
        <div className="form-group">
          <label>Study Strategy</label>
          <select defaultValue="Balanced (Default)">
            <option>Balanced (Default)</option>
            <option>Deadline-Focused</option>
            <option>Priority-Focused</option>
            <option>Energy-Peak Optimized</option>
          </select>
        </div>

        <div className="form-group">
          <label>Available Hours Per Day</label>
          <select 
            value={dailyAvailableHours}
            onChange={(e) => setDailyAvailableHours(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
              <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Subjects to Focus (Optional)</label>
          <div
            onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#fafafa",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>
              {selectedSubjects.length > 0 ? selectedSubjects.join(", ") : "All Subjects"}
            </span>
            <span>▼</span>
          </div>
          {subjectDropdownOpen && (
            <div style={{
              marginTop: "8px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "white",
              padding: "8px",
              maxHeight: "150px",
              overflowY: "auto"
            }}>
              {uniqueSubjects.map(sub => (
                <label key={sub} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(sub)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubjects([...selectedSubjects, sub]);
                      } else {
                        setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
                      }
                    }}
                  />
                  {sub}
                </label>
              ))}
            </div>
          )}
        </div>
        
        <button className="generate-ai-btn" onClick={handleGenerateAI}>
          {loading ? "🤖 Analyzing..." : "✨ Generate Smart Plan"}
        </button>
        
        <button className="reschedule-btn" onClick={autoReschedule}>
          🔄 Auto-Optimize Plan
        </button>
      </div>

      {/* RIGHT PANEL - Plan Display */}
      <div className="ai-card">
        <div className="plan-tabs">
          <button 
            className={`tab ${activePlanTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActivePlanTab('plan')}
          >
            📋 Study Plan
          </button>
          <button 
            className={`tab ${activePlanTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActivePlanTab('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={`tab ${activePlanTab === 'tips' ? 'active' : ''}`}
            onClick={() => setActivePlanTab('tips')}
          >
            💡 Tips
          </button>
        </div>
        
        {/* STUDY PLAN TAB */}
        {activePlanTab === 'plan' && (
          <div className="plan-list">
            {studyPlan.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎯</span>
                <p>No plan generated yet</p>
                <small>Click "Generate Smart Plan" to get started</small>
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="plan-summary">
                  <div className="summary-item">
                    <span>📚 Total Tasks</span>
                    <strong>{studyPlan.length}</strong>
                  </div>
                  <div className="summary-item">
                    <span>⏱ Total Hours</span>
                    <strong>{studyPlan.reduce((sum, i) => sum + i.hours, 0)}h</strong>
                  </div>
                  <div className="summary-item">
                    <span>📅 Days</span>
                    <strong>{new Set(studyPlan.map(i => i.day)).size}</strong>
                  </div>
                </div>
                
                {/* Gantt Chart View */}
                {studyPlan.length > 0 && (
                  <div className="gantt-chart">
                    <h4>📊 Study Timeline</h4>
                    {studyPlan.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="gantt-item">
                        <div className="gantt-label">{item.day.substring(0, 3)}</div>
                        <div className="gantt-bar-container">
                          <div 
                            className={`gantt-bar ${item.priority.toLowerCase()}`}
                            style={{ width: `${Math.min(100, (item.hours / 6) * 100)}%` }}
                            title={`${item.title} - ${item.hours}h`}
                          >
                            {item.subject}
                          </div>
                        </div>
                        <div className="gantt-hours">{item.hours}h</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Detailed Plan List */}
                {studyPlan.map((item: any, index: number) => (
                  <div className="plan-day" key={index}>
                    <div className="day-header">
                      <h4>📅 {item.day}</h4>
                      <span className={`priority-badge ${item.priority.toLowerCase()}`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="plan-item">
                      <div className="plan-subject">
                        📘 <strong>{item.subject}</strong>
                      </div>
                      <div className="plan-details">
                        <span>📝 {item.title}</span>
                        <span className="plan-hours">⏱ {item.hours}h</span>
                      </div>
                      <div className="plan-progress">
                        <small>📅 Deadline: {item.deadline}</small>
                        <button 
                          className="quick-complete-btn"
                          onClick={() => {
                            const task = tasks.find(t => t.title === item.title && t.subject === item.subject);
                            if (task?.id) handleMarkDone(task.id);
                          }}
                        >
                          ✓ Mark Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activePlanTab === 'analytics' && (
          <div className="analytics-content">
            <h4>📊 Study Analytics Dashboard</h4>
            
            <div className="stats-row">
              <div className="stat">
                <span>📋 Completion Rate</span>
                <strong>{tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0}%</strong>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="stat">
                <span>⭐ Productivity Score</span>
                <strong>{Math.floor((completedTasks / Math.max(tasks.length, 1)) * 100)}/100</strong>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat">
                <span>⏰ Total Study Hours</span>
                <strong>{totalStudyHours}h</strong>
              </div>
              <div className="stat">
                <span>✅ Completed Tasks</span>
                <strong>{completedTasks}</strong>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat">
                <span>📚 Pending Tasks</span>
                <strong>{pendingTasks}</strong>
              </div>
              <div className="stat">
                <span>📅 Subjects</span>
                <strong>{totalSubjects}</strong>
              </div>
            </div>
            
            <div className="subject-breakdown">
              <h5>📚 Subject Distribution</h5>
              {uniqueSubjects.map(sub => {
                const subjectTasks = tasks.filter(t => t.subject === sub);
                const completedSubjectTasks = subjectTasks.filter(t => t.status === "Completed").length;
                const percentage = subjectTasks.length > 0 ? (completedSubjectTasks / subjectTasks.length) * 100 : 0;
                return (
                  <div key={sub} className="subject-item">
                    <div className="subject-name">
                      <span>{sub}</span>
                      <span className="subject-count">{subjectTasks.length} tasks</span>
                    </div>
                    <div className="subject-progress">
                      <div className="subject-progress-bar" style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="subject-stats">
                      {completedSubjectTasks}/{subjectTasks.length} completed ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="study-insights">
              <h5>💡 Key Insights</h5>
              <ul>
                <li>🎯 You have <strong>{pendingTasks}</strong> pending tasks</li>
                <li>✅ <strong>{completedTasks}</strong> tasks completed so far</li>
                <li>⏰ Total study time: <strong>{totalStudyHours}</strong> hours</li>
                <li>📊 Average study time per task: <strong>{(totalStudyHours / Math.max(tasks.length, 1)).toFixed(1)}</strong> hours</li>
                {pendingTasksList.filter(t => {
                  const today = new Date().toISOString().split("T")[0];
                  return t.deadline && t.deadline < today;
                }).length > 0 && (
                  <li>⚠️ You have <strong>{pendingTasksList.filter(t => {
                    const today = new Date().toISOString().split("T")[0];
                    return t.deadline && t.deadline < today;
                  }).length}</strong> overdue tasks! Focus on them first.</li>
                )}
                {studyPlan.length > 0 && (
                  <li>📅 Your study plan covers <strong>{new Set(studyPlan.map(i => i.day)).size}</strong> days</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* TIPS TAB */}
        {activePlanTab === 'tips' && (
          <div className="tips-content">
            <h4>💡 Productivity Tips for Success</h4>
            
            <div className="tip-category">
              <h5>🎯 Study Strategies</h5>
              <ul>
                <li>📚 Use the <strong>Pomodoro Technique</strong>: 25 min study, 5 min break</li>
                <li>🎯 Apply the <strong>2-Minute Rule</strong>: If a task takes less than 2 minutes, do it immediately</li>
                <li>⭐ Use <strong>Eisenhower Matrix</strong>: Prioritize tasks by urgency and importance</li>
                <li>📝 Practice <strong>Active Recall</strong>: Test yourself instead of just re-reading</li>
                <li>🧠 Use <strong>Spaced Repetition</strong> for better memory retention</li>
              </ul>
            </div>

            <div className="tip-category">
              <h5>⏰ Time Management</h5>
              <ul>
                <li>🌅 Study during your <strong>peak energy hours</strong> (morning or evening)</li>
                <li>🚫 <strong>Eliminate distractions</strong>: Put your phone away during study sessions</li>
                <li>📅 <strong>Plan ahead</strong>: Review your tasks the night before</li>
                <li>💪 Take <strong>regular breaks</strong> to maintain focus and avoid burnout</li>
                <li>🎯 Set <strong>SMART goals</strong>: Specific, Measurable, Achievable, Relevant, Time-bound</li>
              </ul>
            </div>

            <div className="tip-category">
              <h5>📚 Task Management</h5>
              <ul>
                <li>✂️ <strong>Break large tasks</strong> into smaller, manageable chunks</li>
                <li>🏆 <strong>Reward yourself</strong> after completing difficult tasks</li>
                <li>📝 <strong>Review completed tasks</strong> to track your progress</li>
                <li>🎯 Set <strong>specific, achievable goals</strong> for each study session</li>
                <li>📊 Use the <strong>80/20 Rule</strong>: 80% of results come from 20% of efforts</li>
              </ul>
            </div>

            <div className="motivation-quote">
              <p>"The secret of getting ahead is getting started." - Mark Twain</p>
            </div>
            
            <div className="quick-actions">
              <h5>⚡ Quick Actions</h5>
              <button onClick={handleGenerateAI} className="quick-tip-btn">
                🤖 Generate New Plan
              </button>
              <button onClick={() => setActiveMenu("tasks")} className="quick-tip-btn">
                📋 View My Tasks
              </button>
              <button onClick={() => setActiveMenu("addtask")} className="quick-tip-btn">
                ➕ Add New Task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

    {/* ========================= */}
{/* PROFILE PAGE - ENHANCED */}
{/* ========================= */}
{activeMenu === "profile" && (
  <div className="profile-page">
    <div className="top-header">
      <div>
        <h1 className="dashboard-title">👤 My Profile</h1>
        <p className="dashboard-subtitle">
          Manage your personal information and study statistics
        </p>
      </div>
      <button className="edit-profile-btn" onClick={() => setShowEditProfile(true)}>
        ✏️ Edit Profile
      </button>
    </div>

    <div className="profile-grid">
      {/* LEFT COLUMN - Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-large">
            {userName ? userName.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="avatar-status online"></div>
        </div>
        <h3 className="profile-name">{userName}</h3>
        <p className="profile-email">{userEmail || "student@example.com"}</p>
        <p className="profile-join-date">
          📅 Joined {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </p>
        
        <div className="profile-stats-mini">
          <div className="mini-stat">
            <span>📚</span>
            <div>
              <strong>{totalSubjects}</strong>
              <small>Subjects</small>
            </div>
          </div>
          <div className="mini-stat">
            <span>✅</span>
            <div>
              <strong>{completedTasks}</strong>
              <small>Completed</small>
            </div>
          </div>
          <div className="mini-stat">
            <span>⏰</span>
            <div>
              <strong>{totalStudyHours}</strong>
              <small>Hours</small>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="profile-action-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
          <button className="profile-action-btn secondary" onClick={() => setActiveMenu("settings")}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN - Statistics & Progress */}
      <div className="profile-stats">
        {/* Achievement Stats */}
        <div className="stats-card">
          <h4>🏆 Achievements</h4>
          <div className="achievements-grid">
            <div className={`achievement-badge ${completedTasks >= 1 ? 'unlocked' : 'locked'}`}>
              <span>🎯</span>
              <p>First Task</p>
              <small>Complete 1 task</small>
            </div>
            <div className={`achievement-badge ${completedTasks >= 10 ? 'unlocked' : 'locked'}`}>
              <span>⭐</span>
              <p>Rising Star</p>
              <small>Complete 10 tasks</small>
            </div>
            <div className={`achievement-badge ${completedTasks >= 50 ? 'unlocked' : 'locked'}`}>
              <span>🏅</span>
              <p>Master</p>
              <small>Complete 50 tasks</small>
            </div>
            <div className={`achievement-badge ${totalStudyHours >= 100 ? 'unlocked' : 'locked'}`}>
              <span>🔥</span>
              <p>Study Warrior</p>
              <small>100 study hours</small>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="stats-card">
          <h4>📅 Study Streak</h4>
          <div className="streak-container">
            <div className="streak-days">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="streak-day">{day}</div>
              ))}
            </div>
            <div className="streak-info">
              <strong>{Math.floor(Math.random() * 30) + 1} day streak</strong>
              <p>🔥 Keep going! You're doing great!</p>
            </div>
          </div>
        </div>

        {/* Study Progress Charts */}
        <div className="stats-card">
          <h4>📊 Study Progress</h4>
          <div className="progress-stats">
            <div className="progress-item">
              <div className="progress-label">
                <span>Task Completion</span>
                <span>{tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">
                <span>Productivity</span>
                <span>{Math.floor((completedTasks / Math.max(tasks.length, 1)) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.floor((completedTasks / Math.max(tasks.length, 1)) * 100)}%` }}></div>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-label">
                <span>Consistency</span>
                <span>{Math.min(100, Math.floor((completedTasks / 50) * 100))}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, Math.floor((completedTasks / 50) * 100))}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="stats-card">
          <h4>📚 Subject Performance</h4>
          <div className="subject-performance">
            {uniqueSubjects.slice(0, 5).map(sub => {
              const subjectTasks = tasks.filter(t => t.subject === sub);
              const completedSubject = subjectTasks.filter(t => t.status === "Completed").length;
              const percentage = subjectTasks.length > 0 ? (completedSubject / subjectTasks.length) * 100 : 0;
              return (
                <div key={sub} className="subject-perf-item">
                  <div className="subject-perf-name">
                    <span>{sub}</span>
                    <span>{completedSubject}/{subjectTasks.length}</span>
                  </div>
                  <div className="subject-perf-bar">
                    <div className="subject-perf-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="stats-card">
          <h4>🕐 Recent Activity</h4>
          <div className="recent-activities">
            {tasks.filter(t => t.status === "Completed").slice(0, 5).map(task => (
              <div key={task.id} className="activity-item">
                <div className="activity-icon">✅</div>
                <div className="activity-details">
                  <p className="activity-title">{task.title}</p>
                  <p className="activity-subject">{task.subject}</p>
                </div>
                <div className="activity-time">Completed</div>
              </div>
            ))}
            {tasks.filter(t => t.status === "Completed").length === 0 && (
              <div className="no-activity">
                <p>No completed tasks yet</p>
                <small>Complete your first task to see activity here!</small>
              </div>
            )}
          </div>
        </div>

        {/* Study Tips */}
        <div className="stats-card tips-card">
          <h4>💡 Personalized Tips</h4>
          <div className="tips-list">
            <div className="tip-item">
              <span>🎯</span>
              <p>You have {pendingTasks} pending task{pendingTasks !== 1 ? 's' : ''}. Focus on completing them!</p>
            </div>
            {completedTasks > 0 && (
              <div className="tip-item">
                <span>⭐</span>
                <p>Great job! You've completed {completedTasks} task{completedTasks !== 1 ? 's' : ''} so far!</p>
              </div>
            )}
            {totalStudyHours > 0 && (
              <div className="tip-item">
                <span>⏰</span>
                <p>You've studied {totalStudyHours} hour{totalStudyHours !== 1 ? 's' : ''}. Keep the momentum!</p>
              </div>
            )}
            <div className="tip-item">
              <span>💪</span>
              <p>Try the Pomodoro technique: 25 min study, 5 min break</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Edit Profile Modal */}
    {showEditProfile && (
      <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
        <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>✏️ Edit Profile</h3>
            <button className="modal-close" onClick={() => setShowEditProfile(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={editEmail} disabled />
              <small>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea 
                rows={3} 
                value={editBio} 
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={() => setShowEditProfile(false)}>Cancel</button>
            <button className="save-btn" onClick={handleUpdateProfile}>Save Changes</button>
          </div>
        </div>
      </div>
    )}
  </div>
)}

        {/* ========================= */}
{/* SETTINGS PAGE - ENHANCED */}
{/* ========================= */}
{activeMenu === "settings" && (
  <div className="settings-page">
    <div className="top-header">
      <div>
        <h1 className="dashboard-title">⚙ Settings</h1>
        <p className="dashboard-subtitle">
          Customize your study planner experience
        </p>
      </div>
    </div>

    <div className="settings-grid">
      {/* LEFT COLUMN - Settings Categories */}
      <div className="settings-sidebar">
        <div className="settings-nav">
          <button 
            className={`settings-nav-btn ${activeSettingsTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('general')}
          >
            <span>🎨</span> General
          </button>
          <button 
            className={`settings-nav-btn ${activeSettingsTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('notifications')}
          >
            <span>🔔</span> Notifications
          </button>
          <button 
            className={`settings-nav-btn ${activeSettingsTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('appearance')}
          >
            <span>🎨</span> Appearance
          </button>
          <button 
            className={`settings-nav-btn ${activeSettingsTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('preferences')}
          >
            <span>⚡</span> Preferences
          </button>
          <button 
            className={`settings-nav-btn ${activeSettingsTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('backup')}
          >
            <span>💾</span> Backup & Data
          </button>
          <button 
            className={`settings-nav-btn ${activeSettingsTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveSettingsTab('about')}
          >
            <span>ℹ️</span> About
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN - Settings Content */}
      <div className="settings-content">
        
        {/* GENERAL SETTINGS */}
        {activeSettingsTab === 'general' && (
          <div className="settings-section">
            <h3>General Settings</h3>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Default Dashboard View</h4>
                  <p>Choose which page to show when you log in</p>
                </div>
                <select 
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value)}
                  className="setting-select"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="tasks">My Tasks</option>
                  <option value="calendar">Calendar</option>
                  <option value="ai">AI Planner</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Language</h4>
                  <p>Select your preferred language</p>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="setting-select"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Time Zone</h4>
                  <p>Your local time zone for deadlines</p>
                </div>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="setting-select"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                  <option value="Europe/Paris">Central European Time (CET)</option>
                  <option value="Asia/Tokyo">Japan Time (JST)</option>
                  <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Date Format</h4>
                  <p>How dates should be displayed</p>
                </div>
                <select 
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="setting-select"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATION SETTINGS */}
        {activeSettingsTab === 'notifications' && (
          <div className="settings-section">
            <h3>Notification Settings</h3>
            <div className="settings-group">
              <div className="setting-item toggle-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Receive email updates about your tasks</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item toggle-item">
                <div className="setting-info">
                  <h4>Daily Reminders</h4>
                  <p>Get daily reminders about pending tasks</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={dailyReminders}
                    onChange={(e) => setDailyReminders(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item toggle-item">
                <div className="setting-info">
                  <h4>Task Deadline Alerts</h4>
                  <p>Receive alerts when deadlines are approaching</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={deadlineAlerts}
                    onChange={(e) => setDeadlineAlerts(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item toggle-item">
                <div className="setting-info">
                  <h4>Browser Notifications</h4>
                  <p>Show notifications in your browser</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={browserNotifications}
                    onChange={(e) => setBrowserNotifications(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Reminder Time</h4>
                  <p>When to send daily reminders</p>
                </div>
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="setting-time"
                />
              </div>
            </div>
          </div>
        )}

        {/* APPEARANCE SETTINGS */}
        {activeSettingsTab === 'appearance' && (
          <div className="settings-section">
            <h3>Appearance Settings</h3>
            <div className="settings-group">
              <div className="setting-item toggle-item">
                <div className="setting-info">
                  <h4>Dark Mode</h4>
                  <p>Switch between light and dark theme</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
          
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES SETTINGS */}
        {activeSettingsTab === 'preferences' && (
          <div className="settings-section">
            <h3>Study Preferences</h3>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Default Priority</h4>
                  <p>Default priority for new tasks</p>
                </div>
                <select 
                  value={defaultPriority}
                  onChange={(e) => setDefaultPriority(e.target.value as any)}
                  className="setting-select"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Default Study Hours</h4>
                  <p>Default estimated hours for new tasks</p>
                </div>
                <input 
                  type="number" 
                  min="0.5" 
                  step="0.5"
                  value={defaultStudyHours}
                  onChange={(e) => setDefaultStudyHours(Number(e.target.value))}
                  className="setting-number"
                />
              </div>

              <div className="setting-item toggle-item">
                <div className="setting-info">
                  <h4>Auto-save Tasks</h4>
                  <p>Automatically save tasks as you create them</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item toggle-item">
                <div className="setting-info">
                  <h4>Show Completed Tasks</h4>
                  <p>Display completed tasks in main view</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>AI Recommendation Priority</h4>
                  <p>How the AI should prioritize tasks</p>
                </div>
                <select 
                  value={aiPriority}
                  onChange={(e) => setAiPriority(e.target.value)}
                  className="setting-select"
                >
                  <option value="deadline">Deadline-focused</option>
                  <option value="priority">Priority-focused</option>
                  <option value="balanced">Balanced</option>
                  <option value="studyTime">Study time optimized</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* BACKUP & DATA SETTINGS */}
        {activeSettingsTab === 'backup' && (
          <div className="settings-section">
            <h3>Backup & Data</h3>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Export All Data</h4>
                  <p>Download all your tasks and study data</p>
                </div>
                <button className="action-btn export-data-btn" onClick={exportAllData}>
                  📥 Export Data (JSON)
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Import Data</h4>
                  <p>Import tasks from a backup file</p>
                </div>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={importData}
                  className="file-input"
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Auto-backup Frequency</h4>
                  <p>How often to automatically backup your data</p>
                </div>
                <select 
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                  className="setting-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Clear All Data</h4>
                  <p>Permanently delete all your tasks (cannot be undone)</p>
                </div>
                <button className="action-btn danger-btn" onClick={clearAllData}>
                  🗑️ Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT SETTINGS */}
        {activeSettingsTab === 'about' && (
          <div className="settings-section">
            <h3>About StudyPlanner AI</h3>
            <div className="settings-group about-group">
              <div className="about-header">
                <div className="app-icon">📚</div>
                <h2>StudyPlanner AI</h2>
                <p className="version">Version 2.0.0</p>
              </div>

              <div className="about-info">
                <div className="info-item">
                  <span>📅</span>
                  <div>
                    <strong>Release Date</strong>
                    <p>January 2025</p>
                  </div>
                </div>
                <div className="info-item">
                  <span>👨‍💻</span>
                  <div>
                    <strong>Developer</strong>
                    <p>StudyPlanner Team</p>
                  </div>
                </div>
                <div className="info-item">
                  <span>🌐</span>
                  <div>
                    <strong>Website</strong>
                    <p>www.studyplanner.ai</p>
                  </div>
                </div>
                <div className="info-item">
                  <span>📧</span>
                  <div>
                    <strong>Support</strong>
                    <p>support@studyplanner.ai</p>
                  </div>
                </div>
              </div>

              <div className="stats-summary">
                <h4>Your Stats</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span>📋</span>
                    <strong>{tasks.length}</strong>
                    <p>Total Tasks</p>
                  </div>
                  <div className="stat-item">
                    <span>✅</span>
                    <strong>{completedTasks}</strong>
                    <p>Completed</p>
                  </div>
                  <div className="stat-item">
                    <span>⏰</span>
                    <strong>{totalStudyHours}</strong>
                    <p>Study Hours</p>
                  </div>
                  <div className="stat-item">
                    <span>📚</span>
                    <strong>{totalSubjects}</strong>
                    <p>Subjects</p>
                  </div>
                </div>
              </div>

              <div className="about-buttons">
                <button className="about-btn" onClick={() => window.open('#', '_blank')}>
                  📖 Documentation
                </button>
                <button className="about-btn" onClick={() => window.open('#', '_blank')}>
                  💬 Community
                </button>
                <button className="about-btn" onClick={() => window.open('#', '_blank')}>
                  ⭐ Rate Us
                </button>
              </div>

              <div className="copyright">
                <p>© 2025 StudyPlanner AI. All rights reserved.</p>
                <p>Made with ❤️ for students worldwide</p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="settings-save-bar">
          <button className="save-settings-btn" onClick={saveAllSettings}>
            💾 Save All Settings
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </main>

      <style>{`
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .edit-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-close:hover {
          color: #374151;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .save-btn {
          background-color: #6a5acd;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background-color: #5b4cb5;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }

        .task-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
        }

        @media (max-width: 768px) {
          .task-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
