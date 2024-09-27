import etag from "etag";

import type { MinifluxIcon } from "~/schema/miniflux";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 404 });

  const client = minifluxClient(event);

  const iconCache = getIconCache();

  let cached = iconCache.get(id);
  if (!cached) {
    const fetched = await client.get(`v1/icons/${id}`).json<MinifluxIcon>();
    const [, encoded] = fetched.data.split(",");
    cached = {
      id: fetched.id,
      icon: Buffer.from(encoded, "base64"),
      mimeType: fetched.mime_type,
    };
    iconCache.set(id, cached);
  }

  // Cache images by manually setting headers to address a serialization issue in Nitro.
  // https://github.com/unjs/nitro/issues/1894
  // https://github.com/unjs/unstorage/issues/142
  setResponseHeader(event, "etag", etag(cached.icon));
  setResponseHeader(
    event,
    "cache-control",
    "public, max-age=86400, must-revalidate",
  );
  return send(event, cached.icon, cached.mimeType);
});
