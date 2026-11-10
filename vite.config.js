import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import academicAssistant from './api/academic-assistant.js'
import academicAssistantAdminSession from './api/academic-assistant-admin-session.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const localAuthBypass = mode !== 'production';

  for (const key of ['DATABASE_URL', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'ACADEMIC_ASSISTANT_ADMIN_SECRET']) {
    if (env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [
      react(),
      {
        name: 'client-ip-dev-endpoint',
        configureServer(server) {
          server.middlewares.use('/api/academic-assistant-admin-session', (req, res, next) => {
            academicAssistantAdminSession(req, res).catch(next);
          });
          server.middlewares.use('/api/academic-assistant', (req, res, next) => {
            academicAssistant(req, res, { allowLocalAuthBypass: localAuthBypass }).catch(next);
          });
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
    ]
  };
})
