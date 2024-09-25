// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: { transpile: ["trpc-nuxt"] },
  compatibilityDate: "2024-04-03",
  css: [
    !process.env.HISTOIRE ? "~/vendor/water.css" : undefined,
    "~/assets/css/style.css",
  ],
  devtools: { enabled: true },
  eslint: { checker: true },
  modules: ["@vueuse/nuxt", "@unocss/nuxt", "@nuxt/eslint"],
  runtimeConfig: {
    kagiSessionLink: "",
    linkdingToken: "",
    linkdingUrl: "",
    minifluxAuthToken: "",
    minifluxUrl: "",
  },
  typescript: { typeCheck: true },
});
