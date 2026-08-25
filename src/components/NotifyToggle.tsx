"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToPush } from "@/lib/push";

export default function NotifyToggle({ userId }: { userId: string }) {
  const supabase = createClient();
  const [on, setOn] = useState(false);

  useEffect(() => {
    supabase
      .from("user_settings")
      .select("notify_enabled")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setOn(!!data?.notify_enabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async () => {
    if (!on) {
      const ok = await subscribeToPush(userId);
      if (!ok) return;
      await supabase.from("user_settings").upsert({ user_id: userId, notify_enabled: true });
      setOn(true);
    } else {
      await supabase.from("user_settings").upsert({ user_id: userId, notify_enabled: false });
      setOn(false);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`text-[11px] border px-2.5 py-1 transition-colors ${
        on ? "border-ivory text-ivory" : "border-ivory/35 text-[#C9BFAE]"
      }`}
    >
      🔔 নোটিফিকেশন {on ? "চালু" : "বন্ধ"}
    </button>
  );
}
