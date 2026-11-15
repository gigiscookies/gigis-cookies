# Gigi's Cookies

The ordering website for Gigi's Cookies, live at https://gigiscookies.netlify.app.

- `index.html` is the whole site (styles, photo and scripts are inside it).
- Netlify deploys it automatically whenever this repository changes.
- The order form is a Netlify form named `order`. Keep `name="order"` and `data-netlify="true"` on it.
- The 8 Stripe payment links live in the `LINKS` variable in `index.html`. Don't remove them.
- Sizes and prices are set once, on the price list in `index.html` (`data-qty` and `data-price`). The amount actually charged is set in Stripe, so change both together.
- Order days, the delivery window and the delivery fee are in the settings at the top of the script.
- Gigi's phone number is set once, on the "Or text" link.
