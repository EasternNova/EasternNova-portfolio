import { defineConfig } from "vite";

export default defineConfig({
    root: "frontend",

    base: "/",

    build: {
        outDir: "../dist",
        emptyOutDir: true,
        assetsDir: "assets",
        assetsInlineLimit: 0,
    },

    server: {
        port: 3000,
        open: true,
    },
});