import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { restaurants } from "@/data/restaurants";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a table - Foodly" },
      {
        name: "description",
        content: "Reserve a table at Varanasi restaurants with dummy payment or pay at restaurant.",
      },
    ],
  }),
  component: BookPage,
});

const times = ["12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const paymentMethods = [
  {
    id: "pay_at_restaurant",
    label: "Pay at Restaurant",
    helper: "Confirm now, pay after dining",
    icon: Banknote,
  },
  { id: "card", label: "Dummy Card", helper: "Pay booking fee now", icon: CreditCard },
  { id: "upi", label: "Dummy UPI", helper: "Pay booking fee now", icon: Wallet },
] as const;

type BookingPaymentMethod = (typeof paymentMethods)[number]["id"];

function BookPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [restaurant, setRestaurant] = useState(restaurants[0].slug);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("19:30");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>("pay_at_restaurant");
  const [paymentInput, setPaymentInput] = useState({ card: "", upi: "" });
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState<null | {
    id: string;
    restaurant: string;
    date: string;
    time: string;
    guests: number;
    payment: string;
  }>(null);

  const r = restaurants.find((x) => x.slug === restaurant)!;
  const bookingFee =
    paymentMethod === "pay_at_restaurant" ? 0 : Math.min(499, Math.max(199, guests * 99));
  const paymentLabel = useMemo(
    () => paymentMethods.find((method) => method.id === paymentMethod)?.label ?? "Payment",
    [paymentMethod],
  );

  const validatePayment = () => {
    if (paymentMethod === "card" && paymentInput.card.replace(/\s/g, "").length < 12) {
      toast.error("Enter a dummy card number for the booking fee.");
      return false;
    }
    if (paymentMethod === "upi" && !paymentInput.upi.includes("@")) {
      toast.error("Enter a dummy UPI ID for the booking fee.");
      return false;
    }
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return toast.error("Please fill in your details");
    if (!validatePayment()) return;
    if (!user) {
      toast.info("Please sign in to confirm your booking");
      nav({ to: "/login", search: { redirect: "/book" } });
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const reference =
      paymentMethod === "pay_at_restaurant"
        ? `PAY-AT-RESTAURANT-${Date.now()}`
        : `BOOK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        restaurant_slug: r.slug,
        restaurant_name: r.name,
        booking_date: date,
        booking_time: time,
        guests,
        contact_name: name,
        contact_phone: phone,
        notes,
        booking_fee: bookingFee,
        payment_method: paymentMethod,
        payment_status: "success",
        payment_reference: reference,
        status: "confirmed",
      })
      .select("id")
      .single();

    setSaving(false);
    if (error || !data) return toast.error(error?.message ?? "Failed to book");
    setConfirmed({
      id: data.id.slice(0, 8).toUpperCase(),
      restaurant: r.name,
      date,
      time,
      guests,
      payment: paymentLabel,
    });
    toast.success(
      paymentMethod === "pay_at_restaurant"
        ? "Table booked. Pay at restaurant."
        : "Dummy payment done. Table booked.",
    );
  };

  if (confirmed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success shadow-glow">
          <CheckCircle2 className="h-10 w-10 text-success-foreground" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Booking confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          Reservation #{confirmed.id} at {confirmed.restaurant}
        </p>
        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-card p-6 text-left shadow-elegant">
          <Row icon={<CalendarDays className="h-4 w-4" />} k="Date" v={confirmed.date} />
          <Row icon={<Clock className="h-4 w-4" />} k="Time" v={confirmed.time} />
          <Row icon={<Users className="h-4 w-4" />} k="Guests" v={String(confirmed.guests)} />
          <Row icon={<Wallet className="h-4 w-4" />} k="Payment" v={confirmed.payment} />
          <Row icon={<MapPin className="h-4 w-4" />} k="Location" v={r.location} />
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/bookings">
            <Button variant="hero">View my bookings</Button>
          </Link>
          <Button variant="outline" onClick={() => setConfirmed(null)}>
            Make another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">Book a table in Varanasi</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Choose a restaurant, slot, guests and mandatory payment option. Pay online with the dummy
          gateway or pay at the restaurant.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-6 rounded-2xl bg-card p-6 shadow-card">
          <div>
            <Label className="mb-2 block text-sm font-semibold">Restaurant</Label>
            <select
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              {restaurants.map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.name} - {x.location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-2 block text-sm font-semibold">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-semibold">Guests</Label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-input px-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                >
                  -
                </Button>
                <span className="flex-1 text-center font-semibold">{guests}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setGuests(Math.min(20, guests + 1))}
                >
                  +
                </Button>
              </div>
            </div>
            <div>
              <Label className="mb-2 block text-sm font-semibold">Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-semibold">Available slots</Label>
            <div className="flex flex-wrap gap-2">
              {times.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-smooth ${
                    time === t
                      ? "border-primary bg-gradient-primary text-primary-foreground"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block text-sm font-semibold">Your name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-semibold">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-semibold">Special request</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Window seat, birthday setup, wheelchair access..."
            />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <Label className="block text-sm font-semibold">Payment option</Label>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {bookingFee ? `Booking fee Rs ${bookingFee}` : "Pay later"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`min-h-28 rounded-xl border-2 p-4 text-left transition-smooth ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <method.icon className="h-5 w-5 text-primary" />
                  <span className="mt-2 block text-sm font-semibold">{method.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{method.helper}</span>
                </button>
              ))}
            </div>
            {paymentMethod !== "pay_at_restaurant" && (
              <div className="mt-4">
                <Label className="mb-1.5 block text-xs font-medium">
                  {paymentMethod === "upi" ? "Dummy UPI ID" : "Dummy card number"}
                </Label>
                <Input
                  value={paymentMethod === "upi" ? paymentInput.upi : paymentInput.card}
                  onChange={(e) =>
                    setPaymentInput(
                      paymentMethod === "upi"
                        ? { ...paymentInput, upi: e.target.value }
                        : { ...paymentInput, card: e.target.value },
                    )
                  }
                  placeholder={paymentMethod === "upi" ? "table@upi" : "4242 4242 4242"}
                />
              </div>
            )}
          </section>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving}>
            {saving
              ? "Confirming..."
              : bookingFee
                ? `Pay Rs ${bookingFee} and reserve`
                : "Reserve and pay at restaurant"}
          </Button>
        </form>
      </div>

      <aside className="h-fit overflow-hidden rounded-2xl bg-card shadow-card lg:sticky lg:top-24">
        <img src={r.image} alt={r.name} className="h-48 w-full object-cover" />
        <div className="p-5">
          <h3 className="text-lg font-bold">{r.name}</h3>
          <p className="text-sm text-muted-foreground">{r.cuisines.join(" / ")}</p>
          <div className="mt-3 space-y-2 text-sm">
            <Row icon={<MapPin className="h-4 w-4" />} k="Location" v={r.location} />
            <Row icon={<Clock className="h-4 w-4" />} k="Hours" v={r.hours} />
            <Row
              icon={<Users className="h-4 w-4" />}
              k="Avg. spend"
              v={`Rs ${r.priceForTwo} for two`}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-primary">{icon}</span>
      <span className="text-muted-foreground">{k}:</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
