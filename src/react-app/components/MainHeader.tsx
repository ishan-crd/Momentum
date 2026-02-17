import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Input } from "@/react-app/components/ui/input";
import { Avatar, AvatarFallback } from "@/react-app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

function getInitial(str: string | undefined): string {
  if (!str || !str.trim()) return "?";
  return str.trim().charAt(0).toUpperCase();
}

export default function MainHeader({ left }: { left?: React.ReactNode }) {
  const [search, setSearch] = useState("");
  const user = useQuery(api.users.current);
  const { signOut } = useAuthActions();
  const initial = getInitial(user?.name ?? user?.email);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex-1 min-w-0">{left ?? null}</div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative w-64 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-muted/50 border-border"
          />
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Account"
            >
              <Avatar className="h-9 w-9 border-2 border-border">
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void signOut()}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
