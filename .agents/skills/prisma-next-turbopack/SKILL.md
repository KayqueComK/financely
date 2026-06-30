---
name: prisma-next-turbopack
description: Instructions for handling Prisma schema updates and Next.js Turbopack caching issues.
---

# Prisma Schema Updates in Next.js with Turbopack

When you modify `prisma/schema.prisma` and run `npx prisma db push` or `npx prisma generate`, the new Prisma Client is generated in `node_modules/@prisma/client`.

However, Next.js dev servers running with Turbopack aggressively cache `node_modules`. This can lead to runtime errors like `TypeError: Cannot read properties of undefined` when trying to access newly created Prisma models (e.g., `prisma.newModel.findMany()`), because the dev server is still using the old cached client.

**Resolution Steps:**
If you or the user encounter this after a schema update, you MUST instruct the user to:
1. Stop the Next.js dev server.
2. Delete the `.next` directory to clear the Turbopack cache (e.g., `Remove-Item -Recurse -Force .next` on Windows).
3. Restart the dev server (`npm run dev`).
