# Google Pay Setup (Bank of Georgia / "georgiancard" gateway)

The Google Pay button on this site is rendered directly by the Google Pay JS
SDK and submits an encrypted token to the Bank of Georgia order-creation
endpoint via our own backend. BoG calls this their "external" Google Pay flow
— the button lives on the merchant's site, not on BoG's hosted payment page.

## 1. Frontend env

Open `.env`:

```
REACT_APP_GOOGLE_PAY_ENV=TEST
REACT_APP_GOOGLE_PAY_MERCHANT_ID=BCR2DN5TU3P7L4RG
REACT_APP_GOOGLE_PAY_MERCHANT_NAME=Funfinder
REACT_APP_GOOGLE_PAY_GATEWAY=georgiancard
REACT_APP_GOOGLE_PAY_GATEWAY_MERCHANT_ID=BCR2DN4TXKPITITV
REACT_APP_GOOGLE_PAY_PROCESS_URL=/api/v5/payment/google-pay/process
```

- `GATEWAY=georgiancard` and `GATEWAY_MERCHANT_ID=BCR2DN4TXKPITITV` are
  prescribed by BoG. Don't change them unless BoG gives you new values.
- `MERCHANT_ID` is your Google Pay merchant ID (from Google Pay Business
  Console). The fallback value (`BCR2DN5TU3P7L4RG`) is fine for `TEST`.
- Leave `ENV=TEST` until your production Google Pay profile is approved.
  Google forces production rejections if you go live without their review.

Restart `npm start` after editing `.env` (CRA reads it once at boot).

## 2. Tokenization spec sent to Google Pay

The `<GooglePayButton>` component (see `src/components/GooglePayButton.js`)
configures the SDK with:

```js
{
  type: 'PAYMENT_GATEWAY',
  parameters: {
    gateway: 'georgiancard',
    gatewayMerchantId: 'BCR2DN4TXKPITITV'
  }
}
```

This is what BoG's docs require. The encrypted token Google produces is
opaque — we forward it byte-for-byte to BoG.

## 3. Backend endpoint contract

The frontend `POST`s to `REACT_APP_GOOGLE_PAY_PROCESS_URL` (default
`/api/v5/payment/google-pay/process`) with this body:

```json
{
  "order_number": "ORD-...",
  "amount": 150.00,
  "payment_method": ["google_pay"],
  "config": {
    "google_pay": {
      "external": true,
      "google_pay_token": "<verbatim string from Google Pay SDK>"
    }
  },
  "paymentData": { "...": "raw paymentData object for verification" }
}
```

The backend must:

1. Verify the user owns the order (auth/cookie check).
2. Cross-check `amount` against the stored order.
3. Forward to BoG's order-creation endpoint with the body that BoG
   documents — **the `config.google_pay.google_pay_token` string must be
   forwarded with no edits, unescaping, or re-stringification**:

```json
{
  "payment_method": ["google_pay"],
  "config": {
    "google_pay": {
      "external": true,
      "google_pay_token": "{token}"
    }
  },
  "...": "other standard order fields BoG requires (purchase_units, etc.)"
}
```

4. Return BoG's response to the frontend as JSON (forward as-is or wrap):

```json
{
  "id": "<bog order id>",
  "status": "completed",
  "order_details": { "...": "..." },
  "_links": {
    "details": { "href": "https://api.bog.ge/payments/v1/receipt/..." },
    "redirect": { "href": "https://payment.bog.ge/api/3ds/post-form?..." }
  }
}
```

Optionally also include `success: true` so the frontend can short-circuit
without parsing `status` — but it falls back to checking
`status === 'completed' | 'succeeded' | 'paid'`.

## 4. 3DS handling

If BoG returns `_links.redirect.href`, the user must complete 3DS on BoG's
hosted page. The frontend automatically:

1. Marks the order as `Processing` (with `requires3ds: true`).
2. Sets `window.location.href = _links.redirect.href`.
3. After 3DS, BoG redirects the user back to your site with the result. Wire
   the success/cancel callback URLs in the BoG dashboard so the user lands on
   `/payment/success` or `/payment/cancel` — your existing routing handles
   the rest.

## 5. Testing

- **Browser**: Chrome on Android, Chrome on macOS/Windows. Edge works too.
  Safari/Firefox won't render the button — that's expected.
- **Test cards**: enroll in https://pay.google.com/gp/w/u/0/home/signup as a
  developer to get the `TEST` environment, which lets any browser see the
  button and use Google's pre-baked test cards.
- **Live**: switch `REACT_APP_GOOGLE_PAY_ENV=PRODUCTION` only after Google
  approves your business profile *and* you've registered the production
  origin in the Google Pay Business Console.

## 6. Common pitfalls

- **`OR_BIBED_07` from BoG** → `gateway`/`gatewayMerchantId` mismatch. Verify
  exact strings: `georgiancard` and `BCR2DN4TXKPITITV`.
- **`DEVELOPER_ERROR` from Google** → tokenizationSpecification has the wrong
  shape, or your origin isn't whitelisted in the Google Pay console for the
  current environment.
- **Button not rendering** → Google Pay SDK couldn't load (check ad-blockers
  or CSP), or `isReadyToPay` returned false. The component already gates the
  render on the SDK + payment data being ready.
- **Token altered in transit** → never `JSON.parse` / `JSON.stringify` the
  Google Pay token between the SDK and BoG. Pass the raw string only.

## 7. Resolving Google review rejections

When Google reviews your business profile they validate the **Submitted
Web Domain** and the **Business Name** against public records. The error
message they ship is:

> Submitted Web Domain: Similarly, your submitted Web Domain should be
> correctly associated with your business and free from typos or errors.

This is **not** a code bug — `window.location.origin` is what Google uses
at runtime. Fix it inside the Google Pay Business Console, not the React
app. Do this:

1. Open https://pay.google.com/business/console.
2. Open your Funfinder profile → Business profile → Edit.
3. **Web Domain** field — enter the canonical domain only:
   - Correct: `funfinder.ge`
   - Wrong: `https://funfinder.ge`, `funfinder.ge/`, `www.funfinder.ge`
     (unless the site actually serves from `www.`), trailing whitespace,
     a copy-pasted unicode dash, etc.
   - Must be reachable over HTTPS with a valid certificate.
   - Must serve a real homepage, terms of service, and privacy policy at
     that exact host (Google's reviewer will load them).
4. **Business Name** field — must match the business that owns the domain
   (whois / hosting records / your terms-of-service page).
5. **Logo** — upload a clean PNG / SVG; transparent background is fine.
6. Save and click "Submit for review". Reviews are usually answered in
   1–3 business days.

While the profile is in review you can still use Google Pay in `TEST`
environment (`REACT_APP_GOOGLE_PAY_ENV=TEST`) — Google's test environment
ignores the production review state.

Once approved, flip the env var:
```
REACT_APP_GOOGLE_PAY_ENV=PRODUCTION
```
and restart the dev server / redeploy.
