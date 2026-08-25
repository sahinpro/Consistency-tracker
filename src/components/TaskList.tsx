"use client";
import { useState } from "react";
import type { Task } from "@/hooks/useTasks";
import { toBn } from "@/lib/dates";

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
        <span className="text-sm text-muted">
          {toBn(done)}/{toBn(tasks.length)}
        </span>
      </div>
      <div className="h-[2px] bg-hair mb-6">
        <div className="h-full bg-ink transition-all" style={{ width: `${pct}%` }} />
      </div>

      {tasks.map((t) => (
        <div key={t.id} className="group flex items-center gap-4 py-3 border-b border-hair">
          <button
            onClick={() => onToggle(t.id, !t.done)}
            className={`w-[18px] h-[18px] shrink-0 border border-ink flex items-center justify-center text-[11px] ${
              t.done ? "bg-ink text-ivory" : ""
            }`}
          >
            {t.done ? "✓" : ""}
          </button>
          <span className={`flex-1 text-[15px] ${t.done ? "text-muted line-through" : ""}`}>
            {t.text}
          </span>
          <button
            onClick={() => onDelete(t.id)}
            className="text-muted opacity-0 group-hover:opacity-100 hover:text-danger transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="flex border-b border-ink mt-4">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="আজকের জন্য একটা কাজ যোগ করুন..."
          className="flex-1 bg-transparent py-2.5 px-1 text-sm outline-none"
        />
        <button onClick={submit} className="px-1 font-semibold text-sm hover:text-accent">
          যোগ করো
        </button>
      </div>
    </div>
  );
}
