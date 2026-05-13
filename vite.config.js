import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/royal-table/", // ← nombre exacto de tu repo en GitHub
});