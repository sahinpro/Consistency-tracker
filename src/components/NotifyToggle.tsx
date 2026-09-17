"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToPush } from "@/lib/push";
import { Switch } from "@/components/ui/switch";

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
    <label className="inline-flex cursor-pointer items-center gap-2">
      <Switch checked={on} onCheckedChange={toggle} aria-label="নোটিফিকেশন" />
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Bell className="size-3.5" aria-hidden="true" />
        নোটিফিকেশন
      </span>
    </label>
  );
}
