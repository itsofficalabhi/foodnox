import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Foodly" }] }),
  component: Forgot,
});

function Forgot() {
  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold">Forgot password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">We'll email you a reset link.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Reset link sent (demo)"); }}
          className="mt-8 space-y-4"
        >
          <div><Label className="mb-1.5 block text-sm">Email</Label><Input type="email" required placeholder="you@example.com" /></div>
          <Button type="submit" variant="hero" size="lg" className="w-full">Send reset link</Button>
          <p className="text-center text-sm">
            <Link to="/login" className="font-semibold text-primary">Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
