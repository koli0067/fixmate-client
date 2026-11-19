import Link from "next/link";
import { CreditCard, ShoppingBag, Users, Wrench } from "lucide-react";

const sections = [
  { title: "Manage Users", href: "/admin/users", icon: Users },
  { title: "Service Approval", href: "/admin/services", icon: Wrench },
  { title: "All Bookings", href: "/admin/bookings", icon: ShoppingBag },
  { title: "Transactions", href: "/admin/transactions", icon: CreditCard },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage FixMate users, services, bookings, and payments.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sections.map(({ title, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#131b2e] p-5 text-white transition hover:border-teal-500"
          >
            <Icon className="h-5 w-5 text-teal-400" />
            <span className="font-medium">{title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
