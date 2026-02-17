import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;
const toDate = (daysAgo: number) =>
  new Date(now - daysAgo * dayMs).toISOString().slice(0, 10);

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const taskIds: Id<"tasks">[] = [];

    // Tasks over past 2 weeks: mix completed (with completedAt), in-progress, todo. Some top-three.
    const taskSpecs: Array<{
      title: string;
      status: "todo" | "in-progress" | "completed";
      priority?: "low" | "medium" | "high";
      dueDate?: string;
      isTopThree?: boolean;
      completedAt?: number;
    }> = [
      { title: "Finalize Design System v2.0", status: "todo", priority: "high", dueDate: toDate(0), isTopThree: true },
      { title: "Marketing Copy Review", status: "todo", priority: "low", dueDate: toDate(2) },
      { title: "Develop Kanban UI", status: "in-progress", priority: "high", dueDate: toDate(0), isTopThree: true },
      { title: "User Interview Prep", status: "completed", priority: "medium", completedAt: now - 2 * dayMs },
      { title: "Internal Kickoff Meeting", status: "completed", priority: "low", completedAt: now - 1 * dayMs },
      { title: "Learn a new piece on the piano", status: "in-progress", priority: "low", isTopThree: true },
      { title: "Analyze the Score", status: "todo", priority: "medium", dueDate: toDate(3) },
      { title: "Ship MVP Feature Set", status: "completed", priority: "high", completedAt: now - 5 * dayMs },
      { title: "Write API documentation", status: "completed", priority: "medium", completedAt: now - 4 * dayMs },
      { title: "Review PRs and merge", status: "completed", priority: "low", completedAt: now - 3 * dayMs },
      { title: "Weekly sync with team", status: "completed", priority: "medium", completedAt: now - 7 * dayMs },
      { title: "Update dependencies", status: "completed", priority: "low", completedAt: now - 8 * dayMs },
      { title: "Plan sprint backlog", status: "completed", priority: "high", completedAt: now - 10 * dayMs },
      { title: "Design onboarding flow", status: "todo", priority: "medium", dueDate: toDate(5) },
      { title: "Set up analytics dashboard", status: "todo", priority: "low", dueDate: toDate(7) },
    ];

    for (const t of taskSpecs) {
      const id = await ctx.db.insert("tasks", {
        userId,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        isTopThree: t.isTopThree,
        completedAt: t.completedAt,
      });
      taskIds.push(id);
    }

    // Goals: link some tasks. Use taskIds by index (e.g. 0,1,2 for first goal).
    await ctx.db.insert("goals", {
      userId,
      title: "Ship product launch",
      category: "Product",
      timeframe: "weekly",
      targetDate: toDate(7),
      linkedTaskIds: [taskIds[0], taskIds[2], taskIds[7]],
    });
    await ctx.db.insert("goals", {
      userId,
      title: "Improve personal productivity",
      category: "Personal",
      timeframe: "monthly",
      targetDate: toDate(30),
      linkedTaskIds: [taskIds[5], taskIds[6], taskIds[13]],
    });
    await ctx.db.insert("goals", {
      userId,
      title: "Complete design system",
      category: "Design",
      timeframe: "weekly",
      targetDate: toDate(3),
      linkedTaskIds: [taskIds[0], taskIds[12]],
    });

    // Habits: 3 habits with weekly completion (5–6 days done in the week)
    await ctx.db.insert("habits", {
      userId,
      name: "Morning journal",
      streak: 7,
      completedToday: true,
      weeklyCompletion: [true, true, true, true, true, true, false],
    });
    await ctx.db.insert("habits", {
      userId,
      name: "Exercise 30 min",
      streak: 4,
      completedToday: false,
      weeklyCompletion: [true, true, true, true, false, false, false],
    });
    await ctx.db.insert("habits", {
      userId,
      name: "No phone before 9am",
      streak: 12,
      completedToday: true,
      weeklyCompletion: [true, true, true, true, true, true, true],
    });

    // Notes
    await ctx.db.insert("notes", {
      userId,
      title: "Hackathon demo talking points",
      content: "1. Show Today + Current Mission\n2. Tasks Kanban + drag-drop\n3. Goals + suggest tasks (AI)\n4. Weekly Review + Analyze reflection",
      createdAt: toDate(0),
    });
    await ctx.db.insert("notes", {
      userId,
      title: "Meeting notes – Sprint planning",
      content: "Priorities: Design system, Kanban polish, API docs. Next week: onboarding flow.",
      createdAt: toDate(2),
    });
    await ctx.db.insert("notes", {
      userId,
      title: "Ideas for Momentum v2",
      content: "Pomodoro timer, dark/light theme improvements, mobile layout.",
      createdAt: toDate(5),
    });

    return { tasks: taskIds.length, goals: 3, habits: 3, notes: 3 };
  },
});
