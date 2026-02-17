import { Card } from '@/react-app/components/ui/card';
import { Progress } from '@/react-app/components/ui/progress';
import { Target, Plus, Calendar, X } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/react-app/components/ui/tabs';
import { useState } from 'react';
import { Input } from '@/react-app/components/ui/input';
import { Label } from '@/react-app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/react-app/components/ui/select';
import { Checkbox } from '@/react-app/components/ui/checkbox';

interface Task {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
}

interface Goal {
  id: number;
  title: string;
  category: 'personal' | 'professional' | 'health' | 'learning';
  timeframe: 'weekly' | 'monthly';
  progress: number;
  linkedTaskIds: number[];
  targetDate: string;
}

// Sample tasks that could be linked to goals
const availableTasks: Task[] = [
  { id: 1, title: 'Update project documentation', status: 'completed' },
  { id: 2, title: 'Research new productivity tools', status: 'todo' },
  { id: 3, title: 'Write blog post draft', status: 'in-progress' },
  { id: 4, title: 'Review code PRs', status: 'in-progress' },
  { id: 5, title: 'Morning meditation', status: 'completed' },
  { id: 6, title: 'Read 30 minutes', status: 'completed' },
  { id: 7, title: 'Complete TypeScript course module', status: 'todo' },
  { id: 8, title: 'Workout session', status: 'completed' },
];

const initialGoals: Goal[] = [
  {
    id: 1,
    title: 'Complete product launch',
    category: 'professional',
    timeframe: 'monthly',
    progress: 65,
    linkedTaskIds: [1, 2, 3],
    targetDate: '2024-01-31'
  },
  {
    id: 2,
    title: 'Exercise 4 times this week',
    category: 'health',
    timeframe: 'weekly',
    progress: 75,
    linkedTaskIds: [5, 8],
    targetDate: '2024-01-14'
  },
  {
    id: 3,
    title: 'Learn TypeScript fundamentals',
    category: 'learning',
    timeframe: 'monthly',
    progress: 40,
    linkedTaskIds: [7],
    targetDate: '2024-01-31'
  },
];

export default function Goals() {
  const [goals, setGoals] = useState(initialGoals);
  const [tasks] = useState(availableTasks);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'personal' | 'professional' | 'health' | 'learning'>('personal');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  const calculateProgress = (linkedTaskIds: number[]) => {
    if (linkedTaskIds.length === 0) return 0;
    const completedCount = linkedTaskIds.filter(taskId => {
      const task = tasks.find(t => t.id === taskId);
      return task?.status === 'completed';
    }).length;
    return Math.round((completedCount / linkedTaskIds.length) * 100);
  };

  const handleToggleTask = (taskId: number) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleAddGoal = () => {
    if (newGoalTitle.trim() && newGoalTargetDate && selectedTaskIds.length > 0) {
      const newGoal: Goal = {
        id: Date.now(),
        title: newGoalTitle,
        category: newGoalCategory,
        timeframe: newGoalTimeframe,
        progress: calculateProgress(selectedTaskIds),
        linkedTaskIds: selectedTaskIds,
        targetDate: newGoalTargetDate,
      };
      setGoals([...goals, newGoal]);
      
      // Reset form
      setNewGoalTitle('');
      setNewGoalCategory('personal');
      setNewGoalTimeframe('weekly');
      setNewGoalTargetDate('');
      setSelectedTaskIds([]);
      setShowAddGoal(false);
    }
  };

  const weeklyGoals = goals.filter(g => g.timeframe === 'weekly');
  const monthlyGoals = goals.filter(g => g.timeframe === 'monthly');

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const currentProgress = calculateProgress(goal.linkedTaskIds);
    const linkedTasks = tasks.filter(t => goal.linkedTaskIds.includes(t.id));
    const completedTasks = linkedTasks.filter(t => t.status === 'completed').length;

    return (
      <Card className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-base font-medium text-foreground mb-1">{goal.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="capitalize">{goal.category}</span>
              <span>•</span>
              <span>{completedTasks}/{linkedTasks.length} tasks complete</span>
            </div>
          </div>
          <Target className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground font-medium">{currentProgress}% complete</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(goal.targetDate).toLocaleDateString()}
              </div>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>

          {linkedTasks.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Linked tasks:</p>
              <div className="space-y-1">
                {linkedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-xs">
                    <div className={`h-1.5 w-1.5 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                    <span className={task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Goals</h1>
          <p className="text-muted-foreground">Connect daily tasks to bigger life outcomes</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddGoal(!showAddGoal)}>
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {showAddGoal && (
        <Card className="p-6 bg-card border-border shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">Create New Goal</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAddGoal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-title">Goal Name</Label>
              <Input
                id="goal-title"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Enter goal name..."
                className="mt-1"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-category">Category</Label>
                <Select value={newGoalCategory} onValueChange={(value) => setNewGoalCategory(value as any)}>
                  <SelectTrigger id="goal-category" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal-timeframe">Timeframe</Label>
                <Select value={newGoalTimeframe} onValueChange={(value) => setNewGoalTimeframe(value as any)}>
                  <SelectTrigger id="goal-timeframe" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="goal-target-date">Target Date</Label>
              <Input
                id="goal-target-date"
                type="date"
                value={newGoalTargetDate}
                onChange={(e) => setNewGoalTargetDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-3 block">Link Tasks</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-4">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={selectedTaskIds.includes(task.id)}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                    <label 
                      htmlFor={`task-${task.id}`}
                      className="flex-1 text-sm text-foreground cursor-pointer"
                    >
                      {task.title}
                      <span className={`ml-2 text-xs ${task.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`}>
                        ({task.status === 'completed' ? 'completed' : task.status})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddGoal} disabled={!newGoalTitle.trim() || !newGoalTargetDate || selectedTaskIds.length === 0}>
                Create Goal
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddGoal(false);
                setNewGoalTitle('');
                setNewGoalCategory('personal');
                setNewGoalTimeframe('weekly');
                setNewGoalTargetDate('');
                setSelectedTaskIds([]);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {weeklyGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">Weekly Goals</h2>
              <div className="grid grid-cols-2 gap-4">
                {weeklyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </div>
            </div>
          )}
          {monthlyGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">Monthly Goals</h2>
              <div className="grid grid-cols-2 gap-4">
                {monthlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </div>
            </div>
          )}
          {goals.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No goals yet. Create your first goal to get started!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly">
          <div className="grid grid-cols-2 gap-4">
            {weeklyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </TabsContent>

        <TabsContent value="monthly">
          <div className="grid grid-cols-2 gap-4">
            {monthlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </TabsContent>

        <TabsContent value="personal">
          <div className="grid grid-cols-2 gap-4">
            {goals.filter(g => g.category === 'personal').map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </TabsContent>

        <TabsContent value="professional">
          <div className="grid grid-cols-2 gap-4">
            {goals.filter(g => g.category === 'professional').map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
