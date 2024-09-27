import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // @ts-expect-error No Error
    conventionalRouter({
      include: ["src/pages/**"],
      exclude: ["src/**/components/**", "src/**/hooks/**"]
    })
  ],
})
