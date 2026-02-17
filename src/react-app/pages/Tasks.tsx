import { Card } from "@/react-app/components/ui/card";
import { Clock, Plus, MoreVertical, MoreHorizontal, Pencil, Sparkles, Trash2, Search } from "lucide-react";
import { cn } from "@/react-app/lib/utils";
import { useState } from "react";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import { Label } from "@/react-app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import SuggestedTasksDialog from "@/react-app/components/SuggestedTasksDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/react-app/components/ui/dialog";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragOverEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { toast } from "sonner";

type TaskStatus = "todo" | "in-progress" | "completed";
type TaskDoc = {
  _id: Id<"tasks">;
  _creationTime: number;
  userId: Id<"users">;
  title: string;
  status: TaskStatus;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  isTopThree?: boolean;
};

function SortableTask({
  task,
  onBreakDown,
  onEdit,
  onDelete,
}: {
  task: TaskDoc;
  onBreakDown?: (title: string) => void;
  onEdit?: (task: TaskDoc) => void;
  onDelete?: (id: Id<"tasks">) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityPillClass = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-muted text-muted-foreground";
      case "low":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const isCompleted = task.status === "completed";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group rounded-xl border p-4 transition-all",
        isCompleted
          ? "cursor-default border-border bg-muted/50"
          : "cursor-grab active:cursor-grabbing border-border bg-card hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        {task.priority ? (
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              getPriorityPillClass(task.priority)
            )}
          >
            {task.priority}
          </span>
        ) : (
          <span />
        )}
        {(onBreakDown ?? onEdit ?? onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onEdit(task); }}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              {onBreakDown && (
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onBreakDown(task.title); }}>
                  <Sparkles className="h-4 w-4" /> Break down
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem variant="destructive" onSelect={(e) => { e.preventDefault(); onDelete(task._id); }}>
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <h4 className="text-[14px] font-semibold text-foreground leading-snug">
        {task.title}
      </h4>
      {task.dueDate && (
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
      <div className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        {isCompleted
          ? "Completed"
          : task.dueDate
            ? new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
            : "No due date"}
      </div>
    </div>
  );
}

const columnDotColors: Record<string, string> = {
  todo: "bg-blue-500",
  "in-progress": "bg-violet-500",
  completed: "bg-green-500",
};

