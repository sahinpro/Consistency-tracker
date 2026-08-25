"use client";
import { useState } from "react";

const REMINDERS = [
  { tag: "কুরআন", text: "নিশ্চয় কষ্টের সাথে স্বস্তি আছে।", src: "সূরা আশ-শারহ, ৯৪:৫–৬ (ভাবানুবাদ)" },
  { tag: "হাদিস", text: "আল্লাহর কাছে সবচেয়ে প্রিয় আমল হলো যা নিয়মিতভাবে করা হয়, যদিও তা পরিমাণে অল্প।", src: "সহীহ বুখারী (ভাবানুবাদ)" },
  { tag: "নিজের কথা", text: "তোমার আরও motivation দরকার নেই। দরকার আজকের কাজটার এমন একটা ছোট ভার্সন, যাকে তুমি 'না' বলতে পারবে না।", src: "" },
  { tag: "কুরআন", text: "যে আল্লাহর উপর ভরসা করে, তার জন্য তিনিই যথেষ্ট।", src: "সূরা আত-তালাক, ৬৫:৩ (ভাবানুবাদ)" },
  { tag: "নিজের কথা", text: "শৃঙ্খলা মানে এখন যা চাও আর সবচেয়ে বেশি যা চাও — এই দুইয়ের মধ্যে বেছে নেওয়া।", src: "" },
  { tag: "হাদিস", text: "পাঁচটি জিনিসকে পাঁচটির আগে মূল্য দাও — বার্ধক্যের আগে যৌবন, অসুস্থতার আগে সুস্থতা, ব্যস্ততার আগে অবসর সময়।", src: "হাদিস (ভাবানুবাদ)" },
  { tag: "নিজের কথা", text: "দুই ঘণ্টার focused কাজ, আট ঘণ্টার scrolling-কে 'research' বলার চেয়ে ভালো।", src: "" },
  { tag: "কুরআন", text: "আল্লাহ কোনো জাতির অবস্থা পরিবর্তন করেন না, যতক্ষণ না তারা নিজেদের অবস্থা নিজেরা পরিবর্তন করে।", src: "সূরা আর-রা'দ, ১৩:১১ (ভাবানুবাদ)" },
  { tag: "নিজের কথা", text: "Facebook ট্যাবটা দুই ঘণ্টা পরেও থাকবে। কিন্তু এখন যে momentum ভাঙছ, সেটা এত সহজে ফিরবে না।", src: "" },
  { tag: "দোয়া", text: "হে আল্লাহ, আমাকে তোমার স্মরণ, শুকরিয়া, আর সর্বোত্তমভাবে ইবাদত করার তৌফিক দাও।", src: "নববী দোয়া (ভাবানুবাদ)" },
  { tag: "নিজের কথা", text: "তুমি পিছিয়ে নেই। তুমি এমন কিছু বানাচ্ছ যা compound হয় — বেশিরভাগ মানুষ compounding শুরুর আগেই ছেড়ে দেয়।", src: "" },
  { tag: "নিজের কথা", text: "এটা খোলো, প্রথম কাজটা করো, বাকি সব বন্ধ রাখো। প্রথম কাজ শেষ না হওয়া পর্যন্ত বাকি প্ল্যান অপেক্ষা করতে পারে।", src: "" },
];

export default function QuoteCard() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * REMINDERS.length));
  const r = REMINDERS[idx];

  return (
    <div className="border-y border-hair py-8 my-8">
      <span className="inline-block text-[11px] text-accent border border-hair px-3 py-1 mb-4">
        {r.tag}
      </span>
      <p className="font-serif font-medium text-[22px] leading-relaxed mb-3">&ldquo;{r.text}&rdquo;</p>
      {r.src && <p className="italic text-[13px] text-muted">{r.src}</p>}
      <button
        onClick={() => setIdx((idx + 1) % REMINDERS.length)}
        className="mt-5 border border-ink text-sm px-4 py-2 hover:bg-ink hover:text-ivory transition-colors"
      >
        পরবর্তী রিমাইন্ডার →
      </button>
    </div>
  );
}
