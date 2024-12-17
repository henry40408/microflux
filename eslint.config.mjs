// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/attributes-order": ["warn", { alphabetical: true }],
    "vue/html-self-closing": "off",
    "vue/static-class-names-order": "warn",
  },
});
// Your custom configs here
