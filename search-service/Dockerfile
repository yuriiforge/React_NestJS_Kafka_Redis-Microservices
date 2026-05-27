FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY search-service/package*.json ./search-service/

RUN npm ci

COPY shared/ ./shared/
COPY search-service/ ./search-service/

WORKDIR /app/search-service


FROM deps AS dev

EXPOSE 3005
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY search-service/package*.json ./search-service/

RUN npm ci --omit=dev

COPY --from=builder /app/search-service/dist ./search-service/dist

WORKDIR /app/search-service

EXPOSE 3005
CMD ["node", "dist/main"]
