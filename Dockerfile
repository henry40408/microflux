FROM node:20.16.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.16.0-alpine
WORKDIR /app
COPY --from=builder /app/.output /app/.output
EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
