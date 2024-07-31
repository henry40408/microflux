import { defineConfig, presetAttributify } from "unocss";
import presetWind from "@unocss/preset-wind";
import transformerDirectives from "@unocss/transformer-directives";

export default defineConfig({
  presets: [presetWind({ dark: "media" }), presetAttributify()],
  transformers: [transformerDirectives()],
});
