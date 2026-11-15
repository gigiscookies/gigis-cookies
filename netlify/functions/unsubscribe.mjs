// The unsubscribe link in the "we miss you" emails points here.
import { getStore } from "@netlify/blobs";
import { SITE_URL, validToken } from "../lib/winback-lib.mjs";

function page(message) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gigi's Cookies</title>
<body style="font-family:Helvetica,Arial,sans-serif;color:#4a1a2c;background:#fff5f8;text-align:center;padding:60px 16px">
<h1 style="color:#e0246a">Gigi's Cookies</h1><p style="font-size:18px">${message}</p>
<p><a href="${SITE_URL}" style="color:#e0246a">Back to the website</a></p></body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export default async (req) => {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") || "").trim().toLowerCase();
  const token = url.searchParams.get("t") || "";
  if (!validToken(email, token)) {
    return page("Sorry, this unsubscribe link doesn't look right. Just reply to the email and Gigi will take you off the list.");
  }
  await getStore("unsubscribed").setJSON(email, { at: Math.floor(Date.now() / 1000) });
  return page("You're unsubscribed. You won't get any more of these emails. Thanks for being a customer!");
};

export const config = { path: "/unsubscribe" };
