// Fails when a built page links to an internal path that has no file in dist/.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, posix, relative } from "node:path"

const ATTR = /\s(?:href|src)="([^"]*)"/g
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return htmlFiles(p)
    return p.endsWith(".html") ? [p] : []
  })
}

function exists(dist, path) {
  const target = join(dist, decodeURIComponent(path))
  return [target, join(target, "index.html"), `${target}.html`].some(
    (p) => existsSync(p) && (statSync(p).isFile() || existsSync(join(p, "index.html"))),
  )
}

export function findBrokenLinks(dist) {
  const broken = []
  for (const file of htmlFiles(dist)) {
    const page = relative(dist, file).replaceAll("\\", "/")
    const pageDir = posix.dirname(`/${page}`)
    for (const [, url] of readFileSync(file, "utf8").matchAll(ATTR)) {
      if (!url || EXTERNAL.test(url)) continue
      const path = url.split(/[?#]/)[0]
      if (!path) continue
      const resolved = path.startsWith("/") ? path : posix.join(pageDir, path)
      if (!exists(dist, resolved)) broken.push({ page, url })
    }
  }
  return broken
}

if (import.meta.main) {
  if (!existsSync("dist")) {
    console.error("dist/ not found: run bun run build first")
    process.exit(1)
  }
  const broken = findBrokenLinks("dist")
  for (const b of broken) console.log(`${b.page}: ${b.url}`)
  if (broken.length) {
    console.error(`\n${broken.length} broken internal link(s).`)
    process.exit(1)
  }
  console.log("check:links ok")
}
