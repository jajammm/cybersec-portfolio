import { describe, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ALLOW, DEFAULT_PATTERNS, findLeaks, listSourceFiles, parseDenylist } from "./check-sensitive.mjs"

describe("allowlist", () => {
  test("intentionally published target host and IP are not flagged", () => {
    const text = `bimbycart.duckdns.org\n188.166.209.84`
    expect(findLeaks("f.md", text, DEFAULT_PATTERNS)).toEqual([])
    expect(ALLOW).toContain("bimbycart.duckdns.org")
  })

  test("a different duckdns host or public IP is still flagged", () => {
    const lines = findLeaks("f.md", "evil.duckdns.org\n9.9.9.9", DEFAULT_PATTERNS).map((l) => l.line)
    expect(lines).toEqual([1, 2])
  })

  test("owner's own email passes but another gmail is still flagged", () => {
    expect(findLeaks("f.md", "mhmmdzamzamfauzan@gmail.com", DEFAULT_PATTERNS)).toEqual([])
    expect(findLeaks("f.md", "victim@gmail.com", DEFAULT_PATTERNS).map((l) => l.line)).toEqual([1])
  })
})

describe("listSourceFiles", () => {
  test("outside a git repo it walks the tree, skipping node_modules, .git and .astro", () => {
    const root = mkdtempSync(join(tmpdir(), "scan-"))
    for (const d of ["src", "node_modules/x", ".astro"]) mkdirSync(join(root, d), { recursive: true })
    writeFileSync(join(root, "src/a.md"), "")
    writeFileSync(join(root, "node_modules/x/b.js"), "")
    writeFileSync(join(root, ".astro/c.json"), "")
    expect(listSourceFiles(root)).toEqual(["src/a.md"])
    rmSync(root, { recursive: true, force: true })
  })
})

describe("findLeaks", () => {
  test("reports file and line of a denylisted string", () => {
    const patterns = parseDenylist("# comment\n\nsecretshop\n")
    const leaks = findLeaks("tmp-leak.md", "ok\nvisit SecretShop now", patterns)
    expect(leaks).toEqual([{ file: "tmp-leak.md", line: 2, pattern: "secretshop" }])
  })

  test("flags a denylisted string in the file name itself", () => {
    const patterns = parseDenylist("secretshop")
    const leaks = findLeaks("assets/secretshop-login.png", "", patterns)
    expect(leaks).toEqual([{ file: "assets/secretshop-login.png", line: 0, pattern: "secretshop" }])
  })

  test("default patterns catch duckdns, gmail and a real-looking session id", () => {
    const text = "a.duckdns.org\nx@gmail.com\nPHPSESSID=abcdef0123456789"
    const lines = findLeaks("f.md", text, DEFAULT_PATTERNS).map((l) => l.line)
    expect(lines).toEqual([1, 2, 3])
  })

  test("default patterns flag public IPv4 but allow lab placeholders", () => {
    const text = "10.10.10.10\n127.0.0.1\n192.168.1.5\n8.8.4.4"
    const lines = findLeaks("f.md", text, DEFAULT_PATTERNS).map((l) => l.line)
    expect(lines).toEqual([4])
  })

  test("IPv4 rule ignores dotted number runs in SVG path data", () => {
    const text = 'd="M1 .315.21.69.825.57 .529.34.888.455 1.162.81.808l.944"'
    expect(findLeaks("icon.svg", text, DEFAULT_PATTERNS)).toEqual([])
  })

  test("a pattern listed twice is reported once per line", () => {
    const patterns = [...DEFAULT_PATTERNS, ...parseDenylist("duckdns")]
    expect(findLeaks("f.md", "a.duckdns.org", patterns)).toHaveLength(1)
  })

  test("clean text produces no leaks", () => {
    expect(findLeaks("f.md", "ShopLab at shoplab.lab with <SESSION_ID>", DEFAULT_PATTERNS)).toEqual([])
  })
})
