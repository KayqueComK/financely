# Stage 1: Install dependencies and build
FROM node:18-alpine AS builder
WORKDIR /app

# Install native dependencies required for better-sqlite3 build
RUN apk add --no-cache python3 make g++ gcc

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Stage 2: Production runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install native dependencies required for runtime if needed (better-sqlite3)
RUN apk add --no-cache python3 make g++ gcc

COPY package*.json ./
RUN npm ci --only=production

# Copy files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/@prisma/adapter-better-sqlite3 ./node_modules/@prisma/adapter-better-sqlite3

EXPOSE 3000
ENV PORT=3000

# Run prisma migration and then start the application
CMD npx prisma migrate deploy && npm run start
