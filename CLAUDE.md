# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev       # Start dev server with Turbopack
bun run build     # Build static export
bun run start     # Serve the built output
bun run lint      # Run ESLint
```

The project uses Bun as the package manager (see `bun.lockb`). Use `bun add` / `bun remove` for dependency changes.

## Environment

Requires a `.env` file with:
```
NEXT_PUBLIC_URL=<backend API base URL>
```

All API calls prefix their path with `process.env.NEXT_PUBLIC_URL`. There are no Next.js API routes — this is a pure frontend that talks to an external backend.

The app is configured with `output: 'export'` (static export), so there is no server-side rendering at runtime. Dynamic project pages use `generateStaticParams` to pre-generate routes at build time.

## Architecture

### Auth & state

`AuthContext` (`src/app/context/AuthContext.tsx`) is the central state store. On mount it calls `/api/profile` (with `credentials: "include"`) to restore session from a cookie. It exposes `user`, `projects`, `permissions`, `login`, `logout`, and `fetchProjects`.

Two roles exist: `admin` and `client`. Clients have per-component permissions stored in the DB and fetched from `/api/users/{id}/apps`. Admins bypass all permission checks.

`LangContext` (`src/app/context/LangContext.tsx`) manages ES/EN language state, persisted in a cookie via `js-cookie`. All bilingual UI uses `const { lang } = useLang()` and inline ternary translation — there is no i18n library.

### Routing

| Path | Description |
|---|---|
| `/` | Entry screen — modal to choose login or landing page |
| `/dashboard` | Project list, redirects to `/` if unauthenticated |
| `/dashboard/[project_name]` | Project detail (static params generated at build) |
| `/dashboard/webapp/*` | Gated web apps (QR, VCard, Calendar, Blogs, Reforma, Monge) |
| `/dashboard/access-app` | Admin: manage client app permissions |
| `/dashboard/create-client`, `update-client` | Admin: client CRUD |
| `/dashboard/create-project`, `update-project` | Admin: project CRUD |
| `/dashboard/create-project-content`, `update-project-content` | Admin: project content CRUD |
| `/dashboard/account` | User account page |

### Dashboard layout

`src/app/dashboard/layout.tsx` wraps all dashboard pages with `AppSidebar` + `SidebarProvider`. The sidebar (`src/components/app-sidebar.tsx`) shows different sections depending on role:
- **Admin**: dropdown groups for client/project/content actions, then all projects in a dropdown, then all apps
- **Client**: only their own projects (flat list) and the apps they have `can_view: true` permission for

The `component` field in permissions must exactly match the string IDs defined in `AVAILABLE_COMPONENTS` in `access-app/page.tsx`: `"QR"`, `"Vcard"`, `"blogs"`, `"calendar"`, `"Reforma"`, `"Monge"`.

### UI conventions

- Brand color: `#BD155C`
- Components in `src/components/ui/` follow the shadcn/ui pattern (Radix UI primitives + `class-variance-authority` + `tailwind-merge`)
- Dark mode is supported via `next-themes` (`ThemeProvider` with `attribute="class"`)
- Animations use `motion` (Framer Motion v12)
- Icons from `lucide-react` and `react-icons`
- Toast notifications via `react-hot-toast`
- The `@/*` path alias maps to `src/*`

### Project content types

Content items inside a project are typed and filterable. The fixed type values are: `"Business and Objectives"`, `"MVP + IDEA"`, `"Business strategy"`, `"Growth Hacking strategy"`, `"Apps"`. These strings are used as-is for DB storage and filtering.
