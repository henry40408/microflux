export default defineNitroPlugin((app) => {
  app.hooks.hook("request", async (event) => {
    const { path } = event;
    const query = getQuery(event);
    const body = await readBody(event);
    console.log("%j", { tag: "request", action: "start", path, query, body });
  });
});
