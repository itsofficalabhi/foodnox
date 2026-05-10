import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My orders — Foodly" }] }),
  component: Orders,
});

type Order = {
  id: string;
  restaurant_name: string | null;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id, restaurant_name, total, status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">My orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your full order history and payment timeline.</p>

      {loading ? (
        <p className="mt-10 text-center text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-card p-12 text-center shadow-card">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No orders yet.</p>
          <Link to="/restaurants" className="mt-4 inline-block text-sm font-semibold text-primary">Browse restaurants →</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to="/orders/$id" params={{ id: o.id }}
                className="flex items-center justify-between rounded-2xl bg-card p-5 shadow-card transition-smooth hover:shadow-elegant">
                <div>
                  <p className="font-semibold">{o.restaurant_name ?? "Order"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()} · ₹{o.total}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={o.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-success/10 text-success",
    preparing: "bg-warning/10 text-warning",
    delivered: "bg-success/10 text-success",
    failed: "bg-destructive/10 text-destructive",
    pending: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
