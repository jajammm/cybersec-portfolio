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
    "Penetration testing portfolio: web application case studies with recon, exploitation, privilege escalation and remediation.",
  locale: "en-US",
  dir: "ltr",
  defaultPageImage: "/static/opengraph-image.png",
  defaultPostImage: "/static/1200x630.png",
} as const

export const NAVIGATION = [
  { href: "/blog", label: "Case Studies" },
  { href: "/projects", label: "Projects" },
  { href: "/authors/zamzam", label: "About" },
]

// Placeholders: replace every YOUR-... value before going live.
export const SOCIALS: { href: string; label: string; icon: SvgComponent }[] = [
  { href: "https://github.com/YOUR-USERNAME", label: "GitHub", icon: GitHub },
  { href: "https://www.linkedin.com/in/YOUR-HANDLE", label: "LinkedIn", icon: LinkedIn },
  { href: "https://tryhackme.com/p/YOUR-HANDLE", label: "TryHackMe", icon: TryHackMe },
  { href: "https://app.hackthebox.com/profile/YOUR-ID", label: "Hack The Box", icon: HackTheBox },
  { href: "mailto:you@example.com", label: "Email", icon: Email },
  { href: "/rss.xml", label: "RSS", icon: RSS },
]
