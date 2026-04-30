import { defineConfig } from 'vite';
import { resolve } from 'path';

const htmlExtFallback = () => {
  return {
    name: 'html-ext-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.length > 1 && req.url.indexOf('.') === -1 && !req.url.startsWith('/api') && !req.url.startsWith('/admin')) {
          req.url += '.html';
        }
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [htmlExtFallback()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        what_we_do: resolve(__dirname, 'what-we-do.html'),
        projects: resolve(__dirname, 'projects.html'),
        project_detail: resolve(__dirname, 'project-detail.html'),
        careers: resolve(__dirname, 'careers.html'),
        news: resolve(__dirname, 'news.html'),
        news_detail: resolve(__dirname, 'news-detail.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    },
  },
  server: {
    open: true,
    proxy: {
      '/api': 'http://localhost:3001',
      '/admin': 'http://localhost:3001',
      '/cms/uploads': 'http://localhost:3001',
    }
  }
});
