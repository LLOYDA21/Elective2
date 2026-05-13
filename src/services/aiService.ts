import type { Task } from "../types/task";

/* =========================
   SMART LOGIC LAYER
========================= */
export const buildStudyPlanInput = (
  tasks: Task[],
  selectedSubjects: string[],
  hoursPerDay: number,
  focus: string
) => {
  // 1. FILTER by selected subjects
  const filteredTasks = tasks.filter((task) =>
    selectedSubjects.includes(task.subject)
  );

  // 2. PRIORITY SORTING
  const priorityRank: Record<string, number> = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const sortedTasks = [...filteredTasks].sort(
    (a, b) =>
      priorityRank[a.priority] - priorityRank[b.priority]
  );

  // 3. GROUP BY SUBJECT
  const grouped: Record<string, Task[]> = {};

  sortedTasks.forEach((task) => {
    if (!grouped[task.subject]) {
      grouped[task.subject] = [];
    }
    grouped[task.subject].push(task);
  });

  // 4. BUILD BALANCED DAILY PLAN
  const plan: any[] = [];
  let dayIndex = 0;
  const maxDays = 7;

  Object.keys(grouped).forEach((subject) => {
    grouped[subject].forEach((task) => {
      const hours = task.studyHours || 1;

      if (!plan[dayIndex]) {
        plan[dayIndex] = {
          day: `Day ${dayIndex + 1}`,
          items: [],
          totalHours: 0,
        };
      }

      // if fits in day
      if (plan[dayIndex].totalHours + hours <= hoursPerDay) {
        plan[dayIndex].items.push({
          subject: task.subject,
          title: task.title,
          hours,
        });

        plan[dayIndex].totalHours += hours;
      } else {
        dayIndex++;

        if (dayIndex < maxDays) {
          plan[dayIndex] = {
            day: `Day ${dayIndex + 1}`,
            items: [
              {
                subject: task.subject,
                title: task.title,
                hours,
              },
            ],
            totalHours: hours,
          };
        }
      }
    });
  });

  return {
    focus,
    hoursPerDay,
    totalTasks: tasks.length,
    filteredTasks: filteredTasks.length,
    plan,
  };
};

/* =========================
   AI GENERATION FUNCTION
========================= */
export const generateStudyPlan = async (
  tasks: Task[],
  selectedSubjects: string[],
  hoursPerDay: number,
  focus: string
) => {
  try {
    // STEP 1: PRE-PROCESS DATA (LOGIC LAYER)
    const structuredData = buildStudyPlanInput(
      tasks,
      selectedSubjects,
      hoursPerDay,
      focus
    );

    // STEP 2: FOR NOW (MOCK AI RESPONSE)
    // Replace this later with OpenAI / Gemini API
    const aiResponse = structuredData.plan.map((day) => ({
      day: day.day,
      items: day.items.map((item: any) => ({
        subject: item.subject,
        title: item.title,
        hours: item.hours,
      })),
    }));

    return aiResponse;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to generate AI plan");
  }
};