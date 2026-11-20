import type { SvgComponent } from "astro/types"
import Email from "@/assets/icons/email.svg"
import GitHub from "@/assets/icons/github.svg"
import HackTheBox from "@/assets/icons/hackthebox.svg"
import LinkedIn from "@/assets/icons/linkedin.svg"
import RSS from "@/assets/icons/rss.svg"
import TryHackMe from "@/assets/icons/tryhackme.svg"

export const SITE = {
  title: "Muhammad Zamzam Fauzan",
  description:
    "Learning cybersecurity: a web application penetration test from the Dibimbing bootcamp offensive phase, now moving into blue team security analysis.",
  locale: "en-US",
  dir: "ltr",
  defaultPageImage: "/static/opengraph-image.png",
  defaultPostImage: "/static/1200x630.png",
} as const

export const NAVIGATION = [
  { href: "/blog", label: "Case Studies" },
  // Re-add when src/content/projects/ has an entry (tool, CTF write-up, etc.):
  // { href: "/projects", label: "Projects" },
  { href: "/authors/zamzam", label: "About" },
]

// Site URL (astro.config.ts) is still the only placeholder: set it after the Vercel project exists.
export const SOCIALS: { href: string; label: string; icon: SvgComponent }[] = [
  { href: "https://github.com/jajammm", label: "GitHub", icon: GitHub },
  { href: "https://www.linkedin.com/in/m-zamzam-fauzan/", label: "LinkedIn", icon: LinkedIn },
  { href: "https://tryhackme.com/p/0xjajamm", label: "TryHackMe", icon: TryHackMe },
  {
    href: "https://profile.hackthebox.com/profile/01a1cf36-0c53-714a-b671-d5f02551062e",
    label: "Hack The Box",
    icon: HackTheBox,
  },
  { href: "mailto:mhmmdzamzamfauzan@gmail.com", label: "Email", icon: Email },
  { href: "/rss.xml", label: "RSS", icon: RSS },
]
