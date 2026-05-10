import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signInWithSupabaseOAuth } from "@/integrations/supabase/oauth";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Foodly" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/" }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) nav({ to: redirect });
  }, [user, redirect, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    nav({ to: redirect });
  };

  const google = async () => {
    const { error } = await signInWithSupabaseOAuth("google", {
      redirectTo: window.location.origin + redirect,
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="container mx-auto grid min-h-[80vh] items-center px-4 py-10 md:grid-cols-2">
      <div className="hidden md:block">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 text-primary-foreground shadow-elegant">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-glow/40 blur-3xl" />
          <UtensilsCrossed className="h-10 w-10" />
          <h2 className="mt-6 text-4xl font-extrabold leading-tight">Welcome back to Foodly.</h2>
          <p className="mt-3 max-w-sm opacity-90">
            Sign in to track orders, save favorites, and unlock exclusive deals.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-extrabold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>

        <Button variant="outline" size="lg" className="mt-6 w-full" onClick={google}>
          <GoogleIcon /> Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or email{" "}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Email</Label>
            <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Password</Label>
            <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-medium text-primary">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.8 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.9 35.5 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
