import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout - Foodly" }] }),
  component: Checkout,
});

const methods = [
  { id: "card", label: "Dummy Card", helper: "Pay now with test card", icon: CreditCard },
  { id: "upi", label: "Dummy UPI", helper: "Pay now with test UPI", icon: Wallet },
  { id: "cod", label: "Cash on Delivery", helper: "Pay when food arrives", icon: Banknote },
] as const;

type Method = (typeof methods)[number]["id"];

function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [method, setMethod] = useState<Method>("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);
  const [addr, setAddr] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    city: "Varanasi",
    pincode: "",
  });
  const [paymentInput, setPaymentInput] = useState({ card: "", upi: "" });

  const deliveryFee = lines.length ? 39 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;
  const restaurantName = lines[0]?.restaurantName ?? "Foodly Restaurant";
  const restaurantSlug = lines[0]?.restaurantSlug ?? null;
  const hasAddress = addr.name && addr.phone && addr.address && addr.city && addr.pincode;

  const paymentHint = useMemo(() => {
    if (method === "cod") return "Cash collection will be marked at doorstep.";
    if (method === "upi") return "Use any UPI ID, for example foodly@upi.";
    return "Use any 12+ digit number as a dummy card.";
  }, [method]);

  const validate = () => {
    if (!user || lines.length === 0) return false;
    if (!hasAddress) {
      toast.error("Please complete the delivery address.");
      return false;
    }
    if (method === "card" && paymentInput.card.replace(/\s/g, "").length < 12) {
      toast.error("Enter a dummy card number to continue.");
      return false;
    }
    if (method === "upi" && !paymentInput.upi.includes("@")) {
      toast.error("Enter a dummy UPI ID to continue.");
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setProcessing(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user!.id,
        restaurant_slug: restaurantSlug,
        restaurant_name: restaurantName,
        items: lines.map((l) => ({
          id: l.item.id,
          name: l.item.name,
          price: l.item.price,
          qty: l.qty,
          restaurant: l.restaurantName,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        payment_method: method,
        delivery_address: addr,
      })
      .select()
      .single();

    if (orderError || !order) {
      setProcessing(false);
      toast.error(orderError?.message ?? "Failed to create order");
      return;
    }

    await supabase.from("order_events").insert({
      order_id: order.id,
      user_id: user!.id,
      event_type: "order_placed",
      message:
        method === "cod"
          ? "Order placed with cash on delivery"
          : "Order placed and dummy payment started",
    });

    await new Promise((resolve) => setTimeout(resolve, 900));
    const reference = `DEMO-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const success = true;

    await supabase.from("payment_attempts").insert({
      order_id: order.id,
      user_id: user!.id,
      method,
      amount: total,
      status: success ? "success" : "failed",
      reference,
      error_message: null,
    });

    await supabase
      .from("orders")
      .update({
        status: method === "cod" ? "preparing" : "paid",
        payment_status: "success",
      })
      .eq("id", order.id);

    await supabase.from("order_events").insert({
      order_id: order.id,
      user_id: user!.id,
      event_type: "payment_success",
      message:
        method === "cod" ? "Cash on delivery confirmed" : `Dummy payment successful (${reference})`,
    });

    clear();
    setDone({ id: order.id });
    toast.success(method === "cod" ? "Order confirmed with COD!" : "Dummy payment successful!");
    setProcessing(false);
  };

  if (done) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success shadow-glow">
          <CheckCircle2 className="h-10 w-10 text-success-foreground" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Order placed!</h1>
        <p className="mt-2 text-muted-foreground">Track your order timeline below.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/orders/$id" params={{ id: done.id }}>
            <Button variant="hero">View order</Button>
          </Link>
          <Button variant="outline" onClick={() => nav({ to: "/restaurants" })}>
            Order again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Checkout</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" /> Delivering across Varanasi with mandatory
            payment selection.
          </p>
        </div>

        <section className="rounded-2xl bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Delivery address</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Full name"
              value={addr.name}
              onChange={(v) => setAddr({ ...addr, name: v })}
            />
            <Field
              label="Phone"
              value={addr.phone}
              onChange={(v) => setAddr({ ...addr, phone: v })}
            />
            <Field
              label="House / street address"
              value={addr.address}
              onChange={(v) => setAddr({ ...addr, address: v })}
              className="sm:col-span-2"
            />
            <Field
              label="Landmark"
              value={addr.landmark}
              onChange={(v) => setAddr({ ...addr, landmark: v })}
            />
            <Field label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
            <Field
              label="Pincode"
              value={addr.pincode}
              onChange={(v) => setAddr({ ...addr, pincode: v })}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Payment method</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Demo gateway
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`min-h-28 rounded-xl border-2 p-4 text-left transition-smooth ${
                  method === m.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <m.icon className="h-5 w-5 text-primary" />
                <span className="mt-2 block text-sm font-semibold">{m.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{m.helper}</span>
              </button>
            ))}
          </div>

          {method !== "cod" && (
            <div className="mt-4">
              <Label className="mb-1.5 block text-xs font-medium">
                {method === "upi" ? "Dummy UPI ID" : "Dummy card number"}
              </Label>
              <Input
                value={method === "upi" ? paymentInput.upi : paymentInput.card}
                onChange={(e) =>
                  setPaymentInput(
                    method === "upi"
                      ? { ...paymentInput, upi: e.target.value }
                      : { ...paymentInput, card: e.target.value },
                  )
                }
                placeholder={method === "upi" ? "foodly@upi" : "4242 4242 4242"}
              />
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">{paymentHint}</p>
        </section>
      </div>

      <aside className="h-fit space-y-3 rounded-2xl bg-card p-6 shadow-elegant lg:sticky lg:top-24">
        <h3 className="text-lg font-bold">Summary</h3>
        <p className="text-sm font-medium text-muted-foreground">{restaurantName}</p>
        <div className="space-y-2 text-sm">
          {lines.map((l) => (
            <div key={l.item.id} className="flex justify-between text-muted-foreground">
              <span>
                {l.qty} x {l.item.name}
              </span>
              <span>Rs {l.qty * l.item.price}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <Row label="Subtotal" value={`Rs ${subtotal}`} />
          <Row label="Delivery" value={`Rs ${deliveryFee}`} />
          <Row label="Taxes" value={`Rs ${tax}`} />
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
          <span>Total</span>
          <span>Rs {total}</span>
        </div>
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={placeOrder}
          disabled={lines.length === 0 || processing}
        >
          {processing
            ? "Processing..."
            : method === "cod"
              ? `Confirm COD Rs ${total}`
              : `Pay Rs ${total}`}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Payment choice is required for every food order.
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
