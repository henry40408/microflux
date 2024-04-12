import { sendRequest } from "~/server/linkding";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await sendRequest(event, {
    path: `/api/bookmarks/${id}`,
    method: "DELETE",
  });
  return setResponseStatus(event, 204, "");
});
