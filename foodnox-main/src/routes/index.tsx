import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin, Sparkles, ArrowRight, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { restaurants, categories } from "@/data/restaurants";
import { RestaurantCard } from "@/components/site/RestaurantCard";
import heroFood from "@/assets/hero-food.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Foodly — Order food & book tables at top restaurants" },
      {
        name: "description",
        content: "Discover trending restaurants, order delicious food, and reserve a table.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const trending = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const nearby = restaurants.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Varanasi food, fast delivery
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Hungry? <br />
              <span className="text-gradient">Get Banaras favorites</span>
              <br />
              delivered fast.
            </h1>
            <p className="max-w-md text-base text-muted-foreground md:text-lg">
              Order chaat, thalis, biryani, cafe plates and desserts, then reserve tables for
              dine-in plans.
            </p>
            <div className="glass flex flex-col gap-3 rounded-2xl p-3 shadow-elegant sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-3 py-2">
                <MapPin className="h-4 w-4 text-primary" />
                <Input
                  defaultValue="Varanasi, India"
                  className="h-9 border-0 p-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants or dishes"
                  className="h-9 border-0 p-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Link to="/restaurants">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Search
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
              <div>
                <span className="font-bold text-foreground">4.8★</span> avg rating
              </div>
              <div>
                <span className="font-bold text-foreground">25 min</span> avg delivery
              </div>
              <div>
                <span className="font-bold text-foreground">8 </span> local hotels
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-warm opacity-30 blur-3xl" />
            <img
              src={heroFood}
              alt="Delicious assortment of global cuisine"
              width={1600}
              height={1024}
              className="relative w-full rounded-[2rem] object-cover shadow-elegant"
            />
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-card p-4 shadow-elegant md:block">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Flat 50% OFF</p>
                  <p className="text-xs text-muted-foreground">on first 3 orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">What's on your mind?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick a craving, we'll do the rest.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/restaurants"
              className="group flex flex-col items-center gap-2 rounded-2xl bg-card p-3 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="aspect-square w-full overflow-hidden rounded-xl">
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-smooth group-hover:scale-110"
                />
              </div>
              <span className="text-sm font-semibold">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offer banner */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 shadow-elegant md:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 text-primary-foreground md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Limited time</p>
              <h3 className="mt-1 text-2xl font-extrabold md:text-4xl">
                FOODLY50 — 50% OFF your next order
              </h3>
              <p className="mt-2 max-w-xl text-sm opacity-90">
                No minimum order. Up to ₹150 off on your first 3 orders. Auto-applied at checkout.
              </p>
            </div>
            <Link to="/restaurants">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                Order now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="container mx-auto px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Trending restaurants</h2>
            <p className="mt-1 text-sm text-muted-foreground">Loved by foodies this week</p>
          </div>
          <Link
            to="/restaurants"
            className="hidden text-sm font-semibold text-primary md:inline-flex"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      </section>

      {/* Nearby */}
      <section className="container mx-auto px-4 pb-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Restaurants near you</h2>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Delivering in 30 min or less
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {nearby.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      </section>

      {/* Book a table CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-card p-8 shadow-card md:grid-cols-2 md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Dine-in</p>
            <h3 className="mt-2 text-3xl font-extrabold md:text-4xl">Book a table in seconds</h3>
            <p className="mt-3 max-w-md text-muted-foreground">
              Reserve your favorite spot, choose date and time, and skip the wait. Confirmation in
              real time.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/book">
                <Button variant="hero" size="lg">
                  Reserve a table
                </Button>
              </Link>
              <Link to="/restaurants">
                <Button variant="outline" size="lg">
                  Browse first
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {restaurants.slice(0, 4).map((r) => (
              <img
                key={r.id}
                src={r.image}
                alt={r.name}
                loading="lazy"
                className="aspect-square w-full rounded-2xl object-cover shadow-card"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
