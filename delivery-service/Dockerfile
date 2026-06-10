FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY delivery-service/package*.json ./delivery-service/

RUN --mount=type=cache,target=/root/.npm npm ci

# Build shared first so this layer is cached independently of service source changes
COPY shared/ ./shared/
RUN npm run build -w @ecommerce/shared && cp -r ./shared/src/generated ./shared/dist/generated

COPY delivery-service/ ./delivery-service/
WORKDIR /app/delivery-service


FROM deps AS dev

EXPOSE 3003
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY delivery-service/package*.json ./delivery-service/

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY --from=builder /app/delivery-service/dist ./delivery-service/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY shared/prisma ./shared/prisma

WORKDIR /app/delivery-service

EXPOSE 3003
CMD ["node", "dist/main.js"]
