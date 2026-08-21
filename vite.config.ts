import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["5176-ixkwm7kz65izyj9v9eapv-3a5b2fd1.us3.manus.computer"],
  },
});
