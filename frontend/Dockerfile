FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci


FROM deps AS dev

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]


FROM deps AS builder

COPY . .
RUN npm run build


FROM nginx:alpine AS prod

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
