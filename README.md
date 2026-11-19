# Pentest Portfolio

Penetration testing portfolio of Muhammad Zamzam Fauzan: web application case studies covering reconnaissance, exploitation, privilege escalation and remediation.

All testing shown here was performed in an authorized bootcamp lab environment. Target names, hosts, IPs, credentials and user data are replaced with placeholders.

## Development

```sh
bun install
bun run dev              # local dev server
bun run build            # astro check + static build to dist/
bun test scripts         # tests for the helper scripts
bun run check:sensitive  # fail if target identifiers leak into tracked files or dist/
bun run check:links      # fail if dist/ has broken internal links
```

Deployed on Vercel (`vercel.json` runs `check:sensitive` before every build).

## Before going live

Replace every placeholder, then confirm none remain with
`grep -rn "YOUR-\|you@example.com\|your-project.vercel" src astro.config.ts`:

- `src/consts.ts` and `src/content/authors/zamzam.md` — GitHub, LinkedIn, TryHackMe,
  Hack The Box URLs, contact email, and the `YOUR-CERTIFICATION` lines.
- `astro.config.ts` — set `site` to the real Vercel URL (also used by sitemap, RSS, canonical).
- `src/content/projects/*.md` — the `link` field uses the same site URL.
- Optionally replace `public/static/avatar.svg` with a real photo.

The private source report and raw screenshots live under `docs/source/`, which is
git-ignored (together with `*.pdf` and `screenshots-raw/`) and must never be committed.
The anonymization denylist is `docs/source/denylist.txt` (also git-ignored); add any new
target identifier to it before pasting new material.

## Credits

Built on [astro-erudite](https://github.com/jktrn/astro-erudite) by enscribe (MIT).
