# Apple Pay Setup (Bank of Georgia external integration)

The Apple Pay button on this site uses Apple's native `ApplePaySession` JS
API and submits the encrypted payment token to Bank of Georgia's
order-creation endpoint via our backend. BoG calls this their "external"
Apple Pay flow — the button lives on the merchant's site, not on BoG's
hosted payment page.

You **do not need** an Apple Developer Program membership for this flow.
BoG acts as the registered Apple Pay merchant and handles the cryptography
on their side. This is the same model Stripe / Adyen / Braintree use.

## 0. Apple's standard requirements vs. this flow

Apple's documentation lists four setup steps for adding Apple Pay to a
website:

| Apple step | Direct flow (your own merchant ID) | BoG external flow (this project) |
| --- | --- | --- |
| 1. Register a merchant ID | You do, in Apple Developer | **BoG already did, with their own ID** |
| 2. Payment Processing Certificate | You generate the CSR & store the private key | **Not needed — BoG processes the token** |
| 3. Apple Pay Merchant Identity Certificate | You generate, store, and use it for `onvalidatemerchant` mTLS | **BoG holds & uses it server-side** |
| 4. Verify your domain | You upload the file generated under your merchant ID | **You upload BoG's file (provided in their docs)** |

Concretely, on your side you only need to:
1. Place the validation file BoG gives you under `/.well-known/`.
2. Email BoG your domain + API Public Key so they associate them.
3. Configure the env vars and backend endpoints described below.

If you ever decide to leave the BoG external flow and run Apple Pay
yourself (for example to use a different processor), then you'd circle
back to Apple's full four-step setup. That's not required today.

## 1. What BoG handles vs. what you handle

BoG provides:
- The validation certificate / domain-association file you serve from
  `/.well-known/apple-developer-merchantid-domain-association`.
- The merchant identity certificate used (server-side) to validate the
  Apple Pay session. This stays on BoG's side; we never see the private key.
- The merchant ID registration with Apple — your site rides on it via the
  external flow.

You provide:
- The domain you'll host the button on (e.g. `funfinder.ge`).
- Your **API Public Key** for the BoG account.

Email both to `ecommercemerchants@bog.ge` after the certificate is in place.

## 2. Frontend env

Open `.env`:

```
REACT_APP_APPLE_PAY_MERCHANT_ID=merchant.com.funfinder.ge
REACT_APP_APPLE_PAY_DISPLAY_NAME=Funfinder
REACT_APP_APPLE_PAY_DOMAIN=funfinder.ge
REACT_APP_APPLE_PAY_COUNTRY=GE
REACT_APP_APPLE_PAY_CURRENCY=GEL
REACT_APP_APPLE_PAY_VALIDATE_URL=/api/v5/payment/apple-pay/validate-merchant
REACT_APP_APPLE_PAY_PROCESS_URL=/api/v5/payment/apple-pay/process
```

`MERCHANT_ID` is the value passed to `ApplePaySession.canMakePaymentsWithActiveCard`
and the `merchantIdentifier` in the merchant validation request — confirm
the exact string with BoG once they reply to your email.

Restart `npm start` after editing `.env` (CRA reads it once at boot).

## 3. Domain association file

1. Download the certificate from the link in BoG's documentation
   ("ჩამოტვირთეთ სერტიფიკატი აქ").
2. Replace `public/.well-known/apple-developer-merchantid-domain-association`
   with the file contents (keep the exact filename, no extension).
3. Deploy. Verify the file is reachable at
   `https://<your-domain>/.well-known/apple-developer-merchantid-domain-association`
   (HTTPS, no redirects).
4. Email `ecommercemerchants@bog.ge` with your API Public Key + the domain.

## 4. Backend endpoints

The frontend calls two endpoints. Both must run on the verified domain
over HTTPS. Both are proxies/wrappers around BoG's API.

### `POST /api/v5/payment/apple-pay/validate-merchant`

Request body:
```json
{
  "validationURL": "https://apple-pay-gateway.apple.com/...",
  "merchantIdentifier": "merchant.com.funfinder.ge",
  "displayName": "Funfinder",
  "domainName": "funfinder.ge",
  "orderNumber": "FF-2026-00123",
  "amount": "150.00"
}
```

Backend must call BoG's merchant-validation API (or call Apple directly
with BoG's identity certificate, depending on which BoG exposes) and
return either:

```json
{ "merchantSession": { /* Apple's response object */ } }
```
or just the raw object — the frontend accepts both.

### `POST /api/v5/payment/apple-pay/process`

Request body sent by the frontend:
```json
{
  "order_number": "FF-2026-00123",
  "amount": "150.00",
  "payment_method": ["apple_pay"],
  "config": {
    "apple_pay": {
      "external": true
    }
  },
  "paymentToken": { /* event.payment.token from ApplePaySession */ },
  "billingContact": { /* Apple billing contact */ },
  "shippingContact": { /* Apple shipping contact */ }
}
```

Backend forwards to BoG's standard order-creation endpoint with the body
BoG documents, **including the verbatim `paymentToken` and the required
fields:**

```json
{
  "payment_method": ["apple_pay"],
  "config": {
    "apple_pay": {
      "external": true
    }
  },
  "...": "other standard order fields BoG requires"
}
```

The BoG payment token data (the encrypted `paymentToken`) is forwarded
without modification — exactly as Apple emitted it.

Backend returns BoG's response to the frontend (forward as-is or wrap):

```json
{
  "id": "<bog payment id>",
  "result": { /* Apple's payment-initiation response */ },
  "_links": {
    "accept": { "href": "https://api.bog.ge/payments/v1/.../accept" }
  }
}
```

## 5. Confirmation step

If `_links.accept.href` is present, the frontend automatically `POST`s to
that URL with credentials to finalize the Apple Pay payment, then calls
`session.completePayment(STATUS_SUCCESS)` so the Apple Pay sheet closes
with the success animation. If the accept call fails, the sheet shows
the failure animation and the order is marked `Failed`.

## 6. Testing

- Apple Pay only renders on **Safari running on a Mac/iPhone/iPad** with
  a card in Wallet. Other browsers will see "Apple Pay unavailable" — that's
  expected.
- **Sandbox cards**: add a sandbox tester Apple ID and a test card from
  https://developer.apple.com/apple-pay/sandbox-testing.
- **Domain verification**: in dev (`localhost`), Apple skips domain
  verification but the merchant-validation backend call will only succeed
  against a domain BoG has registered. Use a tunnel (ngrok / Cloudflare
  Tunnel) pointed at your verified domain to test the full flow.

## 7. Common pitfalls

- **`InvalidAccessError` from ApplePaySession** → page is loaded over HTTP
  or inside a cross-origin iframe. Fix: HTTPS + same-origin frame.
- **"Domain not verified"** → `/.well-known/...` file is missing, redirected,
  or the domain isn't yet associated by BoG (email step pending).
- **`canMakePaymentsWithActiveCard` returns false on the test device** →
  no card in Wallet, or `merchantId` doesn't match the value BoG registered
  for your account.
- **Backend returns 403 from BoG** → API Public Key not yet linked with
  your domain on BoG's side (email step pending).
- **Token altered in transit** → never `JSON.parse` / `JSON.stringify` the
  Apple Pay `paymentToken` between the frontend and BoG. Pass the raw
  object only.
