import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        contentScriptToolbar: 'src/content-script-toolbar.ts',
        contentScriptHighlighter: 'src/content-script-highlighter.ts',
        contentScriptDraw: 'src/content-script-draw.ts',
        contentScriptIMG: 'src/content-script-img.ts',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})