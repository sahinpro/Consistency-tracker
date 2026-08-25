"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="w-full max-w-sm px-6">
        <h1 className="font-serif text-2xl mb-6 text-center">ধারাবাহিকতা ড্যাশবোর্ড</h1>
        {sent ? (
          <p className="text-center text-sm text-muted">
            {email}-এ একটা লগইন লিংক পাঠানো হয়েছে। ইনবক্স চেক করো।
          </p>
        ) : (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ইমেইল"
              className="w-full border-b border-ink bg-transparent py-2.5 mb-4 outline-none text-sm"
            />
            <button
              onClick={submit}
              className="w-full bg-ink text-ivory py-2.5 text-sm hover:bg-accent"
            >
              লগইন লিংক পাঠাও
            </button>
          </>
        )}
      </div>
    </main>
  );
}
