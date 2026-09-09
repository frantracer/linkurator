FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY app ./app
COPY components ./components
COPY contexts ./contexts
COPY entities ./entities
COPY hooks ./hooks
COPY i18n ./i18n
COPY messages ./messages
COPY providers ./providers
COPY public ./public
COPY services ./services
COPY utilities ./utilities
COPY configuration.ts ./configuration.ts
COPY next.config.js ./next.config.js
COPY next-env.d.ts ./next-env.d.ts
COPY postcss.config.js ./postcss.config.js
COPY tailwind.config.js ./tailwind.config.js
COPY tsconfig.json ./tsconfig.json

ENV LINKURATOR_APP_ENV="development"
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]
