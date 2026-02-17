import { Card } from '@/react-app/components/ui/card';
import { Circle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/react-app/lib/utils';

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
}

interface TaskBoardProps {
  tasks: Task[];
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const columns = [
    { id: 'todo', label: 'To Do', icon: Circle },
    { id: 'in-progress', label: 'In Progress', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ] as const;

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Task Board</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">{column.label}</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
              
              <div className="space-y-2 flex-1">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 rounded-lg border bg-background transition-all cursor-move",
                      "hover:shadow-sm hover:border-foreground/20"
                    )}
                  >
                    <p className="text-sm text-foreground">{task.title}</p>
                  </div>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="p-3 rounded-lg border border-dashed border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
