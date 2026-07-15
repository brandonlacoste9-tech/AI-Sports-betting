import { Resend } from "resend";

let client: Resend | null = null;

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export function emailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "BetEdge AI <onboarding@resend.dev>"
  );
}

export function hasEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
