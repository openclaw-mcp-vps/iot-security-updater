# Build Task: iot-security-updater

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: iot-security-updater
HEADLINE: Automated IoT device security patch management
WHAT: Automatically discovers IoT devices on your network, tracks available security patches, and orchestrates updates across manufacturers. Handles the complexity of different update mechanisms and schedules patches during maintenance windows.
WHY: IoT devices are the weakest link in enterprise security but manually tracking patches across hundreds of devices from dozens of vendors is impossible. Recent breaches show unpatched IoT devices as primary attack vectors.
WHO PAYS: IT security managers at mid-market companies (100-1000 employees) with mixed IoT deployments. They have budget for security tools but lack dedicated IoT specialists to manually manage device updates.
NICHE: security-tools
PRICE: $$12/mo

ARCHITECTURE SPEC:
A Next.js web application with a dashboard for managing IoT device discovery and patch orchestration. The backend uses network scanning APIs and manufacturer update services, with a job queue system for scheduling patches during maintenance windows.

PLANNED FILES:
- app/dashboard/page.tsx
- app/devices/page.tsx
- app/patches/page.tsx
- app/settings/page.tsx
- app/api/devices/scan/route.ts
- app/api/patches/check/route.ts
- app/api/patches/schedule/route.ts
- app/api/webhooks/lemonsqueezy/route.ts
- lib/device-scanner.ts
- lib/patch-manager.ts
- lib/manufacturer-apis.ts
- lib/scheduler.ts
- components/device-list.tsx
- components/patch-status.tsx
- components/maintenance-window.tsx
- prisma/schema.prisma

DEPENDENCIES: next, tailwindcss, prisma, @prisma/client, node-nmap, node-cron, bull, redis, @lemonsqueezy/lemonsqueezy.js, recharts, lucide-react, zod, react-hook-form, @hookform/resolvers

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.
