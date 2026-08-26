"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = [
  "email",
  "signup",
  "magiclink",
  "invite",
  "recovery",
  "email_change",
];

function asOtpType(value: string): EmailOtpType {
  return OTP_TYPES.includes(value as EmailOtpType) ? (value as EmailOtpType) : "email";
}

export async function confirmEmailLink(formData: FormData) {
  const token_hash = String(formData.get("token_hash") ?? "");
  const type = asOtpType(String(formData.get("type") ?? "email"));

  if (!token_hash) {
    redirect("/login?error=expired");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    redirect("/login?error=expired");
  }

  redirect("/");
}
