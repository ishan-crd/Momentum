import { Card } from "@/react-app/components/ui/card";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  Flame,
  Calendar,
} from "lucide-react";
import { Textarea } from "@/react-app/components/ui/textarea";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekBounds() {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { weekStart: monday.getTime(), weekEnd: sunday.getTime(), monday };
}

function getDayBounds(monday: Date, dayIndex: number) {
  const start = new Date(monday);
  start.setDate(monday.getDate() + dayIndex);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
}

export default function WeeklyReview() {
  const tasks = useQuery(api.tasks.list) ?? [];
  const habits = useQuery(api.habits.list) ?? [];
  const goals = useQuery(api.goals.list) ?? [];

  const { weekStart, weekEnd, monday } = getWeekBounds();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const completedTasksThisWeek = tasks.filter(
    (t) =>
      t.status === "completed" &&
      t.completedAt != null &&
      t.completedAt >= weekStart &&
      t.completedAt <= weekEnd
  );

  const chartData = DAY_LABELS.map((day, idx) => {
    const { start, end } = getDayBounds(monday, idx);
    const tasksOnDay = completedTasksThisWeek.filter((t) => {
      const at = t.completedAt;
      return at != null && at >= start && at <= end;
    });
    return { day, tasks: tasksOnDay.length };
  });

  const tasksCompleted = completedTasksThisWeek.length;
  const maxTasks = Math.max(1, ...chartData.map((d) => d.tasks));

  const habitConsistency =
    habits.length === 0
      ? 0
      : Math.round(
          (habits.reduce((sum, h) => {
            const completed = h.weeklyCompletion.filter(Boolean).length;
            return sum + (completed / 7) * 100;
          }, 0) /
            habits.length)
        );

  const goalsWithProgress = goals.map((goal) => {
    if (goal.linkedTaskIds.length === 0)
      return { id: goal._id, name: goal.title, progress: 0 };
    const linked = tasks.filter((t) => goal.linkedTaskIds.includes(t._id));
    const completed = linked.filter((t) => t.status === "completed").length;
    const progress = Math.round((completed / linked.length) * 100);
    return { id: goal._id, name: goal.title, progress };
  });

  const weekLabel = `Week of ${monday.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })} - ${sunday.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-foreground">
          Weekly Review
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <p>{weekLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Tasks Completed
            </h3>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {tasksCompleted}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            major tasks this week
          </p>
        </Card>

        <Card className="border-border bg-card p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Habit Consistency
            </h3>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {habitConsistency}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            across all habits
          </p>
        </Card>

        <Card className="border-border bg-card p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Active Goals
            </h3>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {goalsWithProgress.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">in progress</p>
        </Card>
      </div>

      <Card className="border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Daily Productivity
          </h2>
        </div>
        <div className="flex h-48 items-end justify-between gap-4">
          {chartData.map((data) => (
            <div
              key={data.day}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full rounded-t-lg bg-primary transition-all hover:opacity-80"
                  style={{
                    height: `${(data.tasks / maxTasks) * 100}%`,
                    minHeight: data.tasks > 0 ? "4px" : "0",
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">
                  {data.tasks}
                </p>
                <p className="text-xs text-muted-foreground">{data.day}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Goals Progress
        </h2>
        <div className="space-y-4">
          {goalsWithProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No goals yet. Add goals on the Goals page.
            </p>
          ) : (
            goalsWithProgress.map((goal) => (
              <div key={goal.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-foreground">{goal.name}</p>
                  <span className="text-sm font-medium text-foreground">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Reflection
        </h2>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="reflection-went-well"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              What went well this week?
            </label>
            <Textarea
              id="reflection-went-well"
              placeholder="Share your wins and positive moments..."
              className="min-h-[100px] resize-none"
            />
          </div>
          <div>
            <label
              htmlFor="reflection-improve"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              What could be improved?
            </label>
            <Textarea
              id="reflection-improve"
              placeholder="Identify areas for growth and adjustment..."
              className="min-h-[100px] resize-none"
            />
          </div>
          <div>
            <label
              htmlFor="reflection-focus"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Focus areas for next week
            </label>
            <Textarea
              id="reflection-focus"
              placeholder="Set intentions and priorities..."
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
