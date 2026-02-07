"use client";

import { useState, type JSX } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const isAuthed = !!user;

  const getInitials = (name?: string | null, email?: string | null) => {
    const source = name?.trim() || email?.split("@")[0] || "U";
    const parts = source.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/doctors", label: "Doctors" },
    { href: "/appointments", label: "Appointments" },
    { href: "/appointments/book", label: "Book" },
    { href: "/chat", label: "Chat" },
    { href: "/admin/dashboard", label: "Admin" },
    { href: "/admin/users", label: "Users" },
    { href: "/patient/dashboard", label: "Patient" },
    { href: "/doctor/dashboard", label: "Doctor" },
  ];

  const authLinks = isAuthed
    ? []
    : [
        { href: "/login", label: "Sign In" },
        { href: "/register", label: "Register" },
      ];

  const desktopNavItems = [...links.slice(0, 6), ...authLinks];
  const mobileNavItems = [...links, ...authLinks];

  const renderNavLinks = (
    items: { href: string; label: string }[],
    className: string,
  ) =>
    items.map((l) => (
      <Link key={l.href + l.label} href={l.href} className={className}>
        {l.label}
      </Link>
    ));

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/70">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-semibold text-lg text-slate-900">
              HealthAI
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {renderNavLinks(
            desktopNavItems,
            "rounded-md px-3 py-2 text-sm text-slate-700 hover:text-blue-600",
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthed && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src={user?.image || undefined} alt="Profile" />
                <AvatarFallback className="text-xs font-semibold">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
          >
            {open ? (
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 flex flex-col gap-1">
            {mobileNavItems.map((l) => (
              <Link
                key={l.href + l.label + "-m"}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md"
              >
                {l.label}
              </Link>
            ))}
            {isAuthed && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Avatar className="h-6 w-6 border border-slate-200">
                  <AvatarImage src={user?.image || undefined} alt="Profile" />
                  <AvatarFallback className="text-[10px] font-semibold">
                    {getInitials(user?.name, user?.email)}
                  </AvatarFallback>
                </Avatar>
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
