import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, Clock, MapPin, Plus, Minus, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRestaurant, type MenuItem } from "@/data/restaurants";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/restaurants/$slug")({
  loader: ({ params }) => {
    const r = getRestaurant(params.slug);
    if (!r) throw notFound();
    return { restaurant: r };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.restaurant.name} — Foodly` },
      {
        name: "description",
        content: `Order from ${loaderData?.restaurant.name} • ${loaderData?.restaurant.cuisines.join(", ")}`,
      },
      { property: "og:image", content: loaderData?.restaurant.image },
    ],
  }),
  component: RestaurantDetail,
});

function RestaurantDetail() {
  const { restaurant: r } = Route.useLoaderData();
  const { lines, add, setQty } = useCart();
  const [tab, setTab] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(r.menu.map((m) => m.category)))],
    [r.menu],
  );
  const items = useMemo<MenuItem[]>(
    () => (tab === "All" ? r.menu : r.menu.filter((m: MenuItem) => m.category === tab)),
    [r, tab],
  );

  const qtyOf = (id: string) => lines.find((l) => l.item.id === id)?.qty ?? 0;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 overflow-hidden md:h-96">
        <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-overlay" />
        <div className="container absolute inset-x-0 bottom-0 mx-auto px-4 py-6 text-background">
          <h1 className="text-3xl font-extrabold md:text-5xl text-white">{r.name}</h1>
          <p className="mt-2 text-sm text-white/90">{r.cuisines.join(" • ")}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/90">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" /> {r.rating} ({r.reviews})
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {r.deliveryTime} min
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {r.location}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          {r.offer && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <span className="rounded-md bg-gradient-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                OFFER
              </span>
              <p className="text-sm font-medium">{r.offer}</p>
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setTab(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-smooth ${
                  tab === c
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-secondary hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {items.map((m: MenuItem) => {
              const q = qtyOf(m.id);
              return (
                <div key={m.id} className="flex gap-4 rounded-2xl bg-card p-4 shadow-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Leaf className={`h-4 w-4 ${m.veg ? "text-success" : "text-destructive"}`} />
                      <h3 className="font-semibold">{m.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                    <p className="mt-2 font-bold">₹{m.price}</p>
                  </div>
                  <div className="w-32 shrink-0">
                    <img
                      src={m.image}
                      alt={m.name}
                      loading="lazy"
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    {q === 0 ? (
                      <Button
                        variant="hero"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => {
                          add(m, r.slug);
                          toast.success(`${m.name} added to cart`);
                        }}
                      >
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    ) : (
                      <div className="mt-2 flex items-center justify-center gap-1 rounded-md bg-gradient-primary px-1 py-0.5 shadow-glow">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-primary-foreground hover:bg-white/20"
                          onClick={() => setQty(m.id, q - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-6 text-center text-sm font-bold text-primary-foreground">
                          {q}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-primary-foreground hover:bg-white/20"
                          onClick={() => setQty(m.id, q + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <h3 className="font-semibold">Hours</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.hours}</p>
            <p
              className={`mt-2 text-sm font-semibold ${r.open ? "text-success" : "text-destructive"}`}
            >
              {r.open ? "Open now" : "Currently closed"}
            </p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <h3 className="font-semibold">Gallery</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {r.gallery.map((g: string, i: number) => (
                <img
                  key={i}
                  src={g}
                  loading="lazy"
                  alt=""
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))}
            </div>
          </div>
          <Link to="/book" className="block">
            <Button variant="outline" size="lg" className="w-full">
              Book a table here
            </Button>
          </Link>
          <Link to="/cart" className="block">
            <Button variant="hero" size="lg" className="w-full">
              Go to cart
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
