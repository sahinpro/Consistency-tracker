"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addDays, todayStr } from "@/lib/dates";

export type DayStat = { date: string; total: number; done: number };

export function useStats(userId: string, rangeDays: number) {
  const supabase = createClient();
  const [entries, setEntries] = useState<DayStat[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const from = todayStr(addDays(new Date(), -(rangeDays - 1)));
    const { data } = await supabase
      .from("tasks")
      .select("date, done")
      .eq("user_id", userId)
      .gte("date", from);

    const byDate = new Map<string, { total: number; done: number }>();
    (data ?? []).forEach((row) => {
      const cur = byDate.get(row.date) ?? { total: 0, done: 0 };
      cur.total += 1;
      if (row.done) cur.done += 1;
      byDate.set(row.date, cur);
    });

    const out: DayStat[] = Array.from(byDate.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    setEntries(out);
    setLoading(false);
  }, [supabase, userId, rangeDays]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}
