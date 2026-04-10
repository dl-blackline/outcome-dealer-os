# Outcome Dealer OS — Repository Review Brief

## What This Is

Outcome Dealer OS is an AI-native dealership operating system built on React + TypeScript + Tailwind CSS. It unifies the entire dealership value chain — from customer attraction through wholesale exit — in one coherent platform.

## Current Phase

**Phase 1 Complete** — Foundations, shell, types, event taxonomy, roles, permissions, and UI surfaces are all in place. The app is navigable, role-aware, and structurally sound. All pages are functional with mock data.

## Stack

- **React 18** + **TypeScript** (strict)
- **Vite 7** (build + dev)
- **Tailwind CSS v4** + oklch color system
- **Radix UI** / Shadcn-style components
- **Phosphor Icons** (via Spark proxy)
- **GitHub Spark** runtime (auth + KV store)

## Architecture Highlights

1. **Hash-based router** — lightweight, no dependencies, path params
2. **Domain-driven modules** — 22 domain folders with types, services, queries, policies
3. **49 canonical events** — full lifecycle taxonomy
4. **13 roles × 28 permissions** — explicit grant matrix, no inheritance
5. **Workstation** — Trello-style execution board with linked-object cards
6. **Auto-card rules** — 9 centralized event-to-card mappings
7. **Governance components** — reusable approval, audit, and event UI
8. **Query hooks** — consistent `QueryResult<T>` pattern for future API swap

## How to Review

1. Start with `src/App.tsx` → `src/app/AppShell.tsx` → pages
2. Check `src/domains/` for type definitions and business logic
3. Review `docs/architecture/` for design decisions
4. Build: `npm install && npx vite build`
5. Focus areas listed in `docs/architecture/reviewer_focus_areas.md`
