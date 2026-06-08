FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY order-service/package*.json ./order-service/

RUN --mount=type=cache,target=/root/.npm npm ci

COPY shared/ ./shared/
COPY order-service/ ./order-service/

RUN /app/node_modules/.bin/prisma generate --schema=./shared/prisma/schema.prisma && \
    npm run build -w @ecommerce/shared && \
    cp -r ./shared/src/generated ./shared/dist/generated

WORKDIR /app/order-service


FROM deps AS dev

EXPOSE 3001
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY order-service/package*.json ./order-service/

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY --from=builder /app/order-service/dist ./order-service/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY shared/prisma ./shared/prisma

WORKDIR /app/order-service

EXPOSE 3001
CMD ["node", "dist/main"]
