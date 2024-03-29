import withNuxt from "./.nuxt/eslint.config.mjs";

// your custom flat configs go here, for example:
// {
//   files: ['**/*.ts', '**/*.tsx'],
//   rules: {
//     'no-console': 'off' // allow console.log in TypeScript files
//   }
// },
// {
//   ...
// }
export default withNuxt(
  {
    rules: {
      // https://github.com/prettier/prettier/issues/5246
      "vue/html-self-closing": "off",
    },
  },
  {},
);
