---
title: "Reporting & Remediation"
description: "Prioritized fixes for session expiry, password reset, order IDOR, stored XSS, plaintext storage, price tampering and missing HTTPS, plus root causes."
date: 2026-11-18
order: 4
tags: ["owasp-top-10"]
authors: ["zamzam"]
---

The seven findings in this case study come down to two root causes: the application decides identity and ownership on the client's word, and it stores and transmits secrets without protection. The fixes below are ordered by risk removed per unit of effort.

## Priority order

| Priority | Finding | Fix in one line | Effort |
|---|---|---|---|
| 1 | Insecure password reset (10) | Token-based reset to the registered email; never return the password | Medium |
| 2 | Session never expires (2) | Destroy the session server-side on logout; add expiry and rotation | Low |
| 3 | Missing HTTPS (9) | TLS everywhere, redirect HTTP→HTTPS, `Secure` cookies, HSTS | Low |
| 4 | Order IDOR (7) | Verify order ownership against the session before any action | Low |
| 5 | Stored XSS (4) | Output-encode all user data; set `HttpOnly`; add CSP | Medium |
| 6 | Plaintext storage (6) | Hash with argon2id/bcrypt; force a reset of existing passwords | Medium |
| 7 | Price tampering (3) | Re-read price from the database server-side; ignore client price | Low |

## Finding 10 — Insecure password reset

- Generate a **single-use, time-limited token**, store its hash, and email a reset link to the account's registered address. Never generate a password and send it back in the response.
- Keep the response identical whether or not the email exists, so the endpoint can't be used to enumerate accounts.
- Rate-limit the endpoint, invalidate all active sessions after a successful reset, and notify the account owner.

## Finding 2 — Session expiration

- **Destroy the session server-side on logout** (`session_destroy()` and remove the server-side record), not just clear the client cookie.
- Add an idle and absolute **session timeout**.
- **Regenerate the session ID** on every privilege change (login, logout, password change) so an old value can't be replayed.
- Set `HttpOnly`, `Secure` and `SameSite` on the session cookie (shared with Findings 4 and 9).

## Finding 9 — Missing HTTPS

- Install a valid TLS certificate (Let's Encrypt is free and auto-renews) and **redirect all HTTP to HTTPS** (301) at the web server.
- Mark session cookies `Secure` so they're only sent over TLS.
- Add an **HSTS** header to prevent downgrade / SSL-stripping, and check for mixed content once HTTPS is on.

## Finding 7 — Order IDOR

```php title="The missing check"
// Before showing or acting on an order:
if ($order->customer_id !== $_SESSION['customer_id']) {
    http_response_code(403);
    exit;
}
```

- Verify that the requested `order_id` belongs to the logged-in customer **before** reading or processing anything.
- Apply authorization middleware consistently to every endpoint that reads user-owned data (orders, cart, wishlist, order history).
- Prefer unpredictable identifiers, or keep internal IDs but always check ownership. Add logging and rate limiting to catch sequential ID sweeps.

## Finding 4 — Stored XSS

```php title="Encode on output"
echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
```

- **Output-encode every piece of user data** rendered back to a page (`htmlspecialchars`), on both customer and admin pages.
- Validate input server-side to reject HTML/tags in fields that don't need them.
- Add a **Content Security Policy** as defense in depth.
- Set `HttpOnly` on the session cookie so a successful XSS still can't read `document.cookie`.

## Finding 6 — Plaintext storage

```php
$hash = password_hash($plain, PASSWORD_ARGON2ID);   // on set
password_verify($input, $storedHash);               // on login
```

- Hash all customer and admin passwords with a slow algorithm (argon2id or bcrypt) and a unique per-user salt.
- **Force a password reset for every existing account** after migrating, because the stored plaintext is already exposed and can't be "un-leaked."
- Enforce a minimum password policy on registration and change.

## Finding 3 — Price tampering

```php title="Trust the database, not the form"
$price = $db->getProductPrice($productId);   // server-side lookup
// never: $price = $_POST['product_price'];
```

- Always re-read the price from the database by `product_id` on the server; ignore any price sent by the client.
- Re-validate the total at **every** stage: add-to-cart, checkout, and payment confirmation.
- Alert on orders whose totals fall outside a product's normal range.

## Root causes and lessons

Across both case studies, ten findings reduce to four root causes:

1. **Input validation and authorization are not enforced server-side.** SQL injection, both IDORs, stored XSS and price tampering all come from trusting client-supplied data, whether a coupon string, an object ID, a profile field or a price.
2. **Credential and session management is weak.** Passwords stored in plaintext, a reset flow that skips ownership, and sessions that outlive logout.
3. **Sensitive information is exposed.** The public `.git` directory handed over source and a database backup.
4. **Transport is unprotected.** Plain HTTP sends credentials and cookies in the clear.

The practical lesson is that these multiply. An anonymous attacker can get admin credentials from the `.git` leak or the SQL injection, take over admin accounts through IDOR, and take over any customer with just an email through the reset flow. Fixing the top of each priority list, parameterized queries, server-side authorization, hashing, TLS and real session invalidation, breaks every chain at its root rather than patching individual symptoms.

---

The first half of this engagement, recon through admin takeover, is the companion case study: [From Recon to Admin Takeover](/blog/recon-to-admin-takeover).
