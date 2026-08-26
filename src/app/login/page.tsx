"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const expired =
      params.get("error") === "expired" ||
      hash.includes("otp_expired") ||
      hash.includes("access_denied");
    if (expired) {
      setError("লিংকটা আর কাজ করছে না — একবার খুললেই শেষ। নতুন কোড পাঠাও, ইমেইলের ছয় অঙ্ক এখানে লিখো। লিংকে ক্লিক করো না।");
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  const send = async () => {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setBusy(false);
    if (sendError) {
      setError(
        sendError.message.toLowerCase().includes("rate") ||
          sendError.message.toLowerCase().includes("seconds")
          ? "একটু অপেক্ষা করো, তারপর আবার পাঠাও।"
          : "পাঠানো যায়নি। ইমেইলটা চেক করে আবার চেষ্টা করো।"
      );
      return;
    }
    setSent(true);
  };

  const verify = async () => {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const token = code.trim();
    let { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (verifyError) {
      ({ error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      }));
    }
    setBusy(false);
    if (verifyError) {
      setError("কোডটা ভুল বা মেয়াদ শেষ। নতুনটা পাঠাও।");
      return;
    }
    window.location.assign("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="w-full max-w-sm px-6">
        <h1 className="font-serif text-2xl mb-6 text-center">ধারাবাহিকতা ড্যাশবোর্ড</h1>
        {error ? <p className="text-center text-sm text-danger mb-4">{error}</p> : null}
        {sent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <p className="text-center text-sm text-muted mb-4">
              {email}-এ কোড গেছে। ইনবক্স বা স্প্যাম চেক করো। লিংকে ক্লিক করো না — ছয় অঙ্কের কোডটা এখানে লিখো।
            </p>
            <label className="sr-only" htmlFor="otp">
              লগইন কোড
            </label>
            <input
              id="otp"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="৬ অঙ্কের কোড"
              className="w-full border-b border-ink bg-transparent py-2.5 mb-4 outline-none text-sm text-center tracking-widest"
            />
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="w-full min-h-11 bg-ink text-ivory py-2.5 text-sm hover:bg-accent disabled:opacity-50"
            >
              {busy ? "চেক হচ্ছে…" : "লগইন"}
            </button>
            <button
              type="button"
              onClick={() => void send()}
              disabled={busy}
              className="w-full min-h-11 mt-3 text-sm text-muted hover:text-ink"
            >
              আবার পাঠাও
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label className="sr-only" htmlFor="email">
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ইমেইল"
              autoComplete="email"
              className="w-full border-b border-ink bg-transparent py-2.5 mb-4 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={busy || !email.includes("@")}
              className="w-full min-h-11 bg-ink text-ivory py-2.5 text-sm hover:bg-accent disabled:opacity-50"
            >
              {busy ? "পাঠানো হচ্ছে…" : "লগইন কোড পাঠাও"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
