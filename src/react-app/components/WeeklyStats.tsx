import { Card } from '@/react-app/components/ui/card';
import { Progress } from '@/react-app/components/ui/progress';
import { TrendingUp, Target, Flame } from 'lucide-react';

interface WeeklyStatsProps {
  completedTasks: number;
  goalProgress: number;
  longestStreak: number;
}

export default function WeeklyStats({ completedTasks, goalProgress, longestStreak }: WeeklyStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">This Week</span>
        </div>
        <p className="text-2xl font-semibold text-foreground">{completedTasks}</p>
        <p className="text-xs text-muted-foreground mt-1">major tasks completed</p>
      </Card>

      <Card className="p-4 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Weekly Goals</span>
        </div>
        <p className="text-2xl font-semibold text-foreground">{goalProgress}%</p>
        <Progress value={goalProgress} className="mt-2 h-1.5" />
      </Card>

      <Card className="p-4 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Longest Streak</span>
        </div>
        <p className="text-2xl font-semibold text-foreground">{longestStreak}</p>
        <p className="text-xs text-muted-foreground mt-1">days in a row</p>
      </Card>
    </div>
  );
}
