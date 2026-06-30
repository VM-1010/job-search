# PRODUCT.md — JobSphere Frontend

> **Stack:** React 19 · Vite 8 · Tailwind CSS v4 (CSS-first) · Radix UI (Shadcn-style) · Clerk Auth · React Router v7

---

## Product Overview

JobSphere is a full-stack recruiting SaaS platform that connects job seekers with employers. The frontend is a single-page application with two distinct role-based portals — **Job Seeker** and **Employer** — powered by Clerk authentication and a Node.js/MongoDB backend.

---

## Design System

### Color Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#FAFAFA` | `#0A0A0B` | Page background |
| `--surface` | `#FFFFFF` | `#141416` | Cards, panels, inputs |
| `--surface-raised` | `#FFFFFF` | `#1C1C1F` | Elevated surfaces, hover states |
| `--border` | `#E4E4E7` | `#27272A` | All borders, dividers |
| `--text-primary` | `#18181B` | `#FAFAFA` | Headlines, body text |
| `--text-secondary` | `#71717A` | `#71717A` | Meta, secondary labels |
| `--text-muted` | `#A1A1AA` | `#52525B` | Placeholders, timestamps |
| `--accent` | `#5B5BF6` | `#6366F1` | Primary actions, active nav, links |
| `--accent-soft` | `rgba(91,91,246,0.10)` | `rgba(99,102,241,0.15)` | Active pills, badges, hover fills |
| `--success` | `#22C55E` | `#22C55E` | Accepted status |
| `--warning` | `#D97706` | `#F59E0B` | Pending status |
| `--danger` | `#EF4444` | `#EF4444` | Rejected status, destructive actions |

### Typography

- **Font:** Inter (variable, loaded via Google Fonts) with `font-feature-settings: 'cv11', 'ss01'`
- **Scale:** `text-xs` (labels) → `text-sm` (body/buttons) → `text-base` (default) → `text-lg/xl` (card titles) → `text-2xl/3xl` (page headers) → `text-4xl/5xl` (hero only)
- **Headings:** `font-bold tracking-tight`

### Elevation

- Cards rest at `shadow-sm`, lift to `shadow-lg` on hover with `translateY(-2px)`
- Border shifts to `--accent-soft-border` (30% opacity) on hover — never full accent
- Dialogs use `shadow-xl` + `rounded-2xl` + `backdrop-blur-sm` overlay

### Border Radius

- Buttons: `rounded-lg` (8px)
- Cards: `rounded-xl` (12px)
- Dialogs: `rounded-2xl` (16px)
- Badges: `rounded-full`
- Inputs: `rounded-lg` (8px)

---

## Features & Pages

### Landing Page (`/`)
- Full-bleed hero with fixed gradient mesh background (accent at 8% opacity, `blur-80px`)
- Large bold headline with gradient text span
- Two CTAs: gradient "Get Started" + outline "Sign In"
- Announcement pill badge at top of hero
- 3-column feature section below fold with `IntersectionObserver` scroll-reveal
- **Role Picker** (post-auth): two large selectable cards with check badge on selection, hover lift

### Job Seeker Portal

| Page | Key Features |
|---|---|
| **Dashboard** (`/dashboard`) | 5 stat cards with `useCountUp` animated counters, accent top strip, gradient icon chips |
| **Browse Jobs** (`/jobs`) | Sticky filter bar (`backdrop-blur`), 3-column card grid, hover-lift job cards, info + apply dialogs |
| **Applications** (`/applications`) | Desktop: clean table with semantic status badges. Mobile (≤768px): stacked cards |
| **Profile** (`/profile`) | Card-based form sections, repeatable list inputs, accent-colored resume upload |

### Employer Portal

| Page | Key Features |
|---|---|
| **Dashboard** (`/emp/dashboard`) | 6 stat cards with `useCountUp`, recent applications table |
| **Listings** (`/emp/listings`) | Table view with icon-colored action buttons, empty state with CTA |
| **Listing Details** (`/emp/listings/:id`) | Hero-style header with fact pills, applicant table with status selector |
| **Company Profile** (`/emp/profile`) | Live preview card, clean form layout |
| **Applicant Profile** (`/emp/applicant/:userId`) | Gradient avatar, icon-chipped section headers, resume download |

---

## Motion & Interactions

| Pattern | Implementation |
|---|---|
| Page entrance | `animate-fade-in-up` (250ms ease-out) on all page roots |
| Stat counter | `useCountUp` hook — RAF-based easing from 0 → target, ~600ms |
| Card hover | `translateY(-2px) + shadow-lg + border-color` (200ms ease-out) |
| Button press | `active:scale-[0.97]`, hover `scale-[1.02]` (150ms) |
| Button focus | `box-shadow: 0 0 0 3px rgba(91,91,246,0.20)` glow |
| Sidebar nav | Active: accent-soft pill + 3px left accent bar (`::before`), 150ms transition |
| Skeleton loaders | Shimmer gradient sweep (`200% background-size`), 1.6s infinite |
| Dialogs | CSS `@keyframes` driven by Radix `data-state` attributes (scale-in 200ms) |
| Scroll reveal | `useInView` hook (IntersectionObserver), fires once per element |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` strips all durations to `0.01ms` |

---

## Dark Mode

- Strategy: **class-based** (`dark` on `<html>`)
- Key: `localStorage.jobplatform_theme` (separate from existing `jobplatform_role` key)
- FOUC prevention: inline `<script>` in `index.html` runs synchronously before React mounts
- Toggle: Sun/Moon icon button in Topbar (`useTheme` hook from `src/lib/utils.js`)
- CSS: `@variant dark (&:where(.dark, .dark *))` in Tailwind v4 CSS-first config

---

## Custom Hooks (`src/lib/utils.js`)

| Hook | Purpose |
|---|---|
| `cn(...inputs)` | Class merge utility (clsx + tailwind-merge) |
| `useCountUp(target, duration)` | RAF-based counter animation, ease-out cubic |
| `useInView(options)` | IntersectionObserver wrapper, fires once, returns `[ref, inView]` |
| `useTheme()` | Reads/writes dark/light preference, toggles `.dark` class on `<html>` |

---

## Accessibility

- **Contrast:** All primary text (`--text-primary`) against `--surface` meets 4.5:1 minimum
- **Focus rings:** Visible 3px accent-soft glow on all interactive elements
- **`aria-label`:** Present on icon-only buttons (theme toggle, close buttons)
- **Reduced motion:** Full override via `@media (prefers-reduced-motion: reduce)` — animations degrade to instant state changes, shimmer becomes static
- **Semantic HTML:** `<header>`, `<aside>`, `<nav>`, `<main>`, `<h1>`–`<h3>` hierarchy maintained

---

## Architecture Notes

- No new routes, no new API calls, no renamed props — pure visual/UX pass
- All theme values are CSS custom properties consumed via `var()` — components are theme-agnostic
- Tailwind v4 CSS-first: tokens live in `@theme {}` and `:root`/`.dark` blocks in `index.css`
- `tailwindcss-animate` not required — all animations defined as native CSS `@keyframes` and targeted via Radix `data-state` attribute selectors
