"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-fitos-accent">FitOS</h1>
        <p className="mb-6 text-sm text-fitos-muted">Your personal AI health operating system.</p>

        {sent ? (
          <p className="text-sm">Check your email for a sign-in link.</p>
        ) : (
          <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn-primary">
              Send magic link
            </button>
          </form>
        )}

        <div className="my-4 flex items-center gap-2 text-xs text-fitos-muted">
          <div className="h-px flex-1 bg-[#24312a]" /> or <div className="h-px flex-1 bg-[#24312a]" />
        </div>

        <button onClick={signInWithGoogle} className="w-full rounded-lg border border-[#24312a] py-2 text-sm hover:bg-[#1c261f]">
          Continue with Google
        </button>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
