import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
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
    <main className="flex min-h-dvh items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm px-6 text-center">
        <div className="flex justify-center mb-4">
          <BrandLogo size={80} />
        </div>
        <h1 className="font-serif text-2xl mb-6">ধারাবাহিকতা ড্যাশবোর্ড</h1>
        <p className="text-sm text-muted-foreground mb-6">
          ইমেইলের লিংক থেকে এসেছো। লগইন শেষ করতে নিচের বাটন চাপো — এভাবে Gmail আগে থেকে লিংক খুলে টোকেন নষ্ট করতে পারে না।
        </p>
        <form action={confirmEmailLink}>
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type ?? "email"} />
          <Button type="submit" className="w-full min-h-11">
            লগইন কনফার্ম করো
          </Button>
        </form>
      </div>
    </main>
  );
}
