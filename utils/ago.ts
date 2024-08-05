import { formatRelative } from "date-fns";

export default function (start: string) {
  return formatRelative(start, new Date());
}
