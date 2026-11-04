import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'client-ip-dev-endpoint',
      configureServer(server) {
        server.middlewares.use('/api/client-ip', (req, res) => {
          const forwarded = req.headers['x-forwarded-for'];
          let ip = '127.0.0.1';
          if (forwarded) {
            ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
          } else if (req.socket && req.socket.remoteAddress) {
            ip = req.socket.remoteAddress;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ ip }));
        });
      }
    }
  ],
})
