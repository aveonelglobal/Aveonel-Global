"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const LINKS = [
  { href: "/dashboard", label: "Today" },
  { href: "/week", label: "Week" },
  { href: "/schedule", label: "Schedule" },
  { href: "/grocery", label: "Grocery" },
  { href: "/progress", label: "Progress" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <nav className="border-b border-[#24312a] bg-fitos-card">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <span className="font-semibold text-fitos-accent">FitOS</span>
        <div className="flex gap-4 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "text-fitos-accent" : "text-fitos-muted hover:text-fitos-text"}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={signOut} className="text-fitos-muted hover:text-fitos-text">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
