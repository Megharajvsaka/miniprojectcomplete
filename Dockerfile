# ======================================================
# Stage 1 : Install Dependencies
# ======================================================

FROM node:22-alpine AS deps

WORKDIR /app

# Install libc compatibility for some native modules
RUN apk add --no-cache libc6-compat

COPY package*.json ./

RUN npm ci

# ======================================================
# Stage 2 : Build Application
# ======================================================

FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Build the standalone Next.js application
RUN npm run build

# ======================================================
# Stage 3 : Production Runtime
# ======================================================

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache libc6-compat

# Create a non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy standalone server
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static

# Give permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]