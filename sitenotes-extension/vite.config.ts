import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        contentScriptNote: 'src/content-script-note.ts',
        contentScriptToolbar: 'src/content-script-toolbar.ts',
        contentScriptHighlighter: 'src/content-script-highlighter.ts',
        contentScriptDraw: 'src/content-script-draw.ts',
        contentScriptIMG: 'src/content-script-img.ts',
        manageNotes: 'src/manage-notes.ts',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },

})