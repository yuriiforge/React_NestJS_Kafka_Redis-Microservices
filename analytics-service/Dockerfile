FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY analytics-service/package*.json ./analytics-service/

RUN --mount=type=cache,target=/root/.npm npm ci

# Build shared first so this layer is cached independently of service source changes
COPY shared/ ./shared/
RUN npm run build -w @ecommerce/shared && cp -r ./shared/src/generated ./shared/dist/generated

COPY analytics-service/ ./analytics-service/
WORKDIR /app/analytics-service


FROM deps AS dev

EXPOSE 3004
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY analytics-service/package*.json ./analytics-service/

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY --from=builder /app/analytics-service/dist ./analytics-service/dist
COPY --from=builder /app/shared/dist ./shared/dist


WORKDIR /app/analytics-service

EXPOSE 3004
CMD ["node", "dist/main.js"]
