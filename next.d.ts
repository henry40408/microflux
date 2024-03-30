declare module "nuxt/schema" {
  interface RuntimeConfig {
    kagiToken: string;
    kagiLanguage: string;
    minifluxUrl: string;
    minifluxToken: string;
    linkdingUrl: string;
    linkdingToken: string;
  }
  interface PublicRuntimeConfig {}
}
// It is always important to ensure you import/export something when augmenting a type
export {};
