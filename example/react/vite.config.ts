import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router"

// https://vitejs.dev/config/
export default defineConfig({
  base: "/cms",
  plugins: [
    react(), 
    // @ts-expect-error No Error
    conventionalRouter({
      pages: ["src/pages/**"]
    })
  ],
})
