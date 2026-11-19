import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { findBrokenLinks } from "./check-links.mjs"

let dist

beforeAll(() => {
  dist = mkdtempSync(join(tmpdir(), "links-"))
  mkdirSync(join(dist, "blog/post"), { recursive: true })
  writeFileSync(join(dist, "style.css"), "")
  writeFileSync(join(dist, "blog/post/index.html"), '<img src="../../style.css">')
  writeFileSync(
    join(dist, "index.html"),
    `<a href="/blog/post">ok</a>
     <a href="/blog/post/#intro">ok hash</a>
     <link href="/style.css?v=1">
     <a href="https://example.com">external</a>
     <a href="mailto:you@example.com">mail</a>
     <a href="#top">anchor</a>
     <a href="/tidak-ada">broken</a>
     <img src="/missing.png">`,
  )
})

afterAll(() => rmSync(dist, { recursive: true, force: true }))

describe("findBrokenLinks", () => {
  test("reports only internal links with no matching file", () => {
    expect(findBrokenLinks(dist)).toEqual([
      { page: "index.html", url: "/tidak-ada" },
      { page: "index.html", url: "/missing.png" },
    ])
  })
})
