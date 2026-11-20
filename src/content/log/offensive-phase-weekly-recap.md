---
title: "Offensive phase bootcamp: a weekly recap"
description: "Week-by-week recap of what I studied in the Dibimbing bootcamp offensive phase — from Linux and networking to web exploitation and the final project."
date: 2026-11-07
tags: ["offensive", "red-team", "bootcamp", "learning", "recap"]
---

A look back at the offensive phase of the **Dibimbing** bootcamp, week by week. I wrote this as a recap after finishing the phase (final project presented 7 November 2026), so it's honest hindsight, not notes taken live. It's the red-team counterpart to my [blue team log](/log/starting-blue-team), and it's the curriculum that built up to my final project: [Dibimbing-Shop — 10 findings](/blog/dibimbing-shop-web-pentest).

Each week below lists what was covered. Topics marked *extra class* were optional sessions.

## Week 1 · 8–9 August 2026 — Foundations & Linux

- **Tool installation** — setting up the lab environment with the mentor.
- **Linux fundamentals** — Linux OS concepts, Kali Linux overview, filesystem structure, partitions.
- **Introduction to cyber security** — the CIA triad, the current threat landscape, and red vs blue career paths.
- **Kali Linux basics** — CLI navigation, file/folder manipulation, installing tools.

## Week 2 · 15–16 August 2026 — System administration & networking

- **System & server management in Kali** — users and permissions (root, sudo, normal user), handling errors, man pages, managing Apache2, and reading Apache logs.
- **Networking fundamentals** — OSI and TCP/IP, the TCP/TLS handshake, IP addressing and subnetting, routing (static, dynamic, NAT), and core protocols (DNS, HTTP, SMB, TLS).
- **Written Test 1** — Cyber Security Foundations.

## Week 3 · 23 August 2026 — Governance

- **Governance & compliance** — security policies, ISO 27001, awareness training, risk management, and third-party / supply-chain risk.
- *Extra class* — **Linux hardening & system security**: security controls, least privilege, the file-permission model, SSH hardening, and simple bash scripting for administration.

## Week 4 · 29–30 August 2026 — Pentest overview & crypto

- **Cryptography** — encryption/decryption, hashing, digital signatures, and PKI.
- **Penetration testing overview** — the pentest phases, threat-actor classification, ethics and legality, and testing frameworks (PTES, NIST, OWASP).
- **Social engineering** — techniques, phishing, prevention, and social engineering in the AI era.

## Week 5 · 5–6 September 2026 — Finding & exploiting

- **Written Test 2** — Governance and Networking.
- **Identifying vulnerabilities** — vulnerability types (misconfiguration, app bugs, protocol weaknesses), scanning with Nmap, manual testing, and vulnerability management.
- *Extra class* — **Automation recon with bash**: using bash for recon, file handling and loops, building a simple recon automation script.
- **System hacking** — system exploitation, privilege escalation (vertical, horizontal, Windows), and post-exploitation.

## Week 6 · 12–13 September 2026 — Reporting, DoS, networks

- **Reporting & mitigation** — writing pentest reports, risk analysis and prioritization, CVSS scoring, and remediation/retesting.
- **Denial of Service** — DoS/DDoS concepts and prevention.
- **Network & wireless hacking** — network scanning and testing, man-in-the-middle concepts, and network defenses.

## Week 7 · 19–20 September 2026 — Sessions

- **Written Test 3** — Foundations of Penetration Testing.
- **Web session hijacking** — sniffing traffic, analyzing and exploiting session cookies, and prevention. (This directly fed Finding 1 of my final project — session hijacking via cookie replay.)

## Week 8 · 26–27 September 2026 — Web vulnerabilities I

- **Cryptographic failures** — weak SSL/TLS and hashing, sensitive-data exposure, the risks of MD5, and safe HTTPS.
- **Injection attacks** — SQL / NoSQL / command injection, their impact, and mitigation (prepared statements, ORM, input validation). (This fed Finding 2 — SQL injection in the coupon field.)
- **Server-Side Request Forgery (SSRF)** — SSRF against cloud metadata, and mitigation via input validation and network segmentation.

## Week 9 · 3–4 October 2026 — Web vulnerabilities II

- **Written Test 4** — Infrastructure & Network Attacks.
- **Broken access control** — horizontal and vertical escalation, RBAC and least privilege, and how to test access control. (This fed the two IDOR findings in my report.)
- **Vulnerable & outdated components** — the risks of old libraries, supply-chain attacks, and patch/dependency management.

## Week 10 · 10–11 October 2026 — Web vulnerabilities III & mobile

- **Security misconfiguration** — default-configuration risks, server/app hardening, and a directory-listing case study. (Related to the exposed `.git` finding.)
- **Software & data integrity failures** — supply-chain attacks (SolarWinds), code signing, and CI/CD with DevSecOps.
- **Mobile application security** — static and dynamic analysis, and mobile testing best practices.

## Week 11 · 17–18 October 2026 — Authentication & malware

- **Identification & authentication failures** — credential stuffing, session hijacking, MFA, secure password policies, and password hashing (bcrypt vs MD5). (Fed the plaintext-password and insecure-reset findings.)
- **Malware** — malware concepts, creation, testing, and detection/prevention, in a lab context.
- **Written Test 5** — Advanced Web Attacks & Exploitation.

## Week 12 · 24–25 October 2026 — Final test & project kickoff

- **Final test — offensive phase** — a written exam over the whole phase.
- **Final project introduction** — the brief, scope, grading criteria, how to choose a relevant red-team scenario, and tips for a good report and risk analysis.

## Week 13 · 31 October 2026 — Final project mentoring

- **Check Point A & B** — in-class mentoring and consultation on the capstone, focused on scoping the attack scenario and initial reconnaissance (information gathering).

## Week 14 · 7 November 2026 — Final project presentation

- **Final project presentation** — presented my final project to the mentors for review: a full black-box assessment, written up as [Dibimbing-Shop — 10 findings](/blog/dibimbing-shop-web-pentest).

## Looking back

The phase moved from fundamentals (Linux, networking, governance) into hands-on offensive work (recon, exploitation, the OWASP-style web vulnerability classes) and ended with a real assessment. Seeing the curriculum laid out like this, it's clear how each week's topic showed up in my final project — session hijacking, SQL injection, access control, weak crypto and authentication all came from specific weeks here.

From here I'm moving to the defensive side — see [Starting my blue team journey](/log/starting-blue-team).
