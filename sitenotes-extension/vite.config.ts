import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removePreloads from './plugins/removePreloads';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), // Or remove specific preloads
    removePreloads({
      filter: linkStr => !linkStr.includes('contentScriptNote.js')
    }),],
  build: {
    outDir: 'dist',
    minify: false,
    // modulePreload: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        contentScriptNote: 'src/content-script-note.ts',
        contentScriptToolbar: 'src/content-script-toolbar.ts',
        contentScriptHighlighter: 'src/content-script-highlighter.ts',
        contentScriptDraw: 'src/content-script-draw.ts',
        contentScriptIMG: 'src/content-script-img.ts',
        manageNotes: 'src/manage-notes.ts',
        background: 'src/background.ts',
      },
      output: {
        inlineDynamicImports: false, // Ensure this is false
        format: 'es',
        preserveModules: false,
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks(id) {
          // Example: Bundle large dependencies into separate chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true, // Transforms CommonJS to ES modules when mixed
    },
    target: 'esnext',
  },
})
