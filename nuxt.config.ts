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

  $production: {
    routeRules: {
      "/og.png": { prerender: true },
    },
  },

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      link: [
        { rel: "icon", href: "/favicon.ico" },
      ],
    },
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    classSuffix: "",
    preference: "default",
    storage: "cookie",
  },

  features: {
    inlineStyles: true,
  },

  compatibilityDate: "2025-07-15",

  nitro: {
    storage: {
      public: {
        driver: "fs",
        base: "./public",
      },
    },
  },

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
      preload: true,
      fallbacks: {
        "sans-serif": ["system-ui", "Arial"],
        "monospace": ["ui-monospace", "Courier New"],
      },
    },
  },
});