function DroppableColumn({
  id,
  children,
  label,
  count,
}: {
  id: string;
  children: React.ReactNode;
  label: string;
  count: number;
}) {
  const { setNodeRef } = useDroppable({ id });
  const dotColor = columnDotColors[id] ?? "bg-muted-foreground";

  return (
    <div ref={setNodeRef} className="flex flex-col">
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />
            <h3 className="text-[15px] font-bold text-foreground truncate">{label}</h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {count}
            </span>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Column options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="min-h-[480px] space-y-3 p-4">{children}</div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const tasks = useQuery(api.tasks.list) ?? [];
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const breakTaskAction = useAction(api.ai.breakTask);
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeId, setActiveId] = useState<Id<"tasks"> | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<
    "low" | "medium" | "high" | undefined
  >(undefined);
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [breakDownOpen, setBreakDownOpen] = useState(false);
  const [breakDownSourceTitle, setBreakDownSourceTitle] = useState("");
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([]);
  const [breakDownLoading, setBreakDownLoading] = useState(false);
  const [breakDownError, setBreakDownError] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<TaskDoc | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<
    "low" | "medium" | "high" | undefined
  >(undefined);
  const [editDueDate, setEditDueDate] = useState("");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columns = [
    { id: "todo", label: "To Do" },
    { id: "in-progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
  ] as const;

  const filteredTasks = taskSearchQuery.trim()
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(taskSearchQuery.toLowerCase())
      )
    : tasks;

  const getTasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((task) => task.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as Id<"tasks">);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;
    const overColumn = columns.find((col) => col.id === over.id);
    if (overColumn && activeTask.status !== overColumn.id) {
      void updateTask({
        id: activeTask._id,
        status: overColumn.id,
      });
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTask({
      title: newTaskTitle,
      status: "todo",
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
    });
    setNewTaskTitle("");
    setNewTaskPriority(undefined);
    setNewTaskDueDate("");
    setShowAddTask(false);
  };

  const handleBreakDown = async (title: string) => {
    setBreakDownSourceTitle(title);
    setBreakDownOpen(true);
    setSuggestedTasks([]);
    setBreakDownError(null);
    setBreakDownLoading(true);
    try {
      const result = await breakTaskAction({ title });
      setSuggestedTasks(result ?? []);
    } catch (e) {
      setSuggestedTasks([]);
      setBreakDownError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBreakDownLoading(false);
    }
  };

  const handleDeleteTask = (id: Id<"tasks">) => {
    void removeTask({ id });
    toast.success("Task deleted");
  };

  const handleEditTask = (task: TaskDoc) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editTask || !editTitle.trim()) return;
    await updateTask({
      id: editTask._id,
      title: editTitle.trim(),
      priority: editPriority,
      dueDate: editDueDate || undefined,
    });
    setEditTask(null);
    setEditTitle("");
    setEditPriority(undefined);
    setEditDueDate("");
    toast.success("Task updated");
  };

  const handleAddSuggestedTask = (title: string) => {
    void createTask({ title, status: "todo" });
    setSuggestedTasks((prev) => prev.filter((t) => t !== title));
    toast.success("Task has been added");
  };

  const handleAddAllSuggested = () => {
    suggestedTasks.forEach((title) => {
      void createTask({ title, status: "todo" });
    });
    setSuggestedTasks([]);
    toast.success("Tasks have been added");
  };

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;
  const activeCount = filteredTasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-foreground">Focus Board</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Managing {activeCount} active task{activeCount !== 1 ? "s" : ""} across 3 stages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search tasks..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="h-10 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Search tasks"
              />
            </div>
            <Button onClick={() => setShowAddTask(!showAddTask)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {showAddTask && (
          <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleAddTask()}
                placeholder="Enter task title..."
                className="mt-1"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-priority">Priority (Optional)</Label>
                <Select
                  value={newTaskPriority ?? "none"}
                  onValueChange={(v) =>
                    setNewTaskPriority(
                      v === "none" ? undefined : (v as "low" | "medium" | "high")
                    )
                  }
                >
                  <SelectTrigger id="task-priority" className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-due-date">Due Date (Optional)</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void handleAddTask()}>Add Task</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskTitle("");
                  setNewTaskPriority(undefined);
                  setNewTaskDueDate("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-5">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                label={column.label}
                count={columnTasks.length}
              >
                <SortableContext
                  items={columnTasks.map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map((task) => (
                    <SortableTask
                      key={task._id}
                      task={task}
                      onBreakDown={handleBreakDown}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </SortableContext>
                {columnTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </div>
                )}
              </DroppableColumn>
            );
          })}
        </div>
        <div className="mt-4 flex justify-start">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground"
            aria-label="Add column"
          >
            <Plus className="h-4 w-4" />
            Add Column
          </button>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
              {activeTask.priority != null && (
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    activeTask.priority === "high" && "bg-destructive text-destructive-foreground",
                    activeTask.priority === "medium" && "bg-muted text-muted-foreground",
                    activeTask.priority === "low" && "bg-secondary text-secondary-foreground"
                  )}
                >
                  {activeTask.priority}
                </span>
              )}
              <h4 className="mt-2 text-[14px] font-semibold text-foreground">{activeTask.title}</h4>
              {activeTask.dueDate && (
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  Due {new Date(activeTask.dueDate).toLocaleDateString()}
                </p>
              )}
              <div className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {activeTask.dueDate
                  ? new Date(activeTask.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                  : "No due date"}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-task-title">Task title</Label>
              <Input
                id="edit-task-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleSaveEdit()}
                placeholder="Task title..."
                className="mt-1"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select
                  value={editPriority ?? "none"}
                  onValueChange={(v) =>
                    setEditPriority(
                      v === "none" ? undefined : (v as "low" | "medium" | "high")
                    )
                  }
                >
                  <SelectTrigger id="edit-task-priority" className="mt-1">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-task-due-date">Due date</Label>
                <Input
                  id="edit-task-due-date"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter showCloseButton={false}>
            <Button variant="outline" onClick={() => setEditTask(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSaveEdit()}
              disabled={!editTitle.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuggestedTasksDialog
        open={breakDownOpen}
        onOpenChange={setBreakDownOpen}
        title={breakDownSourceTitle ? `Break down: ${breakDownSourceTitle}` : "Break down"}
        suggestedTasks={suggestedTasks}
        loading={breakDownLoading}
        error={breakDownError}
        onAddTask={handleAddSuggestedTask}
        onAddAll={handleAddAllSuggested}
      />
      </div>
    </div>
  );
}
