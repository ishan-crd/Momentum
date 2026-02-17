import { Card } from '@/react-app/components/ui/card';
import { TrendingUp, Target, CheckCircle2, Flame, Calendar } from 'lucide-react';
import { Textarea } from '@/react-app/components/ui/textarea';

export default function WeeklyReview() {
  const weekData = {
    tasksCompleted: 23,
    habitConsistency: 78,
    goalsProgress: [
      { name: 'Complete product launch', progress: 65 },
      { name: 'Exercise 4 times this week', progress: 75 },
      { name: 'Learn TypeScript fundamentals', progress: 40 },
    ],
    chartData: [
      { day: 'Mon', tasks: 4 },
      { day: 'Tue', tasks: 3 },
      { day: 'Wed', tasks: 5 },
      { day: 'Thu', tasks: 2 },
      { day: 'Fri', tasks: 4 },
      { day: 'Sat', tasks: 3 },
      { day: 'Sun', tasks: 2 },
    ]
  };

  const maxTasks = Math.max(...weekData.chartData.map(d => d.tasks));

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Weekly Review</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <p>Week of January 8 - January 14, 2024</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Tasks Completed</h3>
          </div>
          <p className="text-3xl font-semibold text-foreground">{weekData.tasksCompleted}</p>
          <p className="text-xs text-muted-foreground mt-1">major tasks this week</p>
        </Card>

        <Card className="p-6 bg-card border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Habit Consistency</h3>
          </div>
          <p className="text-3xl font-semibold text-foreground">{weekData.habitConsistency}%</p>
          <p className="text-xs text-muted-foreground mt-1">across all habits</p>
        </Card>

        <Card className="p-6 bg-card border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Active Goals</h3>
          </div>
          <p className="text-3xl font-semibold text-foreground">{weekData.goalsProgress.length}</p>
          <p className="text-xs text-muted-foreground mt-1">in progress</p>
        </Card>
      </div>

      {/* Productivity Chart */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Daily Productivity</h2>
        </div>
        
        <div className="flex items-end justify-between gap-4 h-48">
          {weekData.chartData.map(data => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center flex-1">
                <div 
                  className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(data.tasks / maxTasks) * 100}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{data.tasks}</p>
                <p className="text-xs text-muted-foreground">{data.day}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Goals Progress */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Goals Progress</h2>
        <div className="space-y-4">
          {weekData.goalsProgress.map((goal, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-foreground">{goal.name}</p>
                <span className="text-sm font-medium text-foreground">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reflection Prompts */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Reflection</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              What went well this week?
            </label>
            <Textarea 
              placeholder="Share your wins and positive moments..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              What could be improved?
            </label>
            <Textarea 
              placeholder="Identify areas for growth and adjustment..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Focus areas for next week
            </label>
            <Textarea 
              placeholder="Set intentions and priorities..."
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
