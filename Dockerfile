FROM node:22-slim AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

# ─── runner ────────────────────────────────────────────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy everything — wrangler dev needs source files to compile at startup
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create empty .dev.vars so wrangler doesn't complain
RUN touch .dev.vars

VOLUME ["/data"]

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:8787/ || exit 1

CMD ["node_modules/.bin/wrangler", "dev", "--local", "--port", "8787", "--ip", "0.0.0.0", "--persist-to", "/data"]
