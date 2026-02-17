import { AlertCircle, Calendar, CheckCircle } from "lucide-react";
import type { Id } from "convex/_generated/dataModel";

type Task = {
  _id: Id<"tasks">;
  title: string;
  status: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
};

export default function CurrentMission({
  task,
  onComplete,
}: {
  task: Task | null;
  onComplete: (id: Id<"tasks">) => void;
}) {
  if (!task) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Current Mission
        </p>
        <p className="mt-2 text-[20px] font-bold text-foreground">No mission set</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Mark a task as top priority or add one to see it here.
        </p>
      </div>
    );
  }

  const dueText = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const priorityLabel = task.priority
    ? `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Current Mission
      </p>
      <div className="mt-3 flex flex-row items-center justify-between gap-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-bold leading-tight text-foreground">
            {task.title}
          </h2>
          <div className="mt-2 flex flex-row flex-wrap items-center gap-0 text-[13px]">
            {task.priority && (
              <>
                <span className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Priority {priorityLabel}
                </span>
                {dueText && (
                  <span className="mx-3 h-4 w-px shrink-0 bg-border" />
                )}
              </>
            )}
            {dueText && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due {dueText}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onComplete(task._id)}
          disabled={task.status === "completed"}
          className="shrink-0 flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
        >
          <CheckCircle className="h-5 w-5" />
          Mark as Complete
        </button>
      </div>
    </div>
  );
}
