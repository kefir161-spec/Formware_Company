import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/Formware_Company/" : "./",
  build: {
    target: "es2020",
  },
});
