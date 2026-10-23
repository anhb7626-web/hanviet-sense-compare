import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages: đổi theo tên repo của bạn
export default defineConfig({
  base: "/hanviet-sense-compare/",
  plugins: [react(), tailwindcss()],
});
