import { Card } from "@/react-app/components/ui/card";
import { Circle, CheckCircle2, Clock, Plus } from "lucide-react";
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
  DndContext,
  DragOverlay,
  closestCenter,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

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

function SortableTask({ task }: { task: TaskDoc }) {
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
      <div className="mb-2 flex items-start justify-between">
        <p className="flex-1 text-sm text-foreground">{task.title}</p>
        {task.priority && (
          <span
            className={cn(
              "ml-2 rounded-full px-2 py-0.5 text-xs font-medium",
              getPriorityColor(task.priority)
            )}
          >
            {task.priority}
          </span>
        )}
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
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeId, setActiveId] = useState<Id<"tasks"> | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<
    "low" | "medium" | "high" | undefined
  >(undefined);
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

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
                  value={newTaskPriority ?? ""}
                  onValueChange={(v) =>
                    setNewTaskPriority(
                      v ? (v as "low" | "medium" | "high") : undefined
                    )
                  }
                >
                  <SelectTrigger id="task-priority" className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
                    <SortableTask key={task._id} task={task} />
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
    </div>
  );
}
