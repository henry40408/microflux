// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/style.css"],
  devtools: { enabled: true },
  modules: ["@unocss/nuxt"],
  runtimeConfig: {
    kagiSessionLink: "",
    linkdingToken: "",
    linkdingUrl: "",
    minifluxAuthToken: "",
    minifluxUrl: "",
  },
  typescript: { typeCheck: true },
});
