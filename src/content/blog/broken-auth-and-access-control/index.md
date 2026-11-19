---
title: "Broken Authentication and Access Control"
description: "Session replay after logout, customer IDOR, insecure password reset, plaintext storage, stored XSS and cleartext transport on a lab e-commerce app."
date: 2026-11-18
tags: ["web-pentest", "owasp-top-10", "session", "idor", "auth", "xss", "access-control", "business-logic", "tls"]
authors: ["zamzam"]
---

:::important[Authorized lab environment]
Same engagement as [From Recon to Admin Takeover](/blog/recon-to-admin-takeover): the final project of a Red Team bootcamp against an intentionally vulnerable e-commerce app in an authorized, isolated lab. The bootcamp approved publishing this write-up. Target name, hosts, IPs, accounts, credentials and session values are replaced with placeholders.
:::

## Summary for non-technical readers

The [first case study](/blog/recon-to-admin-takeover) showed how an attacker reaches admin control. This one is about the accounts themselves: whose identity the application trusts, and for how long. On ShopLab the answer was "not carefully enough." A stolen session kept working after logout. Any logged-in customer could open and pay for other customers' orders. Anyone who knew a customer's email could reset that customer's password and receive the new one. Passwords were stored and transmitted in the clear.

None of these needs the SQL injection from the first case study. They are independent failures in how the app handles login, sessions and personal data.

## Findings in this case study

This case study covers the seven remaining findings from the engagement. Session hijacking is the deep dive; the rest are summarized with sanitized evidence.

| # | Finding | Severity | CVSS 3.1 |
|---|---|---|---|
| 2 | Improper session expiration — session hijacking via cookie replay | Critical | 9.1 |
| 10 | Account takeover via insecure password reset | Critical | 9.1 |
| 7 | IDOR in `confirm.php` — access and pay other customers' orders | High | 8.1 |
| 4 | Stored XSS in the profile name field | High | 7.6 |
| 6 | Insecure password storage (plaintext) | High | 7.5 |
| 3 | Parameter tampering on add-to-cart price | Moderate | 6.5 |
| 9 | Missing HTTPS — credentials sent in cleartext | Moderate | 6.5 |

## How the findings reinforce each other

These are separate bugs, but they stack into realistic account-takeover paths:

```text
No HTTPS (9)  ──►  session cookie sniffable on the wire
Stored XSS (4) + cookie without HttpOnly  ──►  session cookie stealable in the browser
                        │
                        ▼
            attacker obtains a session cookie
                        │  session never expires server-side (2)
                        ▼
            full access to the victim account, logout doesn't help

Insecure reset (10)  ──►  takeover with only the victim's email, no cookie needed
IDOR confirm.php (7) ──►  reach other customers' orders without takeover at all
Plaintext storage (6) ──►  every leaked password is usable immediately, elsewhere too
```

## How this case study is organized

1. **Introduction** (this page).
2. [Reconnaissance & Scanning](/blog/broken-auth-and-access-control/reconnaissance): the auth and session surface.
3. [Exploitation](/blog/broken-auth-and-access-control/exploitation): session hijacking in depth, plus the reset, IDOR and tampering findings.
4. [Post-Exploitation & Privilege Escalation](/blog/broken-auth-and-access-control/post-exploitation): chaining XSS, plaintext storage and no-HTTPS into account takeover.
5. [Reporting & Remediation](/blog/broken-auth-and-access-control/reporting): fixes, priorities and the engagement's root causes.
