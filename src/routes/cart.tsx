import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus, Minus, Tag, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — Foodly" }] }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, subtotal, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const delivery = lines.length ? 39 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = Math.max(0, subtotal + delivery + taxes - discount);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "FOODLY50") {
      setDiscount(Math.min(150, Math.round(subtotal * 0.5)));
      toast.success("Coupon applied — 50% OFF up to ₹150");
    } else {
      toast.error("Invalid coupon");
    }
  };

  if (lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
          <ShoppingBag className="h-9 w-9 text-primary-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some delicious food to get started.</p>
        <Link to="/restaurants" className="mt-6 inline-block">
          <Button variant="hero" size="lg">Browse restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-3">
        <h1 className="mb-2 text-3xl font-extrabold">Your cart</h1>
        {lines.map(({ item, qty }) => (
          <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
            <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">₹{item.price} each</p>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(item.id, qty - 1)}><Minus className="h-3.5 w-3.5" /></Button>
              <span className="min-w-6 text-center text-sm font-bold">{qty}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(item.id, qty + 1)}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            <p className="w-20 text-right font-bold">₹{item.price * qty}</p>
            <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <button onClick={clear} className="mt-2 text-sm text-muted-foreground hover:text-destructive">
          Clear cart
        </button>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl bg-card p-6 shadow-elegant lg:sticky lg:top-24">
        <h3 className="text-lg font-bold">Order summary</h3>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-background px-3">
            <Tag className="h-4 w-4 text-primary" />
            <Input
              placeholder="Coupon code (try FOODLY50)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="h-10 border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button variant="outline" onClick={applyCoupon}>Apply</Button>
        </div>
        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <Row label="Subtotal" value={`₹${subtotal}`} />
          <Row label="Delivery" value={`₹${delivery}`} />
          <Row label="Taxes & fees" value={`₹${taxes}`} />
          {discount > 0 && <Row label="Discount" value={`-₹${discount}`} className="text-success" />}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4 text-lg font-bold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        <Link to="/checkout" className="block">
          <Button variant="hero" size="lg" className="w-full">Proceed to checkout</Button>
        </Link>
      </aside>
    </div>
  );
}

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
