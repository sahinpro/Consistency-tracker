import { toBn } from "@/lib/dates";

export default function StreakBadge({ count }: { count: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-serif font-bold text-xl">{toBn(count)}</span>
      <span className="text-xs text-muted">দিনের ধারাবাহিকতা</span>
    </div>
  );
}
