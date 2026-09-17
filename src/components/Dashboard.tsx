"use client";
import { useMemo } from "react";
import BrandLogo from "./BrandLogo";
import QuoteCard from "./QuoteCard";
import TaskList from "./TaskList";
import StreakBadge from "./StreakBadge";
import ReminderBanner from "./ReminderBanner";
import StatsPanel from "./StatsPanel";
import NotifyToggle from "./NotifyToggle";
import { Separator } from "@/components/ui/separator";
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
    <main className="mx-auto min-h-dvh max-w-2xl bg-background font-sans text-foreground">
      <div className="relative border-b border-border bg-card px-8 py-14 text-center">
        <div className="mb-3 flex justify-center">
          <NotifyToggle userId={userId} />
        </div>
        <div className="mb-4 flex justify-center">
          <BrandLogo size={88} />
        </div>
        <h1 className="mb-3 font-serif text-3xl">ধারাবাহিকতাই শক্তি</h1>
        <p className="text-sm text-muted-foreground italic">প্রতিদিনের ছোট কাজ, বড় ফলাফলের ভিত্তি</p>
      </div>

      <div className="px-8 py-10">
        <div className="flex justify-between items-center pb-4 mb-6">
          <div className="text-sm text-muted-foreground">{prettyDateBn()}</div>
          <StreakBadge count={count} />
        </div>
        <Separator className="mb-6" />

        <QuoteCard />

        <TaskList tasks={tasks} onAdd={addTask} onToggle={handleToggle} onDelete={deleteTask} />

        <ReminderBanner userId={userId} />

        <StatsPanel userId={userId} />
      </div>
    </main>
  );
}
