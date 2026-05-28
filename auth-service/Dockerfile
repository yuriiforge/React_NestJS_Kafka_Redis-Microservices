FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY auth-service/package*.json ./auth-service/

RUN npm ci

COPY shared/ ./shared/
COPY auth-service/ ./auth-service/

WORKDIR /app/auth-service


FROM deps AS dev

EXPOSE 3006
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY auth-service/package*.json ./auth-service/

RUN npm ci --omit=dev

COPY --from=builder /app/auth-service/dist ./auth-service/dist
COPY shared/prisma ./shared/prisma

WORKDIR /app/auth-service

EXPOSE 3006
CMD ["node", "dist/main"]
