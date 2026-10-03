import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: './',
  html: command === 'serve' ? { cspNonce: 'zajedno-development' } : undefined,
  plugins: [react(), {
    name: 'local-development-csp',
    transformIndexHtml(html, context) {
      return context.server ? html.replace("script-src 'self'", "script-src 'self' 'nonce-zajedno-development'") : html;
    },
  }],
  server: { host: true, allowedHosts: true, strictPort: false },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
}));