FROM node:20.11.1-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json .
RUN npm ci

COPY . .
RUN npm run build

FROM node:20.11.1-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/.output .

CMD ["node", "server/index.mjs"]
