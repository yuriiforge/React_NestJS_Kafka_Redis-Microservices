FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY delivery-service/package*.json ./delivery-service/

RUN npm ci

COPY shared/ ./shared/
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

RUN npm ci --omit=dev

COPY --from=builder /app/delivery-service/dist ./delivery-service/dist

WORKDIR /app/delivery-service

EXPOSE 3003
CMD ["node", "dist/main"]
