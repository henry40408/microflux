import lodash from "lodash";

import type { MinifluxCompactCategory } from "./entries.get";

export default defineEventHandler(
  async (event): Promise<MinifluxCompactCategory[]> => {
    const client = minifluxClient(event);
    const categories = await client
      .get("v1/categories")
      .json<MinifluxCompactCategory[]>();
    return categories.map((category) => lodash.pick(category, ["id", "title"]));
  },
);
