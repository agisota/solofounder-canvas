FROM node:22-slim AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

# ─── builder ───────────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─── runner ────────────────────────────────────────────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Create .dev.vars with placeholder keys
RUN echo 'ANTHROPIC_API_KEY=placeholder' > .dev.vars && \
    echo 'OPENAI_API_KEY=placeholder' >> .dev.vars && \
    echo 'GOOGLE_API_KEY=placeholder' >> .dev.vars

# Create a minimal wrangler.toml for the runner that points to pre-built output
RUN echo 'name = "solofounder-canvas"' > wrangler.toml && \
    echo 'main = "dist/solofounder_canvas/index.js"' >> wrangler.toml && \
    echo 'compatibility_date = "2024-12-30"' >> wrangler.toml && \
    echo 'assets = { directory = "dist/client", not_found_handling = "single-page-application" }' >> wrangler.toml && \
    echo '' >> wrangler.toml && \
    echo '[observability]' >> wrangler.toml && \
    echo 'enabled = true' >> wrangler.toml && \
    echo '' >> wrangler.toml && \
    echo '[durable_objects]' >> wrangler.toml && \
    echo 'bindings = [{ name = "AGENT_DURABLE_OBJECT", class_name = "AgentDurableObject" }]' >> wrangler.toml && \
    echo '' >> wrangler.toml && \
    echo '[[migrations]]' >> wrangler.toml && \
    echo 'tag = "v1"' >> wrangler.toml && \
    echo 'new_classes = ["TldrawAiDurableObject"]' >> wrangler.toml && \
    echo '' >> wrangler.toml && \
    echo '[[migrations]]' >> wrangler.toml && \
    echo 'tag = "v2"' >> wrangler.toml && \
    echo 'renamed_classes = [{ from = "TldrawAiDurableObject", to = "AgentDurableObject" }]' >> wrangler.toml

VOLUME ["/data"]

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:8787/ || exit 1

CMD ["node_modules/.bin/wrangler", "dev", "--local", "--no-bundle", "--port", "8787", "--ip", "0.0.0.0", "--persist-to", "/data"]
