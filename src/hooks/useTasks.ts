"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayStr } from "@/lib/dates";

export type Task = {
  id: string;
  text: string;
  done: boolean;
  position: number;
};

export function useTasks(userId: string, date: string = todayStr()) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("id, text, done, position")
      .eq("user_id", userId)
      .eq("date", date)
      .order("position", { ascending: true });
    setTasks(data ?? []);
    setLoading(false);
  }, [supabase, userId, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTask = useCallback(
    async (text: string) => {
      const position = tasks.length;
      const { data, error } = await supabase
        .from("tasks")
        .insert({ user_id: userId, date, text, position })
        .select("id, text, done, position")
        .single();
      if (!error && data) setTasks((prev) => [...prev, data]);
    },
    [supabase, userId, date, tasks.length]
  );

  const toggleTask = useCallback(
    async (id: string, done: boolean) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
      await supabase.from("tasks").update({ done }).eq("id", id);
    },
    [supabase]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await supabase.from("tasks").delete().eq("id", id);
    },
    [supabase]
  );

  return { tasks, loading, addTask, toggleTask, deleteTask, refresh };
}
