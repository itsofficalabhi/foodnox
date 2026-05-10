import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      nav({ to: "/login", search: { redirect: window.location.pathname } });
    }
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <Outlet />;
}
