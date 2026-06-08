FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY product-service/package*.json ./product-service/

RUN npm ci

COPY shared/ ./shared/
COPY product-service/ ./product-service/

RUN /app/node_modules/.bin/prisma generate --schema=./shared/prisma/schema.prisma && \
    npm run build -w @ecommerce/shared && \
    cp -r ./shared/src/generated ./shared/dist/generated

WORKDIR /app/product-service


FROM deps AS dev

EXPOSE 3007
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY product-service/package*.json ./product-service/

RUN npm ci --omit=dev

COPY --from=builder /app/product-service/dist ./product-service/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY shared/prisma ./shared/prisma

WORKDIR /app/product-service

EXPOSE 3007
CMD ["node", "dist/main"]
