import pino from "pino";

const logger = pino();

export default function getLogger() {
  return logger;
}
