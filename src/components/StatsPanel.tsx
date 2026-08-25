"use client";
import { useState } from "react";
import { useStats } from "@/hooks/useStats";
import { prettyDateBn, toBn } from "@/lib/dates";

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
      <div className="flex border border-hair mb-5">
        {[
          { label: "এই সপ্তাহ", v: 7 },
          { label: "এই মাস", v: 30 },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setRange(t.v)}
            className={`flex-1 text-center py-2 text-sm border-r border-hair last:border-r-0 ${
              range === t.v ? "bg-ink text-ivory" : "text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted py-3.5">
          এখনো কোনো ডেটা নেই — কাজ শেষ করা শুরু করলে এখানে ট্র্যাক হবে।
        </p>
      ) : (
        <>
          <div className="flex gap-6 mb-5 pb-4 border-b border-hair">
            <div>
              <div className="font-serif font-bold text-2xl">{toBn(avgRate)}%</div>
              <div className="text-[11.5px] text-muted mt-0.5">গড় সম্পন্নতার হার</div>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl">{toBn(perfectDays)}</div>
              <div className="text-[11.5px] text-muted mt-0.5">১০০% সম্পন্ন দিন</div>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl">
                {toBn(totalDone)}/{toBn(totalTasks)}
              </div>
              <div className="text-[11.5px] text-muted mt-0.5">মোট কাজ সম্পন্ন</div>
            </div>
          </div>

          {entries.map((e) => {
            const rate = e.total ? Math.round((e.done / e.total) * 100) : 0;
            return (
              <div key={e.date} className="mb-3">
                <div className="flex justify-between text-[12.5px] text-muted mb-1">
                  <span>{prettyDateBn(new Date(e.date))}</span>
                  <span>
                    {toBn(e.done)}/{toBn(e.total)}
                  </span>
                </div>
                <div className="h-1.5 bg-hair">
                  <div className="h-full bg-ink" style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
