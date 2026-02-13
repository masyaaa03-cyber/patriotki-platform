"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(data);
      }
      setLoading(false);
    }
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(data);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/map", label: "Карта" },
    ...(user
      ? [
          { href: "/dashboard", label: "Профиль" },
          { href: "/dashboard/events", label: "Мероприятия" },
          { href: "/dashboard/achievements", label: "Достижения" },
          ...(user.role === "admin"
            ? [{ href: "/admin", label: "Админ" }]
            : []),
        ]
      : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-red-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Патриотки всея Руси
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-red-900 text-white"
                    : "text-red-100 hover:bg-red-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!loading &&
              (user ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-700 transition-colors"
                >
                  Выйти
                </button>
              ) : (
                <Link
                  href="/login"
                  className="ml-4 px-4 py-2 bg-white text-red-800 rounded-md text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Войти
                </Link>
              ))}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-red-900 text-white"
                    : "text-red-100 hover:bg-red-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!loading &&
              (user ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-100 hover:bg-red-700"
                >
                  Выйти
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium bg-white text-red-800"
                >
                  Войти
                </Link>
              ))}
          </div>
        )}
      </div>
    </nav>
  );
}
