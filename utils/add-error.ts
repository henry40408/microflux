import { Notify } from "quasar";
import * as uuid from "uuid";

interface OccurredError {
  id: string;
  error: unknown;
  timestamp: Date;
}

export const errors = ref<OccurredError[]>([]);

export function clearErrors() {
  errors.value = [];
}

export default function (e: unknown) {
  Notify.create({
    color: "negative",
    icon: "error_outline",
    message: `${e}`,
    position: "top",
  });
  errors.value.unshift({ id: uuid.v7(), error: e, timestamp: new Date() });
}
