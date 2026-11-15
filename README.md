# Gigi's Cookies

The ordering website for Gigi's Cookies, live at https://gigiscookies.netlify.app.

- `index.html` is the whole site (styles, photo and scripts are inside it).
- Netlify deploys it automatically whenever this repository changes.
- The order form is a Netlify form named `order`. Keep `name="order"` and `data-netlify="true"` on it.
- The 8 Stripe payment links live in the `L` variable in `index.html`. Don't remove them.

## "We miss you" emails

`netlify/functions/winback.mjs` runs every day at 10 AM (New York). It looks at paid orders in Stripe and emails anyone whose last order was 3+ weeks ago, once per quiet spell. People who click the unsubscribe link (`/unsubscribe`, `netlify/functions/unsubscribe.mjs`) never get another one. Who was emailed and who unsubscribed is kept in Netlify Blobs.

Netlify environment variables it needs: `STRIPE_READ_KEY`, `RESEND_API_KEY`, `WINBACK_FROM`, `WINBACK_REPLY_TO`, `UNSUBSCRIBE_SECRET`, and `WINBACK_LIVE` (`true` to really send; otherwise it only logs who it would email).
