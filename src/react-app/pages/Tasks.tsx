import { Card } from '@/react-app/components/ui/card';
import { Circle, CheckCircle2, Clock, Plus } from 'lucide-react';
import { cn } from '@/react-app/lib/utils';
import { useState } from 'react';
import { Input } from '@/react-app/components/ui/input';
import { Button } from '@/react-app/components/ui/button';
import { Label } from '@/react-app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/react-app/components/ui/select';
import { DndContext, DragOverlay, closestCenter, DragStartEvent, DragOverEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

const initialTasks: Task[] = [
  { id: 1, title: 'Update project documentation', status: 'todo', priority: 'high', dueDate: '2024-01-15' },
  { id: 2, title: 'Research new productivity tools', status: 'todo', priority: 'medium' },
  { id: 3, title: 'Write blog post draft', status: 'in-progress', priority: 'high' },
  { id: 4, title: 'Review code PRs', status: 'in-progress' },
  { id: 5, title: 'Morning meditation', status: 'completed' },
  { id: 6, title: 'Read 30 minutes', status: 'completed', priority: 'low' },
];

function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-500 bg-blue-50';
      default: return '';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-4 rounded-lg border bg-background transition-all cursor-grab active:cursor-grabbing group",
        "hover:shadow-md hover:border-foreground/20"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-foreground flex-1">{task.title}</p>
        {task.priority && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full ml-2",
            getPriorityColor(task.priority)
          )}>
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
  count 
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
      <Card className="flex-1 bg-card border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">{label}</h3>
            <span className="ml-auto text-xs text-muted-foreground">
              {count}
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-3 min-h-[500px]">
          {children}
        </div>
      </Card>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  
  // Add task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: 'todo', label: 'To Do', icon: Circle },
    { id: 'in-progress', label: 'In Progress', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ] as const;

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Check if we're over a column
    const overColumn = columns.find(col => col.id === over.id);
    if (overColumn && activeTask.status !== overColumn.id) {
      setTasks(tasks.map(task =>
        task.id === active.id
          ? { ...task, status: overColumn.id }
          : task
      ));
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: newTaskTitle,
        status: 'todo',
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskPriority(undefined);
      setNewTaskDueDate('');
      setShowAddTask(false);
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Tasks</h1>
          <p className="text-muted-foreground">Manage your actionable work</p>
        </div>
        <Button 
          onClick={() => setShowAddTask(!showAddTask)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {showAddTask && (
        <Card className="p-4 bg-card border-border shadow-sm">
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Enter task title..."
                className="mt-1"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-priority">Priority (Optional)</Label>
                <Select value={newTaskPriority || ''} onValueChange={(value) => setNewTaskPriority(value as any || undefined)}>
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
              <Button onClick={handleAddTask}>Add Task</Button>
              <Button variant="outline" onClick={() => {
                setShowAddTask(false);
                setNewTaskTitle('');
                setNewTaskPriority(undefined);
                setNewTaskDueDate('');
              }}>Cancel</Button>
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
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map((task) => (
                    <SortableTask 
                      key={task.id} 
                      task={task}
                    />
                  ))}
                </SortableContext>
                
                {columnTasks.length === 0 && (
                  <div className="p-8 rounded-lg border border-dashed border-border/50 text-center">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </div>
                )}
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="p-4 rounded-lg border bg-background shadow-lg">
              <p className="text-sm text-foreground">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
