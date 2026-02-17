import { useState } from "react";
import TopThreeTasks from "@/react-app/components/TopThreeTasks";
import TaskBoard from "@/react-app/components/TaskBoard";
import QuickAdd from "@/react-app/components/QuickAdd";
import WeeklyStats from "@/react-app/components/WeeklyStats";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Sparkles, Loader2 } from "lucide-react";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Today() {
  const topThree = useQuery(api.tasks.listTopThree) ?? [];
  const allTasks = useQuery(api.tasks.list) ?? [];
  const goals = useQuery(api.goals.list) ?? [];
  const updateTask = useMutation(api.tasks.update);
  const todayFocusAction = useAction(api.ai.todayFocus);
  const [focusLine, setFocusLine] = useState<string | null>(null);
  const [focusLoading, setFocusLoading] = useState(false);

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

  const topTaskTitles = topThree.map((t) => t.title);
  const overdueTitles = allTasks
    .filter(
      (t) =>
        t.status !== "completed" &&
        t.dueDate &&
        t.dueDate < todayStr()
    )
    .map((t) => t.title);
  const goalTitle = goals.length > 0 ? goals[0].title : undefined;

  const handleSuggestFocus = async () => {
    setFocusLoading(true);
    setFocusLine(null);
    try {
      const sentence = await todayFocusAction({
        topTasks: topTaskTitles,
        overdue: overdueTitles,
        goalTitle,
      });
      setFocusLine(sentence);
    } catch {
      setFocusLine("Focus on one thing at a time.");
    } finally {
      setFocusLoading(false);
    }
  };

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

      <Card className="border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Today&apos;s focus
            </p>
            {focusLoading ? (
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Suggesting…</span>
              </div>
            ) : focusLine ? (
              <p className="mt-1 text-base font-medium text-foreground">
                {focusLine}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Get a one-line focus suggestion from your top tasks and goals.
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => void handleSuggestFocus()}
            disabled={focusLoading}
          >
            <Sparkles className="h-4 w-4" />
            {focusLine ? "Regenerate" : "Suggest focus"}
          </Button>
        </div>
      </Card>

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
