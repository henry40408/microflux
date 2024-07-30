export default defineEventHandler(async (event) => {
  const client = linkdingClient(event);
  const id = getRouterParam(event, "id");
  await client.delete(`api/bookmarks/${id}/`);
  return null;
});
