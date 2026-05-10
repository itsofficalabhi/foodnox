import { Link } from "@tanstack/react-router";
import { Star, Clock, Tag } from "lucide-react";
import type { Restaurant } from "@/data/restaurants";

export function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <Link
      to="/restaurants/$slug"
      params={{ slug: r.slug }}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={r.image}
          alt={r.name}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
        {r.offer && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-gradient-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
            <Tag className="h-3 w-3" /> {r.offer}
          </div>
        )}
        {!r.open && (
          <div className="absolute right-3 top-3 rounded-md bg-foreground/80 px-2 py-1 text-xs font-semibold text-background">
            Closed
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold">{r.name}</h3>
          <span className="flex items-center gap-1 rounded-md bg-success px-1.5 py-0.5 text-xs font-bold text-success-foreground">
            <Star className="h-3 w-3 fill-current" /> {r.rating}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {r.cuisines.join(" • ")}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.deliveryTime} min</span>
          <span>₹{r.priceForTwo} for two</span>
        </div>
      </div>
    </Link>
  );
}
