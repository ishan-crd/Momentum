import { Card } from '@/react-app/components/ui/card';
import { Checkbox } from '@/react-app/components/ui/checkbox';
import { Flame, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/react-app/components/ui/dialog';
import { Input } from '@/react-app/components/ui/input';
import { Label } from '@/react-app/components/ui/label';

interface Habit {
  id: number;
  name: string;
  streak: number;
  completedToday: boolean;
  weeklyCompletion: boolean[]; // Last 7 days
}

const stubHabits: Habit[] = [
  {
    id: 1,
    name: 'Morning meditation',
    streak: 12,
    completedToday: true,
    weeklyCompletion: [true, true, true, true, false, true, true]
  },
  {
    id: 2,
    name: 'Exercise',
    streak: 7,
    completedToday: false,
    weeklyCompletion: [true, false, true, true, true, false, true]
  },
  {
    id: 3,
    name: 'Read 30 minutes',
    streak: 15,
    completedToday: true,
    weeklyCompletion: [true, true, true, true, true, true, true]
  },
  {
    id: 4,
    name: 'Journal',
    streak: 5,
    completedToday: false,
    weeklyCompletion: [true, true, false, true, true, false, false]
  },
];

function newHabit(habits: Habit[], name: string): Habit {
  const nextId = habits.length > 0 ? Math.max(...habits.map((h) => h.id)) + 1 : 1;
  return {
    id: nextId,
    name: name.trim(),
    streak: 0,
    completedToday: false,
    weeklyCompletion: [false, false, false, false, false, false, false],
  };
}

export default function Habits() {
  const [habits, setHabits] = useState(stubHabits);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const toggleHabit = (id: number) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id) return h;
        const completedToday = !h.completedToday;
        const weeklyCompletion = [...h.weeklyCompletion];
        weeklyCompletion[todayIndex] = completedToday;
        return { ...h, completedToday, weeklyCompletion };
      })
    );
  };

  const handleAddHabit = () => {
    const name = newHabitName.trim();
    if (!name) return;
    setHabits(prev => [...prev, newHabit(prev, name)]);
    setNewHabitName('');
    setAddDialogOpen(false);
  };

  const getConsistencyPercentage = (habit: Habit) => {
    const completed = habit.weeklyCompletion.filter(Boolean).length;
    return Math.round((completed / 7) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Habits</h1>
          <p className="text-muted-foreground">Build consistency with small daily wins</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Habit
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New habit</DialogTitle>
              <DialogDescription>
                Add a habit you want to track daily. You can check it off each day.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit name</Label>
              <Input
                id="habit-name"
                placeholder="e.g. Morning meditation"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              />
            </div>
            <DialogFooter showCloseButton>
              <Button
                onClick={handleAddHabit}
                disabled={!newHabitName.trim()}
              >
                Add habit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Habits */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Today's Check-ins</h2>
        <div className="space-y-3">
          {habits.map(habit => (
            <div
              key={habit.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background hover:border-foreground/20 transition-colors"
            >
              <Checkbox
                checked={habit.completedToday}
                onCheckedChange={() => toggleHabit(habit.id)}
                className="h-5 w-5"
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  habit.completedToday ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {habit.name}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-foreground">{habit.streak}</span>
                <span className="text-muted-foreground text-xs">day streak</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Consistency */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Weekly Consistency</h2>
        </div>
        
        <div className="space-y-6">
          {habits.map(habit => {
            const consistency = getConsistencyPercentage(habit);
            return (
              <div key={habit.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">{habit.name}</h3>
                  <span className="text-sm text-muted-foreground">{consistency}%</span>
                </div>
                <div className="flex gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <div key={day} className="flex-1 text-center">
                      <div className={`h-12 rounded-lg mb-1 ${
                        habit.weeklyCompletion[idx]
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`} />
                      <span className="text-xs text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Completed Today</p>
          <p className="text-2xl font-semibold text-foreground">
            {habits.filter(h => h.completedToday).length}/{habits.length}
          </p>
        </Card>
        <Card className="p-4 bg-card border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Longest Streak</p>
          <p className="text-2xl font-semibold text-foreground">
            {habits.length ? Math.max(...habits.map(h => h.streak)) : 0} days
          </p>
        </Card>
        <Card className="p-4 bg-card border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Average Consistency</p>
          <p className="text-2xl font-semibold text-foreground">
            {habits.length ? Math.round(habits.reduce((sum, h) => sum + getConsistencyPercentage(h), 0) / habits.length) : 0}%
          </p>
        </Card>
      </div>
    </div>
  );
}
