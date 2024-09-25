import { getGitCommitHash } from "./utils/get-git-commit-hash";

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
  modules: ["@vueuse/nuxt", "@nuxt/eslint"],
  runtimeConfig: {
    kagiSessionLink: "",
    linkdingToken: "",
    linkdingUrl: "",
    minifluxAuthToken: "",
    minifluxUrl: "",
    public: {
      gitCommitHash: process.env.GITHUB_SHA
        ? process.env.GITHUB_SHA.substring(0, 7)
        : getGitCommitHash(),
    },
  },
  typescript: { typeCheck: true },
});
