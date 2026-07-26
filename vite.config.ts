import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Deployed as a GitHub Pages *user site* (nagdii.github.io) → base is "/"
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
});
