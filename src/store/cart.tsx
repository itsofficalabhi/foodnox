import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getRestaurant, type MenuItem } from "@/data/restaurants";

type CartLine = {
  item: MenuItem;
  qty: number;
  restaurantSlug: string;
  restaurantName: string;
};

type CartCtx = {
  lines: CartLine[];
  add: (item: MenuItem, restaurantSlug: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "foodly:cart";

function hydrateCartLine(line: CartLine): CartLine {
  return {
    ...line,
    restaurantName:
      line.restaurantName ?? getRestaurant(line.restaurantSlug)?.name ?? line.restaurantSlug,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]).map(hydrateCartLine) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore storage failures.
    }
  }, [lines]);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      add: (item, restaurantSlug) =>
        setLines((prev) => {
          const found = prev.find((l) => l.item.id === item.id);
          if (found) {
            return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l));
          }

          return [
            ...prev,
            {
              item,
              qty: 1,
              restaurantSlug,
              restaurantName: getRestaurant(restaurantSlug)?.name ?? restaurantSlug,
            },
          ];
        }),
      remove: (id) => setLines((prev) => prev.filter((l) => l.item.id !== id)),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.item.id !== id)
            : prev.map((l) => (l.item.id === id ? { ...l, qty } : l)),
        ),
      clear: () => setLines([]),
      totalItems: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.item.price, 0),
    }),
    [lines],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
