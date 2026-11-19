---
title: "From Recon to Admin Takeover on a Lab E-commerce App"
description: "An exposed .git directory, a SQL injection in the coupon field and an IDOR in the admin panel, chained from zero access to control of every admin account."
date: 2026-11-19
tags: ["web-pentest", "owasp-top-10", "recon", "information-disclosure", "sqli", "idor", "access-control"]
authors: ["zamzam"]
---

:::important[Authorized lab environment]
This assessment was the final project of a Red Team bootcamp. The target was an intentionally vulnerable e-commerce application run by the bootcamp as an isolated, authorized test target. The bootcamp approved publishing this write-up. The application name, hostnames, IP addresses, accounts, credentials and session values are replaced with placeholders such as `shoplab.lab`, `10.10.10.10` and `<REDACTED>`.
:::

## Summary for non-technical readers

ShopLab is a small online shop. It stores customer names, emails, phone numbers, addresses and payment records. I started with no account and no inside knowledge. Within the test window I could read the shop's entire database and log in as its administrator. From there I could take over every other administrator account, including reading their passwords.

Three weaknesses made that possible, and each one alone would justify an urgent fix:

1. The site published its own source code and a database backup by accident.
2. The coupon code box let me send commands straight to the database.
3. The admin panel trusted a number in the URL to decide whose profile to show and edit.

All three are cheap to fix. The [Reporting](/blog/recon-to-admin-takeover/reporting) section lists the fixes in priority order.

## Engagement at a glance

| | |
|---|---|
| Target | ShopLab, a PHP e-commerce app (customer storefront + `/admin_area/`) |
| Approach | Black box: no source code or credentials provided at the start |
| Roles tested | Unauthenticated guest, customer, admin |
| Methodology | OWASP Web Security Testing Guide, CVSS 3.1 scoring |
| Tools | Nmap, WhatWeb, curl, Gobuster, dirb, Burp Suite, sqlmap |
| Allowed | Active scanning, manual exploitation, proof of concept |
| Not allowed | Denial of service, permanent data destruction, defacement |
| Test window | 2–10 November 2026 |

## Findings in this case study

The full engagement produced 10 findings. This case study follows the three that form the path to admin takeover. The other seven are covered in [Broken Authentication and Access Control](/blog/broken-auth-and-access-control).

| # | Finding | Severity | CVSS 3.1 |
|---|---|---|---|
| 1 | Exposed `.git` repository with source code and database backup | High | 7.5 |
| 5 | SQL injection in the coupon `code` parameter of `POST /cart.php` | Critical | 9.8 |
| 8 | IDOR in admin `user_profile`: admin-to-admin takeover and password disclosure | Critical | 9.6 |

## Attack chain

```text
[no access]
   │  Nmap http-git script finds /.git/ and its public remote
   ▼
[source code + database backup]          Finding 1
   │  coupon field in POST /cart.php is concatenated into SQL
   ▼
[full database read via sqlmap]          Finding 5
   │  admins table stores passwords in plaintext
   ▼
[logged in as Administrator]
   │  /admin_area/index.php?user_profile=<id> has no ownership check
   ▼
[read and modify any admin profile]      Finding 8
```

## How this case study is organized

1. **Introduction** (this page): scope, rules and the short version.
2. [Reconnaissance & Scanning](/blog/recon-to-admin-takeover/reconnaissance): mapping the attack surface, and why the `.git` directory stood out.
3. [Exploitation](/blog/recon-to-admin-takeover/exploitation): the exposed repository and the SQL injection, with proof of concept.
4. [Post-Exploitation & Privilege Escalation](/blog/recon-to-admin-takeover/post-exploitation): from one admin login to every admin account.
5. [Reporting & Remediation](/blog/recon-to-admin-takeover/reporting): fixes, priorities and lessons learned.
