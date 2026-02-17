import { Outlet, useLocation } from "react-router";
import Sidebar from "@/react-app/components/Sidebar";
import MainHeader from "@/react-app/components/MainHeader";

const PAGE_TITLES: Record<string, string> = {
  "/": "Today",
  "/tasks": "Tasks",
  "/goals": "Goals",
  "/notes": "Notes",
  "/habits": "Habits",
  "/review": "Weekly Review",
  "/settings": "Settings",
};

function HeaderLeft() {
  const location = useLocation();
  if (location.pathname === "/") {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Today.</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    );
  }
  const title =
    Object.entries(PAGE_TITLES).find(([path]) =>
      path !== "/" && location.pathname.startsWith(path)
    )?.[1] ?? "Momentum";
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}.</h1>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="flex h-screen min-h-0 bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        <MainHeader left={<HeaderLeft />} />
        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
