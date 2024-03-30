FROM node:20.11.1-alpine AS builder

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install && npm run build

COPY . .

FROM node:20.11.1-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/.output .

CMD ["node", "server/index.mjs"]
