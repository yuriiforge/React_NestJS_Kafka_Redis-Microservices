FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY auth-service/package*.json ./auth-service/

RUN --mount=type=cache,target=/root/.npm npm ci

COPY shared/ ./shared/
COPY auth-service/ ./auth-service/

RUN /app/node_modules/.bin/prisma generate --schema=./shared/prisma/schema.prisma && \
    /app/node_modules/.bin/tsc --project /app/shared/tsconfig.json && \
    cp -r ./shared/src/generated ./shared/dist/generated

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

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY --from=builder /app/auth-service/dist ./auth-service/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY shared/prisma ./shared/prisma

WORKDIR /app/auth-service

EXPOSE 3006
CMD ["node", "dist/main"]
