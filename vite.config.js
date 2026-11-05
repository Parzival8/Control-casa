import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gastos Casa',
        short_name: 'Gastos',
        lang: 'es',
        display: 'standalone',
        start_url: '/',
        background_color: '#f6f7f9',
        theme_color: '#2563eb',
      },
    }),
  ],
});
