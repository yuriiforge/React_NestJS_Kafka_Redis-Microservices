FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY product-service/package*.json ./product-service/

RUN npm ci

COPY shared/ ./shared/
COPY product-service/ ./product-service/

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

WORKDIR /app/product-service

EXPOSE 3007
CMD ["node", "dist/main"]
