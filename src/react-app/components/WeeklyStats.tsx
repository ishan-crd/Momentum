import { Progress } from "@/react-app/components/ui/progress";
import { Flame } from "lucide-react";
import { cn } from "@/react-app/lib/utils";

interface WeeklyStatsProps {
  goalProgress: number;
  longestStreak: number;
  weeklyGoalsDone?: number;
  weeklyGoalsTotal?: number;
}

export default function WeeklyStats({
  goalProgress,
  longestStreak,
  weeklyGoalsDone = 0,
  weeklyGoalsTotal = 12,
}: WeeklyStatsProps) {
  const remaining = Math.max(0, weeklyGoalsTotal - weeklyGoalsDone);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            This Week
          </span>
          {goalProgress > 0 && (
            <span className="text-xs font-medium text-green-600 dark:text-green-500">+{Math.min(12, goalProgress)}%</span>
          )}
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">{goalProgress}% Complete</p>
        <Progress value={goalProgress} className="mt-3 h-2" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Weekly Goals
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {weeklyGoalsDone} of {weeklyGoalsTotal}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {Array.from({ length: weeklyGoalsTotal }, (_, i) => ({ id: `goal-${i}`, filled: i < weeklyGoalsDone })).map(({ id, filled }) => (
            <div
              key={id}
              className={cn(
                "h-2 w-6 rounded-sm",
                filled ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {remaining} remaining goals for the week.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Longest Streak
          </span>
          <Flame className="h-5 w-5 shrink-0 text-orange-500" />
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {longestStreak} <span className="text-sm font-normal text-muted-foreground">Days</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {longestStreak > 0 ? "New personal record achieved!" : "Longest streak"}
        </p>
      </div>
    </div>
  );
}
