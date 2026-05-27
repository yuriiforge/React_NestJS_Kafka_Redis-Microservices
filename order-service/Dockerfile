FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY order-service/package*.json ./order-service/

RUN npm ci

COPY shared/ ./shared/
COPY order-service/ ./order-service/

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

RUN npm ci --omit=dev

COPY --from=builder /app/order-service/dist ./order-service/dist

WORKDIR /app/order-service

EXPOSE 3001
CMD ["node", "dist/main"]
