import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router";
import { useConvexAuth } from "convex/react";
import { ThemeProvider } from "@/react-app/contexts/ThemeContext";
import Layout from "@/react-app/components/Layout";
import Today from "@/react-app/pages/Today";
import Tasks from "@/react-app/pages/Tasks";
import Goals from "@/react-app/pages/Goals";
import Notes from "@/react-app/pages/Notes";
import Habits from "@/react-app/pages/Habits";
import WeeklyReview from "@/react-app/pages/WeeklyReview";
import Settings from "@/react-app/pages/Settings";
import Login from "@/react-app/pages/Login";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<LoginOrRedirect />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Today />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="goals" element={<Goals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="habits" element={<Habits />} />
            <Route path="review" element={<WeeklyReview />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

function LoginOrRedirect() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Login />;
}
