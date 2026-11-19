---
title: "Reconnaissance & Scanning"
description: "Mapping ShopLab's authentication, session and checkout flows, and the signals from the first case study that pointed at weak session handling."
date: 2026-11-18
order: 1
tags: ["recon"]
authors: ["zamzam"]
---

The general reconnaissance for this target, hosting, technology, ports and content discovery, is covered in the [first case study](/blog/recon-to-admin-takeover/reconnaissance). This page focuses on the parts of the attack surface that matter for authentication and access control, and on two signals from that earlier phase that predicted the findings here.

## Signals carried over from recon

Two observations from the technology fingerprinting pointed straight at session weaknesses before I tested anything:

| Observation | What it predicted |
|---|---|
| `PHPSESSID` cookie **without** `HttpOnly` | If any XSS exists, `document.cookie` (and the session) is readable by script → [Finding 4](/blog/broken-auth-and-access-control/post-exploitation) |
| Shop served over plain **HTTP only**, no TLS | Credentials and session cookies travel in cleartext → [Finding 9](/blog/broken-auth-and-access-control/post-exploitation) |

Both are missing cookie/transport protections, and both make a stolen session easier to get. That raised the priority of testing what happens to a session after logout.

## The authentication and session surface

Using the app as a registered customer with Burp Suite recording traffic, I mapped the flows where identity and ownership are decided:

| Flow | Endpoint | Parameters | Question I wanted answered |
|---|---|---|---|
| Login | `POST /login.php` | `c_email`, `c_pass` | Are credentials sent in cleartext? |
| Logout | `GET /logout.php` | – | Is the session destroyed server-side, or only the cookie cleared? |
| Session | `PHPSESSID` cookie | – | Does the same cookie still authenticate after logout? |
| Edit profile | `POST /customer/my_account.php?edit_account` | `c_name`, `c_email`, … | Is stored input encoded on output? |
| Order confirm | `GET/POST /customer/confirm.php` | `order_id`, `due_amount`, `invoice_no` | Is order ownership checked? |
| Add to cart | `POST /<product-slug>` | `product_price`, `product_qty` | Is the price trusted from the client? |
| Forgot password | `POST /functions/fetch_password.php` | `email` | Is account ownership verified before reset? |

Three patterns stood out across these flows:

- **Sequential integer IDs** on `order_id` (and, in the admin panel, on `user_profile`, `edit_coupon` and others). Easy to guess and iterate, which is the precondition for IDOR.
- **Client-supplied values the server should own**, like `product_price` in add-to-cart and `due_amount` in order confirmation.
- **A password-reset endpoint that takes only an email.** No token, no confirmation step visible in the request.

## What this phase produced

A focused test list: confirm whether the session survives logout (the deep dive), then check each of the single-parameter trust problems above, the reset flow, output encoding on the profile field, and whether credentials are visible on the wire. The next page starts with the session test.

Next: [Exploitation](/blog/broken-auth-and-access-control/exploitation)
