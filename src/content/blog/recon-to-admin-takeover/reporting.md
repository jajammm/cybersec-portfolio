---
title: "Reporting & Remediation"
description: "Prioritized, practical fixes for the exposed .git repository, the coupon SQL injection and the admin-panel IDOR, plus the lessons behind the chain."
date: 2026-11-19
order: 4
tags: ["owasp-top-10"]
authors: ["zamzam"]
---

The three findings in this case study share two root causes: the server trusts input it should validate, and it stores and returns secrets it should protect. The fixes below are ordered by how much risk each removes for the effort.

## Priority order

| Priority | Finding | Fix in one line | Effort |
|---|---|---|---|
| 1 | SQL injection (5) | Parameterized queries everywhere user input reaches SQL | Low |
| 2 | Exposed `.git` (1) | Block `.git` at the web server; purge the public repo and backup | Low |
| 3 | IDOR + plaintext (8) | Object-level authorization; stop returning the password field | Medium |
| 4 | Credential hygiene | Hash all passwords; rotate every exposed credential | Medium |

## Finding 5 — SQL injection

```php title="Before (vulnerable)"
$code = $_POST['code'];
$result = mysqli_query($con, "SELECT * FROM coupons WHERE coupon_code='$code'");
```

```php title="After (parameterized)"
$stmt = $con->prepare('SELECT * FROM coupons WHERE coupon_code = ?');
$stmt->bind_param('s', $_POST['code']);
$stmt->execute();
$result = $stmt->get_result();
```

- Use prepared statements for **every** query that touches user input, not just the coupon lookup. The dump proved the whole database is reachable through this one parameter, so audit every query.
- Give the application's database account only the privileges it needs (`SELECT`/`INSERT`/`UPDATE` on its own schema), so an injection cannot read `information_schema` freely or reach other databases.
- Turn off detailed database errors in production; they fuel error-based injection.
- A WAF rule for common injection patterns is a useful extra layer, not a substitute for the fix.

## Finding 1 — Exposed `.git` repository

:::warning[The repository was public]
Blocking `/.git/` on the server is necessary but not sufficient here: the code and database backup were also pushed to a public GitHub repository. The server rule stops `/.git/` crawling; it does not unpublish what is already on GitHub.
:::

- **Block the directory at the web server.** For Apache:

  ```apache title=".htaccess"
  RedirectMatch 404 /\.git
  ```

  For nginx:

  ```nginx
  location ~ /\.git { deny all; return 404; }
  ```

- **Never commit backups, `.env` files or credentials.** Add them to `.gitignore` and keep database dumps out of the repository entirely.
- **Treat the exposed secrets as burned.** Take down the public repo (or make it private and purge history), and rotate every credential that appeared in the dump, including all admin passwords.

## Finding 8 — IDOR and plaintext password disclosure

- **Enforce object-level authorization** on every endpoint that takes an ID. Before loading `user_profile=<id>`, confirm the logged-in admin is allowed to act on that record.
- **Add real role separation (RBAC).** Distinguish super-admin from ordinary admin instead of treating "logged in" as "allowed to edit any admin."
- **Never send a password back to the client.** The edit form should leave the password field empty and only update it when the admin types a new value.
- **Audit every ID parameter in `/admin_area/`** (`edit_coupon`, `edit_manufacturer`, `user_delete`, `order_delete`, …) for the same pattern; consider non-sequential identifiers for sensitive records.

## Credential hygiene (cuts across all three)

Store passwords with a slow one-way hash and rotate what has leaked:

```php title="Hashing on write and verify"
// On create / change
$hash = password_hash($plain, PASSWORD_ARGON2ID);

// On login
if (password_verify($input, $storedHash)) { /* ok */ }
```

Plaintext storage is what made both the `.git` dump and the IDOR so damaging: in each case the attacker didn't just reach the password column, they could read it. Hashing would not have closed the injection or the IDOR, but it would have blunted their payoff.

## Lessons learned

- **The chain is worse than its links.** Each finding is serious alone; together they take an anonymous visitor to full admin control. Fixing them in priority order breaks the chain early.
- **Information disclosure sets the tone.** The exposed repository turned every later step from guesswork into reading the source. Keeping source and secrets off the public internet is one of the highest-leverage controls here.
- **Validate and authorize on the server.** Both the injection and the IDOR come from trusting client input: a coupon string in one case, a profile ID in the other. Server-side validation and authorization are the common fix.

---

For the remaining findings from the same engagement, including session hijacking, the customer-side IDOR, insecure password reset, stored XSS and the missing transport security that ties them together, see the second case study: [Broken Authentication and Access Control](/blog/broken-auth-and-access-control).
