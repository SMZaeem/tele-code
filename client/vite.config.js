import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // This forces Vite to include these in the build
    include: ['y-socket.io', 'yjs', 'y-monaco', 'socket.io-client'] 
  }
})