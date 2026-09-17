"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import { toBn } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function TaskList({
  tasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onAdd: (text: string) => Promise<void>;
  onToggle: (id: string, done: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;

  const submit = async () => {
    const v = value.trim();
    if (!v) return;
    setValue("");
    await onAdd(v);
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <h2 className="font-serif font-semibold text-[17px]">আজকের অবশ্য-করণীয়</h2>
        <span className="text-sm text-muted-foreground">
          {toBn(done)}/{toBn(tasks.length)}
        </span>
      </div>
      <Progress value={pct} className="mb-6 h-2" />

      {tasks.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">আজকের জন্য এখনো কোনো কাজ নেই।</p>
      ) : null}

      {tasks.map((t) => (
        <div key={t.id} className="group flex items-center gap-4 py-3 border-b border-border">
          <Checkbox
            checked={t.done}
            onCheckedChange={(checked) => void onToggle(t.id, checked === true)}
            aria-label={t.text}
          />
          <span className={`flex-1 text-[15px] ${t.done ? "text-muted-foreground line-through" : ""}`}>
            {t.text}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void onDelete(t.id)}
            aria-label="মুছুন"
            className="size-11 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}

      <div className="mt-4 flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void submit()}
          placeholder="আজকের জন্য একটা কাজ যোগ করুন..."
          aria-label="নতুন কাজ"
          className="h-11"
        />
        <Button type="button" className="h-11 shrink-0" onClick={() => void submit()}>
          <Plus className="size-4" />
          যোগ করো
        </Button>
      </div>
    </div>
  );
}
