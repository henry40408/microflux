declare module "nuxt/schema" {
  interface RuntimeConfig {
    kagiApiToken: string;
    kagiLanguage: string;
    minifluxUrl: string;
    minifluxApiKey: string;
  }
  interface PublicRuntimeConfig {}
}
// It is always important to ensure you import/export something when augmenting a type
export {};
