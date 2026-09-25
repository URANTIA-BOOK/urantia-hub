# Versioned hub image. NEXT_PUBLIC_* bake in at build time — pass them as build args.
# Defaults match .env.example. A lab origin is a build arg, not the default.
# Dev Container uses the `dev` target (source bind-mounted at /app).

FROM node:22-bookworm AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

FROM deps AS dev
WORKDIR /app
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
EXPOSE 3001
CMD ["sh", "-c", "corepack enable && yarn install --frozen-lockfile && npx prisma generate && yarn dev"]

FROM node:22-bookworm AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_URANTIA_DEV_API_HOST=https://api.urantia.dev
ARG NEXT_PUBLIC_HOST=http://localhost:3001
ARG NEXT_PUBLIC_AUDIO_FILES_CDN=https://audio.urantiahub.com
ARG NEXT_PUBLIC_AUTH_ENABLED=
ARG NEXTAUTH_URL=http://localhost:3001
ENV NEXT_PUBLIC_URANTIA_DEV_API_HOST=$NEXT_PUBLIC_URANTIA_DEV_API_HOST \
    NEXT_PUBLIC_HOST=$NEXT_PUBLIC_HOST \
    NEXT_PUBLIC_AUDIO_FILES_CDN=$NEXT_PUBLIC_AUDIO_FILES_CDN \
    NEXT_PUBLIC_AUTH_ENABLED=$NEXT_PUBLIC_AUTH_ENABLED \
    NEXTAUTH_URL=$NEXTAUTH_URL \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && yarn build

FROM node:22-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/sentry.client.config.ts ./
COPY --from=builder /app/sentry.server.config.ts ./
COPY --from=builder /app/sentry.edge.config.ts ./
COPY --from=builder /app/instrumentation.ts ./
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && exec yarn start"]
