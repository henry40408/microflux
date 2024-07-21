// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  css: ["~/assets/style.css"],
  devtools: { enabled: true },
  modules: ["@unocss/nuxt"],
  runtimeConfig: {
    minifluxAuthToken: "",
    minifluxUrl: "",
    kagiSessionLink: "",
  },
  typescript: { typeCheck: true },
});
