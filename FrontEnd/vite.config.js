import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Prevenir redirecciones automáticas
    strictPort: true,
    // Configuración específica para SPA
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    strictPort: true
  }
})
