import { getGitCommitHash } from "./utils/get-git-commit-hash";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    },
  },
  build: { transpile: ["trpc-nuxt"] },
  compatibilityDate: "2024-08-08",
  css: ["~/assets/css/style.css"],
  devtools: { enabled: true },
  eslint: { checker: true },
  modules: ["@vueuse/nuxt", "@nuxt/eslint", "nuxt-quasar-ui"],
  runtimeConfig: {
    kagiSessionLink: "",
    linkdingToken: "",
    linkdingUrl: "",
    minifluxAuthToken: "",
    minifluxUrl: "",
    public: {
      gitCommitHash: process.env.GIT_COMMIT_HASH
        ? process.env.GIT_COMMIT_HASH.substring(0, 7)
        : getGitCommitHash(),
    },
  },
  quasar: {
    config: { dark: "auto" },
    cssAddon: true,
    plugins: ["Notify"],
  },
  typescript: { typeCheck: true },
});
