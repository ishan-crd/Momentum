import { Circle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/react-app/components/ui/card';
import { cn } from '@/react-app/lib/utils';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TopThreeTasksProps {
  tasks: Task[];
  onToggle: (id: number) => void;
}

export default function TopThreeTasks({ tasks, onToggle }: TopThreeTasksProps) {
  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Top 3 Most Important</h2>
        <span className="text-sm text-muted-foreground">
          {tasks.filter(t => t.completed).length}/{tasks.length} done
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <button
            key={task.id}
            onClick={() => onToggle(task.id)}
            className={cn(
              "w-full flex items-start gap-3 p-4 rounded-lg border transition-all group",
              task.completed
                ? "bg-muted/30 border-muted"
                : "bg-background border-border hover:border-foreground/20 hover:shadow-sm"
            )}
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-foreground transition-colors" />
            )}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
              </div>
              <p className={cn(
                "text-sm",
                task.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              )}>
                {task.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
