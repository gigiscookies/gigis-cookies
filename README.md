# Gigi's Cookies

The ordering website for Gigi's Cookies, live at https://gigiscookiesnyc.com (also https://gigiscookies.netlify.app).

- `index.html` is the whole site (styles, photo and scripts are inside it).
- Netlify deploys it automatically whenever this repository changes.
- The order form is a Netlify form named `order`. Keep `name="order"` and `data-netlify="true"` on it.
- The 8 Stripe payment links live in the `LINKS` variable in `index.html`. Don't remove them.
- Sizes and prices are set once, on the price list in `index.html` (`data-qty` and `data-price`). The amount actually charged is set in Stripe, so change both together.
- Order days, the delivery window and the delivery fee are in the settings at the top of the script.
- Gigi's phone number is set once, on the "Or text" link.

## Subscriptions

The order form works as a normal one-time order. Under the sizes there is a "Subscribe and get cookies on repeat" button; tapping it switches the form to a subscription (every week, every 2 weeks or every 4 weeks), and tapping it again switches back.

- Subscriptions come in 1 dozen and 2 dozen, for pickup or delivery (+$10), at the same prices as one-time orders.
- The 12 recurring Stripe payment links live in `SUBSCRIPTION_LINKS` in `index.html`. Each sends the customer back to the site with `?paid=1` after paying.
- `MANAGE_LINK` is the Stripe customer portal, where subscribers update their card or cancel. It is linked in grey text at the bottom of the page. Cancelling takes effect at the end of the period already paid for.
- Stripe charges on the day the customer signs up and then on that schedule, which is not necessarily the pickup day.
- To hide the Subscribe button, set `SHOW_SUBSCRIPTION` to `false`.
- To offer other sizes or schedules, create the recurring payment link in Stripe, add it to `SUBSCRIPTION_LINKS`, and add a matching "How often" option in the form for a new schedule.

## Deploys

Every push to `main` deploys to Netlify automatically. This repository is public on purpose: Netlify's free plan blocks deploys from more than one contributor on a private repository ("unrecognized Git contributor").
