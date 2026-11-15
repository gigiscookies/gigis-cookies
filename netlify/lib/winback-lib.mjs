// Shared helpers for the "we miss you" emails.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SITE_URL = "https://gigiscookiesnyc.com";

// Unsubscribe links carry a signature so nobody can unsubscribe someone else.
export function unsubToken(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error("UNSUBSCRIBE_SECRET is not set");
  return createHmac("sha256", secret).update(email.toLowerCase()).digest("hex").slice(0, 32);
}

export function validToken(email, token) {
  if (!email || !token) return false;
  const a = Buffer.from(unsubToken(email));
  const b = Buffer.from(String(token));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubLink(email) {
  const q = new URLSearchParams({ e: email.toLowerCase(), t: unsubToken(email) });
  return `${SITE_URL}/unsubscribe?${q}`;
}
