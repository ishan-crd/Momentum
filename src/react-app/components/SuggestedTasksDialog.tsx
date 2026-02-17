import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/react-app/components/ui/dialog";
import { Button } from "@/react-app/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

type SuggestedTasksDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  suggestedTasks: string[];
  loading: boolean;
  error?: string | null;
  onAddTask: (title: string) => void;
  onAddAll: () => void;
};

export default function SuggestedTasksDialog({
  open,
  onOpenChange,
  title,
  suggestedTasks,
  loading,
  error,
  onAddTask,
  onAddAll,
}: SuggestedTasksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-[120px]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Getting suggestions…</span>
            </div>
          ) : error ? (
            <div className="space-y-2 py-4">
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground">
                Get a free key at <strong>aistudio.google.com/app/apikey</strong> and add <strong>GEMINI_API_KEY</strong> in Convex Dashboard → Settings → Environment Variables.
              </p>
            </div>
          ) : suggestedTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No suggestions. Try again or add tasks manually.
            </p>
          ) : (
            <div className="space-y-2">
              <ul className="max-h-60 space-y-1.5 overflow-y-auto">
                {suggestedTasks.map((taskTitle) => (
                  <li
                    key={taskTitle}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span className="flex-1 truncate text-foreground">
                      {taskTitle}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => onAddTask(taskTitle)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add</span>
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                className="w-full gap-2"
                onClick={() => {
                  onAddAll();
                  onOpenChange(false);
                }}
              >
                <Plus className="h-4 w-4" />
                Add all to tasks
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
