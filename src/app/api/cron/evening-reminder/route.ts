import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { todayStr, tomorrowStr } from "@/lib/dates";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = todayStr();
  const tomorrow = tomorrowStr();

  const { data: settingsRows } = await supabase
    .from("user_settings")
    .select("user_id, notify_enabled, notified_date")
    .eq("notify_enabled", true);

  let notified = 0;

  for (const s of settingsRows ?? []) {
    if (s.notified_date === today) continue;

    const { count } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", s.user_id)
      .eq("date", tomorrow);

    if (count && count > 0) continue;

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", s.user_id);

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: "আগামীকালের পরিকল্পনা এখনো বাকি",
            body: "কালকের টু-ডু লিস্ট তৈরি করো — ৩-৫টা কাজ যথেষ্ট।",
          })
        );
        notified++;
      } catch (err) {
        console.error("push failed", err);
      }
    }

    await supabase.from("user_settings").update({ notified_date: today }).eq("user_id", s.user_id);
  }

  return NextResponse.json({ ok: true, users_checked: settingsRows?.length ?? 0, notified });
}
