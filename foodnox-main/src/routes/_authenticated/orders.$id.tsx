import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Clock, CreditCard, Truck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order details — Foodly" }] }),
  component: OrderDetail,
});

type OrderRow = {
  id: string;
  restaurant_name: string | null;
  items: { id: string; name: string; price: number; qty: number }[];
  subtotal: number; delivery_fee: number; tax: number; total: number;
  status: string; payment_status: string; payment_method: string | null;
  created_at: string;
};
type Event = { id: string; event_type: string; message: string | null; created_at: string };
type Attempt = { id: string; method: string; amount: number; status: string; reference: string | null; error_message: string | null; created_at: string };

function OrderDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: o }, { data: e }, { data: a }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).maybeSingle(),
        supabase.from("order_events").select("*").eq("order_id", id).order("created_at", { ascending: true }),
        supabase.from("payment_attempts").select("*").eq("order_id", id).order("created_at", { ascending: true }),
      ]);
      setOrder(o as OrderRow | null);
      setEvents((e ?? []) as Event[]);
      setAttempts((a ?? []) as Attempt[]);
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  if (!order) return <div className="container mx-auto px-4 py-20 text-center">Order not found.</div>;

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> All orders
        </Link>

        <div className="rounded-2xl bg-card p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold">{order.restaurant_name}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Placed {new Date(order.created_at).toLocaleString()} · #{order.id.slice(0, 8)}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between">
                <span>{it.qty}× {it.name}</span>
                <span className="text-muted-foreground">₹{it.qty * it.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Order timeline</h2>
          <ol className="space-y-4">
            {events.map((ev) => (
              <li key={ev.id} className="flex gap-3">
                <TimelineIcon type={ev.event_type} />
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{ev.event_type.replace(/_/g, " ")}</p>
                  {ev.message && <p className="text-xs text-muted-foreground">{ev.message}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    {new Date(ev.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {attempts.length > 0 && (
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold">Payment attempts</h2>
            <ul className="space-y-3 text-sm">
              {attempts.map((a) => (
                <li key={a.id} className="flex items-start justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium uppercase">{a.method} · ₹{a.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.reference ?? a.error_message ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground/70">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    a.status === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>{a.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="h-fit space-y-2 rounded-2xl bg-card p-6 shadow-elegant text-sm lg:sticky lg:top-24">
        <Row label="Subtotal" value={`₹${order.subtotal}`} />
        <Row label="Delivery" value={`₹${order.delivery_fee}`} />
        <Row label="Tax" value={`₹${order.tax}`} />
        <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
          <span>Total</span><span>₹{order.total}</span>
        </div>
        <Row label="Payment" value={(order.payment_method ?? "—").toUpperCase()} />
        <Row label="Status" value={order.payment_status} />
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="capitalize text-foreground">{value}</span></div>;
}

function TimelineIcon({ type }: { type: string }) {
  const cls = "mt-0.5 h-8 w-8 rounded-full p-2";
  if (type === "payment_success") return <CheckCircle2 className={`${cls} bg-success/10 text-success`} />;
  if (type === "payment_failed") return <XCircle className={`${cls} bg-destructive/10 text-destructive`} />;
  if (type === "order_placed") return <CreditCard className={`${cls} bg-primary/10 text-primary`} />;
  if (type.includes("delivery")) return <Truck className={`${cls} bg-warning/10 text-warning`} />;
  return <Clock className={`${cls} bg-muted text-muted-foreground`} />;
}
