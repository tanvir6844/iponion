"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import IponionLogo from "@/components/Logo";
import { User, Shield } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => authListener?.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-95 transition">
          <IponionLogo size={40} />
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <Link href="/portal" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-[#2D1457] font-bold text-sm border border-violet-200">
              <User size={15} /> My Portal
            </Link>
          ) : (
            <Link href="/auth" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D1457] text-white font-bold text-sm hover:bg-[#3D1A75]">
              Customer Sign In
            </Link>
          )}
          <Link href="/admin" className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 text-sm font-semibold">
            <Shield size={16} /> Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
