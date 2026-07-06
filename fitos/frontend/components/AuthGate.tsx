"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Nav from "./Nav";

/**
 * Wraps every protected page: redirects to /login if there's no Supabase
 * session, otherwise renders children inside the shared Nav shell.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  if (session === undefined) {
    return <div className="p-8 text-fitos-muted">Loading...</div>;
  }
  if (!session) {
    return <div className="p-8 text-fitos-muted">Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
