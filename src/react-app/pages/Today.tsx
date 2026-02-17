import { useState } from 'react';
import TopThreeTasks from '@/react-app/components/TopThreeTasks';
import TaskBoard from '@/react-app/components/TaskBoard';
import QuickAdd from '@/react-app/components/QuickAdd';
import WeeklyStats from '@/react-app/components/WeeklyStats';

// Stub data for initial UI
const initialTopTasks = [
  { id: 1, title: 'Complete quarterly review presentation', completed: false },
  { id: 2, title: 'Schedule team 1-on-1 meetings', completed: true },
  { id: 3, title: 'Review and respond to client feedback', completed: false },
];

const initialBoardTasks = [
  { id: 4, title: 'Update project documentation', status: 'todo' as const },
  { id: 5, title: 'Research new productivity tools', status: 'todo' as const },
  { id: 6, title: 'Write blog post draft', status: 'in-progress' as const },
  { id: 7, title: 'Review code PRs', status: 'in-progress' as const },
  { id: 8, title: 'Morning meditation', status: 'completed' as const },
  { id: 9, title: 'Read 30 minutes', status: 'completed' as const },
];

export default function Today() {
  const [topTasks, setTopTasks] = useState(initialTopTasks);
  const [boardTasks] = useState(initialBoardTasks);

  const handleTopTaskToggle = (id: number) => {
    setTopTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Today</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Weekly Stats */}
      <WeeklyStats 
        completedTasks={5} 
        goalProgress={68} 
        longestStreak={12} 
      />

      {/* Top 3 Tasks */}
      <TopThreeTasks tasks={topTasks} onToggle={handleTopTaskToggle} />

      {/* Quick Add */}
      <QuickAdd />

      {/* Task Board */}
      <TaskBoard tasks={boardTasks} />
    </div>
  );
}
