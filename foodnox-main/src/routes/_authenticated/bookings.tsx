import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Clock, Users, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({ meta: [{ title: "My bookings — Foodly" }] }),
  component: BookingsPage,
});

type Booking = {
  id: string;
  restaurant_name: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  booking_fee: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
};

function BookingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select(
        "id, restaurant_name, booking_date, booking_time, guests, booking_fee, payment_method, payment_status, status, created_at",
      )
      .order("booking_date", { ascending: false });
    setItems((data ?? []) as Booking[]);
    setLoading(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user]);

  const cancel = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking cancelled");
    load();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your table reservations and their status.
          </p>
        </div>
        <Link to="/book">
          <Button variant="hero">New booking</Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-card p-12 text-center shadow-card">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No bookings yet.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {items.map((b) => (
            <li key={b.id} className="rounded-2xl bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold">{b.restaurant_name}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    b.status === "confirmed"
                      ? "bg-success/10 text-success"
                      : b.status === "cancelled"
                        ? "bg-destructive/10 text-destructive"
                        : b.status === "completed"
                          ? "bg-muted text-muted-foreground"
                          : "bg-warning/10 text-warning"
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {b.booking_date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {b.booking_time}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {b.guests} guest{b.guests > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  {b.payment_method === "pay_at_restaurant"
                    ? "Pay at restaurant"
                    : `Paid Rs ${b.booking_fee}`}{" "}
                  ({b.payment_status})
                </span>
              </div>
              {b.status !== "cancelled" && b.status !== "completed" && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => cancel(b.id)}>
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
