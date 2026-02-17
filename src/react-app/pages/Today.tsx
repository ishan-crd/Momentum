import TopThreeTasks from "@/react-app/components/TopThreeTasks";
import TaskBoard from "@/react-app/components/TaskBoard";
import QuickAdd from "@/react-app/components/QuickAdd";
import WeeklyStats from "@/react-app/components/WeeklyStats";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export default function Today() {
  const topThree = useQuery(api.tasks.listTopThree) ?? [];
  const allTasks = useQuery(api.tasks.list) ?? [];
  const updateTask = useMutation(api.tasks.update);

  const topTasks = topThree.map((t) => ({
    id: t._id,
    title: t.title,
    completed: t.status === "completed",
  }));

  const boardTasks = allTasks.map((t) => ({
    id: t._id,
    title: t.title,
    status: t.status,
  }));

  const handleTopTaskToggle = (id: string) => {
    const task = topThree.find((t) => t._id === id);
    if (!task) return;
    const newStatus =
      task.status === "completed" ? "in-progress" : "completed";
    void updateTask({ id: id as Id<"tasks">, status: newStatus });
  };

  const completedToday =
    allTasks.filter((t) => t.status === "completed").length;
  const totalTasks = allTasks.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-foreground">Today</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <WeeklyStats
        completedTasks={completedToday}
        goalProgress={totalTasks ? Math.round((completedToday / totalTasks) * 100) : 0}
        longestStreak={0}
      />

      <TopThreeTasks tasks={topTasks} onToggle={handleTopTaskToggle} />

      <QuickAdd />

      <TaskBoard tasks={boardTasks} />
    </div>
  );
}
