import { createFileRoute } from "@tanstack/react-router";
import { Store, Users, ShoppingBag, CalendarDays, IndianRupee, TrendingUp } from "lucide-react";
import { restaurants } from "@/data/restaurants";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Foodly" }] }),
  component: Admin,
});

const stats = [
  { label: "Total Revenue", value: "₹1,24,580", icon: IndianRupee, change: "+12.4%" },
  { label: "Orders Today", value: "2,341", icon: ShoppingBag, change: "+8.1%" },
  { label: "Active Users", value: "18,902", icon: Users, change: "+4.7%" },
  { label: "Bookings", value: "412", icon: CalendarDays, change: "+22%" },
];

const recentOrders = [
  { id: "#FD1029", customer: "Aarav Sharma", item: "Burger Haus", amount: 540, status: "Delivered" },
  { id: "#FD1028", customer: "Priya Mehta", item: "Napoli Pizzeria", amount: 980, status: "On the way" },
  { id: "#FD1027", customer: "Rohan Kapoor", item: "Sakura Sushi", amount: 1450, status: "Preparing" },
  { id: "#FD1026", customer: "Diya Iyer", item: "Paradise Biryani", amount: 720, status: "Delivered" },
  { id: "#FD1025", customer: "Karan Singh", item: "El Mariachi", amount: 610, status: "Cancelled" },
];

const statusStyle: Record<string, string> = {
  Delivered: "bg-success text-success-foreground",
  "On the way": "bg-primary text-primary-foreground",
  Preparing: "bg-warning text-warning-foreground",
  Cancelled: "bg-destructive text-destructive-foreground",
};

function Admin() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your platform performance.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-sm font-semibold text-success md:flex">
          <TrendingUp className="h-4 w-4" /> All systems operational
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-primary/10 p-2 text-primary"><s.icon className="h-5 w-5" /></div>
              <span className="text-xs font-semibold text-success">{s.change}</span>
            </div>
            <p className="mt-4 text-2xl font-extrabold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart placeholder */}
        <div className="rounded-2xl bg-card p-6 shadow-card lg:col-span-2">
          <h3 className="text-lg font-bold">Revenue (last 7 days)</h3>
          <div className="mt-6 flex h-56 items-end gap-3">
            {[40, 65, 50, 80, 70, 95, 88].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-xl bg-gradient-primary opacity-80 transition-smooth hover:opacity-100" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <span key={d}>{d}</span>)}
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card">
          <h3 className="text-lg font-bold">Top restaurants</h3>
          <ul className="mt-4 space-y-3">
            {restaurants.slice(0, 5).map((r, i) => (
              <li key={r.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                <img src={r.image} alt={r.name} className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.reviews} orders</p>
                </div>
                <span className="text-sm font-bold text-success">★ {r.rating}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Manage panels */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Restaurants</h3>
          </div>
          <div className="divide-y divide-border">
            {restaurants.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-3">
                <img src={r.image} alt={r.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.location}</p>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${r.open ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {r.open ? "Active" : "Closed"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Recent orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="pb-2">Order</th><th className="pb-2">Customer</th><th className="pb-2">Total</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 font-mono text-xs">{o.id}</td>
                    <td className="py-2.5"><p className="font-medium">{o.customer}</p><p className="text-xs text-muted-foreground">{o.item}</p></td>
                    <td className="py-2.5 font-semibold">₹{o.amount}</td>
                    <td className="py-2.5"><span className={`rounded-md px-2 py-0.5 text-xs font-bold ${statusStyle[o.status]}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
