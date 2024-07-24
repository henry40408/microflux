import { formatDistanceToNow } from "date-fns";

export default function (start: string) {
  return formatDistanceToNow(start, { addSuffix: true });
}
