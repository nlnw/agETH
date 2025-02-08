// @ts-check
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import react from "@astrojs/react";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), UnoCSS()],
  adapter: node({
    mode: "standalone",
  }),
});
