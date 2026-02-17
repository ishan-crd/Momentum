import {
  Calendar,
  CheckSquare,
  Target,
  FileText,
  BarChart3,
  TrendingUp,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { cn } from "@/react-app/lib/utils";
import { Button } from "@/react-app/components/ui/button";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/react-app/components/ui/avatar";

const navItems = [
  { path: "/", label: "Today", icon: Calendar },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/notes", label: "Notes", icon: FileText },
  { path: "/habits", label: "Habits", icon: BarChart3 },
  { path: "/review", label: "Weekly Review", icon: TrendingUp },
  { path: "/settings", label: "Settings", icon: Settings },
];

function getInitial(str: string | undefined): string {
  if (!str || !str.trim()) return "?";
  const first = str.trim().charAt(0);
  return first.toUpperCase();
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useQuery(api.users.current);
  const { signOut } = useAuthActions();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const raw = user?.name?.trim() || user?.email?.trim() || "User";
  const displayName = raw.includes("@") ? raw.slice(0, raw.indexOf("@")) : raw;
  const initial = getInitial(user?.name ?? user?.email);

  const handleLogout = () => {
    void signOut();
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between border-b border-sidebar-border p-4">
        {!collapsed && (
          <h1 className="text-xl font-semibold text-sidebar-foreground">
            Momentum
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-sidebar-accent/50",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
                  {initial}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <span className="min-w-0 flex-1 truncate text-sidebar-foreground">
                  {displayName}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
