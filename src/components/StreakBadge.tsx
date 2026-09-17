import { Flame } from "lucide-react";
import { toBn } from "@/lib/dates";

export default function StreakBadge({ count }: { count: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <Flame className="h-5 w-5 self-center text-primary" aria-hidden="true" />
      <span className="font-serif font-bold text-xl">{toBn(count)}</span>
      <span className="text-xs text-muted-foreground">দিনের ধারাবাহিকতা</span>
    </div>
  );
}
