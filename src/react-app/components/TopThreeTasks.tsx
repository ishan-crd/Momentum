import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/react-app/lib/utils";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  status?: "todo" | "in-progress" | "completed";
}

interface TopThreeTasksProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onReview?: (id: string) => void;
}

export default function TopThreeTasks({ tasks, onToggle, onReview }: TopThreeTasksProps) {
  return (
    <div className="space-y-6">
      {/* Header: title and Edit Priorities on same baseline */}
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[22px] font-bold leading-tight text-foreground tracking-tight">
          Top 3 Most Important.
        </h2>
        <Link
          to="/tasks"
          className="shrink-0 text-sm font-normal text-primary hover:underline"
        >
          Edit Priorities
        </Link>
      </div>

      {/* Three cards: equal gap, same size */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {tasks.slice(0, 3).map((task) => {
          const Icon = task.completed
            ? CheckCircle2
            : task.status === "in-progress"
              ? HelpCircle
              : XCircle;

          const iconStyles = task.completed
            ? {
                circle: "border-green-500 bg-muted",
                icon: "text-green-600 dark:text-green-400",
              }
            : task.status === "in-progress"
              ? {
                  circle: "border-primary bg-muted",
                  icon: "text-primary",
                  glow: "shadow-md",
                }
              : {
                  circle: "border-destructive bg-muted",
                  icon: "text-destructive",
                  glow: "",
                };

          return (
            <div
              key={task.id}
              className={cn(
                "flex flex-col rounded-[14px] border border-border bg-card p-6",
                task.status === "in-progress" && iconStyles.glow
              )}
            >
              <div className="flex justify-center">
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2",
                    iconStyles.circle
                  )}
                >
                  <Icon className={cn("h-7 w-7", iconStyles.icon)} />
                </div>
              </div>

              <h3 className="mt-4 text-center text-[15px] font-bold leading-snug text-foreground">
                {task.title}
              </h3>

              <p className="mt-2 text-center text-[13px] font-normal leading-snug text-muted-foreground line-clamp-2">
                {task.completed
                  ? "Completed."
                  : "Focus on this task next."}
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => onReview?.(task.id)}
                  className="flex-1 rounded-lg border border-border bg-transparent py-2.5 text-xs font-normal uppercase tracking-wide text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Review
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(task.id)}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-normal uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
                >
                  Done
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
