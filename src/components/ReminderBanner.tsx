"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addDays, isEveningNow, prettyDateBn, todayStr, tomorrowStr } from "@/lib/dates";

export default function ReminderBanner({ userId }: { userId: string }) {
  const supabase = createClient();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const check = async () => {
    if (!isEveningNow()) {
      setVisible(false);
      return;
    }

    const today = todayStr();
    const { data: settings } = await supabase
      .from("user_settings")
      .select("reminder_dismissed_date")
      .eq("user_id", userId)
      .maybeSingle();

    if (settings?.reminder_dismissed_date === today) {
      setVisible(false);
      return;
    }

    const { count } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("date", tomorrowStr());

    setVisible(!count);
  };

  useEffect(() => {
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = async () => {
    await supabase
      .from("user_settings")
      .upsert({ user_id: userId, reminder_dismissed_date: todayStr() });
    setVisible(false);
  };

  const save = async () => {
    if (draft.length === 0) return;
    await supabase.from("tasks").insert(
      draft.map((text, position) => ({
        user_id: userId,
        date: tomorrowStr(),
        text,
        position,
      }))
    );
    setDraft([]);
    await dismiss();
  };

  const add = () => {
    const v = input.trim();
    if (!v) return;
    setDraft((d) => [...d, v]);
    setInput("");
  };

  if (!visible) return null;

  return (
    <div className="mt-9 border border-accent bg-accent/5 p-5">
      <div className="flex justify-between items-start mb-2.5">
        <h3 className="font-serif font-semibold text-[16px]">
          ⏰ রাত ৯:৩০ — আগামীকালের পরিকল্পনা করার সময়
        </h3>
        <button onClick={dismiss} className="text-muted">
          ✕
        </button>
      </div>
      <p className="text-[13.5px] text-muted mb-4 leading-relaxed">
        আগামীকালের ({prettyDateBn(addDays(new Date(), 1))}) জন্য এখনো কোনো টু-ডু লিস্ট তৈরি হয়নি।
      </p>
      {draft.map((t, i) => (
        <div key={i} className="flex justify-between text-sm py-2">
          <span>{t}</span>
          <button onClick={() => setDraft((d) => d.filter((_, j) => j !== i))} className="text-muted">
            ✕
          </button>
        </div>
      ))}
      <div className="flex border-b border-accent mb-3.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="আগামীকালের একটা কাজ লেখো..."
          className="flex-1 bg-transparent py-2 px-1 text-sm outline-none"
        />
        <button onClick={add} className="px-1 text-accent font-semibold text-sm">
          + যোগ করো
        </button>
      </div>
      <button onClick={save} className="bg-ink text-ivory text-sm px-4 py-2 hover:bg-accent">
        লিস্ট সংরক্ষণ করো
      </button>
    </div>
  );
}
