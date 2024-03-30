export default defineNitroPlugin((app) => {
  app.hooks.hook("request", async (event) => {
    const { path } = event;
    const query = getQuery(event);
    const body = await readBody(event);
    console.log("request %j", { path, query, body });
  });
});
