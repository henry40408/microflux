export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const client = minifluxClient(event);
  await client.post(`v1/entries/${id}/save`);
  return null;
});
