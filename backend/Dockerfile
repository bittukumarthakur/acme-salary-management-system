# syntax=docker/dockerfile:1

# ---- Builder: install deps, generate the Prisma client, compile TypeScript ----
FROM node:22-slim AS builder
WORKDIR /app

# Copy everything (.dockerignore keeps node_modules, dist, .env, etc. out),
# install deps (postinstall runs `prisma generate`), then build to dist/.
COPY . .
RUN yarn install --frozen-lockfile && yarn build

# ---- Runner: runtime image ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy the fully built app (node_modules, dist, prisma schema/config) from the
# builder. Prisma schema + config are needed at runtime for `migrate deploy`.
COPY --from=builder /app ./

EXPOSE 8080
USER node
CMD ["node", "dist/src/main.js"]
