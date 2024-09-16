import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import conventionalRouter from "../../npm"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), conventionalRouter()],
})
