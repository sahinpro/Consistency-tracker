"use client";
import { useMemo } from "react";
import QuoteCard from "./QuoteCard";
import TaskList from "./TaskList";
import StreakBadge from "./StreakBadge";
import ReminderBanner from "./ReminderBanner";
import StatsPanel from "./StatsPanel";
import NotifyToggle from "./NotifyToggle";
import { useTasks } from "@/hooks/useTasks";
import { useStreak } from "@/hooks/useStreak";
import { prettyDateBn, todayStr } from "@/lib/dates";

export default function Dashboard({ userId }: { userId: string }) {
  const today = useMemo(() => todayStr(), []);
  const { tasks, addTask, toggleTask, deleteTask } = useTasks(userId, today);
  const { count, recompute } = useStreak(userId);

  const handleToggle = async (id: string, done: boolean) => {
    await toggleTask(id, done);
    const updated = tasks.map((t) => (t.id === id ? { ...t, done } : t));
    await recompute(updated.length > 0 && updated.every((t) => t.done));
  };

  return (
    <main className="mx-auto max-w-2xl bg-ivory text-ink font-sans min-h-screen">
      <div className="relative bg-ink text-ivory px-8 py-14 text-center">
        <div className="flex justify-center mb-3">
          <NotifyToggle userId={userId} />
        </div>
        <h1 className="font-serif text-3xl mb-3">ধারাবাহিকতাই শক্তি</h1>
        <p className="italic text-sm text-[#C9BFAE]">প্রতিদিনের ছোট কাজ, বড় ফলাফলের ভিত্তি</p>
      </div>

      <div className="px-8 py-10">
        <div className="flex justify-between items-center border-b border-hair pb-4 mb-6">
          <div className="text-sm text-muted">{prettyDateBn()}</div>
          <StreakBadge count={count} />
        </div>

        <QuoteCard />

        <TaskList tasks={tasks} onAdd={addTask} onToggle={handleToggle} onDelete={deleteTask} />

        <ReminderBanner userId={userId} />

        <StatsPanel userId={userId} />
      </div>
    </main>
  );
}
