FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY analytics-service/package*.json ./analytics-service/

RUN npm ci

COPY shared/ ./shared/
COPY analytics-service/ ./analytics-service/

RUN /app/node_modules/.bin/prisma generate --schema=./shared/prisma/schema.prisma && \
    npm run build -w @ecommerce/shared && \
    cp -r ./shared/src/generated ./shared/dist/generated

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

RUN npm ci --omit=dev

COPY --from=builder /app/analytics-service/dist ./analytics-service/dist
COPY --from=builder /app/shared/dist ./shared/dist

WORKDIR /app/analytics-service

EXPOSE 3004
CMD ["node", "dist/main"]
