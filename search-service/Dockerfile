FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY search-service/package*.json ./search-service/

RUN --mount=type=cache,target=/root/.npm npm ci

# Build shared first so this layer is cached independently of service source changes
COPY shared/ ./shared/
RUN /app/node_modules/.bin/prisma generate --schema=./shared/prisma/schema.prisma &&     npm run build -w @ecommerce/shared &&     cp -r ./shared/src/generated ./shared/dist/generated

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

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY --from=builder /app/search-service/dist ./search-service/dist
COPY --from=builder /app/shared/dist ./shared/dist


WORKDIR /app/search-service

EXPOSE 3005
CMD ["node", "dist/main.js"]
