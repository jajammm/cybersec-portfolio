---
title: "Starting my blue team journey"
description: "Kicking off the defensive side of my learning: what I plan to study, why I'm moving from red to blue, and how I'll use my own pentest as a map."
date: 2026-11-20
tags: ["blue-team", "learning", "detection"]
---

This is the first entry in my learning log — honest, dated notes as I pick up the defensive side of cybersecurity. It is **work in progress, not a finished case study**. If something here is wrong or half-understood, that's the point: I'll correct it as I learn.

## Where I'm starting

I just finished the offensive phase of the Dibimbing bootcamp as a penetration tester. That work is written up as a full report — [Dibimbing-Shop: 10 findings](/blog/dibimbing-shop-web-pentest). This week I'm starting the blue team / security analyst track, essentially from zero on the defensive side.

## Why red → blue

Attacking an app taught me *how* things break. I want to understand the other half: how a defender would have **seen** those attacks and **stopped** them. The two sides reinforce each other — knowing the attacker's steps should make me better at spotting them in logs and alerts.

## The plan

I'll use my own pentest report as a map. For each finding I already proved as an attacker, I want to answer, as a defender:

- What would this attack look like in the logs (web server, app, auth)?
- What detection rule or alert would catch it?
- What control would have prevented or contained it?

Concretely, the first things I want to learn:

- Reading and querying logs (web/access logs to start).
- A SIEM from the ground up — setting one up in a home lab and sending logs to it.
- Writing a first detection rule for something I understand well, like the SQL injection in the coupon field from my report.

## How I'll track it here

I'll add short entries as I go, rather than waiting for a polished write-up. Expect rough edges. When a topic is solid enough to stand on its own, I'll turn it into a proper case study.

Next entry: setting up the lab and getting my first logs flowing.
