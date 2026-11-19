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

## Credits

Built on [astro-erudite](https://github.com/jktrn/astro-erudite) by enscribe (MIT).
