import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { restaurants } from "@/data/restaurants";
import { RestaurantCard } from "@/components/site/RestaurantCard";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "All restaurants — Foodly" },
      {
        name: "description",
        content: "Browse top-rated restaurants and filter by cuisine, rating, and delivery time.",
      },
    ],
  }),
  component: RestaurantsPage,
});

const filters = ["All", "Top Rated", "Fast Delivery", "Offers", "Pure Veg"];

function RestaurantsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [q, setQ] = useState("");
  const [active, setActive] = useState("All");

  const list = useMemo(() => {
    let arr = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.cuisines.some((c) => c.toLowerCase().includes(q.toLowerCase())),
    );
    if (active === "Top Rated") arr = arr.filter((r) => r.rating >= 4.5);
    if (active === "Fast Delivery") arr = arr.filter((r) => r.deliveryTime <= 30);
    if (active === "Offers") arr = arr.filter((r) => r.offer);
    if (active === "Pure Veg") arr = arr.filter((r) => r.menu.every((m) => m.veg));
    return arr;
  }, [q, active]);

  if (pathname !== "/restaurants") {
    return <Outlet />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl">Restaurants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.length} Varanasi places ready for delivery and table booking
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-96">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-card px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search restaurant or cuisine"
              className="h-10 border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth ${
              active === f
                ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((r) => (
          <RestaurantCard key={r.id} r={r} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          No restaurants match your search.
        </div>
      )}
    </div>
  );
}
