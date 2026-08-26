import { redirect } from "next/navigation";
import { confirmEmailLink } from "./actions";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash, type } = await searchParams;

  if (!token_hash) {
    redirect("/login?error=expired");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="w-full max-w-sm px-6 text-center">
        <h1 className="font-serif text-2xl mb-6">ধারাবাহিকতা ড্যাশবোর্ড</h1>
        <p className="text-sm text-muted mb-6">
          ইমেইলের লিংক থেকে এসেছো। লগইন শেষ করতে নিচের বাটন চাপো — এভাবে Gmail আগে থেকে লিংক খুলে টোকেন নষ্ট করতে পারে না।
        </p>
        <form action={confirmEmailLink}>
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type ?? "email"} />
          <button
            type="submit"
            className="w-full min-h-11 bg-ink text-ivory py-2.5 text-sm hover:bg-accent"
          >
            লগইন কনফার্ম করো
          </button>
        </form>
      </div>
    </main>
  );
}
