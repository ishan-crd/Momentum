import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";

export default function Login() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("flow", step);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 bg-card border-border shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Momentum</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A calm, minimal productivity app
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="mt-1"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              className="mt-1"
              autoComplete={step === "signUp" ? "new-password" : "current-password"}
            />
            {step === "signUp" && (
              <p className="text-xs text-muted-foreground mt-1">
                At least 8 characters
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : step === "signIn" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setStep((s) => (s === "signIn" ? "signUp" : "signIn"));
            setError(null);
          }}
          className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          {step === "signIn" ? "Create an account" : "Sign in instead"}
        </button>
      </Card>
    </div>
  );
}
