// Runs once a day. Emails customers whose last paid order was 3+ weeks ago.
// Each customer gets one email per quiet spell: once they order again and then
// go quiet for 3 weeks, they can get one more. Unsubscribed people never do.
//
// Netlify environment variables:
//   STRIPE_READ_KEY     Stripe restricted key with read access to Charges
//   RESEND_API_KEY      Resend API key
//   WINBACK_FROM        e.g. "Gigi's Cookies <hello@gigiscookiesnyc.com>"
//   WINBACK_REPLY_TO    where replies go (Gigi's inbox)
//   UNSUBSCRIBE_SECRET  any long random text
//   WINBACK_LIVE        "true" to really send; anything else = practice run (logs only)
import { getStore } from "@netlify/blobs";
import { SITE_URL, unsubLink } from "../lib/winback-lib.mjs";

const DAYS_QUIET = 21;
const MAX_PER_RUN = 50;
const DAY = 86400;

async function stripeCharges() {
  const key = process.env.STRIPE_READ_KEY;
  if (!key) throw new Error("STRIPE_READ_KEY is not set");
  const charges = [];
  let after = null;
  for (let page = 0; page < 50; page++) {
    const q = new URLSearchParams({ limit: "100" });
    if (after) q.set("starting_after", after);
    const res = await fetch(`https://api.stripe.com/v1/charges?${q}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`);
    const body = await res.json();
    charges.push(...body.data);
    if (!body.has_more) break;
    after = body.data[body.data.length - 1].id;
  }
  return charges;
}

// email -> { email, name, lastOrder (unix seconds) }
function lastOrders(charges) {
  const people = new Map();
  for (const c of charges) {
    if (c.status !== "succeeded" || !c.paid || c.refunded) continue;
    const email = (c.billing_details?.email || c.receipt_email || "").trim().toLowerCase();
    if (!email) continue;
    const p = people.get(email) || { email, name: "", lastOrder: 0 };
    if (c.created > p.lastOrder) {
      p.lastOrder = c.created;
      p.name = (c.billing_details?.name || "").trim().replace(/\s+/g, " ");
    }
    people.set(email, p);
  }
  return [...people.values()];
}

function firstName(name) {
  const first = (name || "").split(" ")[0];
  if (!first || first.length < 2) return "there";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function emailContent(person) {
  const hi = firstName(person.name);
  const unsub = unsubLink(person.email);
  const text = `Hi ${hi},

Thank you so much for ordering from Gigi's Cookies! It's been a little while, so I wanted to say hi and let you know the oven is warm.

Thin, chewy chocolate chip cookies with ooey gooey chocolate, baked fresh for you.

- Delivery: Mondays and Fridays, 9 AM to 2 PM
- Pickup: Mondays, Fridays and Sundays

Order in a minute here: ${SITE_URL}

Hope to bake for you soon!
Gigi

Don't want these emails? Unsubscribe: ${unsub}`;
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#4a1a2c;max-width:520px">
<p>Hi ${hi},</p>
<p>Thank you so much for ordering from Gigi's Cookies! It's been a little while, so I wanted to say hi and let you know the oven is warm.</p>
<p>Thin, chewy chocolate chip cookies with ooey gooey chocolate, baked fresh for you.</p>
<ul><li>Delivery: Mondays and Fridays, 9 AM to 2 PM</li><li>Pickup: Mondays, Fridays and Sundays</li></ul>
<p><a href="${SITE_URL}" style="display:inline-block;background:#e0246a;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Order cookies</a></p>
<p>Hope to bake for you soon!<br>Gigi</p>
<p style="font-size:12px;color:#888">Don't want these emails? <a href="${unsub}" style="color:#888">Unsubscribe</a></p>
</div>`;
  return { subject: "Fresh cookies this week? 🍪", text, html, unsub };
}

async function sendEmail(person) {
  const { subject, text, html, unsub } = emailContent(person);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.WINBACK_FROM,
      to: [person.email],
      reply_to: process.env.WINBACK_REPLY_TO || undefined,
      subject,
      text,
      html,
      headers: {
        "List-Unsubscribe": `<${unsub}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export default async () => {
  const live = process.env.WINBACK_LIVE === "true";
  const now = Math.floor(Date.now() / 1000);
  const sent = getStore("winback-sent"); // email -> { sentAt }
  const unsubscribed = getStore("unsubscribed"); // email -> { at }

  const people = lastOrders(await stripeCharges());
  let count = 0;
  for (const p of people) {
    if (now - p.lastOrder < DAYS_QUIET * DAY) continue;
    if (await unsubscribed.get(p.email)) continue;
    const prev = await sent.get(p.email, { type: "json" });
    if (prev && prev.sentAt >= p.lastOrder) continue; // already emailed since their last order
    if (count >= MAX_PER_RUN) break;
    count++;
    const days = Math.floor((now - p.lastOrder) / DAY);
    if (!live) {
      console.log(`[practice] would email ${p.email} (last order ${days} days ago)`);
      continue;
    }
    try {
      await sendEmail(p);
      await sent.setJSON(p.email, { sentAt: now });
      console.log(`emailed ${p.email} (last order ${days} days ago)`);
    } catch (err) {
      console.error(`failed for ${p.email}: ${err.message}`);
    }
  }
  console.log(`${live ? "Sent" : "Practice run, would send"}: ${count}`);
};

// Every day at 3 PM UTC (10 AM in New York in winter, 11 AM in summer).
export const config = { schedule: "0 15 * * *" };
