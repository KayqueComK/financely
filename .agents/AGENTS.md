# Rules

## Next.js 15+ ESLint Configuration
Do not use `eslint: { ignoreDuringBuilds: true }` in `next.config.ts`. This configuration is invalid in Next.js 15+ and will cause the build to fail if lint errors exist. To bypass ESLint errors that block Vercel deployments, either fix the errors directly or use file-level comments (`/* eslint-disable */`).

## Prisma Client Import
In this project, the Prisma client singleton is instantiated in `src/lib/db.ts`. Always import the Prisma client using `import prisma from "@/lib/db"`. Do not use `@/lib/prisma`.
