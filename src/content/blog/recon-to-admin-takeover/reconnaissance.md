---
title: "Reconnaissance & Scanning"
description: "Mapping ShopLab's hosting, technology, open ports and content before testing anything, and why an exposed .git directory became the first lead."
date: 2026-11-19
order: 1
tags: ["recon"]
authors: ["zamzam"]
---

The goal of this phase was to understand what ShopLab is made of and where it might be weak, without exploiting anything yet. Each step below answers one question, and the answer decides what I look at next.

:::note[Placeholders]
Commands use `shoplab.lab` and `10.10.10.10` in place of the real lab host and IP. Results are summarized from my original notes and scan output.
:::

## 1. Where is it hosted?

```bash
nslookup shoplab.lab
whois 10.10.10.10
```

The hostname resolved through a dynamic DNS service rather than a normal registrar, and WHOIS on the IP pointed to a cloud VPS provider's Singapore region. WHOIS gave no owner details, because the cloud provider fronts them.

**Why it matters:** this is a single cloud VM, not a corporate network. The attack surface is probably whatever that one VM exposes, so port and content discovery matter more than hunting for sibling hosts.

## 2. What is it built with?

```bash
whatweb http://shoplab.lab
curl -sI http://shoplab.lab
```

| Component | Observation |
|---|---|
| Web server | Apache (`Server` header) |
| Backend | PHP (`PHPSESSID` cookie) |
| Frontend | Bootstrap, HTML5 |
| Contact email | A real-looking contact address exposed in page source (useful for phishing pretexts in a real engagement) |
| Cache headers | `Cache-Control: no-store, no-cache, must-revalidate` with `Expires` in 1981, the PHP session default, so there are session-backed pages |
| Session cookie | `PHPSESSID` **without** the `HttpOnly` flag |

**Why it matters:** PHP with a hand-rolled storefront suggests string-built SQL queries, so injection testing goes high on the list. A session cookie without `HttpOnly` means any XSS I find can steal sessions. That lead is followed up in the [second case study](/blog/broken-auth-and-access-control).

## 3. What is listening?

```bash
nmap -sV shoplab.lab
```

| Port | Service | Notes |
|---|---|---|
| 22 | SSH | OpenSSH 8.9p1 (Ubuntu) |
| 80 | HTTP | Apache, the shop itself |
| 443 | HTTP(S) | `-sV` reports Apache; the `http-title` script later showed a default nginx welcome page. No real TLS site |
| 888 | HTTP | Apache, non-standard port |
| 7800 | HTTP | nginx, non-standard port |

**Why it matters:** the shop only runs on plain HTTP (port 80), so credentials travel unencrypted. Ports 888 and 7800 are non-standard web ports that often host hosting-control panels or internal tools. I noted them, but they were out of the shop's scope and my main path didn't need them.

## 4. What content exists that isn't linked?

I ran two brute-force tools so each could check the other's results. Gobuster was better at hidden files, and dirb's recursion went deeper into `/admin_area/`.

```bash
gobuster dir -u http://shoplab.lab -w common.txt   # 4,613-entry common-words list
dirb http://shoplab.lab
```

```text title="gobuster (excerpt, host replaced)"
.hta                 (Status: 403) [Size: 270]
.git/HEAD            (Status: 200) [Size: 22]
.htpasswd            (Status: 403) [Size: 270]
.htaccess            (Status: 403) [Size: 270]
.svn/entries         (Status: 403) [Size: 270]
admin_area           (Status: 301) [Size: 319] [--> http://shoplab.lab/admin_area/]
customer             (Status: 301) [Size: 333] [--> http://shoplab.lab/customer/?pro_id=customer]
functions            (Status: 301) [Size: 335] [--> http://shoplab.lab/functions/?pro_id=functions]
includes             (Status: 301) [Size: 333] [--> http://shoplab.lab/includes/?pro_id=includes]
index.php            (Status: 200) [Size: 13197]
server-status        (Status: 403) [Size: 270]
```

| Path | Status | What it tells me |
|---|---|---|
| `/admin_area/` and `/admin_area/index.php` | 301 / 200 | Admin login is reachable from the internet |
| `/admin_area/includes/`, `/admin_area/product_images/` | 301 | Admin backend logic and an upload folder |
| `/customer/`, `/functions/`, `/includes/` … | 301 → `?pro_id=<dirname>` | Redirect parameter mirrors the directory name, a hint of dynamic file inclusion |
| **`/.git/HEAD`** | **200** | **The Git repository is publicly readable** |
| `/.svn/`, `/.htaccess`, `/.htpasswd` | 403 | Exist but are blocked |
| `/server-status`, `/server-info` | 403 | Apache status modules enabled but blocked |

The `/.git/HEAD` result changed my priorities. A readable `.git` directory usually means the full source code, and often secrets, can be rebuilt from the server. That is the cheapest possible path to understanding the application, so it went first. The `pro_id` behavior went on the list for later.

## 5. How does the app behave for a real user?

With Burp Suite as a proxy I used the site as a customer and as an admin, and logged every endpoint and parameter. These were the ones worth testing:

| Area | Endpoint | Parameters | Why it's interesting |
|---|---|---|---|
| Cart | `POST /cart.php` | `quantity-<id>`, `code`, `apply_coupon` | Coupon codes are looked up in the database |
| Product | `POST /<product-slug>` | `product_qty`, `product_price`, `add_cart` | Price sent from the client |
| Checkout | `GET/POST /customer/confirm.php` | `order_id`, `due_amount`, `invoice_no` | Sequential order IDs |
| Account | `POST /customer/my_account.php?edit_account` | `c_name`, `c_email`, … | Stored user input |
| Admin | `/admin_area/index.php?user_profile=<id>` | `admin_id`, `admin_name`, `admin_pass`, … | Sequential admin IDs, password field in the form |
| Admin | `/admin_area/index.php?edit_coupon=<id>`, `?edit_manufacturer=<id>`, `?user_delete=<id>` | numeric IDs | Same ID pattern across the admin panel |

**Output of this phase:** a ranked list of leads. First the exposed `.git`, then the coupon `code` parameter (database lookup, user-controlled), then the sequential IDs everywhere in the admin panel. The next page follows the first two.

Next: [Exploitation](/blog/recon-to-admin-takeover/exploitation)
