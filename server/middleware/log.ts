import pinoHttp from "pino-http";

const logger = pinoHttp();

export default defineEventHandler((event) => {
  logger(event.node.req, event.node.res);
});
