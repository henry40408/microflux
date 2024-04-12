export default defineNitroPlugin((app) => {
  app.hooks.hook("request", async (event) => {
    const { method, path } = event;
    const query = getQuery(event);
    const body = await readBody(event);
    console.log("%j", {
      tag: "request",
      action: "start",
      method,
      path,
      query,
      body,
    });
  });
});
