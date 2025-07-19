import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.jsx', '.json']
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx'
      }
    }
  }
})