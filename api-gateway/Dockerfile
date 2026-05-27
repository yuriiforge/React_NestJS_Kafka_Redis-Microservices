FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY api-gateway/package*.json ./api-gateway/

RUN npm ci

COPY shared/ ./shared/
COPY api-gateway/ ./api-gateway/

WORKDIR /app/api-gateway


FROM deps AS dev

EXPOSE 8000
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY api-gateway/package*.json ./api-gateway/

RUN npm ci --omit=dev

COPY --from=builder /app/api-gateway/dist ./api-gateway/dist

WORKDIR /app/api-gateway

EXPOSE 8000
CMD ["node", "dist/main"]
