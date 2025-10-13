import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "motion-v/nuxt",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    classSuffix: "",
  },

  compatibilityDate: "2025-07-15",

  vite: {
    plugins: [tailwindcss()],
  },

  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

  fonts: {
    families: [
      {
        name: "JetBrains Mono",
        provider: "google",
        weights: [600],
      },
      {
        name: "Manrope",
        provider: "google",
        weights: [400, 500, 700],
      },
    ],
    defaults: {
      styles: ["normal"],
      subsets: ["latin"],
    },
  },
});
