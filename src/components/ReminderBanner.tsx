"use client";
import { useEffect, useState } from "react";
import { Clock, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addDays, isEveningNow, prettyDateBn, todayStr, tomorrowStr } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <Card className="mt-9 border-primary">
      <CardContent>
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 font-serif text-base font-semibold">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            রাত ৯:৩০ — আগামীকালের পরিকল্পনা করার সময়
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            onClick={() => void dismiss()}
            aria-label="বন্ধ করো"
          >
            <X className="size-4" />
          </Button>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          আগামীকালের ({prettyDateBn(addDays(new Date(), 1))}) জন্য এখনো কোনো টু-ডু লিস্ট তৈরি হয়নি।
        </p>
        {draft.map((t, i) => (
          <div key={i} className="flex justify-between items-center text-sm py-2">
            <span>{t}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 shrink-0"
              onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}
              aria-label="মুছুন"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <div className="mb-3.5 flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="আগামীকালের একটা কাজ লেখো..."
            aria-label="আগামীকালের কাজ"
            className="h-11"
          />
          <Button type="button" variant="secondary" className="h-11 shrink-0" onClick={add}>
            <Plus className="size-4" />
            যোগ করো
          </Button>
        </div>
        <Button type="button" className="h-11" onClick={() => void save()}>
          লিস্ট সংরক্ষণ করো
        </Button>
      </CardContent>
    </Card>
  );
}
