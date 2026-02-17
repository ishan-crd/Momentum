import { useState } from "react";
import { useNavigate } from "react-router";
import TopThreeTasks from "@/react-app/components/TopThreeTasks";
import QuickAdd from "@/react-app/components/QuickAdd";
import WeeklyStats from "@/react-app/components/WeeklyStats";
import CurrentMission from "@/react-app/components/CurrentMission";
import NextUpList from "@/react-app/components/NextUpList";
import type { NextUpTask } from "@/react-app/components/NextUpList";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/react-app/components/ui/dialog";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Sparkles, Loader2, Calendar, AlertCircle } from "lucide-react";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Today() {
  const navigate = useNavigate();
  const topThree = useQuery(api.tasks.listTopThree) ?? [];
  const allTasks = useQuery(api.tasks.list) ?? [];
  const goals = useQuery(api.goals.list) ?? [];
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const todayFocusAction = useAction(api.ai.todayFocus);
  const [focusLine, setFocusLine] = useState<string | null>(null);
  const [focusLoading, setFocusLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState<Id<"tasks"> | null>(null);

  const weeklyGoals = goals.filter((g) => g.timeframe === "weekly");
  const weeklyGoalsTotal = weeklyGoals.length || 12;
  const weeklyGoalsDone = weeklyGoals.filter((g) => {
    const linked = allTasks.filter((t) => g.linkedTaskIds.includes(t._id));
    return linked.length > 0 && linked.every((t) => t.status === "completed");
  }).length;

  const topThreeIds = new Set(topThree.map((t) => t._id));
  const nextUpTasks: NextUpTask[] = allTasks
    .filter((t) => !topThreeIds.has(t._id) && t.status !== "completed")
    .slice(0, 10)
    .map((t) => ({
      id: t._id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    }));

  const currentMissionTask =
    topThree.find((t) => t.status !== "completed") ?? topThree[0] ?? null;

  const topTasks = topThree.map((t) => ({
    id: t._id,
    title: t.title,
    completed: t.status === "completed",
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

  const handleNextUpToggle = (id: Id<"tasks">) => {
    const task = allTasks.find((t) => t._id === id);
    if (!task) return;
    const newStatus =
      task.status === "completed" ? "todo" : "completed";
    void updateTask({ id, status: newStatus });
  };

  const completedToday =
    allTasks.filter((t) => t.status === "completed").length;
  const totalTasks = allTasks.length;
  const weekProgress = totalTasks
    ? Math.round((completedToday / totalTasks) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Card className="border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground">
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

      <CurrentMission
        task={currentMissionTask}
        onComplete={(id) =>
          void updateTask({ id, status: "completed" })
        }
      />

      <WeeklyStats
        goalProgress={weekProgress}
        longestStreak={0}
        weeklyGoalsDone={weeklyGoalsDone}
        weeklyGoalsTotal={weeklyGoalsTotal}
      />

      <TopThreeTasks
        tasks={topTasks}
        onToggle={handleTopTaskToggle}
        onReview={(id) => setReviewTaskId(id as Id<"tasks">)}
      />

      <NextUpList
        tasks={nextUpTasks}
        onToggle={handleNextUpToggle}
        onEdit={() => navigate("/tasks")}
        onDelete={(id) => void removeTask({ id })}
        onAddTask={() => setShowQuickAdd((v) => !v)}
      />

      {showQuickAdd && (
        <QuickAdd />
      )}

      <Dialog open={!!reviewTaskId} onOpenChange={(open) => !open && setReviewTaskId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Task details</DialogTitle>
          </DialogHeader>
          {reviewTaskId && (() => {
            const task = allTasks.find((t) => t._id === reviewTaskId) ?? topThree.find((t) => t._id === reviewTaskId);
            if (!task) return null;
            const dueText = task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;
            const priorityLabel = task.priority
              ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
              : null;
            return (
              <div className="space-y-4">
                <p className="text-base font-semibold text-foreground">{task.title}</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-foreground capitalize">{task.status.replace("-", " ")}</span>
                  </div>
                  {priorityLabel && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Priority</span>
                      <span className="text-foreground capitalize">{priorityLabel}</span>
                    </div>
                  )}
                  {dueText && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Due date</span>
                      <span className="text-foreground">{dueText}</span>
                    </div>
                  )}
                </dl>
              </div>
            );
          })()}
          <DialogFooter showCloseButton={false}>
            <Button variant="outline" onClick={() => setReviewTaskId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
