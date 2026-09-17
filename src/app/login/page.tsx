"use client";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      setError("লিংকটা আর কাজ করছে না — একবার খুললেই শেষ। নতুন কোড পাঠাও, ইমেইলের পুরো কোডটা এখানে লিখো। লিংকে ক্লিক করো না।");
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
    <main className="flex min-h-dvh items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm px-6">
        <div className="flex justify-center mb-4">
          <BrandLogo size={80} />
        </div>
        <h1 className="font-serif text-2xl mb-6 text-center">ধারাবাহিকতা ড্যাশবোর্ড</h1>
        {error ? <p className="text-center text-sm text-destructive mb-4">{error}</p> : null}
        {sent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <p className="text-center text-sm text-muted-foreground mb-4">
              {email}-এ কোড গেছে। ইনবক্স বা স্প্যাম চেক করো। লিংকে ক্লিক করো না — ইমেইলের পুরো কোডটা এখানে লিখো।
            </p>
            <label className="sr-only" htmlFor="otp">
              লগইন কোড
            </label>
            <Input
              id="otp"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="৮ অঙ্কের কোড"
              className="mb-4 h-11 text-center tracking-widest"
            />
            <Button type="submit" disabled={busy || code.length < 6} className="w-full min-h-11">
              {busy ? "চেক হচ্ছে…" : "লগইন"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void send()}
              disabled={busy}
              className="w-full min-h-11 mt-3"
            >
              আবার পাঠাও
            </Button>
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
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ইমেইল"
              autoComplete="email"
              className="mb-4 h-11"
            />
            <Button type="submit" disabled={busy || !email.includes("@")} className="w-full min-h-11">
              {busy ? "পাঠানো হচ্ছে…" : "লগইন কোড পাঠাও"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
