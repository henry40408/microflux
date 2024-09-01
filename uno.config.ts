import { defineConfig, presetAttributify, presetWebFonts } from "unocss";
import presetWind from "@unocss/preset-wind";
import transformerDirectives from "@unocss/transformer-directives";

export default defineConfig({
  presets: [
    presetWind({ dark: "media" }),
    presetAttributify(),
    presetWebFonts({
      provider: "bunny",
      fonts: {
        mono: "JetBrains Mono",
      },
    }),
  ],
  transformers: [transformerDirectives()],
});
