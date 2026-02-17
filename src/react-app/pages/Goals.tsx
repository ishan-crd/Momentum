import { Card } from "@/react-app/components/ui/card";
import { Progress } from "@/react-app/components/ui/progress";
import { Target, Plus, Calendar, X } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { useState } from "react";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import { Checkbox } from "@/react-app/components/ui/checkbox";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type TaskDoc = {
  _id: Id<"tasks">;
  title: string;
  status: "todo" | "in-progress" | "completed";
};
type GoalDoc = {
  _id: Id<"goals">;
  title: string;
  category: string;
  timeframe: string;
  targetDate: string;
  linkedTaskIds: Id<"tasks">[];
};

function calculateProgress(
  linkedTaskIds: Id<"tasks">[],
  tasks: TaskDoc[]
): number {
  if (linkedTaskIds.length === 0) return 0;
  const completedCount = linkedTaskIds.filter((taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    return task?.status === "completed";
  }).length;
  return Math.round((completedCount / linkedTaskIds.length) * 100);
}

function GoalCard({
  goal,
  tasks,
}: {
  goal: GoalDoc;
  tasks: TaskDoc[];
}) {
  const currentProgress = calculateProgress(goal.linkedTaskIds, tasks);
  const linkedTasks = tasks.filter((t) => goal.linkedTaskIds.includes(t._id));
  const completedTasks = linkedTasks.filter((t) => t.status === "completed").length;

  return (
    <Card className="border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-base font-medium text-foreground">{goal.title}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="capitalize">{goal.category}</span>
            <span>•</span>
            <span>
              {completedTasks}/{linkedTasks.length} tasks complete
            </span>
          </div>
        </div>
        <Target className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {currentProgress}% complete
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(goal.targetDate).toLocaleDateString()}
            </div>
          </div>
          <Progress value={currentProgress} className="h-2" />
        </div>
        {linkedTasks.length > 0 && (
          <div className="border-border/50 border-t pt-2">
            <p className="mb-2 text-xs text-muted-foreground">Linked tasks:</p>
            <div className="space-y-1">
              {linkedTasks.map((task) => (
                <div key={task._id} className="flex items-center gap-2 text-xs">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      task.status === "completed" ? "bg-green-500" : "bg-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={
                      task.status === "completed"
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }
                  >
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
}

export default function Goals() {
  const goals = useQuery(api.goals.list) ?? [];
  const tasks = useQuery(api.tasks.list) ?? [];
  const createGoal = useMutation(api.goals.create);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<
    "personal" | "professional" | "health" | "learning"
  >("personal");
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<"weekly" | "monthly">("weekly");
  const [newGoalTargetDate, setNewGoalTargetDate] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<Id<"tasks">[]>([]);

  const handleToggleTask = (taskId: Id<"tasks">) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleAddGoal = async () => {
    if (
      !newGoalTitle.trim() ||
      !newGoalTargetDate ||
      selectedTaskIds.length === 0
    )
      return;
    await createGoal({
      title: newGoalTitle,
      category: newGoalCategory,
      timeframe: newGoalTimeframe,
      targetDate: newGoalTargetDate,
      linkedTaskIds: selectedTaskIds,
    });
    setNewGoalTitle("");
    setNewGoalCategory("personal");
    setNewGoalTimeframe("weekly");
    setNewGoalTargetDate("");
    setSelectedTaskIds([]);
    setShowAddGoal(false);
  };

  const weeklyGoals = goals.filter((g) => g.timeframe === "weekly");
  const monthlyGoals = goals.filter((g) => g.timeframe === "monthly");

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-foreground">Goals</h1>
          <p className="text-muted-foreground">
            Connect daily tasks to bigger life outcomes
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddGoal(!showAddGoal)}>
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {showAddGoal && (
        <Card className="mb-6 border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">Create New Goal</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAddGoal(false)}>
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
                <Select
                  value={newGoalCategory}
                  onValueChange={(v) =>
                    setNewGoalCategory(v as typeof newGoalCategory)
                  }
                >
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
                <Select
                  value={newGoalTimeframe}
                  onValueChange={(v) =>
                    setNewGoalTimeframe(v as typeof newGoalTimeframe)
                  }
                >
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
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-border p-4">
                {tasks.map((task) => (
                  <div key={task._id} className="flex items-center gap-3">
                    <Checkbox
                      id={`task-${task._id}`}
                      checked={selectedTaskIds.includes(task._id)}
                      onCheckedChange={() => handleToggleTask(task._id)}
                    />
                    <label
                      htmlFor={`task-${task._id}`}
                      className="flex-1 cursor-pointer text-sm text-foreground"
                    >
                      {task.title}
                      <span
                        className={`ml-2 text-xs ${
                          task.status === "completed"
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        ({task.status === "completed" ? "completed" : task.status})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedTaskIds.length} task
                {selectedTaskIds.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => void handleAddGoal()}
                disabled={
                  !newGoalTitle.trim() ||
                  !newGoalTargetDate ||
                  selectedTaskIds.length === 0
                }
              >
                Create Goal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddGoal(false);
                  setNewGoalTitle("");
                  setNewGoalCategory("personal");
                  setNewGoalTimeframe("weekly");
                  setNewGoalTargetDate("");
                  setSelectedTaskIds([]);
                }}
              >
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
              <h2 className="mb-4 text-lg font-medium text-foreground">
                Weekly Goals
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {weeklyGoals.map((goal) => (
                  <GoalCard key={goal._id} goal={goal} tasks={tasks} />
                ))}
              </div>
            </div>
          )}
          {monthlyGoals.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-medium text-foreground">
                Monthly Goals
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {monthlyGoals.map((goal) => (
                  <GoalCard key={goal._id} goal={goal} tasks={tasks} />
                ))}
              </div>
            </div>
          )}
          {goals.length === 0 && (
            <div className="py-12 text-center">
              <Target className="mx-auto mb-4 h-12 w-12 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">
                No goals yet. Create your first goal to get started!
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="weekly">
          <div className="grid grid-cols-2 gap-4">
            {weeklyGoals.map((goal) => (
              <GoalCard key={goal._id} goal={goal} tasks={tasks} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="monthly">
          <div className="grid grid-cols-2 gap-4">
            {monthlyGoals.map((goal) => (
              <GoalCard key={goal._id} goal={goal} tasks={tasks} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="personal">
          <div className="grid grid-cols-2 gap-4">
            {goals
              .filter((g) => g.category === "personal")
              .map((goal) => (
                <GoalCard key={goal._id} goal={goal} tasks={tasks} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="professional">
          <div className="grid grid-cols-2 gap-4">
            {goals
              .filter((g) => g.category === "professional")
              .map((goal) => (
                <GoalCard key={goal._id} goal={goal} tasks={tasks} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
