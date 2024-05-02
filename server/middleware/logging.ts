import createHttpLogger from "pino-http";

const logger = createHttpLogger();

export default defineEventHandler((event) => {
  logger(event.node.req, event.node.res);
});
