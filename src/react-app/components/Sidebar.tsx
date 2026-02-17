import {
  Calendar,
  CheckSquare,
  Target,
  FileText,
  Dumbbell,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { cn } from "@/react-app/lib/utils";

const navItems = [
  { path: "/", label: "Today", icon: Calendar },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/notes", label: "Notes", icon: FileText },
  { path: "/habits", label: "Habits", icon: Dumbbell },
  { path: "/review", label: "Weekly Review", icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              Momentum
            </h1>
            {/* <p className="text-xs text-primary/90">PREMIUM ACCESS</p> */}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <NavLink
          to="/settings"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            location.pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
}
