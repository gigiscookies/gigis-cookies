# Gigi's Cookies

The ordering website for Gigi's Cookies, live at https://gigiscookies.netlify.app.

- `index.html` is the whole site (styles, photo and scripts are inside it).
- Netlify deploys it automatically whenever this repository changes.
- The order form is a Netlify form named `order`. Keep `name="order"` and `data-netlify="true"` on it.
- The 8 Stripe payment links live in the `LINKS` variable in `index.html`. Don't remove them.
- Sizes and prices are set once, on the price list in `index.html` (`data-qty` and `data-price`). The amount actually charged is set in Stripe, so change both together.
- Order days, the delivery window and the delivery fee are in the settings at the top of the script.
- Gigi's phone number is set once, on the "Or text" link.

## Subscriptions (Stripe not connected yet)

The order form works as a normal one-time order. Under the sizes there is a "Subscribe and get cookies on repeat" button; tapping it switches the form to a subscription (every 2 weeks or every 4 weeks), and tapping it again switches back.

Until Stripe is set up, trying to pay for a subscription shows "Subscriptions aren't open yet" and takes no payment. To hide the button from customers in the meantime, set `SHOW_SUBSCRIPTION` to `false` in `index.html`.

To connect it, in Stripe:

1. Create recurring prices for 1 dozen and 2 dozen, for pickup and for delivery (+$10), billed every 2 weeks and every 4 weeks. That is 8 prices.
2. Create a payment link for each, and set each one to send the customer back to `https://gigiscookies.netlify.app/?paid=1` after paying.
3. Paste the 8 links into `SUBSCRIPTION_LINKS` in `index.html`.
4. Turn on the Stripe customer portal and paste its link into `MANAGE_LINK`. This shows a "Manage or cancel a subscription" link.

To offer other sizes or schedules, add them to `SUBSCRIPTION_LINKS` (and add a matching "How often" option in the form for a new schedule).
