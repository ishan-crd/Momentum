import { cn } from "@/react-app/lib/utils";
import { Checkbox } from "@/react-app/components/ui/checkbox";
import { Button } from "@/react-app/components/ui/button";
import { MoreVertical, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import { Pencil, Trash2 } from "lucide-react";
import type { Id } from "convex/_generated/dataModel";

export type NextUpTask = {
  id: Id<"tasks">;
  title: string;
  status: string;
  priority?: string;
  dueDate?: string;
  isWork?: boolean;
};

interface NextUpListProps {
  tasks: NextUpTask[];
  onToggle: (id: Id<"tasks">) => void;
  onEdit: (id: Id<"tasks">) => void;
  onDelete: (id: Id<"tasks">) => void;
  onAddTask: () => void;
}

export default function NextUpList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onAddTask,
}: NextUpListProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Next Up</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Work
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Personal
          </span>
        </div>
      </div>
      <ul className="space-y-0">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3 transition-colors hover:bg-card"
          >
            <Checkbox
              checked={task.status === "completed"}
              onCheckedChange={() => onToggle(task.id)}
              className="rounded"
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  task.status === "completed"
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                )}
              >
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {task.dueDate
                  ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                  : "No due date"}
              </p>
            </div>
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium",
                task.priority === "high"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {task.priority === "high" ? "Urgent" : "WORK"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task.id)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAddTask}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Add a new task
      </button>
    </div>
  );
}
