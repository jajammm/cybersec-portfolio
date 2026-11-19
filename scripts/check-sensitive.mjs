// Fails when tracked files, their names, or dist/ contain target identifiers.
// Patterns come from docs/source/denylist.txt (git-ignored, so the list itself
// never ships) plus generic defaults that also run on Vercel.
import { execSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

// Strings intentionally published (authorized lab target identity). They are
// stripped before matching, so the generic rules still flag ANY OTHER host/IP.
export const ALLOW = ["bimbycart.duckdns.org", "188.166.209.84"]

function stripAllowed(s) {
  for (const a of ALLOW) s = s.split(a).join("")
  return s
}

const PRIVATE_IPV4 = /^(10|127)\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|^0\.0\.0\.0$/
// Lookarounds skip longer dotted runs such as SVG path data.
const ipv4 = /(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])/g

export const DEFAULT_PATTERNS = [
  { source: "duckdns", test: (s) => /duckdns/i.test(s) },
  { source: "@gmail\\.com", test: (s) => /@gmail\.com/i.test(s) },
  { source: "PHPSESSID=<value>", test: (s) => /PHPSESSID=[A-Za-z0-9]{10,}/.test(s) },
  {
    source: "public IPv4",
    test: (s) =>
      (s.match(ipv4) ?? []).some(
        (ip) => ip.split(".").every((o) => Number(o) <= 255) && !PRIVATE_IPV4.test(ip),
      ),
  },
]

export function parseDenylist(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((source) => {
      const re = new RegExp(source, "i")
      return { source, test: (s) => re.test(s) }
    })
}

export function findLeaks(file, text, rawPatterns) {
  const seen = new Set()
  const patterns = rawPatterns.filter((p) => !seen.has(p.source.toLowerCase()) && seen.add(p.source.toLowerCase()))
  const leaks = []
  const cleanFile = stripAllowed(file)
  for (const p of patterns) if (p.test(cleanFile)) leaks.push({ file, line: 0, pattern: p.source })
  text.split(/\r?\n/).forEach((lineText, i) => {
    const clean = stripAllowed(lineText)
    for (const p of patterns) if (p.test(clean)) leaks.push({ file, line: i + 1, pattern: p.source })
  })
  return leaks
}

const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|pdf)$/i
// The scanner and its tests contain the generic patterns by necessity.
const SELF = /^scripts\/check-sensitive(\.test)?\.mjs$/

const SKIP_DIRS = new Set(["node_modules", ".git", ".astro", ".vercel", "dist"])

function walk(dir, skip = new Set()) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (!statSync(p).isDirectory()) return [p.replaceAll("\\", "/")]
    return skip.has(name) ? [] : walk(p, skip)
  })
}

// Vercel builds may run without .git, so fall back to walking the tree.
export function listSourceFiles(root = ".") {
  try {
    return execSync("git ls-files --cached --others --exclude-standard", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .filter(Boolean)
  } catch {
    return walk(root, SKIP_DIRS).map((p) => relative(root, p).replaceAll("\\", "/"))
  }
}

function main() {
  const denyPath = "docs/source/denylist.txt"
  const patterns = [...DEFAULT_PATTERNS]
  if (existsSync(denyPath)) patterns.push(...parseDenylist(readFileSync(denyPath, "utf8")))
  else console.warn(`warning: ${denyPath} not found, using generic patterns only`)

  const files = listSourceFiles()
  if (existsSync("dist")) files.push(...walk("dist"))

  const leaks = files.flatMap((file) => {
    if (!existsSync(file)) return []
    const text = BINARY.test(file) || SELF.test(file) ? "" : readFileSync(file, "utf8")
    return findLeaks(file, text, patterns)
  })

  for (const l of leaks) console.log(`${l.file}:${l.line}: ${l.pattern}`)
  if (leaks.length) {
    console.error(`\n${leaks.length} sensitive match(es) found.`)
    process.exit(1)
  }
  console.log(`check:sensitive ok (${files.length} files, ${patterns.length} patterns)`)
}

if (import.meta.main) main()
