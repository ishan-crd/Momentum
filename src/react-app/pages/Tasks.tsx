import { Card } from "@/react-app/components/ui/card";
import { Circle, CheckCircle2, Clock, Plus, MoreVertical, Pencil, Sparkles, Trash2 } from "lucide-react";
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-500";
      case "medium":
        return "bg-yellow-50 text-yellow-600";
      case "low":
        return "bg-blue-50 text-blue-500";
      default:
        return "";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group cursor-grab rounded-lg border bg-background p-4 transition-all active:cursor-grabbing",
        "hover:border-foreground/20 hover:shadow-md"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm text-foreground">{task.title}</p>
        <div className="flex shrink-0 items-center gap-1">
          {task.priority && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                getPriorityColor(task.priority)
              )}
            >
              {task.priority}
            </span>
          )}
          {(onBreakDown || onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 opacity-70 hover:opacity-100"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      onEdit(task);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onBreakDown && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      onBreakDown(task.title);
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Break down
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      onDelete(task._id);
                    }}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {task.dueDate && (
        <p className="text-xs text-muted-foreground">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function DroppableColumn({
  id,
  children,
  label,
  icon: Icon,
  count,
}: {
  id: string;
  children: React.ReactNode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex flex-col">
      <Card className="border-border bg-card flex-1 shadow-sm">
        <div className="border-border border-b p-4">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">{label}</h3>
            <span className="ml-auto text-xs text-muted-foreground">{count}</span>
          </div>
        </div>
        <div className="min-h-[500px] space-y-3 p-4">{children}</div>
      </Card>
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columns = [
    { id: "todo", label: "To Do", icon: Circle },
    { id: "in-progress", label: "In Progress", icon: Clock },
    { id: "completed", label: "Completed", icon: CheckCircle2 },
  ] as const;

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

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

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-foreground">Tasks</h1>
          <p className="text-muted-foreground">Manage your actionable work</p>
        </div>
        <Button onClick={() => setShowAddTask(!showAddTask)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {showAddTask && (
        <Card className="border-border bg-card p-4 shadow-sm">
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
        <div className="grid grid-cols-3 gap-6">
          {columns.map((column) => {
            const Icon = column.icon;
            const columnTasks = getTasksByStatus(column.id);
            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                label={column.label}
                icon={Icon}
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
                  <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </div>
                )}
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rounded-lg border bg-background p-4 shadow-lg">
              <p className="text-sm text-foreground">{activeTask.title}</p>
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
  );
}
