"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Stethoscope,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "staff"],
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/admin/doctors",
    label: "Doctors",
    icon: Stethoscope,
    roles: ["admin"],
  },
  {
    href: "/admin/staff",
    label: "Staff",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    href: "/admin/patients",
    label: "Patients",
    icon: Users,
    roles: ["admin", "staff"],
  },
  {
    href: "/admin/appointments",
    label: "Appointments",
    icon: Calendar,
    roles: ["admin", "staff"],
  },
  {
    href: "/admin/billing",
    label: "Billing",
    icon: DollarSign,
    roles: ["admin", "staff"],
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: FileText,
    roles: ["admin", "staff"],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const role = session?.user?.role || "staff";

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`sticky top-0 h-screen bg-white/90 backdrop-blur border-r border-slate-200 transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-64"
      } md:w-64`}
    >
      <div className="p-4 md:p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className={`${isCollapsed ? "hidden" : "block"} md:block`}>
            <div className="font-bold text-slate-900">Admin Panel</div>
            <div className="text-xs text-slate-500">System Control</div>
          </div>
          <button
            type="button"
            aria-label="Toggle admin menu"
            className="ml-auto md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span
                className={`${isCollapsed ? "hidden" : "inline"} md:inline`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div
        className={`mt-auto p-4 ${isCollapsed ? "hidden" : "block"} md:block`}
      >
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
          Access all admin tools for managing users, billing, appointments, and
          reports.
        </div>
      </div>
    </aside>
  );
}
