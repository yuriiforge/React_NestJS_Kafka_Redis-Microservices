FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY payment-service/package*.json ./payment-service/

RUN npm ci

COPY shared/ ./shared/
COPY payment-service/ ./payment-service/

WORKDIR /app/payment-service


FROM deps AS dev

EXPOSE 3002
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY payment-service/package*.json ./payment-service/

RUN npm ci --omit=dev

COPY --from=builder /app/payment-service/dist ./payment-service/dist

WORKDIR /app/payment-service

EXPOSE 3002
CMD ["node", "dist/main"]
