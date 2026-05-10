import { Link } from "@tanstack/react-router";
import { UtensilsCrossed, Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Foodly.</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Discover the best restaurants, order food and book tables — all in one place.
          </p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <Instagram className="h-5 w-5 hover:text-primary cursor-pointer" />
            <Twitter className="h-5 w-5 hover:text-primary cursor-pointer" />
            <Facebook className="h-5 w-5 hover:text-primary cursor-pointer" />
          </div>
        </div>
        <div>
          <h4 className="font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>About</li><li>Careers</li><li>Press</li><li>Blog</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">For You</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/restaurants">Restaurants</Link></li>
            <li><Link to="/book">Book a Table</Link></li>
            <li><Link to="/cart">Your Cart</Link></li>
            <li><Link to="/admin">Admin Portal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>support@foodly.app</li>
            <li>+91 80 0000 0000</li>
            <li>Mumbai · Bengaluru · Delhi</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Foodly. Crafted with ❤ for food lovers.
      </div>
    </footer>
  );
}
