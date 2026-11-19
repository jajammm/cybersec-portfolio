import { describe, expect, test } from "bun:test"
import { DEFAULT_PATTERNS, findLeaks, parseDenylist } from "./check-sensitive.mjs"

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
