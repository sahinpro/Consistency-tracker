"use client";
import { useState } from "react";
import { useStats } from "@/hooks/useStats";
import { prettyDateBn, toBn } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StatsPanel({ userId }: { userId: string }) {
  const [range, setRange] = useState(30);
  const { entries } = useStats(userId, range);

  const totalDone = entries.reduce((s, e) => s + e.done, 0);
  const totalTasks = entries.reduce((s, e) => s + e.total, 0);
  const perfectDays = entries.filter((e) => e.total > 0 && e.done === e.total).length;
  const avgRate = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="mt-11">
      <h2 className="font-serif font-semibold text-[17px] mb-4">পরিসংখ্যান</h2>
      <Tabs value={String(range)} onValueChange={(v) => setRange(Number(v))} className="mb-5">
        <TabsList className="h-11 w-full">
          <TabsTrigger value="7" className="flex-1">
            এই সপ্তাহ
          </TabsTrigger>
          <TabsTrigger value="30" className="flex-1">
            এই মাস
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-3.5">
          এখনো কোনো ডেটা নেই — কাজ শেষ করা শুরু করলে এখানে ট্র্যাক হবে।
        </p>
      ) : (
        <>
          <div className="flex gap-3 mb-5">
            <Card size="sm" className="flex-1">
              <CardContent>
                <div className="font-serif font-bold text-2xl">{toBn(avgRate)}%</div>
                <div className="mt-0.5 text-xs text-muted-foreground">গড় সম্পন্নতার হার</div>
              </CardContent>
            </Card>
            <Card size="sm" className="flex-1">
              <CardContent>
                <div className="font-serif font-bold text-2xl">{toBn(perfectDays)}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">১০০% সম্পন্ন দিন</div>
              </CardContent>
            </Card>
            <Card size="sm" className="flex-1">
              <CardContent>
                <div className="font-serif font-bold text-2xl">
                  {toBn(totalDone)}/{toBn(totalTasks)}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">মোট কাজ সম্পন্ন</div>
              </CardContent>
            </Card>
          </div>

          {entries.map((e) => {
            const rate = e.total ? Math.round((e.done / e.total) * 100) : 0;
            return (
              <div key={e.date} className="mb-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{prettyDateBn(new Date(e.date))}</span>
                  <span>
                    {toBn(e.done)}/{toBn(e.total)}
                  </span>
                </div>
                <Progress value={rate} className="h-1.5" />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
