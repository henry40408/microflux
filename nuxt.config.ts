// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "Microflux",
      link: [
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/water.css@2/out/water.css",
          integrity:
            "sha512-GW7j11RXZmdio87hQsKNjomKEy/DwDjh6J2Z1JnI5Z4FNP791QfZP7Iut25vA+L+YJLZipI2BZhEpkvBkfr8cw==",
          crossorigin: "anonymous",
        },
      ],
    },
  },
  devtools: { enabled: true },
  modules: ["@nuxt/eslint"],
  eslint: {
    checker: true,
  },
  runtimeConfig: {
    minifluxUrl: "",
    minifluxApiKey: "",
  },
});
