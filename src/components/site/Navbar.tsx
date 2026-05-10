import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, UtensilsCrossed, CalendarDays, User, LogOut, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-smooth hover:text-primary ${
        path === to ? "text-primary" : "text-foreground/80"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            FoodNox<span className="text-gradient">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {link("/", "Home")}
          {link("/restaurants", "Restaurants")}
          {link("/book", "Book a Table")}
          {user && link("/orders", "Orders")}
          {link("/admin", "Admin")}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-1 hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="hero" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user.user_metadata?.full_name?.split(" ")[0] ?? "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> My orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bookings" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> My bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="hero" size="sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
      <Link to="/" className="flex flex-col items-center gap-0.5 py-2.5 text-xs">
        <UtensilsCrossed className="h-5 w-5" /> Home
      </Link>
      <Link to="/restaurants" className="flex flex-col items-center gap-0.5 py-2.5 text-xs">
        <UtensilsCrossed className="h-5 w-5" /> Eats
      </Link>
      <Link to="/book" className="flex flex-col items-center gap-0.5 py-2.5 text-xs">
        <CalendarDays className="h-5 w-5" /> Book
      </Link>
      <Link to="/cart" className="flex flex-col items-center gap-0.5 py-2.5 text-xs">
        <ShoppingCart className="h-5 w-5" /> Cart
      </Link>
    </nav>
  );
}
