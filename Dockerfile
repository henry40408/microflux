FROM node:20.16.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG GIT_COMMIT_HASH
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

RUN npm run build

FROM node:20.16.0-alpine
WORKDIR /app
COPY --from=builder /app/.output /app/.output

ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
