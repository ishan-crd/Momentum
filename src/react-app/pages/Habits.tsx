import { Card } from "@/react-app/components/ui/card";
import { Checkbox } from "@/react-app/components/ui/checkbox";
import { Flame, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/react-app/components/ui/dialog";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

const todayIndex = (new Date().getDay() + 6) % 7;

function getConsistencyPercentage(weeklyCompletion: boolean[]) {
  const completed = weeklyCompletion.filter(Boolean).length;
  return Math.round((completed / 7) * 100);
}

export default function Habits() {
  const habits = useQuery(api.habits.list) ?? [];
  const createHabit = useMutation(api.habits.create);
  const toggleToday = useMutation(api.habits.toggleToday);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const handleToggle = (id: Id<"habits">, completedToday: boolean) => {
    void toggleToday({ id, todayIndex, completedToday });
  };

  const handleAddHabit = async () => {
    const name = newHabitName.trim();
    if (!name) return;
    await createHabit({ name });
    setNewHabitName("");
    setAddDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-foreground">Habits</h1>
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
                onKeyDown={(e) => e.key === "Enter" && void handleAddHabit()}
              />
            </div>
            <DialogFooter showCloseButton>
              <Button onClick={handleAddHabit} disabled={!newHabitName.trim()}>
                Add habit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Today&apos;s Check-ins</h2>
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit._id}
              className="flex items-center gap-4 rounded-lg border border-border bg-background p-4 transition-colors hover:border-foreground/20"
            >
              <Checkbox
                checked={habit.completedToday}
                onCheckedChange={() => handleToggle(habit._id, !habit.completedToday)}
                className="h-5 w-5"
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    habit.completedToday ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {habit.name}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-foreground">{habit.streak}</span>
                <span className="text-xs text-muted-foreground">day streak</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Weekly Consistency</h2>
        </div>
        <div className="space-y-6">
          {habits.map((habit) => {
            const consistency = getConsistencyPercentage(habit.weeklyCompletion);
            return (
              <div key={habit._id}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{habit.name}</h3>
                  <span className="text-sm text-muted-foreground">{consistency}%</span>
                </div>
                <div className="flex gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                    <div key={day} className="flex-1 text-center">
                      <div
                        className={`mb-1 h-12 rounded-lg ${
                          habit.weeklyCompletion[idx] ? "bg-primary" : "bg-muted"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card p-4 shadow-sm">
          <p className="mb-1 text-xs text-muted-foreground">Completed Today</p>
          <p className="text-2xl font-semibold text-foreground">
            {habits.filter((h) => h.completedToday).length}/{habits.length}
          </p>
        </Card>
        <Card className="border-border bg-card p-4 shadow-sm">
          <p className="mb-1 text-xs text-muted-foreground">Longest Streak</p>
          <p className="text-2xl font-semibold text-foreground">
            {habits.length ? Math.max(...habits.map((h) => h.streak)) : 0} days
          </p>
        </Card>
        <Card className="border-border bg-card p-4 shadow-sm">
          <p className="mb-1 text-xs text-muted-foreground">Average Consistency</p>
          <p className="text-2xl font-semibold text-foreground">
            {habits.length
              ? Math.round(
                  habits.reduce((sum, h) => sum + getConsistencyPercentage(h.weeklyCompletion), 0) /
                    habits.length
                )
              : 0}
            %
          </p>
        </Card>
      </div>
    </div>
  );
}
