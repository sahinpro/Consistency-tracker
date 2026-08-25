"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addDays, todayStr } from "@/lib/dates";

export function useStreak(userId: string) {
  const supabase = createClient();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("streaks")
      .select("count")
      .eq("user_id", userId)
      .maybeSingle();
    setCount(data?.count ?? 0);
  }, [supabase, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recompute = useCallback(
    async (allDone: boolean) => {
      const today = todayStr();
      const { data: row } = await supabase
        .from("streaks")
        .select("count, last_complete_date")
        .eq("user_id", userId)
        .maybeSingle();

      let nextCount = row?.count ?? 0;
      let nextDate = row?.last_complete_date ?? null;

      if (allDone && nextDate !== today) {
        const yesterday = todayStr(addDays(new Date(), -1));
        nextCount = nextDate === yesterday ? nextCount + 1 : 1;
        nextDate = today;
      } else if (!allDone && nextDate === today) {
        nextCount = Math.max(0, nextCount - 1);
        nextDate = null;
      } else {
        return;
      }

      await supabase
        .from("streaks")
        .upsert({ user_id: userId, count: nextCount, last_complete_date: nextDate });
      setCount(nextCount);
    },
    [supabase, userId]
  );

  return { count, recompute, refresh };
}
