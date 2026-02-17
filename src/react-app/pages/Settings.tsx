import { Card } from "@/react-app/components/ui/card";
import { Label } from "@/react-app/components/ui/label";
import { Switch } from "@/react-app/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import { Separator } from "@/react-app/components/ui/separator";
import { Bell, Moon, Timer, Target, User } from "lucide-react";
import { useTheme } from "@/react-app/contexts/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Personalize your Focus experience
        </p>
      </div>

      {/* Appearance */}
      <Card className="border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Moon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label
                htmlFor="dark-mode"
                className="text-sm font-medium text-foreground"
              >
                Dark Mode
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="task-reminders" className="text-sm font-medium text-foreground">
                Task Reminders
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Get notified about upcoming tasks
              </p>
            </div>
            <Switch id="task-reminders" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="habit-reminders" className="text-sm font-medium text-foreground">
                Habit Reminders
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Daily reminders for habit check-ins
              </p>
            </div>
            <Switch id="habit-reminders" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-review" className="text-sm font-medium text-foreground">
                Weekly Review
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Reminder to complete weekly review
              </p>
            </div>
            <Switch id="weekly-review" defaultChecked />
          </div>
        </div>
      </Card>

      {/* Focus Timer */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Timer className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Focus Timer</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="focus-duration" className="text-sm font-medium text-foreground">
              Focus Duration (minutes)
            </Label>
            <Select defaultValue="25">
              <SelectTrigger id="focus-duration" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="break-duration" className="text-sm font-medium text-foreground">
              Break Duration (minutes)
            </Label>
            <Select defaultValue="5">
              <SelectTrigger id="break-duration" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Goals */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Goals</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="weekly-target" className="text-sm font-medium text-foreground">
              Weekly Task Target
            </Label>
            <Input 
              id="weekly-target" 
              type="number" 
              defaultValue="20" 
              className="mt-2"
              placeholder="Number of tasks"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your target number of major tasks per week
            </p>
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="display-name" className="text-sm font-medium text-foreground">
              Display Name
            </Label>
            <Input 
              id="display-name" 
              defaultValue="User" 
              className="mt-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue="user@example.com" 
              className="mt-2"
              placeholder="your@email.com"
            />
          </div>

          <Separator className="my-6" />

          <div className="flex gap-3">
            <Button>Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
