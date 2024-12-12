import { getGitCommitHash } from "./utils/get-git-commit-hash";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: { transpile: ["trpc-nuxt"] },
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/style.css"],
  devtools: { enabled: true },
  eslint: { checker: true },
  modules: ["@vueuse/nuxt", "@nuxt/eslint", "vuetify-nuxt-module"],
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
  typescript: { typeCheck: true },
});

