import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Output directory for the extension
    rollupOptions: {
      input: {
        main: 'index.html', // Path to your main HTML file
        manageNotes: 'src/manage-notes.ts', // Your main TypeScript file
      },
      output: {
        entryFileNames: 'assets/[name].js', // Define how entry files are named
        chunkFileNames: 'assets/[name].js', // Define how chunk files are named
        assetFileNames: 'assets/[name].[ext]', // Define how asset files are named
      },
    },
  },
})
